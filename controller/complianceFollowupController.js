const ComplianceFollowup = require("../model/complianceFollowup");
const { pool } = require('../config/mysqldatabase');
const { getAuditStatus,
    getComplianceStatus } = require('../controller/auditCommentController');
const formattedDateTime = require('../config/currentDate');

const addComplianceFollowup = async (req, res) => {
    let complianceFollowup = new ComplianceFollowup();
    complianceFollowup = req.body;
    console.log("inserting compliance followup");
    const auditStatus = await getAuditStatus(complianceFollowup.commentId);
    console.log(auditStatus);
    const sql = "insert into compliance_followup (commentId, enteredBy, response, attachment) values(?,?,?,?)";
    try {
        if (auditStatus !== 'C') {
            const [rows, fields] = await pool.execute(sql, [complianceFollowup.commentId, complianceFollowup.enteredBy,
            complianceFollowup.response, complianceFollowup.attachment]);
            if (rows.affectedRows === 0) {
                res.status(500).send("Error while inserting compliance followup ");
            }
            res.status(200).send("Record added");
        } else {
            res.status(400).send("Audit comment is not closed by Audit Team");
        }
    } catch (error) {
        res.status(500).send("Error while inserting compliance followup " + error);
    }

};

const listCompinaceFollowupByCommentId = async (req, res) => {
    const commentId = req.params.commentId;
    const sql = "select * from compliance_followup where commentId=? and isDeleted='F' ";
    try {
        const [rows, fields] = await pool.execute(sql, [commentId]);
        console.log(rows.length);
        if (rows.length === 0) {
            res.status(404).send("Record not found");
        } else {
            res.status(200).send(rows);
        }
    } catch (error) {
        console.error("Error while fetchig compliance followup list " + error);
        res.status(500).send("Error while fetching compliance followup list " + error);
    }
};

const updateComplianceFollowup = async (req, res) => {
    let complianceFollowup = new ComplianceFollowup();
    complianceFollowup = req.body;
    const currentTime = formattedDateTime();
    const auditStatus = await getAuditStatus(complianceFollowup.commentId);
    const complianceStatus = await getComplianceStatus(complianceFollowup.commentId);
    console.log("updating compliance followup");
    const sql = `update compliance_followup set enteredBy=?,enteredOn=?, response=?, attachment=? where commentid=? and
                id=? and isDeleted='F'`;
    try {
        if (auditStatus === 'C' && complianceStatus !== 'C') {
            const [rows, fields] = await pool.execute(sql, [complianceFollowup.enteredBy,
                currentTime, complianceFollowup.response,
            complianceFollowup.attachment, complianceFollowup.commentId, complianceFollowup.id]);
            console.log(rows.affectedRows);
            if (rows.affectedRows === 1) {
                res.status(200).send("Update successful");
            } else {
                res.status(500).send("Error while updating compliance followup");
            }
        } else {
            res.status(400).send("Update not permitted");
        }
    } catch (error) {
        console.error("Error while updating compliance followup " + error);
        res.status(500).send("Error while updating compliance followup " + error);
    }
};

const deleteComplianceFollowup = async (req, res) => {
    const commentId = req.params.commentId;
    const id = req.params.id;
    const sql = "update compliance_followup set isDeleted='T' where commentId=? and id=? and isDeleted='F'";
    const auditStatus = await getAuditStatus(commentId);
    const complianceStatus = await getComplianceStatus(commentId);
    try {
        if (auditStatus === 'C' && complianceStatus !== 'C') {
            const [rows, fields] = await pool.execute(sql, [commentId, id]);
            if (rows.affectedRows === 1) {
                res.status(200).send("Delete successful");
            } else {
                res.status(404).send("Failed to delete compliance followup ");
            }
        } else {
            res.status(500).send("Deleting compliance followup is not permitted");
        }
    } catch (error) {
        console.error("Error while deleting compliance followup " + error);
        res.status(500).send("Error while deleting compliance followup " + error);
    }
};

module.exports = {
    addComplianceFollowup,
    listCompinaceFollowupByCommentId,
    updateComplianceFollowup,
    deleteComplianceFollowup
}