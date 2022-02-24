const dotenv = require('dotenv');
const path = require('path');

const pathToEnv = path.resolve(__dirname, '../../.env');

dotenv.config({ path: pathToEnv });

const dateLocales = 'ru-RU' || process.env.DATE_LOCALES;

const getDate = (time) => time.toLocaleString(dateLocales);

module.exports = { getDate };
