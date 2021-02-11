var companyService = require('./company.service');
let config = require('../config').config();
const httpService = require('./httpService');
const uuidv1 = require('uuid/v1');
let Company = require('../models/company');
let Interview = require('../models/interview');
exports.getCreateInterviewRequest = async function (request) {
    switch (request.channel) {
        case  "GoLiveMeet": {
            return createGoLiveMeetInterview(request);
        }
        default: {
            return getDefault(request)
        }
    }
};


exports.getDeleteInterviewRequest = async function (request) {
    switch (request.channel) {
        case  "GoLiveMeet": {
            return deleteGoLiveMeetInterview(request);
        }
        default: {
            return null;
        }
    }
};
exports.getUpdateInterviewRequest = async function (request) {
    switch (request.channel) {
        case  "GoLiveMeet": {
            return updateGoLiveMeetInterview(request);
        }
        default: {
            return getDefaultUpdate(request)
        }

    }

};
exports.startInterview = async function (request) {
    switch (request.channel) {
        case  "GoLiveMeet": {
            return startGoLiveMeetInterview(request);
        }
        default: {
            return request.channelLink
        }
    }
};

async function createInterview(request) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await Interview.create(
                {
                    uid: request.uid,
                    sequence: 1,
                    status: "CONFIRMED",
                    start: new Date(new Date(request.start)),
                    end: new Date(new Date(request.end)),
                    note: request.note,
                    round: request.round,
                    jobId: request.jobId,
                    jobApplicant: request.jobApplicant,
                    interviewer: request.interviewerId,
                    organizer: request.organizerId,
                    channel: request.channel,
                    channelLink: request.channelLink,
                    result: "PENDING",
                    is_deleted: false,
                    channelProperty: request.channelProperty || {},
                    created_by: request.owner,
                    created_at: Date.now(),
                    modified_by: request.owner,
                    modified_at: Date.now()
                });

            request["interviewId"] = result._id;
            resolve({request: request, result: result});
        } catch (error) {
            reject(error);
        }

    })

}

async function updateInterview(request) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await Interview.update({
                _id: request.interviewId
            }, {
                $set: {
                    uid: request.uid,
                    sequence: request.sequence,
                    status: request.status,
                    start: new Date(new Date(request.start)),
                    end: new Date(new Date(request.end)),
                    note: request.note,
                    round: request.round,
                    jobId: request.jobId,
                    jobApplicant: request.jobApplicant,
                    interviewer: request.interviewerId,
                    organizer: request.organizerId,
                    channel: request.channel,
                    channelLink: request.channelLink,
                    result: request.result,
                    channelProperty: request.channelProperty || {},
                    modified_by: request.owner,
                    modified_at: Date.now()
                }
            });
            resolve(request);
        } catch (error) {
            reject(error);
        }

    })

}

async function getDefault(request) {
    return new Promise(async (resolve, reject) => {
        try {
            let companyInformation = await getCompany();
            request["companyName"] = companyInformation.name;
            resolve(await createInterview(request));
        } catch (error) {
            reject(error);
        }

    })

}

async function getDefaultUpdate(request) {
    return new Promise(async (resolve, reject) => {
        try {
            let companyInformation = await getCompany();
            request["companyName"] = companyInformation.name;
            resolve(await updateInterview(request));
        } catch (error) {
            reject(error);
        }

    })

}

function deleteGoLiveMeetInterview(request) {
    return new Promise(async (resolve, reject) => {
        try {
            const goLiveMeetConfiguration = await getGoLiveMeetConfiguration();
            request["companyName"] = goLiveMeetConfiguration.companyName;
            if (request.channelProperty && request.channelProperty.channelId) {
                let result = await deleteGoLiveMeetMeeting(goLiveMeetConfiguration.goLiveMeetClientID, goLiveMeetConfiguration.goLiveMeetClientSecret, request.channelProperty.channelId);
                resolve(result);
            } else {
                reject({message: "GoLiveMeet interview  meetingID not found "});
            }
        } catch (error) {
            reject(error);
        }

    })
}

