const { pool } = require('../config/mysqldatabase');
const AuditTeam = require('../model/auditTeam');


const insertAuditTeam = async (auditId, teamList) => {

    console.log("Inserting audit team members");
    try {
        teamList.forEach(teamList => {
            const sql = "insert into audit_team (member_name,audit_id) values (?,?)";
            pool.execute(sql, [teamList.memberName, auditId]);
            console.log('Team members added successfully');
        });
    } catch (error) {
        console.error('Error while inserting audit members ' + error);
    }
}


const getAllMembers = async () => {
    console.log('Getting members from audit team ');
    try {
        const sql = "select * from audit_team order by id desc";
        const [rows, fields] = await pool.execute(sql);
        return [rows];
    } catch (error) {
        console.log("Error while getting audit team members", error);
    }
}

module.exports = { insertAuditTeam, getAllMembers };