const express = require("express");
const router = express.Router();
const multer = require("multer");

let timeval = null;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.FILE_UPLOAD_PATH_TMP); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        const fileExtension = file.originalname.split('.').pop();
        const modFiscalYear = req.body.fiscalYear.replace(/\//g, '');
        const destinationFileName = modFiscalYear + "-" + req.body.auditId + "-" +
            req.body.commentId + "-" + timeval + '.' + fileExtension;
        cb(null, destinationFileName);
    }
});

// Create the multer upload instance
const upload = multer(
    {
        storage: storage,
        fileFilter: function (req, file, cb) {
            const allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ];

            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Only PDF, JPEG, Excel, and Word files are allowed.'));
            }
        }
    });

const { addComplianceFollowup,
    listCompinaceFollowupByCommentId,
    updateComplianceFollowup,
    deleteComplianceFollowup,
    deleteComplianceFollowupFile
} = require("../controller/complianceFollowupController");

router.post("/addComplianceFollowup", addComplianceFollowup);

router.get("/listComplianceFollowup/:commentId", listCompinaceFollowupByCommentId);

router.post("/updateComplianceFollowup", updateComplianceFollowup);

router.post("/deleteComplianceFollowup/:commentId/:id", deleteComplianceFollowup);

router.post("/deleteFile/:commentId/:id",deleteComplianceFollowupFile);

//for providing random file name 
router.post("/uploadFile", (req, res, next) => {
    timeval = Date.now();
    next();
});


//below code is for uploading file
router.post("/uploadFile", (req, res) => {
    upload.single('fileName')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error(err.message);
            res.status(400).send(err.message);
        } else if (err) {
            console.error(err.message);
            res.status(500).send(err.message);
        } else {
            const fileExtension = req.file.originalname.split('.').pop();
            const modFiscalYear = req.body.fiscalYear.replace(/\//g, '');
            const destinationFileName = modFiscalYear + "-" + req.body.auditId + "-" +
                req.body.commentId + "-" + timeval + '.' + fileExtension;
            timeval = null;
            console.log("File uploaded successful " + destinationFileName);
            res.status(200).send({ "status": "Completed", "fileName": destinationFileName });
        }
    });

});


module.exports = router;