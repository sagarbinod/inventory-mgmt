const fs = require('fs');//for handiling file related cases   
const util = require('util');
const ComplianceFollowup = require("../model/complianceFollowup");
const { pool } = require('../config/mysqldatabase');
const { getAuditStatus,
    getComplianceStatus } = require('../controller/auditCommentController');
const formattedDateTime = require('../config/currentDate');


const copyfile = async (source, destination) => {
    const readFile = util.promisify(fs.readFile);
    const writeFile = util.promisify(fs.writeFile);
    const data = await readFile(source);
    await writeFile(destination, data);
}

async function processFileCopy(attachment, file_loc, temp_file_loc) {
    const fileParts = attachment.split(/-+/);
    const dirPath = file_loc + "\\" + fileParts[0];
    console.log(dirPath)
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        if (!fs.existsSync(dirPath + "\\" + fileParts[1])) {
            fs.mkdirSync(dirPath + "\\" + fileParts[1]);
        }
        if (!fs.existsSync(dirPath + "\\" + fileParts[1] + "\\" + fileParts[2])) {
            fs.mkdirSync(dirPath + "\\" + fileParts[1] + "\\" + fileParts[2]);
        }

        const sourceFilePath = temp_file_loc + "\\" + attachment;
        const destFilePath = dirPath + "\\" + fileParts[1] +
            "\\" + fileParts[2] + "\\" + attachment;
        try {
            await copyfile(sourceFilePath, destFilePath);
            console.log("File copy successful from " + sourceFilePath + " to " + destFilePath);
            attachment = "\\" + fileParts[0] + "\\" +
                fileParts[1] + "\\" + fileParts[2] + "\\" + attachment;
            return attachment;
        } catch (error) {
            console.error("Error while copying file " + error);
        }
    } catch (error) {
        console.error("Error while processing file " + error);
        res.status(500).send("Error while processing file " + error);
    }
}

const addComplianceFollowup = async (req, res) => {
    let complianceFollowup = new ComplianceFollowup();
    complianceFollowup = req.body;
    console.log("inserting compliance followup");
    const auditStatus = await getAuditStatus(complianceFollowup.commentId);
    console.log(auditStatus);
    const temp_file_loc = process.env.FILE_UPLOAD_PATH_TMP;
    const file_loc = process.env.FILE_UPLOAD_PATH;
    if (complianceFollowup.attachment.length !== 0 && auditStatus === 'C') {
        const attachment = await processFileCopy(complianceFollowup.attachment, file_loc, temp_file_loc);
        complianceFollowup.attachment = attachment;
    }
    const sql = "insert into compliance_followup (commentId, enteredBy, response, attachment) values(?,?,?,?)";
    try {
        if (auditStatus === 'C') {
            const [rows, fields] = await pool.execute(sql, [complianceFollowup.commentId, complianceFollowup.enteredBy,
            complianceFollowup.response, complianceFollowup.attachment]);
            if (rows.affectedRows === 0) {
                res.status(500).send("Error while inserting compliance followup ");
            }
            res.status(200).send("Record added");
        } else {
            res.status(400).send("Audit comment is not closed by Audit Team");
        }
    } catch (error) {
        res.status(500).send("Error while inserting compliance followup " + error);
    }

};

const listCompinaceFollowupByCommentId = async (req, res) => {
    const commentId = req.params.commentId;
    const file_loc = process.env.FILE_UPLOAD_PATH;
    const sql = "select * from compliance_followup where commentId=? and isDeleted='F' ";
    try {
        const [rows, fields] = await pool.execute(sql, [commentId]);
        console.log(rows.length);
        if (rows.length === 0) {
            res.status(404).send("Record not found");
        } else {
            const records = [];
            rows.forEach(element => {
                if (element.attachment !== "") {
                    element.attachment = file_loc + "\\" + element.attachment;
                }
                records.push(element);
            })
            res.status(200).send(records);
        }
    } catch (error) {
        console.error("Error while fetchig compliance followup list " + error);
        res.status(500).send("Error while fetching compliance followup list " + error);
    }
};

