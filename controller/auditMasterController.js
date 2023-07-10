const { insertAuditTeam,
    getAllMembers,
    getAllMembersBasedonId,
    updateTeamMemberById,
    validateTeamMember } = require('../controller/auditTeamController');
const { pool } = require('../config/mysqldatabase');
const AuditMaster = require('../model/auditMaster');
const { formattedDateTime } = require('../config/currentDate');
const { setAuditStatusByIADHead } = require('../controller/auditCommentController');
const { sendDraftFinalizedEmail } = require('../config/draftFinalizedEmail');

const addAuditMasterRecord = async (req, res) => {

    console.log(req.body);
    const { typeOfAudit, fiscalYear, auditUnit, auditUnitDesc, auditHead, corporateTitleAuditHead, auditStartDate,
        auditEndDate, onsiteStartDate, onsiteEndDate, netWorkingDays, auditLeader, staffAtBranch,
        createdBy, createdByName, auditTeam } = req.body;

    try {
        const sql = `insert into audit_master 
            (typeOfAudit,fiscalYear,auditUnit,auditUnitDesc,auditHead,corporateTitleAuditHead,auditStartDate,
                auditEndDate,onsiteStartDate,onsiteEndDate,netWorkingDays,auditLeader,staffAtBranch,createdBy,createdByName) 
            values 
            (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        console.log(sql);

        const [result] = await pool.execute(sql, [typeOfAudit, fiscalYear, auditUnit, auditUnitDesc, auditHead, corporateTitleAuditHead, auditStartDate,
            auditEndDate, onsiteStartDate, onsiteEndDate, netWorkingDays, auditLeader, staffAtBranch, createdBy,
            createdByName]);
        console.log('New Audit Record Added ' + result.insertId);
        await insertAuditTeam(result.insertId, auditTeam);
        res.status(200).json({ "status": "Success", "Message": "Audit record added" });
    } catch (error) {
        console.error("Error while inserting data to audit master " + error);
        res.status(500).json({ "status": "Failed", "Message": "Failed to add audit record" });
    }
};

const getAllRecordAuditMaster = async (req, res) => {
    console.log("Getting All records of Audit Master");
    const { createdBy } = req.body;
    console.log(createdBy);
    let sql = "";
    if (createdBy === '') {
        sql = "select * from audit_master where isDeleted='F' order by id desc";
    } else if (createdBy !== '') {
        sql = `select * from audit_master where isDeleted='F' 
                    and createdBy='${req.body.createdBy}' order by id desc`;
    }

    try {

        const [rows, fields] = await pool.execute(sql);
        console.log(sql);

        console.log("Record fetched");
        console.log(rows);
        if (rows.length === 0) {
            return res.status(200).send("No records found");
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

        const output = { "auditMasterListAll": mergedResult }
        res.status(200).json(output);

    } catch (error) {
        console.log('Error while getting records of Audit Master', error);
    }
};

//Getting Audit Master by id for api call
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

const getAuditMasterRecordById = async (auditId) => {
    const sql = `select * from audit_master where id=? and isDeleted='F'`;
    try {
        const [rows, fields] = await pool.execute(sql, [auditId]);
        if (rows.length !== 0) {
            const auditMasterRecord = rows.pop();//as this is fetching single record only
            return auditMasterRecord;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error while fetching audit master record " + auditId);
    }
}

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
            updatedByName=${auditMaster.updatedByName},
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
                            updateTeamMemberById(auditMaster.id, row);
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

//verify audit master record by audit head
const verifyAuditMasterRecordIAD = async (req, res) => {
    console.log('verifying audit master record after comment draft is finalized ');
    const currentDateTime = formattedDateTime();
    const { id, auditVerifiedBy, auditResponseDate, auditRemarks } = req.body;
    const sql = `update audit_master set auditVerifiedBy=?,auditVerifiedOn=?, auditResponseDate=?, 
                auditRemarks=?, auditStatus='O' where id=?`;
    try {
        const [rows, fields] = await pool.execute
            (sql, [auditVerifiedBy, currentDateTime, auditResponseDate, auditRemarks, id]);
        if (rows.affectedRows === 1) {
            let checkStatus = await setAuditStatusByIADHead(id, 'AF');
            if (checkStatus === true) {
                let checkEmailStatus = await sendDraftFinalizedEmail(await getAuditMasterRecordById(id));
                if (checkEmailStatus === true) {
                    console.log("Email send successful after audit comment draft verification by IAD Head");
                } else {
                    console.log("Failed to send email after audit comment draft verification ");
                }
                res.status(200).send("Success");
            } else {
                res.status(500).send("Internal server error");
            }
        } else {
            res.status(500).send('Error while verifying audit comment draft');
        }
    } catch (error) {
        console.log('Error while verifying audit master record by IAD ' + error);
        res.status(500).send('Error while ')
    }
};

//close audit master record by audit head
const closeAuditMasterRecordIAD = async (req, res) => {
    const id = req.body.auditId;
    const sql = "update audit_master set auditStatus='C' where id=?";
    try {
        const [rows, fields] = await pool.execute(sql, [id]);
        if (rows.affectedRows === 1) {
            res.status(200).send('Audit Master closed');
        } else {
            res.status(500).send('Internal Server Error');
        }
    } catch (error) {
        console.error('Error while closing audit master record' + error);
    }
}

//get count days after audit draft is forwarded
const getAuditForwardedDays = async () => {
    const sql = `select 
                    c.id commentId, 
                    m.id auditId,
                    cast(now() as date)-cast(auditVerifiedOn as date) as daysDiff
                from 
                    audit_comment c join audit_master m 
                on 
                c.auditId=m.id and c.auditStatus='AF'
                where m.isDeleted='F' and c.isDeleted='F'`;
    try {
        const [rows, fields] = await pool.execute(sql);
        if (rows.length !== 0) {
            return rows;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error while fetching audit forwarded date count' + error);
    }

};

module.exports = {
    addAuditMasterRecord,
    getAllRecordAuditMaster,
    getAuditMasterById,
    getAuditMasterRecordById,
    deleteAuditMasterById,
    updateAuditMasterById,
    verifyAuditMasterRecordIAD,
    getAuditForwardedDays
};