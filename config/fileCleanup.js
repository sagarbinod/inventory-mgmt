const cron = require('node-cron');
const fs = require('fs');

const folderPath = process.env.FILE_UPLOAD_PATH_TMP;

// Define the cron schedule for running the job at a specific time every day
//const cronSchedule = '00 17 * * *'; // Runs at 12:00 AM every day
const cronSchedule=process.env.FILE_CLEANUP_SCHEDULE

// Define the batch job function to delete temporary files
const deleteTemporaryFiles = () => {
    console.log("File clean up job started");
    console.log(folderPath);
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    // Iterate through the files and delete them
    files.forEach((file) => {
        console.log("File being deleted is "+file);
      const filePath = `${folderPath}/${file}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File deleted:', filePath);
        }
      });
    });
  });
};

// Schedule the batch job to run at the specified cron schedule
console.log("scheduling the file cleanup job ....")
cron.schedule(cronSchedule, deleteTemporaryFiles);