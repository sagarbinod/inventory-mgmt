const express=require('express');
const router=express.Router();
const {getDataFromApims} = require('../controller/apimsController');


router.get('/getData', getDataFromApims);

module.exports=router;