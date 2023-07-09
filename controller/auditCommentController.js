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
        req.body.id = rows.insertId;
        let response = { 'comment': req.body }
        res.status(200).json(response);
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
            const result = await Promise.all(rows.map(async (element) => {
                element.commentSpecialMark = await getCommentSpecialMarkByCommentId(element.id);
                element.commentSpecialAttn = await getCommentSpecialAttnByCommentId(element.id);
                return element;
            }
            ));
            mergedResult = { 'commentList': result };
            res.status(200).json(mergedResult);
        } else {
            res.status(404).json("Record does not exist");
        }
    } else {
        res.status(400).json("Audit id is missing");
    }
};

//delete audit comment
const deleteAuditComment = async (req, res) => {
    const sql = `update audit_comment set isDeleted='T' where id=?`;    
    try {
        const [rows, fields] = await pool.execute(sql, [req.params.commentId]);
        if (rows.affectedRows === 1) {
            res.status(200).send("comment deleted");
        } else {
            res.status(500).send("Failed to delete comment");
        }
    } catch (error) {
        console.error("Error while deleting audit comment " + error);
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


//for special attention members only
const getAFAuditIdForEmailNotSent = async () => {
    const sql = `select distinct AC.id from audit_comment AC join comment_special_attn CSA on 
                AC.id=CSA.commentId
                    where 
                AC.auditStatus='AF' 
                and Ac.isDeleted='F' 
                and CSA.emailStatus='N' 
                and CSA.isDeleted='F'`
    try {
        const [rows, fields] = await pool.execute(sql);
        return rows;
    } catch (error) {
        console.log("Error while fetching Audit Forwarded Email Not sent id " + error);
    }

};

const getAuditCommentById = async (id) => {
    const sql = `select * from audit_comment where id=? and isDeleted='F'`;
    try {
        const [rows, fields] = await pool.execute(sql, [id]);
        if (rows.length !== 0) {
            const auditCommentRecord = rows.pop();//as this only contains single record
            return auditCommentRecord;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error while fetching audit comment based on comment id " + error);
    }
}

//update audit status code after audit comment draft is finalized by IAD Head
const setAuditStatusByIADHead = async (auditId, status) => {
    const sql = "update audit_comment set auditStatus=? where auditId =? and auditStatus!='C';"
    try {
        const [rows, fields] = await pool.execute(sql, [status, auditId]);
        return true;
    } catch (error) {
        console.error('Error while updating audit comment table auditStatus field ' + error);
        return false;
    }
}

//for counting audit comment Risk staus : Low, Medium and High
const countCommentRiskGrade = async (auditId) => {
    console.log("Fetching risk status " + auditId);
    const sql = `select riskGrade 'riskGrade',count(riskGrade) 'noOfComments' from audit_comment where auditId=? and isDeleted='F' group by riskGrade
                union all
                select 'Total Comments',count(id) from audit_comment where auditId=? and isDeleted='F' group by auditId`;
    try {
        const [rows, fields] = await pool.execute(sql, [auditId, auditId]);
        if (rows.length !== 0) {
            return rows;
        }
    } catch (error) {
        console.error("Error while fetching comment risk grade " + error);
    }
}

module.exports = {
    addAuditComment,
    updateAuditCommentById,
    listAuditComentByAuditId,
    deleteAuditComment,
    getAuditStatus,
    getComplianceStatus,
    getAFAuditIdForEmailNotSent,
    getAuditCommentById,
    setAuditStatusByIADHead,
    countCommentRiskGrade
}