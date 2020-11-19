const ics = require('ics');
let moment = require("moment");

class IcsService {
    async createInvitation(data) {
        return new Promise(async (resolve, reject) => {
            const event = {
                start: moment(data.start).format('YYYY-M-D-H-m').split("-"),
                end: moment(data.end).format('YYYY-M-D-H-m').split("-"),
                title: data.title,
                method: data.method || "REQUEST",
                description: data.body,
                organizer: {email: data.organizer, name: data.organizer},
                attendees: data.attendees,
                uid: data.uuid,
                sequence: data.sequence + 1,
                status: data.status || "CONFIRMED"
            };
            try {
                ics.createEvent(event, (error, value) => {
                    if (error) {
                       console.log("IcsService--->createEvent", error);
                        reject(error);
                    } else {
                        resolve(value)
                    }
                });
            } catch (error) {
               console.log("IcsService--->createInvitation", error);
                reject(error);
            }
        });
    }

    async createInvitationIcsFile(inviteData) {
        return await this.createInvitation(inviteData);

    }

    async createCancelEventIcsFile(meeting, events, organizerEmail, attendees) {
        let inviteData = {
            organizer: organizerEmail,
            title: meeting.name,
            meetingStart: events.meetingStart,
            meetingEnd: events.meetingEnd,
            sequence: events.sequence,
            uuid: events.uuid,
            repeating: events.repeating,
            method: "CANCEL",
            status: "CANCELLED",
            attendees: attendees,
        };
        return await this.createInvitation(inviteData);
    }
}

module.exports.IcsService = new IcsService();
