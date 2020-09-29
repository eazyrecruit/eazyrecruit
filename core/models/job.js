var mongoose = require('mongoose');
var mexp = require('mongoosastic');
var config = require('../config').config();
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
 
var jobSchema = new Schema({
    title: String,
    guid: String,
    active: Boolean,
    description: String,
    responsibilities: String,
    ctc: String,
    minExperience: Number,
    maxExperience: Number,
    mode: String,
    type: String,
    locations: [{
        type: Schema.Types.ObjectId,
        ref: 'Locations',
        es_type:'nested',
        es_include_in_parent:true
    }],
    skills: [{
        type: Schema.Types.ObjectId,
        ref: 'Skills',
        es_type:'nested',
        es_include_in_parent:true
    }],
    applicants: [{
        type:Schema.Types.ObjectId,
        ref:'JobApplicants'
    }],
    pipelines: [{
        type:Schema.Types.ObjectId,
        ref:'JobPipelines'
    }],

    expiryDate: Date,
    is_published: Boolean,
    metaImage: { type: String },
    metaImageAltText: String,
    metaTitle: String,
    tags: Array,
    categories: Array,

    is_deleted: Boolean,
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    created_at: Date,
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    modified_at: Date

}, {
    versionKey: false,
    usePushEach: true,
    strict: false
});

jobSchema.plugin(mexp, {
    hosts: [
        config.elasticSearch.host
    ],
    populate: [
        { path: 'locations.Locations', select: 'city state' },
        { path: 'skills.Skills', select: 'name' },
    //     { path: 'jobapplicants', select: 'applicant._id applicant.firstName applicant.middleName applicant.lastName applicant.email applicant.phone pipeline._id' },
    //     { path: 'pipelines', select: 'name' },
    ],
    bulk: {
        size: 10, // preferred number of docs to bulk index
        delay: 100 //milliseconds to wait for enough docs to meet size constraint
    }
});

var JobSchema = mongoose.model('Jobs', jobSchema);
var stream = JobSchema.synchronize();
var count = 0;
stream.on('data', function (err, doc) {
    count++;
});
stream.on('sync closed', function () {
    console.log('indexed ' + count + ' documents!');
});
stream.on('sync error', function (err) {
    console.log(err);
});

module.exports = JobSchema;