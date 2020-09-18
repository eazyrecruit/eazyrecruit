let mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const ISODate = mongoose.Types.ISODate;
let Interview = require('../models/interview')
let interviewResults = mongoose.model('InterviewResults');
const ics = require('./ics').IcsService;
const uuidv1 = require('uuid/v1');
var emailService = require('../services/email.service');
let interviewCriteria = require('../models/interviewCriteria');
let Applicant = require('../models/applicant');
let config = require('../config').config();
let Company = require('../models/company');

exports.createAndInvite = async (req) => {

    let company = await getCompany();
    req.body["companyName"] = company.name;
    req.body.interview.interview = await Interview.create(
        {
            uid: uuidv1(),
            sequence: 1,
            status: "CONFIRMED",
            start: new Date(new Date(req.body.interview.start)),
            end: new Date(new Date(req.body.interview.end)),
            note: req.body.interview.note,
            round: req.body.interview.round,
            jobId: req.body.interview.job.id,
            jobApplicant: req.body.interview.candidate.id,
            interviewer: req.body.interview.interviewer.id,
            organizer: req.body.interview.organizer.id,
            channel: req.body.interview.channel,
            result: "PENDING",
            is_deleted: false,
            created_by: req.body.interview.created_by.id,
            created_at: Date.now(),
            modified_by: req.body.interview.modified_by.id,
            modified_at: Date.now()
        });

    // Invite Participants
    await inviteCandidate(req, "Invitation: Interview scheduled with " + req.body["companyName"] + " for " + req.body.interview.job.name + " profile");
    await inviteInterviewer(req, "Interview scheduled with " + req.body.interview.candidate.name + " for " + req.body.interview.job.name + " profile");
    await inviteOrganizer(req, "Interview scheduled with " + req.body.interview.candidate.name + " for " + req.body.interview.job.name + " profile");
    // Return Interview Details
    return req.body.interview;
}

exports.rescheduleAndInvite = async (req) => {
    let interview = await Interview.findById({_id: req.body.id});
    let company = await getCompany();
    req.body["companyName"] = company.name;
    req.body.interview.interview = await Interview.findByIdAndUpdate({_id: req.body.id, is_deleted: {$ne: true}},
        {
            sequence: req.body.sequence + 1,
            status: "CONFIRMED",
            start: new Date(new Date(req.body.interview.start)),
            end: new Date(new Date(req.body.interview.end)),
            note: req.body.interview.note,
            round: req.body.interview.round,
            jobId: req.body.interview.job.id,
            jobApplicant: req.body.interview.candidate.id,
            interviewer: req.body.interview.interviewer.id,
            organizer: req.body.interview.organizer.id,
            channel: req.body.interview.channel,
            result: interview.result,
            is_deleted: false,
            modified_by: req.body.interview.modified_by.id,
            modified_at: Date.now()
        }, {new: true});
    // Invite Participants
    await inviteCandidate(req, "Invitation: Interview scheduled with " + req.body["companyName"] + " for " + req.body.interview.job.name + " profile");
    await inviteInterviewer(req, "Interview scheduled with " + req.body.interview.candidate.name + " for " + req.body.interview.job.name + " profile");
    await inviteOrganizer(req, "Interview scheduled with " + req.body.interview.candidate.name + " for " + req.body.interview.job.name + " profile");
    // Return Interview Details
    return req.body.interview;
}

exports.getAllBetweenDates = async (req) => {
    let query = {
        is_deleted: {$ne: true},
        start: {
            $gte: new Date(new Date(parseInt(req.params.start)).toISOString()),
            $lt: new Date(new Date(parseInt(req.params.end)).toISOString())
        }
    };
    if (req.user.roles.indexOf('admin') === -1 && req.user.roles.indexOf('hr') === -1) {
        query.interviewer = req.user.id;
    }
    return await Interview.find(query
    ).populate({
            path: 'jobApplicant',
            model: 'Applicants',
        }
    );
}

exports.getAllByCandidate = async (req) => {
    return await Interview.find({jobApplicant: req.params.candidateId, is_deleted: {$ne: true}}).sort([['start', -1]]);
}

exports.getAllByInterview = async (req) => {
    return await Interview.aggregate([
        {$match: {_id: ObjectId(req.params.interviewId), is_deleted: {$ne: true}}},
        {
            $lookup: {
                from: 'interviewresults',
                localField: '_id',
                foreignField: 'interview_id',
                as: 'interviewResults'
            }
        }]);
}

