const express = require ("express");

const router = express.Router();

const {getAllCommentHeadings}= require("../controller/commentHeadingController");

router.get("/getAllRecords",getAllCommentHeadings);

router.post("/addCommentHeading",);

module.exports = router;