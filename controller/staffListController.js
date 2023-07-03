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
        branchType,isProvinceManager,isBranchManager,isABM,isOI,isCreditIncharge) 
        values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

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
            staffList.isBranchManager, staffList.isABM, staffList.isOI, staffList.isCreditIncharge]);
        } catch (error) {
            console.error("error while inserting staff list " + error);
        }
    });



};

module.exports = { saveStaffList };