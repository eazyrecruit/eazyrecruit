const express = require('express');
var responseService = require('./response.service');

module.exports = (Collection, Operations) => {
    // ======
    // Create
    // ======
    const create = (req, res) => {
        if (Operations.indexOf('C') >= 0) {
            const newEntry = req.body;
            Collection.create(newEntry, (e, newEntry) => {
                if (e) {
                    responseService.response(req, e, "", null, res);
                } else {
                    responseService.response(req, null, "", newEntry, res);
                }
            });
        } else {
            res.sendStatus(500);
        }
    };

    // ========
    // Read one
    // ========
    const readOne = (req, res) => {
        if (Operations.indexOf('R') >= 0) {
            const id = req.params._id;
            Collection.find({_id: id , is_deleted: { $ne: false }}, (e, result) => {
                if (e) {
                    responseService.response(req, e, "", null, res);
                } else {
                    responseService.response(req, null, "", result, res);
                }
            });
        } else {
            res.sendStatus(500);
        }
    };

    // ========
    // Read many
    // ========
    const readMany = (req, res) => {
        if (Operations.indexOf('R') >= 0) {
            Collection.find({is_deleted: { $ne: false }}, (e, result) => {
                if (e) {
                    responseService.response(req, e, "", null, res);
                } else {
                    responseService.response(req, null, "", result, res);
                }
            });
        } else {
            res.sendStatus(500);
        }
    };

    // ======
    // Update
    // ======
    const update = (req, res) => {
        if (Operations.indexOf('U') >= 0) {
            const changedEntry = req.body;
            Collection.update({ _id: req.params._id }, { $set: changedEntry }, (e, result) => {
                if (e) {
                    responseService.response(req, e, "", null, res);
                } else {
                    responseService.response(req, null, "", result, res);
                }
            });
        } else {
            res.sendStatus(500);
        }
    };

    // ======
    // Remove
    // ======
    const remove = (req, res) => {
        if (Operations.indexOf('D') >= 0) {
            Collection.update({ _id: req.params._id }, { $set: {is_deleted: "true"} }, (e, result) => {
                if (e) {
                    responseService.response(req, e, "", null, res);
                } else {
                    responseService.response(req, null, "", result, res);
                }
            });
        } else {
            res.sendStatus(500);
        }
    };

    // ======
    // Routes
    // ======

    let router = express.Router();

    router.post('/', create);
    router.get('/:_id', readOne);
    router.get('/', readMany);
    router.put('/:_id', update);
    router.delete('/:_id', remove);

    return router;
}