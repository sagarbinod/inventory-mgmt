
const { CommentHeading } = require("../model/commentHeading");

const { pool } = require('../config/mysqldatabase');

const getAllCommentHeadings = async (req, res) => {
    console.log("Getting all records from Comment Heading");
    const sql = "select * from comment_heading where isDeleted='F' order by id";
    try {
        const [rows, fields] = await pool.execute(sql);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error while fetching comment Heading " + error);
        res.status(500).json("Failed to get comment heading list");
    }
};

module.exports = { getAllCommentHeadings };