const axios = require("axios");

function errorCallback(error) {
    if (error && error.statusText) {
        return {message: error.statusText};
    }
    if (error && error.response) {
        return {
            message: error.response.statusText
        };
    } else if (error && error.message) {
        return {message: error.message};
    } else {
        return {message: error};
    }
}

exports.post = async function (option, body = null, callback = errorCallback) {
    return new Promise((resolve, reject) => {
        try {
            option.method = "POST";
            if (body) {
                option.data = JSON.stringify(body);
            }
            axios(option).then((response) => {
                response = parseData(response);
                if (response && response.status >= 200 && response.status < 300) {
                    resolve(parseData(response.data));
                } else {
                    reject(callback(response));
                }
            }).catch((error) => {
                console.log("HttpService-->post--->", error);
                reject(callback(error));
            });
        } catch (error) {
            console.log("HttpService-->post--->catch", error);
            reject(callback(error));
        }
    })

}


exports.get = async function (option, errorCallback = errorCallback) {
    return new Promise((resolve, reject) => {
        try {
            option.method = "GET";
            axios(option).then((response) => {
                response = parseData(response);
                if (response && response.status >= 200 && response.status < 300) {
                    resolve(parseData(response.data));
                } else {
                    reject(errorCallback(response));
                }
            }).catch((error) => {
                console.log("HttpService-->post--->", error);
                reject(errorCallback(error));
            });
        } catch (error) {
            console.log("HttpService-->post--->catch", error);
            reject(errorCallback(error));
        }
    })

}


function parseData(data) {
    try {
        return JSON.parse(data);
    } catch (e) {
        return data;
    }
}
