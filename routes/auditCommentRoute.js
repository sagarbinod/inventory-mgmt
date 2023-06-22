const express = require("express");

const router = express.Router();

const {
    addAuditComment,
    updateAuditCommentById,
    listAuditComentByAuditId
} = require("../controller/auditCommentController");

router.post("/addComment", addAuditComment);
router.post("/updateAuditComment/:commentId", updateAuditCommentById);
router.get("/listAuditComment/:auditId", listAuditComentByAuditId);


module.exports = router;