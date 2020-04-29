let mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const ISODate = mongoose.Types.ISODate;
let Interview = require('../models/interview')
let interviewResults = mongoose.model('InterviewResults');
const ics = require('ics')
const uuidv1 = require('uuid/v1');
var emailService = require('../services/email.service');
let interviewCriteria = require('../models/interviewCriteria');

exports.createAndInvite = async (req) => {
    req.body.interview.interview = await Interview.create(
        {
            uid: uuidv1(),
            sequence: 1,
            status: "CONFIRMED",
            start: new Date(new Date(req.body.interview.start).toUTCString()),
            end: new Date(new Date(req.body.interview.end).toUTCString()),
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
    await inviteCandidate(req, 'Interview scheduled');
    await inviteInterviewer(req, 'Interview scheduled');
    await inviteOrganizer(req, 'Interview scheduled');
    // Return Interview Details
    return req.body.interview;
}

exports.rescheduleAndInvite = async (req) => {
    let interview = await Interview.findById({ _id: req.body.id });
    req.body.interview.interview = await Interview.findByIdAndUpdate({ _id: req.body.id, is_deleted: { $ne: true } },
        {
            sequence: req.body.sequence + 1,
            status: "CONFIRMED",
            start: new Date(new Date(req.body.interview.start).toUTCString()),
            end: new Date(new Date(req.body.interview.end).toUTCString()),
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
    await inviteCandidate(req, 'Interview rescheduled');
    await inviteInterviewer(req, 'Interview rescheduled');
    await inviteOrganizer(req, 'Interview rescheduled');
    // Return Interview Details
    return req.body.interview;
}

exports.getAllBetweenDates = async (req) => {
    let query = {
        is_deleted: { $ne: true },
        start: {
            $gte: new Date(new Date(parseInt(req.params.start)).toISOString()),
            $lt: new Date(new Date(parseInt(req.params.end)).toISOString())
        }
    };
    if (req.user.roles.indexOf('admin') === -1) {
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
    return await Interview.find({ jobApplicant: req.params.candidateId, is_deleted: { $ne: true } }).sort([['start', -1]]);
}

exports.getAllByInterview = async (req) => {
    return await Interview.aggregate([
        { $match: { _id: ObjectId(req.params.interviewId), is_deleted: { $ne: true } } },
        { $lookup: { from: 'interviewresults', localField: '_id', foreignField: 'interview_id', as: 'interviewResults' } }]);
}

exports.comment = async (req) => {
    return await Interview.findByIdAndUpdate({ _id: req.body._id, is_deleted: { $ne: true } }, {
        comment : req.body.comment,
        result : req.body.result
    }, {new : true});
}

exports.getResult = async (req) => {
    return await interviewResults.find({ interview: req.params.id , is_deleted: false}).populate('criteria');
}

exports.deleteResult = async (req) => {
    return await interviewResults.findByIdAndUpdate({ _id: req.body.id }, {
        is_deleted : true
    }, {new : true});
}

exports.saveResult = async (req) => {
    let createInterviewResults = [];
    let results = [];
    for (let index = 0; index < req.body.length; index++) {
        const criteria = req.body[index];
        if (!criteria._id) {
            createInterviewResults.push({
                interview: criteria.interview,
                criteria: criteria.criteriaId, 
                score: criteria.score,
                is_deleted: false,
                created_at: Date.now(),
                created_by: criteria.created_by,
                modified_at: Date.now(),
                modified_by: criteria.modified_by });
        } else {
            // updates.push(criteria);
            let updatedCriteria = await interviewResults.findByIdAndUpdate({_id : criteria._id}, {
                score: criteria.score,
                criteria: criteria.criteria._id,
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
    // updates.push(await interviewResults.create(results));
    return results;
    // await interviews.findOneAndUpdate({ _id: req.body.interview }, {
    //     result: req.body.result, comment: req.body.comment
    // }, { upsert: true });
}

exports.addCriteria = async (req) => {
    let criteria = interviewCriteria.find({ name: req.body.name.toLowerCase(), is_deleted: { $ne: true} });
    if (!criteria) {
        interviewCriteria.create({
            name: req.body.name,
            created_at: new Date(),
            created_by: req.user.id,
            modified_at: new Date(),
            modified_by: req.user.id,
            is_deleted: false
        });
    } else {
        return criteria;
    }
}

exports.getInterviews = async (req) => {
    let limit = 10, offset = 0, sortOrder = -1;
    let type = 'PENDING';
    if (req.query.limit) limit = parseInt(req.query.limit);
    if (req.query.offset) offset = parseInt(req.query.offset);
    if (req.query.type) type = req.query.type;
    if (req.query.sortOrder) sortOrder = parseInt(req.query.sortOrder);
    let query = {
        is_deleted: { $ne: true }
    };
    if (req.user.roles.indexOf('admin') === -1) {
        query = {
            is_deleted: { $ne: true },
            interviewer: req.user.id
        }
    }
    if (type.toUpperCase() === 'PENDING') {
        query.result = type
    } else {
        query.result = { $ne: 'PENDING' }
    }
    let count = await Interview.count(query);
    let interviews = await Interview.find(query).populate([{
        path: 'jobApplicant',
        model: 'Applicants'
    },{
        path: 'jobId',
        model: 'Jobs',
        select: ['title']
    }]).sort([['start', sortOrder]]).skip(offset).limit(limit).exec();
    return { count, interviews };
}

async function inviteCandidate(req) {
    return await createInvitation(req, 'Interview scheduled',
        `
        <p>Dear ${req.body.interview.candidate.name},</p>
        <p>You are invited to attend an interview for the following profile.</p>
        <p>Profile: <b>${req.body.interview.job.name}<b><br/>
        Interview date: <b>${new Date(req.body.interview.start).toLocaleString()}<b><br/>
        </p>
        <p>Best regards,<br>
        Team Eazyrecruit</p>
    `, req.body.interview.candidate.email, req.body.interview.organizer.email);
}

async function inviteInterviewer(req, title) {
    return await createInvitation(req, title,
        `
        <p>Dear ${req.body.interview.interviewer.name },</p>
        <p>${req.body.interview.organizer.name} invited you to interview ${req.body.interview.candidate.name} for the profile ${req.body.interview.job.name}.
        Please click on below link to access more details about the interview.</p>
        <p><a href="https://web.easyrecruit.in/interview/${req.body.interview.interview._id.toString()}">https://web.easyrecruit.in/interview/${req.body.interview.interview.id}</p>
        <p>Best regards,<br>
        Team Easyrecruit</p>
    `, req.body.interview.interviewer.email, req.body.interview.organizer.email);
}

async function inviteOrganizer(req, title) {
    return await createInvitation(req, title,
        `
        <p>Dear ${req.body.interview.organizer.name},</p>
        <p>You have successfully scheduled an interview.</p>
        <p> Candidate Name: ${req.body.interview.candidate.name}<br>
        Interviewer Name: ${req.body.interview.interviewer.name}<br>
        Profile: ${req.body.interview.job.name}</p>
        <p>Please click on below link to access more details about the interview.<p>
        <p>https://web.easyrecruit.in/interview/${req.body.interview.interview._id.toString()}</p>
        <p>Best regards,<br>
        Team Eazyrecruit</p>
    `, req.body.interview.organizer.email, req.body.interview.organizer.email);
}

async function createInvitation(req, title, body, attendee, organizer) {
    return new Promise(async (resolve, reject) => {
        req.body.interview.start = new Date(req.body.interview.start);
        req.body.interview.end = new Date(req.body.interview.end);
        const event = {
            start: [
                req.body.interview.start.getFullYear(),
                req.body.interview.start.getMonth() + 1,
                req.body.interview.start.getDate(),
                req.body.interview.start.getHours(),
                req.body.interview.start.getMinutes()
            ],
            end: [
                req.body.interview.end.getFullYear(),
                req.body.interview.end.getMonth() + 1,
                req.body.interview.end.getDate(),
                req.body.interview.end.getHours(),
                req.body.interview.end.getMinutes()
            ],
            title: title,
            description: body,
            organizer: { email: organizer },
            attendees: [{ email: attendee, role: 'REQ-PARTICIPANT' }],
            uid: req.body.interview.interview.uid,
            sequence: req.body.interview.interview.sequence,
            status: req.body.interview.interview.status
        };
        ics.createEvent(event, (error, value) => {
            if (error) reject(error);
            else {
                var email = {
                    toEmail: attendee, // list of receivers
                    subject: title, // Subject line
                    body: body,
                    attachments: [{ 'filename': 'calendar.ics', 'content': value, 'type': 'text/Calendar' }]
                }
                emailService.sendEmail(email, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            }
        });
    });
}