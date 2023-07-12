const express = require("express");

const router = express.Router();

const {
    addAuditComment,
    updateAuditCommentById,
    listAuditComentByAuditId,
    deleteAuditComment
} = require("../controller/auditCommentController");

router.post("/addComment", addAuditComment);
router.post("/updateAuditComment", updateAuditCommentById);
router.get("/listAuditComment/:auditId", listAuditComentByAuditId);
router.post("/delete", deleteAuditComment);


module.exports = router;