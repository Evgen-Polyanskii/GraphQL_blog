const Queue = require('bull');
const throng = require('throng');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');
const { getAnalyticalReport, makeTable } = require('../lib/getAnalyticalReport.js');

const pathToEnv = path.resolve(__dirname, '../../.env');
dotenv.config({ path: pathToEnv });

let workers = process.env.WEB_CONCURRENCY || 2;
let maxJobsPerWorker = 5;

const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.TRANSPORTER_AUTH_USER,
    pass: process.env.TRANSPORTER_AUTH_PASS,
  },
});

// const sendAnalyticalReport = new Queue('Send analytical report', process.env.REDIS_URL);

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

const createAnalyticalReport = () => {
  const sendAnalyticalReport = new Queue('Send analytical report', REDIS_URL);
  sendAnalyticalReport.process(maxJobsPerWorker, async (job) => {
    try {
      const { email, startDate, endDate } = job.data;
      const analyticalReport = await getAnalyticalReport(startDate, endDate);
      const reportTable = makeTable(analyticalReport);
      const info = await transporter.sendMail(
        {
          from: process.env.TRANSPORTER_EMAIL,
          to: email,
          subject: 'Analytical report',
          text: reportTable.toString(),
        },
      );
      console.log('Message sent: %s', info.messageId);
    } catch (err) {
      console.log('Error', err);
      throw err;
    }
  });
};

createAnalyticalReport();
// throng({ workers, start: createAnalyticalReport });

// module.exports = createAnalyticalReport;
