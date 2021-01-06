let Activity = require('../models/activity');
exports.getActivity = getActivity = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = {};
            if (data.applicant) {
                query["applicant"] = data.applicant;
            }
            const count = await Activity.find(query).countDocuments();
            let result = await Activity.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit)).populate("created_by", ["name", "email", "picture"]);
            resolve({total: count, records: result});
        } catch (error) {
            reject(error);
        }


    })
};


exports.addActivity = async (data) => {
    let activity = {
        applicant: data.applicant,
        created_by: data.created_by
    };
    if (data.title) {
        activity["title"] = data.title;
    }
    if (data.description) {
        activity["description"] = data.description;
    }
    return await new Activity(activity).save();

};
