const express = require("express");
const router = express.Router();

const {
    addAuditMasterRecord,
    getAllRecordAuditMaster,
    getAuditMasterById,
    deleteAuditMasterById,
    updateAuditMasterById
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


module.exports = router;