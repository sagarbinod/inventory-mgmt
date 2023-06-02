const express=require("express");
const morgan=require("morgan");
const homerouter=require("./routes/home");
const itemRouter=require("./routes/itemRoute");
const connection=require("./config/database");
const logger=require("./middleware/logger");


const app=express();
//Setting up ENV in our project
require("dotenv").config();

//global middlewares
app.use(morgan('dev'));
app.use(logger);
app.use(express.json());


//connect to database
connection();
app.use(homerouter);
app.use("/api/items/",itemRouter);


app.listen(process.env.PORT,()=>{
    console.log(`Server started at port ${process.env.PORT}`)
});