const updateComplianceFollowup = async (req, res) => {
    let complianceFollowup = new ComplianceFollowup();
    complianceFollowup = req.body;
    const currentTime = formattedDateTime();
    const auditStatus = await getAuditStatus(complianceFollowup.commentId);
    const complianceStatus = await getComplianceStatus(complianceFollowup.commentId);
    console.log("updating compliance followup");
    const temp_file_loc = process.env.FILE_UPLOAD_PATH_TMP;
    const file_loc = process.env.FILE_UPLOAD_PATH;
    if (complianceFollowup.attachment.length !== 0 && auditStatus === 'C') {
        const attachment = await processFileCopy(complianceFollowup.attachment, file_loc, temp_file_loc);
        complianceFollowup.attachment = attachment;
    }
    const sql = `update compliance_followup set enteredBy=?,enteredOn=?, response=?, attachment=? where commentid=? and
                id=? and isDeleted='F'`;
    try {
        if (auditStatus === 'C' && complianceStatus !== 'C') {
            const [rows, fields] = await pool.execute(sql, [complianceFollowup.enteredBy,
                currentTime, complianceFollowup.response,
            complianceFollowup.attachment, complianceFollowup.commentId, complianceFollowup.id]);
            console.log(rows.affectedRows);
            if (rows.affectedRows === 1) {
                res.status(200).send("Update successful");
            } else {
                res.status(500).send("Error while updating compliance followup");
            }
        } else {
            res.status(400).send("Update not permitted");
        }
    } catch (error) {
        console.error("Error while updating compliance followup " + error);
        res.status(500).send("Error while updating compliance followup " + error);
    }
};

const deleteComplianceFollowup = async (req, res) => {
    const commentId = req.params.commentId;
    const id = req.params.id;
    const sql = "update compliance_followup set isDeleted='T' where commentId=? and id=? and isDeleted='F'";
    const auditStatus = await getAuditStatus(commentId);
    const complianceStatus = await getComplianceStatus(commentId);
    try {
        if (auditStatus === 'C' && complianceStatus !== 'C') {
            const [rows, fields] = await pool.execute(sql, [commentId, id]);
            if (rows.affectedRows === 1) {
                res.status(200).send("Delete successful");
            } else {
                res.status(404).send("Failed to delete compliance followup ");
            }
        } else {
            res.status(404).send("Deleting compliance followup is not permitted");
        }
    } catch (error) {
        console.error("Error while deleting compliance followup " + error);
        res.status(500).send("Error while deleting compliance followup " + error);
    }
};

const deleteComplianceFollowupFile = async (req, res) => {
    console.log("Deleting the uploaded file ");
    const commentId = req.params.commentId;
    const complianceFollowupId = req.params.id;
    const sql = `select attachment from compliance_followup where commentId=? and id=? and isDeleted='F'`;
    const sql1 = `update compliance_followup set attachment='' where commentId=? and id=? and isDeleted='F'`;
    const auditStatus = await getAuditStatus(commentId);
    const complianceStatus = await getComplianceStatus(commentId);
    let folderPath = process.env.FILE_UPLOAD_PATH;

    try {
        if (auditStatus === 'C' && complianceStatus !== 'C') {
            const [rows, fields] = await pool.execute(sql, [commentId, complianceFollowupId]);
            if (rows.length !== 0) {
                const fileName = rows[0].attachment;
                folderPath = folderPath + fileName
                const checkFileStatus = fs.unlink(folderPath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } else {
                        console.log('File deleted:', fileName);
                    }
                });
                try {
                    await pool.execute(sql1, [commentId, complianceFollowupId]);
                    res.status(200).send("File deleted successfully ");
                } catch (error) {
                    console.log('Error while deleting file ' + error);
                    res.status(500).send("Error while deleting file " + error);
                }
            } else {
                res.status(400).send("File does not exist");
            }
        }
        else {
            res.status(404).send("Deleting file is not permitted");
        }
    } catch (error) {
        console.error("Error while deleting file " + error);
        res.status(500).send("Error while deleting file " + error);
    }
};

module.exports = {
    addComplianceFollowup,
    listCompinaceFollowupByCommentId,
    updateComplianceFollowup,
    deleteComplianceFollowup,
    deleteComplianceFollowupFile
}