const Queue = require('bull');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');
const { getAnalyticalReport, makeTable } = require('../lib/getAnalyticalReport.js');

const pathToEnv = path.resolve(__dirname, '../../.env');
dotenv.config({ path: pathToEnv });

const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.TRANSPORTER_AUTH_USER,
    pass: process.env.TRANSPORTER_AUTH_PASS,
  },
});

const sendAnalyticalReport = new Queue('Send analytical report', process.env.REDIS_URL);

const createAnalyticalReport = (params) => {
  sendAnalyticalReport.add(params);
};

sendAnalyticalReport.process(async (job) => {
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

module.exports = createAnalyticalReport;
