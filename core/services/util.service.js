var fs = require('fs');

exports.readWriteFile = async (file, imageName) => {
    return new Promise(async (resolve, reject) => {
        try {
            var data = new Buffer(file.buffer);
            let name = `${imageName}.${file.mimetype.split('/')[1]}`;
            if (!fs.existsSync("images")) {
                fs.mkdirSync("images");
            }
            fs.writeFile(`images/${name}`, data, 'binary', function (err) {
                if (err) {
                    console.log("error writing image : ", err);
                    reject(err);
                }
                else {
                    console.log("file was written : ", name);
                    resolve(name)
                }
            });
        } catch (error) {
            console.log("error writing image : ", error);
            reject(error);
        }
    });
};

exports.writeResumeFile = async (req, imageName) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (req.files.length) {
                var data = new Buffer(req.files[0].buffer);
                let name = `${imageName + new Date().getMilliseconds()}.${req.files[0].mimetype.split('/')[1]}`;
                if (!fs.existsSync("resumes")) {
                    fs.mkdirSync("resumes");
                }
                fs.writeFile(`resumes/${name}`, data, 'binary', function (err) {
                    if (err) {
                        console.log("error writing image : ", err);
                        reject(err);
                    }
                    else {
                        console.log("file was written : ", name);
                        resolve(name)
                    }
                });    
            } else {
                resolve(null);
            }
        } catch (error) {
            console.log("error writing image : ", error);
            reject(error);
        }
    });
};
