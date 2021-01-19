let mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const ISODate = mongoose.Types.ISODate;
let Interview = require('../models/interview');
let interviewResults = mongoose.model('InterviewResults');
const ics = require('./ics').IcsService;
const uuidv1 = require('uuid/v1');
var emailService = require('../services/email.service');
let interviewCriteria = require('../models/interviewCriteria');
let Applicant = require('../models/applicant');
let config = require('../config').config();
var interviewIntegration = require('./interview.Integration.service');
let Company = require('../models/company');
var Activity = require('./activity.service');
exports.createAndInvite = async (req) => {
    try {
        const data = {
            jobName: req.body.interview.job.name,
            round: req.body.interview.round,
            uid: uuidv1(),
            companyName: "",
            start: req.body.interview.start,
            end: req.body.interview.end,
            note: req.body.interview.note,
            jobId: req.body.interview.job.id,
            jobApplicant: req.body.interview.candidate.id,
            owner: req.user.id,
            localStartDate: req.body.interview.localStartDate,
            channel: req.body.interview.channel,
            applicantName: req.body.interview.candidate.name,
            applicantEmail: req.body.interview.candidate.email,
            organizerName: req.body.interview.organizer.name,
            organizerId: req.body.interview.organizer.id,
            organizerEmail: req.body.interview.organizer.email,
            interviewerName: req.body.interview.interviewer.name,
            interviewerEmail: req.body.interview.interviewer.email,
            channelLink: req.body.interview.channelLink,
            interviewerId: req.body.interview.interviewer.id,
            localStartTime: req.body.interview.localStartTime
        };

        const requestResult = await interviewIntegration.getCreateInterviewRequest(data);
        const request = requestResult.request;
        let description = request.jobName + " profile ";
        if (request.round) {
            description = description + request.round + "round " + "interview created";
        } else {
            description = description + "interview created "
        }
        Activity.addActivity({
            applicant: request.jobApplicant,
            created_by: request.owner,
            title: "interview Created",
            description: description
        });

        // Invite Participants
        await inviteCandidate(request, "Invitation: Interview scheduled with " + request["companyName"] + " for " + request.jobName + " profile");
        await inviteInterviewer(request, "Interview scheduled with " + request.applicantName + " for " + request.jobName + " profile");
        await inviteOrganizer(request, "Interview scheduled with " + request.applicantName + " for " + request.jobName + " profile");
        // Return Interview Detailsa
        req.body.interview.interview = requestResult.result;
        req.body.interview.interview["_id"] = request.interviewId;
        return req.body.interview;
    } catch (error) {
        console.log("error", error);
        throw  error;
    }

};
exports.rescheduleAndInvite = async (req) => {
    try {
        let interview = await Interview.findById({_id: req.body.id});
        const data = {
            jobName: req.body.interview.job.name,
            round: req.body.interview.round,
            uid: interview.interview,
            companyName: "",
            sequence: interview.sequence + 1,
            start: req.body.interview.start,
            end: req.body.interview.end,
            note: req.body.interview.note,
            jobId: req.body.interview.job.id,
            jobApplicant: req.body.interview.candidate.id,
            owner: req.user.id,
            localStartDate: req.body.interview.localStartDate,
            channel: req.body.interview.channel,
            applicantName: req.body.interview.candidate.name,
            applicantEmail: req.body.interview.candidate.email,
            organizerName: req.body.interview.organizer.name,
            organizerId: req.body.interview.organizer.id,
            organizerEmail: req.body.interview.organizer.email,
            interviewerName: req.body.interview.interviewer.name,
            interviewerEmail: req.body.interview.interviewer.email,
            channelLink: req.body.interview.channelLink,
            result: interview.result,
            interviewerId: req.body.interview.interviewer.id,
            localStartTime: req.body.interview.localStartTime,
            channelProperty: interview.channelProperty,
            interviewId: interview._id.toString(),
            status: "CONFIRMED",
        };

        const request = await interviewIntegration.getUpdateInterviewRequest(data);
        let description = request.jobName + " profile ";
        if (request.round) {
            description = description + request.round + "round interview updated"
        } else {
            description = description + "interview Updated "
        }
        Activity.addActivity({
            applicant: request.jobApplicant,
            created_by: request.owner,
            title: "interview Created",
            description: description
        });

        // Invite Participants
        await inviteCandidate(request, "Invitation: Interview scheduled with " + request["companyName"] + " for " + request.jobName + " profile");
        await inviteInterviewer(request, "Interview scheduled with " + request.applicantName + " for " + request.jobName + " profile");
        await inviteOrganizer(request, "Interview scheduled with " + request.applicantName + " for " + request.jobName + " profile");
        // Return Interview Details
        req.body.interview.interview = interview;
        return req.body.interview;
    } catch (error) {
        console.log("error", error);
        throw  error;
    }


}
exports.startInterView = async (id) => {
    try {
        let interview = await Interview.findById({_id: id});
        const data = {
            channelProperty: interview.channelProperty,
            interviewId: interview.interviewId,
            channel: interview.channel,
            channelLink: interview.channelLink

        };

        return await interviewIntegration.startInterview(data);
    } catch (error) {
        throw  error;
    }


}
exports.getAllBetweenDates = async (req) => {
    let query = {
        is_deleted: {$ne: true},
        result: "PENDING",
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
    return await Interview.find({
        jobApplicant: req.params.candidateId,
        result: {$ne: "CANCEL"},
        is_deleted: {$ne: true}
    }).sort([['start', -1]]);
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
    let interview = await Interview.findOne({_id: req.body._id, is_deleted: {$ne: true}}).populate("jobId");
    interview["result"] = req.body.result;
    interview["comment"] = req.body.comment;
    await interview.save();
    let description = interview.jobId.title + " profile ";
    if (interview.round) {
        description = description + interview.round + "round " + "interview Result set to  " + req.body.result
    } else {
        description = description + "interview Result set to  " + req.body.result
    }
    Activity.addActivity({
        applicant: interview.jobApplicant,
        created_by: req.user.id,
        title: "Updated Interview Result",
        description: description
    });
    return true;
}

exports.getResult = async (req) => {
    return await interviewResults.find({interview: req.params.id, is_deleted: false}).populate('criteria');
}

exports.deleteResult = async (req) => {
    return await interviewResults.findByIdAndUpdate({_id: req.body.id}, {
        is_deleted: true
    }, {new: true});
}

exports.cancelInterview = async (id, user) => {
    return new Promise(async (resolve, reject) => {
        try {
            let interview = await Interview.findOne({_id: id}).populate("interviewer", ['email', "name", "firstName", "lastName"]).populate([{
                path: 'jobApplicant',
                model: 'Applicants'
            }, {
                path: 'jobId',
                model: 'Jobs',
                select: ['title']
            }]).populate("organizer", ['email', "name", "firstName", "lastName"]);
            interview["result"] = "CANCEL";
            interview["modified_by"] = user;
            interview["modified_at"] = new Date();
            await interview.save();
            SendDeleteInterviewNotification(interview);
            let description = interview.jobId.title + " profile ";
            if (interview.round) {
                description = description + interview.round + "round " + "interview cancel";
            } else {
                description = description + "interview cancel "
            }
            Activity.addActivity({
                applicant: interview.jobApplicant._id,
                created_by: user,
                title: "Cancel Interview",
                description: description
            });
            resolve(true);
        } catch (error) {
            return reject(error);
        }
    });

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
        let score = Math.floor(totalScore / req.body.length);
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
                request["score"] = Math.floor(totalScore / InterviewCounter);
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
    let limit = 10, offset = 0, sortOrder = 1;
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
    } else if (type.toUpperCase() === 'CANCEL') {
        query.result = type
    } else {
        query.result = {$nin: ["PENDING", "CANCEL"]}
    }
    let count = await Interview.count(query);
    let interviews = await Interview.find(query).populate("modified_by", ['email', "name"]).populate("interviewer", ['email', "name", "firstName", "lastName"]).populate([{
        path: 'jobApplicant',
        model: 'Applicants'
    }, {
        path: 'jobId',
        model: 'Jobs',
        select: ['title']
    }]).sort({start: -1}).skip(offset).limit(limit).exec();
    return {count, interviews};
}

