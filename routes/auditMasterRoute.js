const express = require("express");
const router = express.Router();

const {
    addAuditMasterRecord,
    getAllRecordAuditMaster
} = require('../controller/auditMasterController');

//router.post('/addRecord',verifyToken,addAuditMasterRecord);
router.post('/addRecord', addAuditMasterRecord);

router.get('/getAllRecord', getAllRecordAuditMaster);



module.exports = router;