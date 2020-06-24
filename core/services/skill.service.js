var Skills = require('../models/skills');

module.exports.searchSkills =  async (req) => {
    let skip = 0, limit = 10;
    if (req.query.limit) limit = parseInt(req.query.limit);
    if (req.query.offset) skip = parseInt(req.query.offset);
    let count = await Skills.count({ "name": { "$regex": req.query.search, "$options": "i" }, is_deleted: false });
    let skills = await Skills.find({ "name": { "$regex": req.query.search, "$options": "i" }, is_deleted: false }).skip(skip).limit(limit).exec();
    return { count, skills };
}

module.exports.getAllByIds = async (skillIds) => {
    return await Skills.find({ '_id': { '$in': skillIds }, 'is_deleted': false }).lean().exec();
}
