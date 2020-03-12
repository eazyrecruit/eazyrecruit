var express = require('express');
var router = express.Router();
var resumeService = require('../services/resume.service');
var responseService = require('../services/response.service');

router.get("/:id",
    async (req, res, next) => {
        try {
            let filenamearray = []
            let resume_id = req.params.id

            //fetch resume by id
            let resume = await resumeService.getResumeById(resume_id);
            if (resume) {
                filenamearray = resume.fileName.split(".");
                if (resume && (filenamearray[1] == "docx" || filenamearray[1] == "doc")) {
                    html_response = await applicantService.getHtmlForReumeBase64(resume.resume, filenamearray[1]);
                    resume.resume = filenamearray[1] == "doc" ? html_response.html.match(/<body[^>]*>[\s\S]*<\/body>/gi) : html_response.html;
                    file_path = html_response.destination;
                    html_file_path = html_response.html_file_path;
                }
                responseService.response(req, null, "Applicant resume", resume, res);
                if (filenamearray[1] == "doc" || filenamearray[1] == "docx")
                    applicantService.deleteFileFromLocal(file_path);
                if (filenamearray[1] == "doc")
                    applicantService.deleteFileFromLocal(html_file_path);
            } else {
                let err = {
                    status: 200,
                    message: "Resume not found!"
                }
                responseService.response(req, err, "Applicant resume", null, res);    
            }
        } catch (err) {
            responseService.response(req, err, "Applicant resume", null, res);
        }
    }
)

module.exports.resume = router;