async function inviteCandidate(request, title) {
    return await createInvitation(request, "Interview scheduled", title,
        `
        <p>Dear ${request.applicantName},</p>
        <p>You are invited for an interview with  ${request.companyName}. Please find your interview details below. </p>
        <p> <b>Interview details </b> <br>
         <b> Profile:</b> ${request.jobName}</p>
         <b> Interview date: </b>${request.localStartDate}<br/>
          <b>Interview Time: </b>${request.localStartTime}<br/>
         <b> Mode : </b>${request.channel}  <a href="${request.channelLink}">${request.channelLink}</a><br/></p>
          </p>
       Please reach out to us in case of any query or availability issues. Contact details are provided below.</p>
    `, request.applicantEmail, request.organizerEmail);
}

async function inviteInterviewer(req, title) {
    return await createInvitation(req, "Interview scheduled", title,
        `
        <p>Dear ${req.interviewerName},</p>
        <p>${req.organizerName} has invited you for an interview.
    <p> <b>Interview details </b> <br>
         <b> Candidate Name: </b>${req.applicantName}<br>
 
        <b>Profile:</b> ${req.jobName}</p>
      <b> Interview date: </b>${req.localStartDate}<br/>
          <b>Interview Time: </b>${req.localStartTime}<br/>
        <b>  Mode : </b>${req.channel}  <a href="${req.channelLink}">${req.channelLink}</a> <br/></p>
        Please click on below link to access more details about the interview.</p>
        <p><a href="${config.website}/admin/interview/${req.interviewId.toString()}">${config.website}/admin/interview/${req.interviewId.toString()}</p>
    `, req.interviewerEmail, req.organizerEmail);
}

