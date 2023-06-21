//audit commment model

class AuditComment {
    id;
    auditUnit;
    head;
    subHead1;
    subHead2;
    subHead3;
    standardComment;
    riskGrade;
    nonCompliance;
    refPolicy;
    commentInDetail;
    auditId;
    createdBy;
    createnOn;
    auditStatus;
    closingRemarksAudit;
    isDeleted;
};     

module.exports = AuditComment;