exports.comment = async (req) => {
    return await Interview.findByIdAndUpdate({_id: req.body._id, is_deleted: {$ne: true}}, {
        comment: req.body.comment,
        result: req.body.result
    }, {new: true});
}

exports.getResult = async (req) => {
    return await interviewResults.find({interview: req.params.id, is_deleted: false}).populate('criteria');
}

exports.deleteResult = async (req) => {
    return await interviewResults.findByIdAndUpdate({_id: req.body.id}, {
        is_deleted: true
    }, {new: true});
}

exports.saveResult = async (req) => {
    let createInterviewResults = [];
    let results = [];
    let totalScore = 0;
    for (let index = 0; index < req.body.length; index++) {
        const criteria = req.body[index];
        if (!criteria._id) {
            createInterviewResults.push({
                interview: criteria.interview,
                criteria: criteria.criteria._id,
                score: criteria.score,
                is_deleted: false,
                created_at: Date.now(),
                created_by: criteria.created_by,
                modified_at: Date.now(),
                modified_by: criteria.modified_by
            });
            totalScore = totalScore + criteria.score;
        } else {
            totalScore = totalScore + criteria.score;
            // updates.push(criteria);
            let updatedCriteria = await interviewResults.findByIdAndUpdate({_id: criteria._id}, {
                score: criteria.score,
                criteria: criteria.criteria._id,
                is_deleted: false,
                modified_at: Date.now(),
                modified_by: criteria.modified_by
            }, {new: true});
            criteria.criteria.modified_at = updatedCriteria.modified_at;
            criteria.criteria.modified_by = updatedCriteria.modified_by;
            results.push(criteria);
        }
    }
    if (createInterviewResults.length > 0) {
        let criteria = await interviewResults.create(createInterviewResults);
        results = results.concat(criteria);

    }

    if (req.body && req.body.length > 0) {
        let score = totalScore / req.body.length;
        updateInterviewScore(req.body[0].interview, {
            modified_at: new Date(),
            score: score,
            modified_by: req.body[0].modified_by
        })
    }
    // updates.push(await interviewResults.create(results));
    return results;
    // await interviews.findOneAndUpdate({ _id: req.body.interview }, {
    //     result: req.body.result, comment: req.body.comment
    // }, { upsert: true });
}

async function updateInterviewScore(id, request) {
    await Interview.findByIdAndUpdate({_id: id}, request);
    await updateApplicantScore(id, request);
}

async function updateApplicantScore(id, request) {
    let interview = await Interview.findOne({_id: id});
    if (interview) {
        var allInterview = await Interview.find({jobApplicant: interview.jobApplicant});
        if (allInterview && allInterview.length) {
            let InterviewCounter = 0;
            let totalScore = 0;
            let index = 1;
            for (let index = 0; index < allInterview.length; index++) {
                if (allInterview[index].result !== "PENDING") {
                    totalScore = totalScore + allInterview[index]['score'];
                    InterviewCounter++;
                }

            }
            if (InterviewCounter) {
                request["score"] = totalScore / InterviewCounter;
                await Applicant.findByIdAndUpdate({_id: interview.jobApplicant}, request);
            }

        }

    }
}

exports.addCriteria = async (req) => {
    let criteria = await interviewCriteria.findOne({
        name: {"$regex": req.body.name, "$options": "i"},
        is_deleted: {$ne: true}
    });
    if (!criteria) {
        criteria = await interviewCriteria.create({
            name: req.body.name,
            created_at: new Date(),
            created_by: req.user.id,
            modified_at: new Date(),
            modified_by: req.user.id,
            is_deleted: false
        });
    }
    return criteria;
}

exports.getInterviews = async (req) => {
    let limit = 10, offset = 0, sortOrder = -1;
    let type = 'PENDING';
    if (req.query.limit) limit = parseInt(req.query.limit);
    if (req.query.offset) offset = parseInt(req.query.offset);
    if (req.query.type) type = req.query.type;
    if (req.query.sortOrder) sortOrder = parseInt(req.query.sortOrder);
    let query = {
        is_deleted: {$ne: true}
    };
    if (req.user.roles.indexOf('admin') === -1 && req.user.roles.indexOf('hr') === -1) {
        query = {
            is_deleted: {$ne: true},
            interviewer: req.user.id
        }
    }
    if (type.toUpperCase() === 'PENDING') {
        query.result = type
    } else {
        query.result = {$ne: 'PENDING'}
    }
    let count = await Interview.count(query);
    let interviews = await Interview.find(query).populate([{
        path: 'jobApplicant',
        model: 'Applicants'
    }, {
        path: 'jobId',
        model: 'Jobs',
        select: ['title']
    }]).sort([['start', sortOrder]]).skip(offset).limit(limit).exec();
    return {count, interviews};
}

