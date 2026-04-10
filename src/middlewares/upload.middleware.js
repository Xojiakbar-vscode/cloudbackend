const multer = require('multer');
const multerS3 = require('multer-s3');
const s3Client = require('../config/s3');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const userId = req.user.id;
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `cloud/${userId}/${timestamp}-${random}${ext}`);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/vnd.rar',
      'application/octet-stream',
    ];

    if (
      allowedMimes.includes(file.mimetype) || 
      file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('video/') || 
      file.mimetype.startsWith('audio/')
    ) {
      cb(null, true);
    } else {
      cb(new Error("Noto'g'ri fayl formati. Tizim ruxsat bermaydi."), false);
    }
  },
});

module.exports = upload;