var express = require('express');

module.exports = {
    validateLoginDetail: function (req, res, next) {
        var email = req.body.username;
        var password = req.body.password;
        req.checkBody('username', 'Email is not valid').isEmail();
        req.checkBody('username', 'Email cannot be empty').notEmpty();
        req.checkBody('password', 'Password cannot be empty').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.json({
                errors: errors
            });
        } else {
            next();
        }
    },

    validateResumeDetail: function (req, res, next) {
        var data = JSON.parse(req.body.data)
        var firstName = data.firstName;
        var lastName = data.lastName;
        var technologies = data.technologies;
        var email = data.email;
        var phoneNo = data.phoneNo;

        var errors;
        if (firstName && lastName && technologies && email && phoneNo) {
            errors = false;
        }
        if (errors) {
            res.json({
                errors: errors
            });
        }
        else {
            next();
        }
    },

    validateCompanyDetals: function (req, res, next) {
        req.checkBody('name', 'Company Name cannot be empty').notEmpty();
        req.checkBody('address_line_1', 'Addrress Name cannot be empty').notEmpty();
        req.checkBody('email', 'Email cannot be empty').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('phone', 'Phone Number cannot be empty').notEmpty();
        var error = req.validationErrors();
        if (error) {
            res.json({
                errors: error
            });
        }
        else {
            next();
        }
    },

    validateDepartmentDetals: function (req, res, next) {
        var category = req.body.category;
        var departmentName = req.body.departmentName;
        req.checkBody('category', 'Select a Company').notEmpty();
        req.checkBody('departmentName', 'Department Name cannot be empty').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.json({
                errors: error
            });
        }
        else {
            next();
        }
    },
    
    validateSkillsDetail: function (req, res, next) {
        var name = req.body.name;
        req.checkBody('name', 'Technology name is required').notEmpty();

        var error = req.validationErrors();
        if (error) {
            res.json({
                errors: error
            });
        } else {
            next();
        }
    },

    validateJobPostDetail: function (req, res, next) {
        var name = req.body.name;
        req.checkBody('title', 'Job title is required').notEmpty();
        req.checkBody('department', 'Department is required').notEmpty();
        req.checkBody('experience', 'Experience is required').notEmpty();
        req.checkBody('ctc', 'Anual CTC is required').notEmpty();
        req.checkBody('description', 'Description is required').notEmpty();
        req.checkBody('responsibilities', 'Job responsibilities is required').notEmpty();

        var error = req.validationErrors();
        if (error) {
            res.json({
                errors: error
            });
        } else {
            next();
        }
    }
}


