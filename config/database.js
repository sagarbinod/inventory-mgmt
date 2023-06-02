const mongoose=require("mongoose");

const connection = async() => {
    try{
        console.log(process.env.CONNECTION_STRING);
     await mongoose.connect(process.env.CONNECTION_STRING);
        console.log("connection_successful");
    }catch(err){
        console.log(err);
    }
};

module.exports = connection;