// const dayjs=require('dayjs');
// //const TimeStamp='2023-06-08T12:29:04.789';
// const crypto= require("crypto");
// const fs=require('fs');
// const { Buffer } = require('buffer');
// const filePath='./certificate/PrivateKey_intranet.pem';
// const axios= require('axios');
const callAPI = require('../config/apims');


const getDataFromApims = async (req,res) => {

  const {functionName,requestModel}=req.body;
  console.log(functionName,requestModel);
  const result = await callAPI(functionName,requestModel);
 
  res.json(result);

};

const getBranchList = async (req,res) => {
    const functionName=process.env.BRANCH_LIST_API;
    const requestModel={"categoryType":"BRANCH"};
    console.log(functionName,requestModel);
    const result =await callAPI(functionName,requestModel);
    res.status(200).json(result);
};

const getDepartmentList = async(req,res) =>{
    const functionName=process.env.DEPARTMENT_LIST_API;
    const requestModel={"TransactionId":"DL-11"};
    console.log(functionName,requestModel);
    const result= await callAPI(functionName,requestModel);
    res.status(200).json(result);
};

const getAllEmployees = async(req,res)=>{
    const functionName=process.env.EMP_DETAIL_LIST_API;
    const requestModel={};
    console.log(functionName,requestModel);
    const result= await callAPI(functionName,requestModel);
    res.status(200).json(result);
};

const getSingleEmployee = async(req,res)=>{
    const functionName=process.env.EMP_DETAIL_BY_STAFFID;
    console.log(req.params.empId);
    const requestModel={"staffId":req.params.empId};
    console.log(functionName,requestModel);
    const result= await callAPI(functionName,requestModel);
    res.status(200).json(result);
};

module.exports = {getDataFromApims,getBranchList,getDepartmentList,getAllEmployees,getSingleEmployee};