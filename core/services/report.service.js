var Profiles = require('../models/applicant');

exports.resumeByDayBySource15Days = async (req) => {
    return new Promise((resolve, reject) => {
        Profiles.search({
                "range": {
                    "created_at": {
                        "gte": "now-15d"
                    }
                }
            
        }, {
            hydrate: false,
            "aggs": {
                "byday": {
                    "date_histogram": {
                        "field": "created_at",
                        "interval": "day"
                    },
                    "aggs": {
                        "value": {
                            "terms": { "field": "source.keyword" }
                        }
                    }
                }
            }
        }, function (err, results) {
            if (err) reject(err);
            else resolve(results);
        });
    })
}