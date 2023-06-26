const CommentReply = require('../model/commentReply');
const { pool } = require('../config/mysqldatabase');
const { getAuditStatus } = require('../controller/auditCommentController');

//add new comment reply
const addCommentReply = async (req, res) => {
    let commentReply = new CommentReply();
    commentReply = req.body;
    const auditStatus = await getAuditStatus(commentReply.commentId);
    console.log(auditStatus);
    const sql = "insert into comment_reply (commentId,enteredBy,commentReply) values (?,?,?)";
    try {
        if (!["E", "C".includes(auditStatus)]) {
            const [rows, fields] = await pool.execute(sql, [commentReply.commentId,
            commentReply.enteredBy, commentReply.commentReply]);
            if (rows.affectedRows === 1) {
                res.status(200).send("Comment Reply added successfully");
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
    const sql = "update comment_reply set enteredBy=?, commentReply=? where id=? and commentId=?";
    try {
        const [rows, fields] = await pool.execute(sql, [commentReply.enteredBy, commentReply.commentReply,
        commentReply.id, commentReply.commentId]);
        console.log(rows.length);

        res.status(200).send(rows.length);
    } catch (error) {
        console.error(" ")
    }

};

//delete comment reply based on comment id and comment reply id
const deleteCommentReply = async (req, res) => {


};

module.exports = {
    addCommentReply,
    listCommentReplyByCommentId,
    updateCommentReply,
    deleteCommentReply
}