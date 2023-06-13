const express=require('express');
const router=express.Router();
const {
    getDataFromApims,
    getBranchList,
    getDepartmentList,
    getAllEmployees,
    getSingleEmployee,
    getEmployeesFromBranch,
    getEmployeesFromDepartment,
    getEmployeeHOD,
    getEmployeeBM
} = require('../controller/apimsController');

router.get('/getData', getDataFromApims);

router.get('/branchList', getBranchList);

router.get('/departmentList', getDepartmentList);

router.get('/employeeList', getAllEmployees);

router.get('/employeeId/:empId', getSingleEmployee);

router.get('/branchEmployeeList/:branchId', getEmployeesFromBranch);

router.get('/deptEmployeeList/:departmentId', getEmployeesFromDepartment);

router.get('/bmEmployeeList', getEmployeeBM);

router.get('/hodEmployeeList', getEmployeeHOD);

module.exports=router;