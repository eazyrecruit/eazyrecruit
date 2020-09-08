const express = require('express');
var responseService = require('../services/response.service');
var userService = require('../services/user.service');
let router = express.Router();
var multer = require('multer');
router.get('/', async (req, res) => {
    try {
        let result = {};
        if (req.query.single) {
            result = await userService.getUser(req.user.id)
        } else {
            result = await userService.getUsers(req);
        }

        responseService.successResponse(result, 'get users', res);
    } catch (err) {
        console.log('get users - error : ', err);
        responseService.errorResponse(error, 'get users', res);
    }
});

router.get('/roles', async (req, res) => {
    try {
        let roles = await userService.getRoles();
        responseService.successResponse(roles, 'get roles', res);
    } catch (err) {
        let error = {
            status: 500,
            message: 'internal server error',
        };
        console.log('get roles - error : ', err);
        responseService.errorResponse(error, 'get roles', res);
    }
});

router.post('/', async (req, res) => {
    try {
        let users = await userService.register(req);
        responseService.successResponse(users, 'create users', res);
    } catch (err) {
        let error = {
            status: 500,
            message: 'internal server error',
        }
        console.log('get users - error : ', err);
        responseService.errorResponse(error, 'create users', res);
    }
});

router.get('/profile/:id', async (req, res) => {
    return await userService.fileStream(req.params.id, res);
});

router.put('/:id', async (req, res) => {
    try {
        let users = await userService.update(req);
        responseService.successResponse(users, 'update users', res);
    } catch (err) {
        let error = {
            status: 500,
            message: 'internal server error',
        };
        console.log('update users - error : ', err);
        responseService.errorResponse(error, 'update users', res);
    }
});
var profileFileUpload = multer({storage: multer.memoryStorage(), limits: {fileSize: 1000 * 1000 * 12}});
router.put('', profileFileUpload.any(), async (req, res) => {
    try {
        req.body["ownerId"] = req.user.id;
        req.body["files"] = req.files;
        let users = await userService.updateUser(req.body);
        responseService.successResponse(users, 'update users', res);
    } catch (err) {
        console.log('update users - error : ', err);
        responseService.errorResponse(err, 'update users', res);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        let users = await userService.delete(req);
        responseService.successResponse(users, 'delete users', res);
    } catch (err) {
        let error = {
            status: 500,
            message: 'internal server error',
        };
        console.log('delete users - error : ', err);
        responseService.errorResponse(error, 'delete users', res);
    }
});

module.exports.user = router;
