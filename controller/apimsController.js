// const dayjs=require('dayjs');
// //const TimeStamp='2023-06-08T12:29:04.789';
// const crypto= require("crypto");
// const fs=require('fs');
// const { Buffer } = require('buffer');
// const filePath='./certificate/PrivateKey_intranet.pem';
// const axios= require('axios');
const callAPI = require('../config/apims');


const getDataFromApims = async (req, res) => {

    const { functionName, requestModel } = req.body;
    console.log(functionName, requestModel);
    const result = await callAPI(functionName, requestModel);

    res.json(result);

};

const sendEmailFromApims = async (functionName, requestModel) => {
    console.log(functionName, requestModel);
    const result = await callAPI(functionName, requestModel);
    return result;
};

const getBranchList = async (req, res) => {
    //fetching branch list 
    const functionName = process.env.BRANCH_LIST_API;
    const requestModel = { "categoryType": "BRANCH" };
    console.log(functionName, requestModel);
    const result = await callAPI(functionName, requestModel);
    //fetching employee list 
    res.status(200).json(result);
};

const getDepartmentList = async (req, res) => {
    const functionName = process.env.DEPARTMENT_LIST_API;
    const requestModel = { "TransactionId": "DL-11" };
    console.log(functionName, requestModel);
    const result = await callAPI(functionName, requestModel);
    res.status(200).json(result);
};

const getAllEmployees = async (req, res) => {
    const functionName = process.env.EMP_DETAIL_LIST_API;
    const requestModel = {};
    console.log(functionName, requestModel);
    const result = await callAPI(functionName, requestModel);
    res.status(200).json(result);
};

const getSingleEmployee = async (req, res) => {
    const functionName = process.env.EMP_DETAIL_BY_STAFFID;
    console.log(req.params.empId);
    const requestModel = { "staffId": req.params.empId };
    console.log(functionName, requestModel);
    const result = await callAPI(functionName, requestModel);
    res.status(200).json(result);
};

const getEmployeesFromBranch = async (req, res) => {
    const functionName = process.env.EMP_DETAIL_LIST_API;
    const requestModel = {};
    console.log(req.params.branchId);
    const result = await callAPI(functionName, requestModel);
    const filteredResult = (result.Data.employeeList).filter(employee => employee.solId === req.params.branchId);
    res.status(200).send(filteredResult);
};

const getEmployeesFromDepartment = async (req, res) => {
    const functionName = process.env.EMP_DETAIL_LIST_API;
    const requestModel = {};
    console.log(req.params.departmentId);
    const result = await callAPI(functionName, requestModel);
    const filteredResult = (result.Data.employeeList).
        filter(employee => employee.departmentName === req.params.departmentId);
    res.status(200).send(filteredResult);
};

const getEmployeeHOD = async (req, res) => {
    const functionName = process.env.EMP_DETAIL_LIST_API;
    const requestModel = {};
    const result = await callAPI(functionName, requestModel);
    const filteredResult = (result.Data.employeeList)
        .filter(employee => (employee.functionalTitle).substring(0, 4) === 'Head')
        .filter(employee => employee.solId === "999")
        .filter(employee => (employee.departmentName).substring(0, 7) !== 'Cluster')
    const finalresult = { "departmentList": filteredResult };


    res.status(200).send(finalresult);
};

const getEmployeeBM = async (req, res) => {
    const functionName = process.env.EMP_DETAIL_LIST_API;
    const requestModel = {};
    const result = await callAPI(functionName, requestModel);
    const filteredResult = (result.Data.employeeList)
        .filter(employee => employee.employeeName === employee.branchManagerName)
        .sort((employee1, employee2) => {
            if (employee1.solId < employee2.solId) {
                return -1;
            } else if (employee1.solid > employee2.solId) {
                return 1;
            } else {
                return 0;
            }
        });

    const finalResult = { "branchList": filteredResult };
    res.status(200).send(finalResult);

};

const getExecutiveList = async (req, res) => {
    const functionName = process.env.EMP_DETAIL_LIST_API;
    const requestModel = {};
    const result = await callAPI(functionName, requestModel);
    let finalResult = [];
    const filteredResult = (result.Data.employeeList)
        .filter(employee => {
            if (employee.designation === "Chief Executive Officer") {
                finalResult.push(employee);
            } else if (employee.designation === "Assistant General Manager") {
                finalResult.push(employee)
            } else if (employee.functionalTitle.substring(0, 5) === "Chief") {
                finalResult.push(employee);
            }
        });

     finalResult = { "executiveList": finalResult }
    res.status(200).send(finalResult);
};

module.exports = {
    getDataFromApims,
    getBranchList,
    getDepartmentList,
    getAllEmployees,
    getSingleEmployee,
    getEmployeesFromBranch,
    getEmployeesFromDepartment,
    getEmployeeHOD,
    getEmployeeBM,
    getExecutiveList,
    sendEmailFromApims
};