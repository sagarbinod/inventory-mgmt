const { insertAuditTeam, getAllMembers } = require('../controller/auditTeamController');
const { pool } = require('../config/mysqldatabase');
const AuditMaster = require('../model/auditMaster');

const addAuditMasterRecord = async (req, res) => {

    console.log(req.body);
    const { typeOfAudit, fiscalYear, auditUnit, auditUnitDesc, auditHead, corporateTitleAuditHead, auditStartDate,
        auditEndDate, onsiteStartDate, onsiteEndDate, netWorkingDays, auditLeader, staffAtBranch,
        acmNo, acmDate, createdBy, auditTeam } = req.body;

    try {
        const sql = `insert into audit_master 
            (typeOfAudit,fiscalYear,auditUnit,auditUnitDesc,auditHead,corporateTitleAuditHead,auditStartDate,
                auditEndDate,onsiteStartDate,onsiteEndDate,netWorkingDays,auditLeader,staffAtBranch,acmNo,acmDate,createdBy) 
            values 
            (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        console.log(sql);

        const [result] = await pool.execute(sql, [typeOfAudit, fiscalYear, auditUnit, auditUnitDesc, auditHead, corporateTitleAuditHead, auditStartDate,
            auditEndDate, onsiteStartDate, onsiteEndDate, netWorkingDays, auditLeader, staffAtBranch, acmNo, acmDate, createdBy]);
        console.log('New Audit Record Added ' + result.insertId);
        await insertAuditTeam(result.insertId, auditTeam);
        res.status(200).json("Record Added");
    } catch (error) {
        console.error("Error while inserting data to audit master " + error);
    }
};

const getAllRecordAuditMaster = async (req, res) => {
    console.log("Getting All records of Audit Master");
    const sql = "select * from audit_master where is_deleted='F' order by id desc";
    console.log(sql);
    try {
        const [rows, fields] = await pool.execute(sql);
        console.log("Record fetched");
        console.log(rows);
        const [rows1] = await getAllMembers();
        const mergedResult = rows.reduce((acc, row) => {
            let masterid = row.id;
            const matchedRow = rows1.filter((item) => (item.audit_id) === masterid);
            acc.push({ row, "auditTeam": matchedRow });
            return acc;
        }, []);
        res.status(200).json(mergedResult);

    } catch (error) {
        console.log('Error while getting records of Audit Master', error);
    }
};

module.exports = { addAuditMasterRecord, getAllRecordAuditMaster };