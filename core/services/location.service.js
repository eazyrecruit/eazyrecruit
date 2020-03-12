var Locations = require('../models/location');

module.exports.searchLocation = async (req) => {
    return await Locations.find({ '$or': [{ "city": { "$regex": req.params.text, "$options": "i" } }, 
        { "state": { "$regex": req.params.text, "$options": "i" } }] }).limit(20);
}

module.exports.getAllByIds = async (locationIds) => {
    return await Locations.find({ '_id': { '$in': locationIds } }).lean().exec();
};
