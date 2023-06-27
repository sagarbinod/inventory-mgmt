const express = require("express");
const router = express.Router();

const { addCommentReply,
    listCommentReplyByCommentId,
    updateCommentReply,
    deleteCommentReply } = require('../controller/commentReplyController');

router.post('/addCommentReply', addCommentReply);

router.get('/listCommentReply/:commentId', listCommentReplyByCommentId);

router.post('/updateCommentReply', updateCommentReply);

router.post('/deleteCommentReply/:commentId/:id', deleteCommentReply);


module.exports = router;