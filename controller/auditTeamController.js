const { pool } = require('../config/mysqldatabase');
const AuditTeam = require('../model/auditTeam');


const insertAuditTeam = async (auditId, teamList) => {

    console.log("Inserting audit team members");
    try {
        teamList.forEach(teamList => {
            const sql = "insert into audit_team (memberName,auditId) values (?,?)";
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
        const sql = "select * from audit_team where isDeleted='F' order by id desc";
        const [rows, fields] = await pool.execute(sql);
        return [rows];
    } catch (error) {
        console.log("Error while getting audit team members", error);
    }
}

const getAllMembersBasedonId = async (auditId) => {
    console.log('Getting team members from audit_team with audit id =' + auditId);
    try {
        const sql = "select * from audit_team where isDeleted='F' and auditId=" + auditId;
        const [rows, fields] = await pool.execute(sql);
        return rows;
    } catch (error) {
        console.log("Error while fething audit team members based on id" + auditId);
    }
}

const updateTeamMemberById = async (id, auditTeam) => {
    console.log(`Updating the members of audit teams with id=${auditTeam.id} and audit id =${id}`);
    try {
        const sql = `update audit_team set 
            memberName='${auditTeam.memberName}' where id=${auditTeam.id} and auditId=${id}`;
        const [rows, fields] = await pool.execute(sql);
        return rows;
    } catch (error) {
        console.log("Error while updating the audit team members " + error);
    }
}

const validateTeamMember = async (id, auditTeam) => {
    //to check if the record already exists
    console.log("Checking if the audit team member already exists or not");
    const sql = `select * from audit_team where id=${auditTeam.id} and auditId=${id}`;
    if (auditTeam.id === undefined) {
        return 0;
    }
    console.log(sql);
    try {
        const [rows, fields] = await pool.execute(sql);
        const recordCount = rows.length;
        return recordCount;
    } catch (error) {
        console.error("Error while validating audit team members " + error);
    }

}

module.exports = {
    insertAuditTeam,
    getAllMembers,
    getAllMembersBasedonId,
    updateTeamMemberById,
    validateTeamMember
};