async function inviteCandidate(req, title) {
    return await createInvitation(req, "Interview scheduled", title,
        `
        <p>Dear ${req.body.interview.candidate.name},</p>
        <p>You are invited for an interview with  ${req.body["companyName"]}. Please find your interview details below. </p>
        <p> <b>Interview details </b> <br>
         <b> Profile:</b> ${req.body.interview.job.name}</p>
         <b> Interview date: </b>${req.body.interview.localStartDate}<br/>
          <b>Interview Time: </b>${req.body.interview.localStartTime}<br/>
         <b> Mode : </b>${req.body.interview.channel}<br/></p>
          </p>
       Please reach out to us in case of any query or availability issues. Contact details are provided below.</p>
    `, req.body.interview.candidate.email, req.body.interview.organizer.email);
}

async function inviteInterviewer(req, title) {
    return await createInvitation(req, "Interview scheduled", title,
        `
        <p>Dear ${req.body.interview.interviewer.name},</p>
        <p>${req.body.interview.organizer.name} has invited you for an interview.
    <p> <b>Interview details </b> <br>
         <b> Candidate Name: </b>${req.body.interview.candidate.name}<br>
 
        <b>Profile:</b> ${req.body.interview.job.name}</p>
      <b> Interview date: </b>${req.body.interview.localStartDate}<br/>
          <b>Interview Time: </b>${req.body.interview.localStartTime}<br/>
        <b>  Mode : </b>${req.body.interview.channel}<br/></p>
        Please click on below link to access more details about the interview.</p>
        <p><a href="${config.website}/admin/interview/${req.body.interview.interview._id.toString()}">${config.website}/admin/interview/${req.body.interview.interview.id}</p>
    `, req.body.interview.interviewer.email, req.body.interview.organizer.email);
}

async function inviteOrganizer(req, title) {
    return await createInvitation(req, "Interview scheduled", title,
        `
        <p>Dear ${req.body.interview.organizer.name},</p>
        <p>You have successfully scheduled an interview.</p>
       
        <p> 
        <b>Interview details </b> <br>
             <b>Candidate Name:   </b> ${req.body.interview.candidate.name}<br>
           <b>Interviewer Name:</b>  ${req.body.interview.interviewer.name}<br>
           <b>Profile:</b>  ${req.body.interview.job.name}</p>
             <b> Interview date: </b>${req.body.interview.localStartDate}<br/>
          <b>Interview Time: </b>${req.body.interview.localStartTime}<br/>
             <b>Mode : </b>  ${req.body.interview.channel}<b><br/>
        <p>Please click on below link to access more details about the interview.<p>
        <p>${config.website}/admin/interview/${req.body.interview.interview._id.toString()}</p>
    `, req.body.interview.organizer.email, req.body.interview.organizer.email);
}

async function createInvitation(req, title, subject, body, attendee, organizer) {
    return new Promise(async (resolve, reject) => {
        try {
            let inviteData = {
                organizer: organizer,
                title: subject,
                start: req.body.interview.start,
                end: req.body.interview.end,
                sequence: req.body.interview.interview.sequence,
                uuid: req.body.interview.interview.uid,
                method: "REQUEST",
                status: "CONFIRMED",
                attendees: [{
                    email: attendee,
                    rsvp: true,
                    name: req.body.interview.candidate.name || " ",
                    partstat: "NEEDS-ACTION",
                    role: "REQ-PARTICIPANT"
                }],
            };
            let value = await ics.createInvitationIcsFile(inviteData);
            var email = {
                toEmail: attendee, // list of receivers
                title: title, // Subject line
                body: body,
                subject: subject,
                attachments: [{'filename': 'calendar.ics', 'content': value, 'type': 'text/Calendar'}]
            }
            emailService.sendEmail(email, (err, data) => {
                if (err) {
                    console.log("emailService", err);
                    reject(err)
                } else
                    resolve(data);
            });
        } catch (err) {
            console.log("emailServicerre", err);
            reject(err)
        }

    });
}


async function getCompany() {
    try {
        return await Company.findOne({});
    } catch (error) {
        console.log("getCompany--->", error);
        return config.companyInfo
    }

}


