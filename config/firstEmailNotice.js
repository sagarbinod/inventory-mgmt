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
    getChiefCreditOfficer,
    getChiefOperatingOfficer,
    getChiefExecutiveOfficer,
    getDCEOOperation,
    getDCEOCredit,
    getBranchCode
} = require('../controller/staffListController');

const { saveEmailLog } = require('../controller/emailLogController');
const { sendEmailFromApims } = require('../controller/apimsController');
const { countCommentRiskGrade } = require('../controller/auditCommentController');
const { getAuditForwardedDays, getAuditMasterRecordById } = require('../controller/auditMasterController');
const { getFormattedDate } = require('./currentDate');


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
}


const cronSchedule = process.env.FIRST_EMAIL_NOTICE_SCHEDULE;

const sendFirstEmailNotice = async () => {
    console.log('First email notice job started for no response from branch ');
    const notRepliedList = await getAuditForwardedDays();
    let notRepliedAuditSet = new Set();
    notRepliedList.forEach(e => {
        if (e.daysDiff === 1) { //for test purpose{
            notRepliedAuditSet.add(e.auditId);
        }
    });
    notRepliedAuditSet.forEach(async e => {
        let auditRecord = await getAuditMasterRecordById(e);
        if (auditRecord.auditUnit === 'Branch') {
            let branchCode = await getBranchCode((auditRecord.auditUnitDesc).toUpperCase());
            try {
                let bmDetail = await getBMByBranchCode(branchCode);
                let abmDetail = await getABMByBranchCode(branchCode);
                let oiDetail = await getOIByBranchCode(branchCode);
                let ciDetail = await getCIByBranchCode(branchCode);
                let iadHead = await getInternalAuditHead();
                let pm = await getProvinceManagerForBranch(bmDetail.provinceId);
                let complianceHead = await getComplianceHead();
                let cco = await getChiefCreditOfficer();
                let coo = await getChiefOperatingOfficer();
                let dceoOperation = await getDCEOOperation();
                let dceoCredit = await getDCEOCredit();
                //to email address
                let emailSetTo = new Set();
                if (bmDetail !== false) {
                    emailSetTo.add(bmDetail.email);
                }
                if (abmDetail !== false) {
                    emailSetTo.add(abmDetail.email);
                }
                if (oiDetail !== false) {
                    emailSetTo.add(oiDetail.email);
                }
                if (ciDetail !== false) {
                    emailSetTo.add(ciDetail.email);
                }
                //cc email address
                let emailSetcc = new Set();
                if (iadHead !== false) {
                    emailSetcc.add(iadHead.email);
                }
                if (pm !== false) {
                    emailSetcc.add(pm.email);
                }
                if (complianceHead !== false) {
                    emailSetcc.add(complianceHead.email);
                }
                if (cco !== false) {
                    emailSetcc.add(cco.email);
                }
                if (coo !== false) {
                    emailSetcc.add(coo.email);
                }
                if (dceoOperation !== false) {
                    emailSetcc.add(dceoOperation.email);
                }
                if (dceoCredit !== false) {
                    emailSetcc.add(dceoCredit.email);
                }

                //for counting audit comment Risk staus : Low, Medium and High
                const riskStatus = await countCommentRiskGrade(auditRecord.id);
                let riskStatusTable = '';
                riskStatus.forEach(e => {
                    riskStatusTable = riskStatusTable + `<tr><td style="border: 1px solid black; padding: 8px; text-align: left;">${e.riskGrade}</td>
                            <td style="border: 1px solid black; padding: 8px; text-align: left;">${e.noOfComments}</td></tr>`;
                });
                //for audit verified date
                let auditVerifiedOn = getFormattedDate(auditRecord.auditVerifiedOn);
                // console.log(emailSetTo);
                //console.log(emailSetcc);
                //emailModel.toAddress = Array.from(emailSetTo).join(",");
                emailModel.toAddress = 'sagar.adhikari@ctznbank.com';
                //emailModel.ccAddress = Array.from(emailSetcc).join(",");
                emailModel.ccAddress = 'software@ctznbank.com,digitalbanking@ctznbank.com';
                emailModel.subject = `Branch reply not received for audit of [${auditRecord.auditUnit} - ${auditRecord.auditUnitDesc}]`;
                emailModel.body = `Dear Sir/Ma'am <br/><br/>
                            We would like to draw your attention to the issues observed during 
                            audit of [${auditRecord.auditUnit}-${auditRecord.auditUnitDesc}] 
                            for [Year ${auditRecord.fiscalYear}].<br/><br/>
                            Audit comment sent to branch on date ${auditVerifiedOn}.<br/><br/>
                            <table style="border-collapse: collapse;">
                            <tr><th style="border: 1px solid black; padding: 8px; text-align: left;">Risk Grade </th>
                            <th style="border: 1px solid black; padding: 8px; text-align: left;">No of Comments</th></tr >    
                            ${riskStatusTable}</table> <br/><br/>
                            Requested to provide the audit comment reply ASAP. <br/><br/>

                            Thanking you!`
                console.log(emailModel);
                //let result = await sendEmailFromApims(senderEmailAPI, emailModel);
                console.log(result);
                if (result.Code === '0') {
                    // let result = '0';                 //only for UAT
                    // if (result === '0') {             //only for UAT
                    console.log("Audit comment draft finalized email sent successfully ");
                    let { toAddress, ccAddress, subject, body } = emailModel;
                    let emailLogToSave = {
                        "To": toAddress,
                        "cc": ccAddress,
                        "subject": subject,
                        "Message": body
                    }
                    await saveEmailLog(emailLogToSave);
                    return true;
                }

            } catch (error) {
                console.error('Error while sending first email notifice ' + error);
            }
        }

    })

};

console.log('Scheduling the first email notice job ..');
cron.schedule(cronSchedule, sendFirstEmailNotice);

