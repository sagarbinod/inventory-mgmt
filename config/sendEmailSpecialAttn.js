const cron = require('node-cron');
const { checkRecordToSendEmail,
    updateSendEmailStatus
} = require('../controller/commentSpecialAttnController');
const { saveEmailLog } = require('../controller/emailLogController');
const { sendEmailFromApims } = require('../controller/apimsController');

const { getAFAuditIdForEmailNotSent } = require('../controller/auditCommentController');
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

            //console.log("idList "+idList);

            //code to send email
            try {
                emailModel.toAddress = toEmailList;
                emailModel.ccAddress = ''
                emailModel.subject = "Special attention issue from internal audit of ";
                emailModel.body = "Test";
                const result = await sendEmailFromApims(senderEmailAPI, emailModel);
                //console.log(result);
                if (result.Code === '0') {
                    console.log("Special attention email sent successfully ");
                    const { toAddress, ccAddress, subject, body } = emailModel;
                    await saveEmailLog("To :" + toAddress + " cc: " + ccAddress + " subject : " + subject + " Message :" + body);
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