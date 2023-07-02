const cron = require('node-cron');
const { checkRecordToSendEmail,
    updateSendEmailStatus
} = require('../controller/commentSpecialAttnController');
const { sendEmailFromApims } = require('../controller/apimsController');
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
    console.log("Special attention email send job started ");
    const sendEmailList = await checkRecordToSendEmail();
    const specialAttnId = [];
    if (sendEmailList !== false) {
        sendEmailList.forEach(element => {
            specialAttnId.push(element);
        });
    }


    try {
        specialAttnId.forEach(async element => {
            console.log(element);
            emailModel.toAddress = element.email;
            emailModel.subject = "Internal Audit System Test Email";
            emailModel.body = "Test";

            const result = 0; //for uat testing
            //const result = await sendEmailFromApims(senderEmailAPI, emailModel); //for implementation in live

            console.log(result);
            //if (result.Code === 0) { //for implementation in live
            if (result === 0) { //for uat testing
                console.log("after email send success");
                const checkEmailSendStatus = await updateSendEmailStatus(element.id);
                if (checkEmailSendStatus === true) {
                    console.log("Email send successful for " + element.id);
                }
            }

        });
    } catch (error) {
        console.error("Error while sending specail attention email " + error);
    }

};

// Schedule the batch job to run at the specified cron schedule
console.log("scheduling the send Email job for special attention members ....");
cron.schedule(cronSchedule, sendEmail);