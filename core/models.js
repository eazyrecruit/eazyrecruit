var config = require('./config').config();
var mongoose = require('mongoose');
var Users = require('./models/user');
var Companies = require('./models/company');
var Applicant = require('./models/applicant');
var Job = require('./models/job');
var Role = require('./models/userRole');
var locationService = require('./services/location.service');
var esService = require('./services/es.service');
const crypto = require('crypto');
var fs = require('fs');

// ****** eazy recruit *******
module.exports.setup = () => {
    mongoose.connect(config.mongo.host, {
        useNewUrlParser: true
    });
    // Get Mongoose to use the global promise library
    mongoose.Promise = global.Promise;
    //Get the default connection
    var mongodb = mongoose.connection;

    mongodb.on('connected', console.log.bind(console, 'MongoDB successfully connected'));
    //Bind connection to error event (to get notification of connection errors)
    mongodb.on('error', console.error.bind(console, 'MongoDB connection error:'));
    //Set up default mongoose connection
}
module.exports.initialize = async () => {


    var roles = config.roles;
    if (roles && roles.length) {
        for (let index = 0; index < roles.length; index++) {
            var dbRoles = await Role.findOne({name: roles[index]});
            if (!dbRoles) {
                var role = new Role();
                role.name = roles[index];
                role.is_deleted = false;
                role.created_at = new Date();
                role.modified_at = new Date();
                await role.save();
            }
        }
    }

    var dbUsers = await Users.findOne({email: config.admin.username});
    if (!dbUsers) {
        const randomString = () => crypto.randomBytes(6).hexSlice();
        let role = await Role.findOne({name: 'admin'});
        var user = new Users();
        user.password = randomString();
        user.is_deleted = false;
        user.email = config.admin.username;
        user.firstName = 'Admin';
        user.lastName = '';
        user.roles = role ? [role._id] : [];
        console.log('Admin Password:', user.password) // dont add any space in "Admin Password:" log using it in reading admin password
        await user.save();

        // create locations
        try {
            let states = fs.readFileSync('./states.json', 'utf8');
            if (states) {
                await locationService.location(JSON.parse(states), user.id);
                console.log('locations added');
            } else {
                console.log('states.json file is missing!');
            }
        } catch (error) {
            console.log('location error : ', error);
        }
    }

    var dbCompanies = await Companies.find();
    if (dbCompanies.length <= 0) {
        var company = new Companies();
        company.name = config.companyInfo.name;
        company.website = config.companyInfo.website;
        company.email = config.companyInfo.email;
        company.address_line_1 = config.companyInfo.address_line_1;
        company.phone = config.companyInfo.phone;
        company.groupName = ['imap', 'smtp', 'google'];
        console.log('*** Test Company Creation***')
        await company.save();
    }

    var dbJobs = await Job.find();
    if (dbJobs.length <= 0) {
        let job = new Job();
        job.title = "TestJob"
        job.active = true
        job.is_published = true
        job.type = "Full-Time"
        job.minExperience = 2
        job.maxExperience = 3
        job.ctc = 4
        job.metaTitle = "Python"
        job.created_at = new Date()
        console.log('*** Test Job Creation***')
        await job.save();
    }

    var dbapplicants = await Applicant.find();
    if (dbapplicants.length <= 0) {
        let applicant = new Applicant();
        applicant.firstName = "Test"
        applicant.lastName = "Applicant"
        applicant.created_at = new Date()
        console.log('*** Test Applicant Creation ***');
        await applicant.save();
    }

    esService.syncApplicants();
    esService.syncJobs();
    console.log("Done")

    return "Done"
}