async function inviteOrganizer(req, title) {
    return await createInvitation(req, "Interview scheduled", title,
        `
        <p>Dear ${req.organizerName},</p>
        <p>You have successfully scheduled an interview.</p>
       
        <p> 
        <b>Interview details </b> <br>
             <b>Candidate Name:   </b> ${req.applicantName}<br>
           <b>Interviewer Name:</b>  ${req.interviewerName}<br>
           <b>Profile:</b>  ${req.jobName}</p>
             <b> Interview date: </b>${req.localStartDate}<br/>
          <b>Interview Time: </b>${req.localStartTime}<br/>
             <b>Mode : </b>  ${req.channel}    <a href="${req.channelLink}">${req.channelLink}</a> <b><br/>
        <p>Please click on below link to access more details about the interview.<p>
        <p>${config.website}/admin/interview/${req.interviewId.toString()}</p>
    `, req.organizerEmail, req.organizerEmail);
}

async function createInvitation(req, title, subject, body, attendee, organizer) {
    return new Promise(async (resolve, reject) => {
        try {
            let inviteData = {
                organizer: organizer,
                title: subject,
                start: req.start,
                end: req.end,
                sequence: req.sequence,
                uuid: req.uid,
                method: "REQUEST",
                status: "CONFIRMED",
                body: "Please Join On " + req.channel + " " + req.channelLink,
                attendees: [{
                    email: attendee,
                    rsvp: true,
                    name: req.applicantName || " ",
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

async function SendDeleteInterviewNotification(data) {
    return new Promise(async (resolve, reject) => {
        try {
            let company = await getCompany();
            let applicantName = getFullName(data.jobApplicant);
            let request = {
                organizer: data.organizer.email,
                start: data.start,
                end: data.end,
                sequence: data.sequence,
                uuid: data.uid,
                name: applicantName
            };
            await createDeleteInvitation(request, "Interview Cancel", " Cancel Invitation: Interview Cancel with " + company.name + " for " + data.jobId.title + " profile", data.jobApplicant.email);
            await createDeleteInvitation(request, "Interview Cancel", " Cancel Invitation: Interview Cancel with " + applicantName + " for " + data.jobId.title + " profile", data.interviewer.email);
            await createDeleteInvitation(request, "Interview Cancel", " Cancel Invitation: Interview Cancel with " + applicantName + " for " + data.jobId.title + " profile", data.organizer.email);
        } catch (err) {
            console.log("SendDeleteInterviewNotifaction", err);
            //reject(err)
        }

    });
}

async function createDeleteInvitation(req, title, subject, attendee) {
    return new Promise(async (resolve, reject) => {
        try {
            let inviteData = {
                organizer: req.organizer,
                title: subject,
                start: req.start,
                end: req.end,
                sequence: req.sequence,
                uuid: req.uid,
                method: "CANCEL",
                status: "CANCELLED",
                attendees: [{
                    email: attendee,
                    rsvp: true,
                    name: req.name || " ",
                    partstat: "NEEDS-ACTION",
                    role: "REQ-PARTICIPANT"
                }],
            };
            let value = await ics.createInvitationIcsFile(inviteData);
            var email = {
                toEmail: attendee, // list of receivers
                title: title, // Subject line
                body: "",
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

function getFullName(data) {
    let name = data.firstName;
    if (data.middleName) name = name + ' ' + data.middleName;
    if (data.lastName) name = name + ' ' + data.lastName;
    if (!name) name = data.email;

    return name;
}

async function getCompany() {
    try {
        return await Company.findOne({});
    } catch (error) {
        console.log("getCompany--->", error);
        return config.companyInfo
    }

}


