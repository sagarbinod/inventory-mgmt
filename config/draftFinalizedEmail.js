const cron = require('node-cron');
const { getBMByBranchCode,
    getABMByBranchCode,
    getOIByBranchCode,
    getCIByBranchCode,
    getProvinceManagerForBranch,
    getComplianceHead,
    getAllStaffsCompliance,
    getInternalAuditHead,
    getAllStaffInternalAudit,
} = require('../controller/staffListController');

const { saveEmailLog } = require('../controller/emailLogController');
const { sendEmailFromApims } = require('../controller/apimsController');
const { getAuditCommentById } = require('../controller/auditCommentController');

const senderEmailAddress = process.env.SEND_EMAIL_ADDRESS;
const senderEmailPassword = process.env.SEND_EMAIL_PASSWORD;
const senderEmailAPI = process.env.EMAIL_API_APIMS;

const emailModel = {
    toAddress: "",
    subject: "",
    body: "",
    ccAddress: "",
    fromAddress: senderEmailAddress,
    password: senderEmailPassword
};

async function sendDraftFinalizedEmail(auditRecord) {
    console.log('sending email after audit comment draft is finalized ' + auditRecord.id);
    //sending email to branch BM, ABM after draft audit comment is approved by IAD Head
    if (auditRecord.auditUit === 'Branch') {

        try {
            

            return true;
        } catch (error) {
            console.error('Error while sending email to branch staff after audit comment draft is approved by IAD');
            return false;
        }
    }



};


module.exports = { sendDraftFinalizedEmail };


