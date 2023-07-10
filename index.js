const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const bodyParser = require('body-parser');
const homerouter = require("./routes/home");
const itemRouter = require("./routes/itemRoute");
const userRouter = require('./routes/userRoute');
const authRouter = require('./routes/authRoute');
const errorRouter = require('./routes/errorRoute');
const apimsRouter = require('./routes/apimsRoute');
const auditMasterRoute = require('./routes/auditMasterRoute');
const auditCommentRoute = require('./routes/auditCommentRoute');
const commentHeadingRoute = require('./routes/commentHeadingRoute');
const commentReplyRoute = require('./routes/commentReplyRoute');
const complianceFollowupRoute = require('./routes/complianceFollowupRoute');

const { checkAPIKey, verifyTokenAdmin, verifyTokenAdminOrUser, verifyToken } = require('./middleware/auth');


//const { connection } = require('./config/mysqldatabase');
const logger = require("./middleware/logger");

const app = express();

//Setting up ENV in our project
require("dotenv").config();
//for deleting temporary files job which run once a day
require('./config/fileCleanup');
//for sending email to audit special attention members after posting comment and after approval
require('./config/sendEmailSpecialAttn');
//for downloading staff list one a day 
require('./config/firstEmailNotice');
require('./config/staffListDownload');
//CORS (Cross-Origin Resource Sharing middleware)
app.use(cors());

//global middlewares
app.use(morgan('dev'));
app.use(logger);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(homerouter);
app.use("/api/auth", authRouter);
app.use("/api/items", itemRouter);
app.use("/api/users", userRouter);
app.use("/api/apims", verifyToken, apimsRouter);
app.use("/api/auditMaster", verifyToken, auditMasterRoute);
app.use("/api/auditComment", verifyToken, auditCommentRoute);
app.use("/api/commentHeading", verifyToken, commentHeadingRoute);
app.use("/api/commentReply", verifyToken, commentReplyRoute);
app.use("/api/complianceFollowup", verifyToken, complianceFollowupRoute);
app.use(errorRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server started at port ${process.env.PORT}`)
});