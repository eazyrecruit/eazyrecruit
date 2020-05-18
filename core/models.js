var config = require('./config').config();
var mongoose = require('mongoose');
var Users = require('./models/user');
var Companies = require('./models/company');
var Applicant = require('./models/applicant');
var Job = require('./models/job');
var Role = require('./models/userRole');
const crypto = require('crypto');

// ****** eazy recruit *******
module.exports.setup = () => {
  //Set up default mongoose connection
  mongoose.connect(config.mongo.host, {
      // sets how many times to try reconnecting
      reconnectTries: 5,
      // sets the delay between every retry (milliseconds)
      reconnectInterval: 1000,
      useMongoClient: true
  });
  // Get Mongoose to use the global promise library 
  mongoose.Promise = global.Promise;
  //Get the default connection
  var mongodb = mongoose.connection;

  mongodb.on('connected', console.log.bind(console, 'EZ MongoDB successfully connected'));
  //Bind connection to error event (to get notification of connection errors)
  mongodb.on('error', console.error.bind(console, 'EZ MongoDB connection error:'));
}
module.exports.initialize = async () => {
  
  var dbRoles = await Role.find();
  if(dbRoles.length >= 0) {
    var roles = ['admin1', 'hr1', 'interviewer1',];
    for (let i = 0; i < roles.length; i++) {
      var role = new Role();
      role.name = roles[i];
      role.is_deleted = false;
      role.created_at = new Date();
      role.modified_at = new Date();
      await role.save(); 
    }
  }

  var dbUsers = await Users.find();
  if(dbUsers.length >= 0){
    const randomString = () => crypto.randomBytes(6).hexSlice();
    let role = await Role.findOne({ name: 'admin' });
    var user = new Users();
    user.password = randomString();
    user.email = 'admin@eazyrecruit.in';
    user.roles = role ? [role._id] : [];
    console.log('Admin Password:',user.password)
    await user.save();
  }

  var dbCompanies = await Companies.find();
  if (dbCompanies.length <= 0) {
    var company = new Companies();
    company.name = 'Eazy Recruit';
    company.website = 'eazyrecruit.in';
    company.email = 'info@eazyrecruit.in';
    company.address_line_1 = '1st floor, malwa tower';
    company.phone = '9876543210';
    company.groupName = ['imap','smtp','google'];
    console.log('*** Test Company Creation***')
    await company.save();
  }

  var dbJobs = await Job.find();
  if (dbJobs.length <= 0) {
    let job = new Job();
    job.title="TestJob"
    job.active=true
    job.is_published=true
    job.type="Full-Time"
    job.minExperience=2
    job.maxExperience=3
    job.ctc=4
    job.metaTitle="Python"
    job.created_at=new Date()
    console.log('*** Test Job Creation***')
    await job.save();
  }

  var dbapplicants = await Applicant.find();
  if (dbapplicants.length <= 0) {
    let applicant = new Applicant();
    applicant.firstName = "Test"
    applicant.lastName = "Applicant"
    applicant.created_at=new Date()
    console.log('*** Test Applicant Creation ***')
    await applicant.save();
  }

  return "Done"
}