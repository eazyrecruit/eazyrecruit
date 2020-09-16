const {google} = require('googleapis');
var companyService = require('./company.service');
var config = require('../config').config();
exports.getAnalyticsData = async (req) => {
    try {
        let company = await companyService.getCompany();
        let googleAnalytics = {};
        if (company && company.length) {
            googleAnalytics = await companyService.getSettingObject({id: company[0]._id, group: "googleAnalytics"});
        }
        if (googleAnalytics && googleAnalytics.analytics === true || googleAnalytics.analytics === 'true') {
            if (googleAnalytics["privateKey"] && googleAnalytics["clientEmail"] && googleAnalytics["viewId"]) {
                const jwt = new google.auth.JWT(googleAnalytics["clientEmail"], null,
                    googleAnalytics["privateKey"], config.googleAnalyticsApi);
                let result = {};
                let object = {
                    'auth': jwt,
                    'ids': 'ga:' + googleAnalytics["viewId"],
                    'start-date': '7daysAgo',
                    'end-date': 'today',
                    'dimensions': 'ga:date',
                    'metrics': 'ga:Pageviews'
                };
                return await getAnalytics(object);

            } else {
                throw "please add correct information";
            }

        } else {

            throw "googleAnalytics not enable";
        }
    } catch (error) {
        console.log("getAnalyticsData", error)
        throw  error;
    }


};

async function getAnalytics(object) {

    try {
        let result = await google.analytics('v3').data.ga.get(object);
        return getFilterData(result, object.metrics);
    } catch (error) {
        console.log("getAnalytics", error)
        throw  error;
    }

}

function getFormatData(index) {
    let date = new Date();
    date.setDate(date.getDate() - index);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    return year + "-" + month + "-" + day;
}


function getFilterData(result, metric) {
    if (result && result.data && result.data.totalsForAllResults) {
        return {
            totalsForAllResults: result.data.totalsForAllResults,
            rows: result.data.rows
        }
    } else {
        return {
            totalsForAllResults: {},
            rows: []

        }
    }

}
