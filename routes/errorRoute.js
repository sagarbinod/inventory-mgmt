const express=require('express');

const router=express.Router();

router.get('*',(req,res)=>{
    res.setHeader("Content-Type", "text/html")
    res.send("<h1>Page Not Found</h1>")
});

module.exports = router;