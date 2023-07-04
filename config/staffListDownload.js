const cron = require('node-cron');
const callAPI = require('../config/apims');
const {saveStaffList}= require('../controller/staffListController');

const cronSchedule = process.env.STAFF_LIST_DOWNLOAD_SCHEDULE;
const staffListAPI = process.env.EMP_DETAIL_LIST_API;
const requestModel = {};

const getEmployeesList = async () => {
    console.log("Fetching Employee List");
    const employeeList = await callAPI(staffListAPI, requestModel);
    const result= await saveStaffList(employeeList);
}


console.log("Scheduling the employee list download job.....");
cron.schedule(cronSchedule, getEmployeesList);