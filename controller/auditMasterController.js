const { insertAuditTeam,
    getAllMembers,
    getAllMembersBasedonId,
    updateTeamMemberById,
    validateTeamMember } = require('../controller/auditTeamController');
const { pool } = require('../config/mysqldatabase');
const AuditMaster = require('../model/auditMaster');

const addAuditMasterRecord = async (req, res) => {

    console.log(req.body);
    const { typeOfAudit, fiscalYear, auditUnit, auditUnitDesc, auditHead, corporateTitleAuditHead, auditStartDate,
        auditEndDate, onsiteStartDate, onsiteEndDate, netWorkingDays, auditLeader, staffAtBranch,
         createdBy, auditTeam } = req.body;

    try {
        const sql = `insert into audit_master 
            (typeOfAudit,fiscalYear,auditUnit,auditUnitDesc,auditHead,corporateTitleAuditHead,auditStartDate,
                auditEndDate,onsiteStartDate,onsiteEndDate,netWorkingDays,auditLeader,staffAtBranch,createdBy) 
            values 
            (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        console.log(sql);

        const [result] = await pool.execute(sql, [typeOfAudit, fiscalYear, auditUnit, auditUnitDesc, auditHead, corporateTitleAuditHead, auditStartDate,
            auditEndDate, onsiteStartDate, onsiteEndDate, netWorkingDays, auditLeader, staffAtBranch, createdBy]);
        console.log('New Audit Record Added ' + result.insertId);
        await insertAuditTeam(result.insertId, auditTeam);
        res.status(200).json("Record Added");
    } catch (error) {
        console.error("Error while inserting data to audit master " + error);
    }
};

const getAllRecordAuditMaster = async (req, res) => {
    console.log("Getting All records of Audit Master");
    const sql = "select * from audit_master where isDeleted='F' order by id desc";
    console.log(sql);
    try {
        const [rows, fields] = await pool.execute(sql);
        console.log("Record fetched");
        console.log(rows);
        if (rows.length === 0) {
            res.status(200).send("No records found");
        }
        const [rows1] = await getAllMembers();
        const mergedResult = rows.reduce((acc, row) => {
            let masterid = row.id;
            const matchedRow = rows1.filter((item) => (item.auditId) === masterid);
            row.auditTeam = matchedRow;
            //acc.push({ row, "auditTeam": matchedRow });
            acc.push(row);
            return acc;
        }, []);
        res.status(200).json(mergedResult);

    } catch (error) {
        console.log('Error while getting records of Audit Master', error);
    }
};


const getAuditMasterById = async (req, res) => {
    console.log("Getting records from Audit Master based on id= " + req.params.auditMasterId);
    const sql = `select * from audit_master where 
                    id=${req.params.auditMasterId} and isDeleted='F' order by id desc`;
    console.log(sql);
    try {
        if (req.params.auditMasterId) {
            let [rows, fields] = await pool.execute(sql);
            console.log(rows.length);
            if (rows.length === 0) {
                res.status(200).json("No records found");
            }
            const auditTeam = await getAllMembersBasedonId(req.params.auditMasterId);
            rows.forEach(row => {
                row.auditTeam = auditTeam;
                res.status(200).json(row);
            });

        } else {
            res.status(500).json("Audit Master id is required");
        }
    } catch (err) {
        console.log('Error while getting records from audit master ' + err);
    }
};

const deleteAuditMasterById = async (req, res) => {
    console.log('Deleting record from audit master ' + req.params.auditMasterId);
    try {
        if (req.params.auditMasterId) {
            const sql = "update audit_master set isDeleted='T' where id=" + req.params.auditMasterId;
            let [rows, fields] = await pool.execute(sql);
            res.status(200).json("Record Deleted");
        } else {
            res.status(500).send("Audit Master Id is required");
        }
    } catch (error) {
        console.log("Error while deleting audit master record " + error);
    }
};

const updateAuditMasterById = async (req, res) => {
    console.log('Updating Audit Master Record');
    try {//to check if the body is empty
        if (Object.keys(req.body).length !== 0 && req.body.constructor === Object) {
            //console.log(req.body);
            let auditMaster = new AuditMaster();
            auditMaster = req.body;
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const hours = String(currentDate.getHours()).padStart(2, '0');
            const minutes = String(currentDate.getMinutes()).padStart(2, '0');
            const seconds = String(currentDate.getSeconds()).padStart(2, '0');

            const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            console.log(formattedDateTime);
            const sql = `update audit_master set typeOfAudit='${auditMaster.typeOfAudit}',
            fiscalYear='${auditMaster.fiscalYear}',
            auditUnit='${auditMaster.auditUnit}',
            auditUnitDesc='${auditMaster.auditUnitDesc}',
            auditHead='${auditMaster.auditHead}',
            corporateTitleAuditHead='${auditMaster.corporateTitleAuditHead}',
            auditStartDate='${auditMaster.auditStartDate}',
            auditEndDate='${auditMaster.auditEndDate}',
            onsiteStartDate='${auditMaster.onsiteStartDate}',
            onsiteEndDate='${auditMaster.onsiteEndDate}',
            netWorkingDays=${auditMaster.netWorkingDays},
            auditLeader='${auditMaster.auditLeader}',
            staffAtBranch='${auditMaster.staffAtBranch}',
            acmNo='${auditMaster.acmNo}',
            acmDate='${auditMaster.acmDate}',
            updatedBy='${auditMaster.updatedBy}',
            updatedOn= '${formattedDateTime}'
            where id=${auditMaster.id} and isDeleted='F'`
            //console.log("Audit Master update query " + sql);
            let [rows, fields] = await pool.execute(sql);
            if (rows.affectedRows === 1) {
                if (req.body.auditTeam.length > 0) {
                    (req.body.auditTeam).forEach(async row => {
                        const checkRecord = await validateTeamMember(auditMaster.id, row)
                        if (checkRecord === 0) {
                            insertAuditTeam(auditMaster.id, [row]);
                        } else if (checkRecord === 1) {
                            updateTeamMemberById(auditMaster.id,row);
                        }
                    });
                }
            }
            res.status(200).send("Update Successful");
        } else {
            res.status(500).send("Records not sent");
        }
    } catch (error) {
        console.log('Error while updating Audit Master Record', error);
    }
};

module.exports = {
    addAuditMasterRecord,
    getAllRecordAuditMaster,
    getAuditMasterById,
    deleteAuditMasterById,
    updateAuditMasterById
};