const { pool } = require('../config/mysqldatabase');
const CommentSpecialAttn = require("../model/commentSpecialAttn");

const addCommentSpecialAttn = async (commentId, specialAttn) => {
    console.log("Adding audit comment special attention list");
    const sql = "insert into comment_special_attn (name,email,commentId) values (?,?,?)";
    specialAttn.forEach(async element => {
        try {
            if (element.name != "" && element.email !== "") {
                await pool.execute(sql, [element.name, element.email, commentId]);
            }
        } catch (error) {
            console.log("Error while inserting audit comment special values " + error);
        }
    });
};

const getCommentSpecialAttnByCommentId = async (commentId) => {
    const sql = `select * from comment_special_attn where commentId =${commentId} and isDeleted='F'`;
    try {
        const [rows, fields] = await pool.execute(sql);
        return rows;
    } catch (error) {
        console.log("Error while fetching comment special attn " + error);
    }
};

const updateCommentSpecialAttnByCommentId = async (commentId, specialAttn) => {
    console.log("Updating comment special attention by comment id " + commentId);
    const sql = "update comment_special_attn set name=?, email=? where commentId=? and id=?";
    specialAttn.forEach(async row => {
        try {
            const [rows, fields] = await pool.execute(sql, [row.name, row.email, commentId, row.id]);
        } catch (error) {
            console.log("Error while updating comment special attn " + error);
        }
    });
};

const validateSpecialAttn = async (commentId, specialAttn) => {
    console.log("validating comment special attn to check if record already exists or not " + commentId);
    const sql = "select * from comment_special_attn where commentId=? and id=?";
    if (specialAttn.id === undefined) {
        return 0;
    }
    console.log(sql);
    try {
        const [rows, fields] = await pool.execute(sql, [commentId, specialAttn.id]);
        const recordCount = rows.length;
        return recordCount;
    } catch (error) {
        console.error("Error while validating comment special attn " + error);
    }
};

module.exports = {
    addCommentSpecialAttn,
    getCommentSpecialAttnByCommentId,
    updateCommentSpecialAttnByCommentId,
    validateSpecialAttn
};