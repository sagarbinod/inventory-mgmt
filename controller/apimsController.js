const dayjs=require('dayjs');
//const TimeStamp='2023-06-08T12:29:04.789';
const crypto= require("crypto");
const fs=require('fs');
const { Buffer } = require('buffer');
const filePath='./certificate/PrivateKey_intranet.pem';
const http= require('http');
const { Console } = require('console');
const axios= require('axios');


const getDataFromApims = (req,res) => {
    //console.log(req.body);
    const TimeStamp = dayjs().format("YYYY-MM-DDTHH:mm:ss.000");
    const {functionName,requestModel}=req.body;
    const base64data = Buffer.from(JSON.stringify(requestModel)).toString('base64');
    const signatureModel= {"Model":requestModel,"TimeStamp":TimeStamp};
    const signatureModelBuffer=Buffer.from(JSON.stringify(signatureModel),'utf-8');
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signatureModelBuffer);
    const privateKey=readPrivateKeyFromFile(filePath);
    const signature = signer.sign(privateKey, 'base64');
    const requestString={"FunctionName":functionName,"Data":base64data,"Signature":signature,"TimeStamp":TimeStamp};

    //Apims login credentials
    const apimsUsername=process.env.APIMS_USERNAME;
    const apimsPassword=process.env.APIMS_PASSWORD;
    const base64Credentials=Buffer.from(apimsUsername+":"+apimsPassword,'utf-8').toString('base64');
    console.log(base64Credentials);
    
    //now call the api from apims
    var config = {
        method: 'post',
        url: process.env.APIMS_ENDPOINT,
        headers: { 
            'Authorization': 'Basic '+base64Credentials, 
            'Content-Type': 'application/json'
        },
        data : JSON.stringify(requestString)
        };

    axios(config).then(function (response) {
            console.log(JSON.stringify(response.data));
            res.status(200).json(response.data);
            }).catch(function (error) {
            console.log(error);
            res.status(500).json(error);
    });

   
};

function readPrivateKeyFromFile(filePath) {
    try {
      const privateKey = fs.readFileSync(filePath, 'utf8');
      return privateKey;
    } catch (error) {
      console.error('Error reading private key file:', error);
      return null;
    }
  }

module.exports = {getDataFromApims};