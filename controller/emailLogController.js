const { pool } = require('../config/mysqldatabase');

const saveEmailLog = async (emailContent) => {
    const sql = "insert into email_log (emailMessage) values (?)";

    try {
        const [rows, fields] = await pool.execute(sql, [emailContent]);
        return true;
    } catch (error) {
        console.log("Error while saving send email log " + error);
        return false;
    }

};

module.exports = { saveEmailLog };