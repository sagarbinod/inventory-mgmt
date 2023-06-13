const express=require("express");
const morgan=require("morgan");
const homerouter=require("./routes/home");
const itemRouter=require("./routes/itemRoute");
const userRouter=require('./routes/userRoute');
const authRouter=require('./routes/authRoute');
const errorRouter=require('./routes/errorRoute');
const apimsRouter=require('./routes/apimsRoute');
const connection=require("./config/database");
const mysql_connection=require("./config/mysqldatabase");
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
mysql_connection();
app.use(homerouter);
app.use("/api/auth", authRouter);
app.use("/api/items",itemRouter);
app.use("/api/users", userRouter);
app.use("/api/apims", apimsRouter);
app.use(errorRouter);

app.listen(process.env.PORT,()=>{
    console.log(`Server started at port ${process.env.PORT}`)
});