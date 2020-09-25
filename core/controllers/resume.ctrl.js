var express = require('express');
var router = express.Router();
var resumeService = require('../services/resume.service');
var responseService = require('../services/response.service');
var multer = require('multer');

router.get("/:id",
    async (req, res, next) => {
        try {
            let resume_id = req.params.id;

            //fetch resume by id
            let resume = await resumeService.getResumeById(resume_id);
            if (resume) {
      /*          var fileExtension = resume.fileName.split('.').pop();
                if (resume && (fileExtension == "docx" || fileExtension == "doc")) {
                    html_response = await resumeService.getHtmlForReumeBase64(resume.resume, fileExtension);
                    resume.resume = fileExtension == "doc" ? html_response.html.match(/<body[^>]*>[\s\S]*<\/body>/gi) : html_response.html;
                    file_path = html_response.destination;
                    html_file_path = html_response.html_file_path;
                }
                responseService.response(req, null, "Applicant resume", resume, res);
                if (fileExtension == "doc" || fileExtension == "docx")
                    resumeService.deleteFileFromLocal(file_path);
                if (fileExtension == "doc")
                    resumeService.deleteFileFromLocal(html_file_path);*/
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

router.get('/file/:id', async (req, res) => {
    try {
        let resume = await resumeService.fileStream(req.params.id, res);
        responseService.successResponse(resume, 'update resume', res);
    } catch (error) {
        responseService.errorResponse(error, 'get resume error', res);
    }
});

var resume = multer({storage: multer.memoryStorage(), limits: {fileSize: 1000 * 1000 * 12}});
router.put("/:id", resume.any(), async (req, res) => {
    try {
        let resume = await resumeService.updateByApplicantId(req);
        if (resume) {
            responseService.successResponse(resume, 'update resume', res);
        } else {
            responseService.errorResponse({
                status: 500,
                message: 'unable to update resume'
            }, 'update resume error', res);
        }

    } catch (error) {
        responseService.errorResponse(error, 'update resume error', res);
    }
});

module.exports.resume = router;