function createGoLiveMeetInterview(request) {
    return new Promise(async (resolve, reject) => {
        try {
            const goLiveMeetConfiguration = await getGoLiveMeetConfiguration();
            request["companyName"] = goLiveMeetConfiguration.companyName;
            let body = {
                "meetingName": request.jobName + " Profile Interview ",
                "meetingStart": request.start,
                "meetingEnd": request.end,
                "attendees": [
                    {
                        "email": request.applicantEmail,
                        "firstName": request.applicantName
                    }
                ],
                "redirectionUrl": "",
                "enableWebcam": true,
                "enableMicrophone": true,
                "enablePublicChat": true,
                "askModerator": false,
                "hideUserList": true,
                "commonChat": true
            };
            let result = await createGoLiveMeetMeeting(goLiveMeetConfiguration.goLiveMeetClientID, goLiveMeetConfiguration.goLiveMeetClientSecret, body);
            request["channelLink"] = result.attendeesLink[request.applicantEmail]["meetingUrl"] || '';
            request["channelProperty"] = {
                meetingID: result.meetingID,
                channelId: result._id.toString(),
            };
            resolve(await createInterview(request));

        } catch (error) {
            reject(error);
        }

    })
}

function updateGoLiveMeetInterview(request) {
    return new Promise(async (resolve, reject) => {
        try {
            const goLiveMeetConfiguration = await getGoLiveMeetConfiguration();
            request["companyName"] = goLiveMeetConfiguration.companyName;
            let body = {
                "meetingName": request.jobName + " Profile Interview ",
                "meetingStart": request.start,
                "meetingEnd": request.end,
                "attendees": [
                    {
                        "email": request.applicantEmail,
                        "firstName": request.applicantName
                    }
                ],
                "redirectionUrl": "",
                "enableWebcam": true,
                "enableMicrophone": true,
                "enablePublicChat": true,
                "askModerator": false,
                "hideUserList": true,
                "commonChat": true
            };
            if (request.channelProperty && request.channelProperty.channelId) {
                body["id"] = request.channelProperty.channelId;
                body["meetingID"] = request.channelProperty.meetingID;
                let result = await updateGoLiveMeetMeeting(goLiveMeetConfiguration.goLiveMeetClientID, goLiveMeetConfiguration.goLiveMeetClientSecret, body);
                request["channelLink"] = result.attendeesLink[request.applicantEmail]["meetingUrl"] || '';
                resolve(await updateInterview(request));
            } else {
                let result = await createGoLiveMeetMeeting(goLiveMeetConfiguration.goLiveMeetClientID, goLiveMeetConfiguration.goLiveMeetClientSecret, body);
                request["channelLink"] = result.attendeesLink[request.applicantEmail]["meetingUrl"] || '';
                request["channelProperty"] = {
                    meetingID: result.meetingID,
                    channelId: result._id.toString(),
                };
                resolve(await updateInterview(request));
            }


        } catch (error) {
            reject(error);
        }

    })
}

function getGoLiveMeetConfiguration() {
    return new Promise(async (resolve, reject) => {
        try {
            let companyInformation = await getInterviewIntegration();
            let interviewIntegration = companyInformation.interviewIntegration;
            if (interviewIntegration.goLiveMeetClientID && interviewIntegration.goLiveMeetClientSecret && interviewIntegration.goLiveMeet === "true" || interviewIntegration.goLiveMeet === true) {
                resolve({
                    companyName: companyInformation.company.name,
                    goLiveMeetClientSecret: interviewIntegration.goLiveMeetClientSecret,
                    goLiveMeetClientID: interviewIntegration.goLiveMeetClientID,
                })
            } else {
                reject({message: "Please Enable GoLiveMeet interview Integration"});
            }

        } catch (error) {
            reject(error);
        }

    })

}

function getGoLiveMeetMeetingData(data) {

    if (data && data.error) {
        throw  {message: data.error.message}
    } else {
        if (data && data.success) {
            return data.success.data;
        } else {
            throw  {message: "internal server error"}
        }
    }
}

