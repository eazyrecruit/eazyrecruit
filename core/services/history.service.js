var History = require('../models/history');
exports.create = async (history) => {
    return await History.create({
        applicant: history.applicant,
        pipeline: history.pipeline,
        job: history.job,
        created_by: history.createdBy,
        created_at: new Date(),
        modified_by: history.modifiedBy,
        modified_at: new Date(),
        is_deleted: false
    });
}

exports.get = async (applicantId) => {
    return await History.find({ applicant: applicantId });
}