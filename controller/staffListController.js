const StaffList = require('../model/staffList');
const { pool } = require('../config/mysqldatabase');


const saveStaffList = async (allStaffList) => {
    const staffListAll = allStaffList.Data.employeeList;
    const truncate_sql = `truncate table staff_list`;
    console.log("Staff list length " + staffListAll.length);
    //truncating staff_list table
    if (staffListAll.length !== 0) {
        try {
            await pool.execute(truncate_sql);
            console.log('Truncating staff list success');
        } catch (error) {
            console.error('Error while truncating staff list ' + error);
        }
    }

    //inserting into staff_list table
    const sql = `insert into staff_list (employeeId,employeeName,designation,domainUserName,email,phone,
        functionalTitle,departmentName,solId,solDesc,branchManagerName,branchManagerDesignation,
        branchType,isProvinceManager,isBranchManager,isABM,isOI,isCreditIncharge,provinceId) 
        values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    console.log("all records " + staffListAll.length);
    staffListAll.forEach(async element => {
        let staffList = new StaffList();
        staffList = element;
        if (element.functionalTitle === 'Branch Manager' || element.functionalTitle === 'Branch Incharge') {
            staffList.isBranchManager = 'Y';
        } else {
            staffList.isBranchManager = 'N';
        }

        if (element.functionalTitle === 'Assistant Branch Manager' ||
            element.functionalTitle.substring(0, 3) === 'ABM') {
            staffList.isABM = 'Y';
        } else {
            staffList.isABM = 'N';
        }

        if (element.functionalTitle === 'Operation Incharge' || element.functionalTitle.substring(0, 23) === 'ABM/ Operation Incharge') {
            staffList.isOI = 'Y';
        } else {
            staffList.isOI = 'N';
        }

        if (element.functionalTitle === 'Credit Incharge' || element.functionalTitle.substring(0, 20) === 'ABM/ Credit Incharge') {
            staffList.isCreditIncharge = 'Y';
        } else {
            staffList.isCreditIncharge = 'N';
        }

        try {
            await pool.execute(sql, [staffList.employeeId, staffList.employeeName, staffList.designation,
            staffList.domainUserName, staffList.email, staffList.phone, staffList.functionalTitle,
            staffList.departmentName, staffList.solId, staffList.solDesc, staffList.branchManagerName,
            staffList.branchManagerDesignation, staffList.branchType, staffList.isProvinceManager,
            staffList.isBranchManager, staffList.isABM, staffList.isOI, staffList.isCreditIncharge,
            staffList.provinceId]);
        } catch (error) {
            console.error("error while inserting staff list " + error);
        }
    });

};


const getBMByBranchCode = async (branchCode) => {
    const sql = `select * from staff_list where solId=? and isBranchManager='Y'`;
    try {
        const [rows, fields] = await pool.execute(sql, [branchCode]);
        if (rows.length !== 0) {
            return rows;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error while fetching bm by branch code " + error);
        return false;
    }
};

const getABMByBranchCode = async (branchCode) => {
    const sql = `select * from staff_list where solId=? and isABM='Y'`;
    try {
        const [rows, fields] = await pool.execute(sql, [branchCode]);
        if (rows.length !== 0) {
            return rows;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error while fetching abm by branch code " + error);
        return false;
    }
};

const getOIByBranchCode = async (branchCode) => {
    const sql = `select * from staff_list where solId=? and isOI='Y'`;
    try {
        const [rows, fields] = await pool.execute(sql, [branchCode]);
        if (rows.length !== 0) {
            return rows;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error while fetching OI by branch code " + error);
        return false;
    }
};

const getCIByBranchCode = async (branchCode) => {
    const sql = `select * from staff_list where solId=? and isCreditIncharge='Y'`;
    try {
        const [rows, fields] = await pool.execute(sql, [branchCode]);
        if (rows.length !== 0) {
            return rows;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error while fetching credit incharge by branch code " + error);
        return false;
    }
};

const getProvinceManagerForBranch = async (provinceId) => {
    const sql = `select * from staff_list where 
    (functionalTitle='Province Incharge' or functionalTitle='Province Manager') and provinceId=?`;
    try {
        const [rows, fields] = await pool.execute(sql, [provinceId]);
        if (rows.length !== 0) {
            return rows;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error while fetching province manager for branch ' + error);
    }

}

const getComplianceHead = async () => {
    const sql = `select * from staff_list where functionalTitle='Head-compliance'`;
    try {
        const [rows, fields] = await pool.execute(sql);
        if (rows.length !== 0) {
            return rows;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error while fetching compliance head ' + error);
        return false;
    }
};

const getAllStaffsCompliance = async () => {
    const sql = `select * from staff_list where departmentName='Compliance'`;
    try {
        const [rows, fields] = await pool.execute(sql);

    } catch (error) {
        console.error('Error while fetching compliance list staffs ' + error);
        return false;
    }
};

const getInternalAuditHead = async () => {
    const sql = `select * from staff_list where functionalTitle='Head - Internal Audit Department'`;
    try {
        const [rows, fields] = await pool.execute(sql);
        if (rows.length !== 0) {
            return rows;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error while fetching internal audit head' + error);
        return false;
    }
};

const getAllStaffInternalAudit = async () => {
    const sql = `select * from staff_list where departmentName='Internal Audit Department'`;
    try {
        const [rows, fields] = await pool.execute(sql);
        if (rows.length !== 0) {
            return rows;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error while fetching all staffs internal audit ' + error);
        return false;
    }
};

const saveBranchList = async (branchList) => {
    //console.log(branchList.Data.categoriesList);
    const sql = "truncate table branch_list";
    const sql1 = "insert into branch_list (branchCode,branchName) values (?,?)";
    const branchListAll = branchList.Data.categoriesList;
    if (branchList.length !== 0) {
        try {
            await pool.execute(sql);
            branchListAll.forEach(async e => {
                await pool.execute(sql1, [e.REF_CODE, e.REF_DESC]);
            });
        } catch (error) {
            console.error('Error while truncating /inserting branch list ' + error);
        }
        return true;
    } else {
        return false;
    }
}


module.exports = {
    saveStaffList,
    getBMByBranchCode,
    getABMByBranchCode,
    getOIByBranchCode,
    getCIByBranchCode,
    getProvinceManagerForBranch,
    getComplianceHead,
    getAllStaffsCompliance,
    getInternalAuditHead,
    getAllStaffInternalAudit,
    saveBranchList
};