function startGoLiveMeetInterview(request) {
    return new Promise(async (resolve, reject) => {
        try {
            const goLiveMeetConfiguration = await getGoLiveMeetConfiguration();
            request["companyName"] = goLiveMeetConfiguration.companyName;
            if (request.channelProperty && request.channelProperty.meetingID) {
                let result = await startGoLiveMeetMeeting(goLiveMeetConfiguration.goLiveMeetClientID, goLiveMeetConfiguration.goLiveMeetClientSecret, {
                    meetingID: request.channelProperty.meetingID,
                    meetingOwner: request.interviewerName
                });
                resolve(result);
            } else {
                reject({message: "GoLiveMeet interview  meetingID not found "});
            }
        } catch (error) {
            reject(error);
        }

    })
}

function deleteGoLiveMeetMeeting(goLiveMeetClientID, goLiveMeetClientSecret, channelId) {
    return new Promise(async (resolve, reject) => {
        try {
            let option = getGoLiveOption(goLiveMeetClientID, goLiveMeetClientSecret, config.InterviewInterviewIntegration.GoLiveMeet.deleteWebinar);
            let result = getGoLiveMeetMeetingData(await httpService.post(option, {id: channelId}));
            resolve(result);
        } catch (error) {
            reject(error);
        }

    })
}

function startGoLiveMeetMeeting(goLiveMeetClientID, goLiveMeetClientSecret, body) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("body", body);
            let option = getGoLiveOption(goLiveMeetClientID, goLiveMeetClientSecret, config.InterviewInterviewIntegration.GoLiveMeet.startWebinar);
            let result = getGoLiveMeetMeetingData(await httpService.post(option, body));
            resolve(result);
        } catch (error) {
            reject(error);
        }

    })
}

function createGoLiveMeetMeeting(goLiveMeetClientID, goLiveMeetClientSecret, body) {
    return new Promise(async (resolve, reject) => {
        try {
            let option = getGoLiveOption(goLiveMeetClientID, goLiveMeetClientSecret, config.InterviewInterviewIntegration.GoLiveMeet.createWebinar);
            let result = getGoLiveMeetMeetingData(await httpService.post(option, body));
            resolve(result);

        } catch (error) {
            reject(error);
        }

    })
}

function updateGoLiveMeetMeeting(goLiveMeetClientID, goLiveMeetClientSecret, body) {
    return new Promise(async (resolve, reject) => {
        try {
            let option = getGoLiveOption(goLiveMeetClientID, goLiveMeetClientSecret, config.InterviewInterviewIntegration.GoLiveMeet.updateWebinar);
            let result = getGoLiveMeetMeetingData(await httpService.post(option, body));
            resolve(result);

        } catch (error) {
            reject(error);
        }

    })
}

function getGoLiveOption(goLiveMeetClientID, goLiveMeetClientSecret, path) {
    return {
        url: `${config.InterviewInterviewIntegration.GoLiveMeet.BaseUrl}/${path}`,
        headers: {
            "Content-Type": "application/json",
            clientID: goLiveMeetClientID,
            clientSecret: goLiveMeetClientSecret
        }
    };

}

async function getInterviewIntegration() {
    try {
        let company = await companyService.getCompany();
        let interviewIntegration = {};
        if (company && company.length) {
            interviewIntegration = await companyService.getSettingObject({
                id: company[0]._id,
                group: "interviewIntegration"
            });
            return {
                company: company[0],
                interviewIntegration: interviewIntegration
            }
        } else {
            return {
                company: config.companyInfo,
                interviewIntegration: {}
            }
        }
    } catch (error) {
        console.log("getCompany--->", error);
        return {
            company: config.companyInfo,
            interviewIntegration: {}
        }
    }

}

async function getCompany() {
    try {
        return await Company.findOne({});
    } catch (error) {
        console.log("getCompany--->", error);
        return config.companyInfo
    }

}
