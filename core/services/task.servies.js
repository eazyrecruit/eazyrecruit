let Task = require('../models/task');

/**
 * add the task
 * @returns
 * @param data
 */
addTask = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data.id) {
                return resolve(await updateTask(data))
            }
            let tasksRequest = {
                title: data.title,
                description: data.description,
                assignee: data.assignee,
                createdBy: data.ownerId,
                applicant: data.applicant,
                targetDate: data.targetDate || new Date()
            };
            if (data.completionDate) {
                tasksRequest["completionDate"] = data.completionDate;
            }
            if (data.targetDate) {
                tasksRequest["targetDate"] = data.targetDate;
            }

            let result = await new Task(tasksRequest).save();
            resolve(result);

        } catch (error) {
            reject(error);
        }
    })
}


/**
 * update the task
 * @returns
 * @param data
 */

updateTask = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data.id) {
                let taskData = await Task.findOne({_id: data.id});
                if (taskData) {
                    taskData["title"] = data.title || taskData["title"];
                    taskData["description"] = data.description || taskData["description"];
                    taskData["assignee"] = data.assignee || taskData["assignee"];
                    taskData["status"] = data.status || taskData["status"];
                    if (data.completionDate) {
                        taskData["completionDate"] = data.completionDate;
                    }
                    if (data.targetDate) {
                        taskData["targetDate"] = data.targetDate;
                    }
                    resolve(taskData.save());

                } else {
                    reject("invalid id")
                }
            } else {
                reject("invalid id")
            }

        } catch (error) {
            reject(error)
        }
    })
}

/**
 * update the task
 * @returns
 * @param data
 */
getTask = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = {isDeleted: false, applicant: data.applicant};
            const count = await Task.find(query).countDocuments();
            let result = await Task.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit)).populate("created_by", ["name", "email", "picture"]).populate("assignee", ["name", "email", "picture"]);
            resolve({total: count, records: result});
        } catch (error) {
            reject(error);
        }


    })
}


deleteTasks = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data.id) {
                let taskData = await Task.findOne({_id: data.id});
                if (taskData) {
                    taskData["isDeleted"] = true;
                    resolve(taskData.save());
                } else {
                    reject("invalid id")
                }
            } else {
                reject("invalid id")
            }
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {addTask, updateTask, getTask, deleteTasks};
