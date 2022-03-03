const dotenv = require('dotenv');
const path = require('path');

const pathToEnv = path.resolve(__dirname, '../../.env');

dotenv.config({ path: pathToEnv });

const allowedFileFormat = ['jpj', 'png'];
const isAllowedFormat = (filename) => {
  const extension = filename.split('.').pop();
  return allowedFileFormat.includes(extension);
};

module.exports = { isAllowedFormat };
