const { pool } = require('../config/mysqldatabase');
const AuditComment = require("../model/auditComment");
const CommentSpecialMark = require("../model/commentSpecialMark");
const CommentSpecialAttn = require("../model/commentSpecialAttn");
const {
    addCommentSpecialMark,
    getCommentSpecialMarkByCommentId,
    updateCommentSpecialMarkByCommentId,
    validateSpecialMark
} = require("../controller/commentSpecialMarkController");

const {
    addCommentSpecialAttn,
    getCommentSpecialAttnByCommentId,
    updateCommentSpecialAttnByCommentId,
    validateSpecialAttn
} = require("../controller/commentSpecialAttnController");

const addAuditComment = async (req, res) => {
    console.log(req.body);
    let auditComment = new AuditComment();
    let commentSpecialMark = new CommentSpecialMark();
    let commentSpecialAttn = new CommentSpecialAttn();
    auditComment = req.body;
    commentSpecialMark = req.body.commentSpecialMark;
    commentSpecialAttn = req.body.commentSpecialAttn;
    console.log("Adding audit comment ");
    try {
        const sql = `insert into audit_comment (auditUnit,head,subHead1,subHead2,subHead3,
            standardComment,riskGrade,nonCompliance,refPolicy,commentInDetail,auditId,createdBy)
                    values 
                    (?,?,?,?,?,?,?,?,?,?,?,?)`;
        console.log(sql);
        const [rows, fields] = await pool.execute(sql, [auditComment.auditUnit, auditComment.head, auditComment.subHead1,
        auditComment.subHead2, auditComment.subHead3, auditComment.standardComment,
        auditComment.riskGrade, auditComment.nonCompliance, auditComment.refPolicy,
        auditComment.commentInDetail, auditComment.auditId, auditComment.createdBy]);
        console.log("New Audit comment added: " + rows.insertId);
        if (rows.insertId) {
            try {
                await addCommentSpecialMark(rows.insertId, commentSpecialMark);
            } catch (error) {
                console.log("Error while adding audit special mark " + error);
            }
        };
        if (rows.insertId) {
            try {
                await addCommentSpecialAttn(rows.insertId, commentSpecialAttn);
            } catch (error) {
                console.log("Error while adding comment special attention " + error);
            }
        };
        res.status(200).json("Comment Add Successful");
    } catch (error) {
        console.error("Error while adding audit comment " + error);
        res.status(500).send("Error while adding audit comment " + error);
    };
};

const updateAuditCommentById = async (req, res) => {
    console.log(req.body);
    let auditComment = new AuditComment();
    let commentSpecialMark = new CommentSpecialMark();
    let commentSpecialAttn = new CommentSpecialAttn();
    auditComment = req.body;
    commentSpecialMark = req.body.commentSpecialMark;
    commentSpecialAttn = req.body.commentSpecialAttn;
    console.log("Adding audit comment " + req.body.id);
    const sql = `update audit_comment set auditUnit=?, head=?, subHead1=?, subHead2=?, subHead3=?
    , standardComment=?, riskGrade=?, nonCompliance=?, refPolicy=?, commentInDetail=?, auditStatus=?,
    closingRemarksAudit=? where id=? and isDeleted='F'`;

    try {
        const [rows, fields] = await pool.execute(sql, [auditComment.auditUnit, auditComment.head,
        auditComment.subHead1, auditComment.subHead2, auditComment.subHead3, auditComment.standardComment,
        auditComment.riskGrade, auditComment.nonCompliance, auditComment.refPolicy, auditComment.commentInDetail,
        auditComment.auditStatus, auditComment.closingRemarksAudit, auditComment.id]);
        if (rows.affectedRows === 1) {
            if (commentSpecialMark.length > 0) {
                commentSpecialMark.forEach(async (row) => {
                    const checkRecord = await validateSpecialMark(auditComment.id, row);
                    console.log(row);
                    console.log(checkRecord);
                    if (checkRecord === 0) {
                        await addCommentSpecialMark(auditComment.id, [row]);
                    } else if (checkRecord === 1) {
                        await updateCommentSpecialMarkByCommentId(auditComment.id, [row]);
                    }
                });
            };

            if (commentSpecialAttn.length > 0) {
                commentSpecialAttn.forEach(async (row) => {
                    const checkRecord = await validateSpecialAttn(auditComment.id, [row]);
                    console.log(row);
                    console.log(checkRecord);
                    if (checkRecord === 0) {
                        await addCommentSpecialAttn(auditComment.id, [row]);
                    } else if (checkRecord === 1) {
                        await updateCommentSpecialAttnByCommentId(auditComment.id, [row]);
                    }
                });
            }
            //await updateCommentSpecialMarkByCommentId(auditComment.id, commentSpecialMark);
            //await updateCommentSpecialAttnByCommentId(auditComment.id, commentSpecialAttn);
            res.status(200).send("Comment updated successfully");
        } else {
            res.status(500).send("Failed to update");
        }
    } catch (error) {
        console.error("Failed to update audit comment " + error);
    };

};

const listAuditComentByAuditId = async (req, res) => {
    console.log("Getting all comments list based on audit id");
    if (req.param.auditId !== "") {
        const auditId = req.params.auditId;
        const sql = `select * from audit_comment where auditId =${auditId} and isDeleted='F'`;
        const [rows, fields] = await pool.execute(sql);
        if (rows.length > 0) {
            const mergedResult = await rows.reduce(async (acc, row) => {
                const commentId = row.id;
                console.log(commentId);
                const commentSpecialMark = await getCommentSpecialMarkByCommentId(commentId);
                console.log(commentSpecialMark);
                const commentSpecialAttn = await getCommentSpecialAttnByCommentId(commentId);
                console.log(commentSpecialAttn);
                row.commentSpecialMark = commentSpecialMark;
                row.commentSpecialAttn = commentSpecialAttn;
                acc.push(row);
                return acc;
            }, []);
            res.status(200).json(mergedResult);
        } else {
            res.status(404).json("Record does not exist");
        }
    } else {
        res.status(400).json("Audit id is missing");
    }
};

//check the audit comment status wheather comment is approved by head or not
//also check the audit comment status if it is closed or not
const getAuditStatus = async (commentId) => {
    const sql = "select auditStatus from audit_comment where id=? and isDeleted='F'";
    try {
        const [rows, fields] = await pool.execute(sql, [commentId]);
        let auditStatus = "";
        rows.forEach(element => auditStatus = element.auditStatus);
        return auditStatus;
    } catch (error) {
        console.error("Error while validating audit comment");
    }
};

const getComplianceStatus = async (commentId) => {
    const sql = "select complianceStatus from audit_comment where isDeleted='F' and id=?";
    try {
        const [rows, fields] = await pool.execute(sql, [commentId]);
        let complianceStatus = "";
        rows.forEach(element => complianeStatus = element.complianceStatus);
        return complianceStatus;
    } catch (error) {
        console.error("Error while validating compliance status " + error);
    }
}

//to change the audit comment status
const setAuditStatus = async (commentId, status) => {
    const sql = "update audit_comment set auditStatus=? where id =? and auditStatus!='C';"
    try {
        const [rows, fields] = await pool.execute(sql, [status, commentId]);
        return true;
    } catch (error) {
        console.error('Error while updating audit comment table auditStatus field ' + error);
        return false;
    }
}



module.exports = {
    addAuditComment,
    updateAuditCommentById,
    listAuditComentByAuditId,
    getAuditStatus,
    getComplianceStatus
}