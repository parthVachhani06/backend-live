// utils/timeFormat.js

const moment = require('moment-timezone');

// Function to format start time in Indian Standard Time (IST)
const formatToIST = (time) => {
    return moment.tz(time, 'Asia/Kolkata').format('h:mm A');
};

module.exports = { formatToIST };
