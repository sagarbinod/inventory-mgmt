const express=require('express');

const router=express.Router();
const {registerUser,loginUser,adLoginUser}=require('../controller/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
//for active directory login

router.post('/adlogin', adLoginUser);

module.exports=router;