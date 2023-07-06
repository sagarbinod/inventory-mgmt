const cron = require('node-cron');
const callAPI = require('../config/apims');
const { saveStaffList,saveBranchList } = require('../controller/staffListController');

const cronSchedule = process.env.STAFF_LIST_DOWNLOAD_SCHEDULE;
const staffListAPI = process.env.EMP_DETAIL_LIST_API;
const requestModel = {};
const branchListAPI = process.env.BRANCH_LIST_API;
const requestModelBranchList = { "categoryType": "BRANCH" };

const getEmployeesList = async () => {
    console.log("Fetching Employee List");
    const employeeList = await callAPI(staffListAPI, requestModel);
    const result = await saveStaffList(employeeList);
    const branchList = await callAPI(branchListAPI, requestModelBranchList);
    const branchResult= await saveBranchList(branchList);
}


console.log("Scheduling the employee list download job.....");
cron.schedule(cronSchedule, getEmployeesList);