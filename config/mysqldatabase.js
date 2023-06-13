const mysql = require('mysql2');



const mysql_connection = async () => {
    
    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USERNAME,
        password:process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    await connection.connect((err) => {
        if (err) {
            console.error('Error connecting to mysql database', err);
            return;
        }
        console.log('connected to MYSQL');
    })
};

module.exports = mysql_connection;

