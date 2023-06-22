const CommentSpecialMark = require("../model/commentSpecialMark");
const { pool } = require('../config/mysqldatabase');


const addCommentSpecialMark = async (commentId, specialMark) => {
    console.log("Adding comment special mark");
    const sql = "insert into comment_special_mark (specialMarking,commentId) values (?,?)";
    specialMark.forEach(async row => {
        try {
            if (row.specialMarking !== "") {
                const [rows, fields] = await pool.execute(sql, [row.specialMarking, commentId]);
            }
        } catch (error) {
            console.log("Error while adding comment special mark " + error);
        }
    });
};

const getCommentSpecialMarkByCommentId = async (commentId) => {
    const sql = `select * from comment_special_mark where commentId=${commentId} and isDeleted='F'`;
    try {
        const [rows, fields] = await pool.execute(sql);
        return rows;
    } catch (error) {
        console.log("Error while fetching comment special mark by comment id" + error);
    }
};

const updateCommentSpecialMarkByCommentId = async (commentId, specialMark) => {
    console.log("Updating comment special mark with comment id " + commentId);
    const sql = `update comment_special_mark set specialMarking=? where commentId=? and id=?`;
    specialMark.forEach(async (row) => {
        try {
            const [rows, fields] = await pool.execute(sql, [row.specialMarking, commentId, row.id]);
        }
        catch (error) {
            console.log("Error while updating audit comment special mark " + error);
        }

    });
};

const validateSpecialMark = async (commentId, specialMark) => {
    console.log("validating comment special mark to check if record exist or not");
    const sql = "select * from comment_special_mark where commentId=? and id=?";
    if (specialMark.id === undefined) {
        return 0;
    }
    console.log(sql);
    try {
        const [rows, fields] = await pool.execute(sql, [commentId, specialMark.id]);
        const recordCount = rows.length;
        return recordCount;
    } catch (error) {
        console.error("Error while validating comment special mark " + error);
    }
};


module.exports = {
    addCommentSpecialMark,
    getCommentSpecialMarkByCommentId,
    updateCommentSpecialMarkByCommentId,
    validateSpecialMark
};