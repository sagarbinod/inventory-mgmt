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
    createdByName;
    createnOn;
    auditStatus;
    closingRemarksAudit;
    isDeleted;
    commitmentDays;
    auditDeadline;
    complianceStatus;
    closingRemarksCompliance;
};     

module.exports = AuditComment;