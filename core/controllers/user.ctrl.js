const express = require('express');
var responseService = require('../services/response.service');
var userService = require('../services/user.service');
let router = express.Router();

router.get('/', async (req, res) => {
    try {
        let users = await userService.getUsers(req);
        responseService.successResponse(users, 'get users', res);
    } catch (err) {
        let error = {
            status: 500,
            message: 'internal server error',
        }
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
        }
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

router.put('/:id', async (req, res) => {
    try {
        let users = await userService.update(req);
        responseService.successResponse(users, 'update users', res);
    } catch (err) {
        let error = {
            status: 500,
            message: 'internal server error',
        }
        console.log('update users - error : ', err);
        responseService.errorResponse(error, 'update users', res);
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
        }
        console.log('delete users - error : ', err);
        responseService.errorResponse(error, 'delete users', res);
    }
});

module.exports.user = router;