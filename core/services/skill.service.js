var Skills = require('../models/skills');

module.exports.searchSkills =  async (req) => {
    return await Skills.find({ "name": { "$regex": req.params.text, "$options": "i" } }).limit(20);
}

module.exports.getAllByIds = async (skillIds) => {
    return await Skills.find({ '_id': { '$in': skillIds } }).lean().exec();
}
