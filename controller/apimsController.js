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

module.exports = {getDataFromApims};