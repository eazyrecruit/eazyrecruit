var mongoose = require('mongoose');
//var Logs = mongoose.model('logs');

module.exports.response = (req, err, logType, records, res) => {
    if (err) {
        // var logsInstance = new Logs();
        // logsInstance.log_type = logType;
        // logsInstance.user_id = 0;
        // logsInstance.log_data = err;
        // logsInstance.is_deleted = 0;
        // logsInstance.save();
        if (err.hasOwnProperty('status')) {
            res.status(err.status).json({ 
                error: {
                    message: err.message
                } 
            });            
        } else {
            res.status(200).json({error: { data: err.message }});
        }
    } else {
        res.status(200).json({success: {data: records}});
    } 
};

module.exports.sendJsonStream = (records, res) => {
    res.status(200).send(records);
};
module.exports.successResponse = (records, logType, res) => {
    if (records) {
        res.status(200).json({success: {data: records}});
    } else {
        console.log('success data is required');
    }
};

module.exports.errorResponse = (err, logType, res) => {
    if (err && err.hasOwnProperty('status')) {
        res.status(err.status).json({ 
            error: {
                message: err.message
            } 
        });            
    } else {
        console.log('error data and error status is required');
    }
};