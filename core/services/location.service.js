var Locations = require('../models/location');

module.exports.searchLocation = async (req) => {
    return await Locations.find({ '$or': [{ "city": { "$regex": req.params.text, "$options": "i" } }, 
        { "state": { "$regex": req.params.text, "$options": "i" } }] }).limit(20);
}

module.exports.getAllByIds = async (locationIds) => {
    return await Locations.find({ '_id': { '$in': locationIds } }).lean().exec();
};

module.exports.location = async (locations, id) => {
    let states = [];
    if (locations && locations.length) {
        try {
            for (let i = 0; i < locations.length; i++) {
                let location = new Locations();
                location.country = 'India';
                location.city = locations[i].name;
                location.state = locations[i].state;
                location.is_deleted = false;
                location.created_by = id;
                location.created_at = new Date();
                location.modified_by = id;
                location.modified_at = new Date();
                states.push(location);
            }
            let result = await Locations.create(states);    
            return result;
        } catch (error) {
            return error;
        }
    }
}
