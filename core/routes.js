var express = require('express');
var path = require('path');
var jwt = require("./services/jwt.service").jwtProfile;
var config = require("./config").config();
var expressJwt = require("express-jwt");
var pathToRegexp = require('path-to-regexp');
const ActivityModels = require('./models/activity');
const ApplicantCommentModel = require('./models/applicantComment');
const ApplicantEmployerModel = require('./models/applicantEmployer');
const IndustryModel = require('./models/industry');
const InterviewCriteriaModel = require('./models/interviewCriteria');
const InterviewModeModel = require('./models/interviewMode');
const InterviewResultModel = require('./models/interviewResult');
const JobPipelineModel = require('./models/jobPipeline');
const JobTypeModel = require('./models/jobType');
const LocationModel = require('./models/location');
const SkillsModel = require('./models/skills');
const UserRoleModel = require('./models/userRole');
const User = require('./models/user');

module.exports.setup = (app) => {
  var unprotected = [
    pathToRegexp('/api/account/*'),
    pathToRegexp('/api/user/otpverification/*'),
    pathToRegexp('/api/user/resetpassword'),
    pathToRegexp('/api/candidate/received/email'),
    pathToRegexp('/jobs/*')
  ];
  app.use((req, res, next) => {
    global.rootdirectory = __dirname;
    next();
  });
  // Admin
  app.use('/admin', express.static(path.resolve(__dirname, 'admin')));
  app.get('/admin/*', function (req, res) {
    res.sendFile('/admin/index.html', { root: '.' });
  });
  app.use("/api", expressJwt({ secret: secretRecruitCallBack }).unless({ path: unprotected }));
  // Generic Implementation
  // app.use('/api/applicant/comment', require('./services/crud.service')(ApplicantCommentModel, 'CRUDQ'));
  app.use('/api/applicant/employer', require('./services/crud.service')(ApplicantEmployerModel, 'CRUDQ'));
  app.use('/api/activity', require('./services/crud.service')(ActivityModels, 'CRUDQ'));
  app.use('/api/industry', require('./services/crud.service')(IndustryModel, 'CRUDQ'));
  app.use('/api/interview/criteria', require('./services/crud.service')(InterviewCriteriaModel, 'CRUDQ'));
  app.use('/api/interview/mode', require('./services/crud.service')(InterviewModeModel, 'CRUDQ'));
  // app.use('/api/interview/result', require('./services/crud.service')(InterviewResultModel, 'CRUDQ'));
  app.use('/api/pipeline', require('./services/crud.service')(JobPipelineModel, 'CRUDQ'));
  app.use('/api/job/type', require('./services/crud.service')(JobTypeModel, 'CRUDQ'));
  app.use('/api/location', require('./services/crud.service')(LocationModel, 'CRUDQ'));
  app.use('/api/skill', require('./services/crud.service')(SkillsModel, 'CRUDQ'));
  app.use('/api/user/getroles', require('./services/crud.service')(UserRoleModel, 'CRUDQ'));
  app.use('/api/user', require('./services/crud.service')(User, 'CRUDQ'));
  // Custom Implementation
  app.use('/api/account', require('./controllers/account.ctrl').account);
  app.use('/api/applicant', require('./controllers/applicant.ctrl').applicant);
  //app.use('/api/applicant/resume', require('./services/resume.ctrl').resume);
  app.use('/api/job', require('./controllers/job.ctrl').job);
  app.use('/api/interview', require('./controllers/interview.ctrl').interview);
  app.use('/api/reports', require('./controllers/report.ctrl').report);
  // Extended Services
  app.use('/api/skills', require('./controllers/skill.ctrl').skillRoutes);
  app.use('/api/location', require('./controllers/location.ctrl').locationRoutes);
  app.use('/api/company', require('./controllers/company.ctrl').company);
  // Resume
  app.use('/api/resume', require('./controllers/resume.ctrl').resume);
  // Views
  app.use('/jobs', require('./views/index').pages);
};

var secretRecruitCallBack = function (req, payload, done) {
  //Generate new token for a authenticated request
  if (payload) {
    var token = jwt.generateToken({ username: payload.email });
    // Set the session details for the request in the request header
    // Add the new token to request header
    req.headers.session = { username: payload.email };
    req.headers['x-token'] = token;
    //Fetch and return the secrect key for the tenant of the request
    var sect = config.jwt.secret;
    done(null, sect);
  }
  else {
    done(null, null);
  }
};
