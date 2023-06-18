//Audit Tem model

class AuditTeam {
    id;
    memberName;
    auditId;

    AuditTeam(memberName, auditId) {
        this.memberName = memberName;
        this.auditId = auditId
    }

    setAuditTeam(id, memberName, auditId) {
        this.id = teamId;
        this.memberName;
        this.auditId = auditId
    }

    getId() {
        return { "id": this.id };
    }

    getMemberName() {
        return { "memberName": this.memberName };
    }

    getAuditId() {
        return { "auditId": this.auditId };
    }

    getAuditTeam() {
        return { "id": this.id, "memberName": this.memberName, "auditId": this.auditId };
    }
}

module.exports = AuditTeam;