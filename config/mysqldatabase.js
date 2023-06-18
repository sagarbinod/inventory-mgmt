const mysql = require('mysql2/promise');

var hostname, db, username, portnum, pass;

hostname = process.env.MYSQL_HOST;
db = process.env.MYSQL_DATABASE;
username = process.env.MYSQL_USERNAME;
portnum = process.env.MYSQL_PORT;
pass = process.env.MYSQL_PASSWORD;


const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Skc@@@@@14733#####%%%%%',  
  database: 'audit',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  port :3306
});

module.exports= {pool};

