const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
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
const commentFollowupRoute = require('./routes/commentFollowupRoute');

const { checkAPIKey, verifyTokenAdmin, verifyTokenAdminOrUser, verifyToken } = require('./middleware/auth');


//const { connection } = require('./config/mysqldatabase');
const logger = require("./middleware/logger");

const app = express();
//Setting up ENV in our project
require("dotenv").config();
//CORS (Cross-Origin Resource Sharing)
app.use(cors());

//global middlewares
app.use(morgan('dev'));
app.use(logger);
app.use(express.json());

app.use(homerouter);
app.use("/api/auth", authRouter);
app.use("/api/items", itemRouter);
app.use("/api/users", userRouter);
app.use("/api/apims", verifyToken, apimsRouter);
app.use("/api/auditMaster", verifyToken, auditMasterRoute);
app.use("/api/auditComment", auditCommentRoute);
app.use("/api/commentHeading", verifyToken, commentHeadingRoute);
app.use("/api/commentReply", verifyToken, commentReplyRoute);
app.use("/api/commentFollowup", verifyToken, commentFollowupRoute);
app.use(errorRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server started at port ${process.env.PORT}`)
});