const cron = require('node-cron');
const { checkRecordToSendEmail,
    updateSendEmailStatus
} = require('../controller/commentSpecialAttnController');
const { saveEmailLog } = require('../controller/emailLogController');
const { sendEmailFromApims } = require('../controller/apimsController');

const { getAFAuditIdForEmailNotSent, getAuditCommentById } = require('../controller/auditCommentController');
const { getAuditMasterRecordById } = require('../controller/auditMasterController');

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

const cronSchedule = process.env.SPECIAL_ATTN_SEND_EMAIL_SCHEDULE;

const sendEmail = async () => {
    console.log("Fetching AF id list whose email is not sent ");
    const emailNotSentId = await getAFAuditIdForEmailNotSent();

    if (emailNotSentId !== '' || emailNotSentId !== undefined) {
        console.log("Send email special attention job started ");
        emailNotSentId.forEach(async element => {
            let commentRecord = await getAuditCommentById(element.id);//audit comment record based on comment id
            //console.log(commentRecord.auditId);
            let auditRecord = await getAuditMasterRecordById(commentRecord.auditId); //audit master record based on audit master id
            //console.log(auditRecord);
            let specialAttentinEmailList = await checkRecordToSendEmail(element.id);

            let toEmailList = '';
            let idList = [];//special attention record id
            specialAttentinEmailList.forEach(e => {
                if (toEmailList === '') {
                    toEmailList = e.email;
                    idList.push(e.id);
                }
                else {
                    toEmailList = toEmailList + "," + e.email;
                    idList.push(e.id);
                }
            })

            //code to send email
            try {
                //emailModel.toAddress = toEmailList;
                emailModel.toAddress = 'sagar.adhikari@ctznbank.com'
                emailModel.ccAddress = '';
                emailModel.subject = `Special attention issue from internal audit of ${auditRecord.auditUnit} ${auditRecord.auditUnitDesc}`;
                //to check the audit unit for either operation or credit
                let messageBasedOnAuditUnit = '';
                if (commentRecord.auditUnit === "Operation Department") {
                    messageBasedOnAuditUnit = `Issues marked as special attention shall be listed based on “Heading”. Comment from “Detailed Comment” sheet shall be displayed pointwise`;
                } else if (commentRecord.auditUnit === 'Credit Department') {
                    messageBasedOnAuditUnit = `Issues marked as special attention shall be listed borrower wise.`;
                }
                emailModel.body = `Dear Sir/Ma'am <br/>
                            We would like to draw your attention to the following issues observed during 
                            audit of [${auditRecord.auditUnit}-${auditRecord.auditUnitDesc}] 
                            for [Year ${auditRecord.fiscalYear}].<br/><br/>
                            <b><u>Area: ${commentRecord.auditUnit}</u></b><br/><br/>
                            ${messageBasedOnAuditUnit} <br/><br/>
                            Standard Comment: ${commentRecord.standardComment} <br/>
                            Risk Grade: ${commentRecord.riskGrade} <br/>
                            Comment in Detail: <br/>
                            ${commentRecord.commentInDetail} <br/><br/><br/>
                            Thank you!`;
                let result = await sendEmailFromApims(senderEmailAPI, emailModel);
                console.log(result);
                if (result.Code === '0') {
                    console.log("Special attention email sent successfully ");
                    let { toAddress, ccAddress, subject, body } = emailModel;
                    let emailLogToSave = {
                        "To": toAddress,
                        "cc": ccAddress,
                        "subject": subject,
                        "Message": body
                    }
                    await saveEmailLog(emailLogToSave);
                    //console.log("IdList " + idList);
                    idList.forEach(async e => {
                        console.log(e);
                        await updateSendEmailStatus(e);
                    });
                }
            } catch (error) {
                console.log("Error while sending email " + error);
            }
            console.log(toEmailList);
        });
    }

};

// Schedule the batch job to run at the specified cron schedule
console.log("scheduling the send Email job for special attention members ....");
cron.schedule(cronSchedule, sendEmail);