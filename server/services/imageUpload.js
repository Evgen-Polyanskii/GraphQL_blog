const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const path = require('path');
const shortId = require('shortid');
const sharp = require('sharp');

const pathToEnv = path.resolve(__dirname, '../../.env');

dotenv.config({ path: pathToEnv });

const id = process.env.AWS_ACCESS_KEY_ID;
const secret = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;
const BUCKET_NAME = 'volt-blog';
const imageWidth = 300;
const imageHeight = 300;

const s3 = new AWS.S3({
  region,
  accessKeyId: id,
  secretAccessKey: secret,
});

const getFileData = (stream) => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

const convertImage = async (image) => sharp(image)
  .resize(imageWidth, imageHeight, {
    position: 'top',
  }).toBuffer();

const upload = (filename, fileContent) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: fileContent,
  };
  s3.upload(params, (err, data) => {
    if (err) {
      return {
        success: false,
        message: err.message,
      };
    }
    return {
      success: true,
      message: 'File uploaded.',
      location: data.Location,
    };
  });
};

const storeUpload = async (createReadStream, filename) => {
  const stream = createReadStream();
  const storedFileName = `${shortId.generate()}-${filename}`;
  const fileData = await getFileData(stream);
  const convertedImage = await convertImage(fileData);
  return upload(storedFileName, convertedImage);
};

module.exports = storeUpload;
