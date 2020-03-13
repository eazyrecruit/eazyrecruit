var Skills = require('../models/skills');

module.exports.searchSkills =  async (req) => {
    let skip = 0, limit = 10;
    if (req.query.limit) limit = parseInt(req.query.limit);
    return await Skills.find({ "name": { "$regex": req.query.search, "$options": "i" }, is_deleted: false }).skip(skip).limit(limit).exec();
}

module.exports.getAllByIds = async (skillIds) => {
    return await Skills.find({ '_id': { '$in': skillIds } }).lean().exec();
}
