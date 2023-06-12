const express=require('express');
const router=express.Router();
const {
    getDataFromApims,
    getBranchList,
    getDepartmentList,
    getAllEmployees,
    getSingleEmployee
} = require('../controller/apimsController');

router.get('/getData', getDataFromApims);

router.get('/branchList', getBranchList);

router.get('/departmentList', getDepartmentList);

router.get('/employeeList', getAllEmployees);

router.get('/employeeId/:empId', getSingleEmployee)

module.exports=router;