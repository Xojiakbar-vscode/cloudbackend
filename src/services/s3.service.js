const { GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/s3');
const dotenv = require('dotenv');

dotenv.config();

const getSignedFileUrl = async (key, expiresIn = 86400) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    throw new Error('Failed to generate signed URL');
  }
};

const deleteFileFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    throw new Error('Failed to delete file from S3');
  }
};

const getFileStream = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    return await s3Client.send(command);
  } catch (error) {
    console.error('S3 GetObject Error:', error);
    throw new Error(`Failed to get file stream from S3: ${error.message}`);
  }
};

module.exports = { getSignedFileUrl, deleteFileFromS3, getFileStream };