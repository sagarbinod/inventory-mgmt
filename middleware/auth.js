const jwt=require('jsonwebtoken');

const checkAPIKey = (req, res, next) => {
    const { APIKey } = req.query;
    if (APIKey) {
      if (APIKey === "ABC123") {
        next();
      } else {
        return res.status(400).json({ message: "Invalid API Key" });
      }
    } else {
      return res.status(400).json({ message: "Missing API Key" });
    }
  };

  const verifyTokenAdmin= (req,res,next)=>{
    if(req.headers.authorization){
        const token=req.headers.authorization.split(" ")[1];
        console.log(token);
        jwt.verify(token,process.env.SECRET_KEY,(err,decoded)=>{
            if(err){
                res.status(401).json("Token is not valid");
            }
            if(decoded.isAdmin){
                next();
            }else{
                res.status(403).json("You are not authorized!");
            }
        });
        next();
    }else{
        res.status(403).json("You are not authorized");
    }
  };

  const verifyTokenAdminOrUser= (req,res,next)=>{
    if(req.headers.authorization){
        const token=req.headers.authorization.split(" ")[1];
        console.log(token);
        jwt.verify(token,process.env.SECRET_KEY,(err,decoded)=>{
            if(err){
                res.status(401).json("Token is not valid");
            }
            if(decoded.isAdmin || decoded.id===req.param.userID){
                next();
            }else{
                res.status(403).json("You are not authorized!");
            }
        });
        next();
    }else{
        res.status(403).json("You are not authorized");
    }
  };


  module.exports = {checkAPIKey,verifyTokenAdmin,verifyTokenAdminOrUser};