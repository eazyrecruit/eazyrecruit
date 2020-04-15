const express = require('express');
var responseService = require('../services/response.service');
var userService = require('../services/user.service');
let router = express.Router();

router.get('/', async (req, res) => {
    try {
        let users = await userService.getUsers();
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

module.exports.user = router;