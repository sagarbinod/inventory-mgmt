const express = require("express");
const router = express.Router();

const {
    addAuditMasterRecord,
    getAllRecordAuditMaster,
    getAuditMasterById,
    deleteAuditMasterById,
    updateAuditMasterById,
    verifyAuditMasterRecordIAD
} = require('../controller/auditMasterController');

//router.post('/addRecord',verifyToken,addAuditMasterRecord);
router.post('/addRecord', addAuditMasterRecord);
//get all records from audit master
router.post('/getAllRecord', getAllRecordAuditMaster);
//get single record from audit master
router.get('/getSingleRecord/:auditMasterId', getAuditMasterById);
//soft delete the record
router.post('/deleteRecord/:auditMasterId', deleteAuditMasterById);
//updating audit master record
router.post('/updateRecord', updateAuditMasterById);
//audit comment draft verification by IAD
router.post('/draftVerify', verifyAuditMasterRecordIAD);


module.exports = router;