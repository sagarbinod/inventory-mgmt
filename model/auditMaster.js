//Audit Master Model

class AuditMaster {
    id;
    typeOfAudit;
    fiscalYear;
    auditUnit;
    auditUnitDesc;
    auditHead;
    corporateTitleAuditHead;
    auditStartDate;
    auditEndDate;
    onsiteStartDate;
    onsiteEndDate;
    netWorkingDays;
    auditLeader;
    staffAtBranch;
    acmNo;
    acmDate;
    createdBy;
    createdOn;
    verifiedBy;
    verifiedOn;
    is_deleted;
}

module.exports = AuditMaster;