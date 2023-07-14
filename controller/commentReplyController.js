const CommentReply = require('../model/commentReply');
const { pool } = require('../config/mysqldatabase');
const { getAuditStatus, setAuditStatusForCommentReply } = require('../controller/auditCommentController');
const formattedDateTime = require('../config/currentDate');

//add new comment reply
const addCommentReply = async (req, res) => {
    let commentReply = new CommentReply();
    commentReply = req.body;
    console.log(commentReply);
    const auditStatus = await getAuditStatus(commentReply.commentId);
    console.log(auditStatus);
    const statusCode = ['E', 'C'];
    const sql = "insert into comment_reply (commentId,enteredBy,commentReply) values (?,?,?)";
    try {
        if (!statusCode.includes(auditStatus)) {
            if (commentReply.solId !== '') {
                const [rows, fields] = await pool.execute(sql, [commentReply.commentId,
                commentReply.enteredBy, commentReply.commentReply]);
                if (rows.affectedRows === 1) {
                    let staffDeptName = req.body.token_data.departmentName;
                    if (staffDeptName === 'Branch Monitoring') {
                        await setAuditStatusForCommentReply(commentReply.commentId, 'BP');
                    } else if (staffDeptName !== 'Branch Monitoring') {
                        await setAuditStatusForCommentReply(commentReply.commentId, 'AP');
                    }
                    res.status(200).send("Comment Reply added successfully");
                }
            } else {
                res.status(500).send('solId is missing ');
            }
        } else {
            res.status(400).send("Audit Comment status is either closed or not approved");
        }
    } catch (error) {
        res.status(500).send("Failed to insert comment");
    }
};

//list all comment reply by comment id
const listCommentReplyByCommentId = async (req, res) => {
    const commentId = req.params.commentId;
    const sql = "select * from comment_reply where isDeleted='F' and commentId=? ";
    try {
        const [rows, fields] = await pool.execute(sql, [commentId]);
        // console.log(rows.length);
        if (rows.length === 0) {
            res.status(404).send("Record does not exist");
        } else {
            res.status(200).send(rows);
        }
    } catch (error) {
        console.error("Error while fetching audit comment reply details " + error);
        res.status(500).send("Error while fetching audit comment reply details ");
    }

};

//update comment reply based on comment id and comment reply id
const updateCommentReply = async (req, res) => {
    let commentReply = new CommentReply();
    commentReply = req.body;
    let currentTime = formattedDateTime();
    //console.log(currentTime);
    const auditStatus = await getAuditStatus(req.params.commentId);
    const statusCode = ['E', 'C'];
    const sql = "update comment_reply set enteredBy=?, commentReply=?, enteredOn=? where id=? and commentId=? amd isDeleted='F'";
    try {
        if (!statusCode.includes(auditStatus)) {
            const [rows, fields] = await pool.execute(sql, [commentReply.enteredBy, commentReply.commentReply,
                currentTime, commentReply.id, commentReply.commentId]);
            res.status(200).send("Comment Reply updated");
        } else {
            res.status(400).send("Audit comment is either closed or not approved by audit head");
        }
    } catch (error) {
        console.error("Error while updating audit comment reply " + error);
        res.status(500).send("Error while updating audit comment reply " + error);
    }

};

//delete comment reply based on comment id and comment reply id
const deleteCommentReply = async (req, res) => {
    console.log(req.params.id + " " + req.params.commentId);
    const auditStatus = await getAuditStatus(req.params.commentId);
    const statusCode = ['E', 'C'];
    const sql = "update comment_reply set isDeleted='T' where id=? and commentId=? and isDeleted='F'";
    try {
        if (!statusCode.includes(auditStatus)) {
            const [rows, fields] = await pool.execute(sql, [req.params.id, req.params.commentId]);
            if (rows.affectedRows === 0) {
                res.status(404).send("Failed to update");
            } else {
                res.status(200).send("Comment reply is deleted");
            }
        } else {
            res.status(400).send("audit comment is already closed or not approved by audit head");
        }
    } catch (error) {
        res.status(500).send("Error while deleting comment reply " + error);
    }
};

module.exports = {
    addCommentReply,
    listCommentReplyByCommentId,
    updateCommentReply,
    deleteCommentReply
}