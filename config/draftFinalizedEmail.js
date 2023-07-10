const { getBMByBranchCode,
    getABMByBranchCode,
    getOIByBranchCode,
    getCIByBranchCode,
    getProvinceManagerForBranch,
    getComplianceHead,
    getAllStaffsCompliance,
    getInternalAuditHead,
    getAllStaffInternalAudit,
    getBranchCode
} = require('../controller/staffListController');

const { saveEmailLog } = require('../controller/emailLogController');
const { sendEmailFromApims } = require('../controller/apimsController');
const { countCommentRiskGrade } = require('../controller/auditCommentController');
const { getFormattedDate } = require('./currentDate');

async function sendDraftFinalizedEmail(auditRecord) {

    // console.log(auditRecord);

    let senderEmailAddress = process.env.SEND_EMAIL_ADDRESS;
    let senderEmailPassword = process.env.SEND_EMAIL_PASSWORD;
    let senderEmailAPI = process.env.EMAIL_API_APIMS;

    let emailModel = {
        toAddress: "",
        subject: "",
        body: "",
        ccAddress: "",
        fromAddress: senderEmailAddress,
        password: senderEmailPassword
    };

    console.log('sending email after audit comment draft is finalized ' + auditRecord.id);
    //sending email to branch BM, ABM after draft audit comment is approved by IAD Head
    if (auditRecord.auditUnit === 'Branch') {
        let branchCode = await getBranchCode((auditRecord.auditUnitDesc).toUpperCase());
        try {
            let bmDetail = await getBMByBranchCode(branchCode);
            let abmDetail = await getABMByBranchCode(branchCode);
            let oiDetail = await getOIByBranchCode(branchCode);
            let ciDetail = await getCIByBranchCode(branchCode);
            let iadHead = await getInternalAuditHead();
            let emailset = new Set();
            if (bmDetail !== false) {
                emailset.add(bmDetail.email);
            }
            if (abmDetail !== false) {
                emailset.add(abmDetail.email);
            }
            if (oiDetail !== false) {
                emailset.add(oiDetail.email);
            }
            if (ciDetail !== false) {
                emailset.add(ciDetail.email);
            }
            //for counting audit comment Risk staus : Low, Medium and High
            const riskStatus = await countCommentRiskGrade(auditRecord.id);
            let riskStatusTable = '';
            riskStatus.forEach(e => {
                riskStatusTable = riskStatusTable + `<tr><td style="border: 1px solid black; padding: 8px; text-align: left;">${e.riskGrade}</td>
                            <td style="border: 1px solid black; padding: 8px; text-align: left;">${e.noOfComments}</td></tr>`;
            });

            //for audit response date
            let auditResponseDate = getFormattedDate(auditRecord.auditResponseDate);
            //console.log(auditResponseDate);

            //mailModel.toAddress = Array.from(emailset).join(",");
            emailModel.toAddress = 'sagar.adhikari@ctznbank.com'
            //emailModel.ccAddress = iadHead.email;
            emailModel.ccAddress = 'sagar.adhikari@ctznbank.com'
            emailModel.subject = `Audit Comment Draft Finalized from IAD of [${auditRecord.auditUnit} - ${auditRecord.auditUnitDesc}]`
            emailModel.body = `Dear Sir/Ma'am <br/><br/>
                        We would like to draw your attention to the issues observed during 
                        audit of [${auditRecord.auditUnit}-${auditRecord.auditUnitDesc}] 
                        for [Year ${auditRecord.fiscalYear}].<br/><br/>
                        Please provide the response on or before ${auditResponseDate}. <br/>
                        <table style="border-collapse: collapse;">
                        <tr><th style="border: 1px solid black; padding: 8px; text-align: left;">Risk Grade </th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">No of Comments</th></tr >    
                        ${riskStatusTable}</table> <br/><br/><br/>
                        Thanking you.!`;
            //console.log(senderEmailAPI);
            //console.log(emailModel);
            let result = await sendEmailFromApims(senderEmailAPI, emailModel);
            //console.log(result);
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
            console.error('Error while sending email to branch staff after audit comment draft is approved by IAD' + error);
            return false;
        }
    }

};


module.exports = { sendDraftFinalizedEmail };


