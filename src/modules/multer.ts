const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');
const multerS3 = require('multer-s3-transform');
const aws = require('aws-sdk');

require('dotenv').config();

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET } = process.env;

aws.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: S3_BUCKET,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    shouldTransform: true,
    transforms: [
      {
        id: 'resized',
        // @ts-ignore
        key: (req, file, cb) => {
          const ext = file.originalname.split('.').pop();

          if (!['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(ext)) {
            return cb(new Error('이미지 파일 확장자만 업로드 가능'));
          }

          return cb(null, `${Date.now()}.${ext}`);
        },
        // @ts-ignore
        transform: (req, file, cb) => {
          cb(null, sharp().resize({ width: 300 }));
        },
      },
    ],
  }),
});

const deleteImg = async (filename: string) => {
  try {
    await s3.deleteObject({ Bucket: S3_BUCKET, Key: filename }).promise();
    return { success: true, message: '이미지 삭제 성공' };
  } catch (error) {
    return { success: false, message: '이미지 삭제 실패', error };
  }
};

const download = async (filename: string) => {
  const { Body } = await s3
    .getObject({
      Key: filename,
      Bucket: S3_BUCKET,
    })
    .promise();

  fs.writeFileSync(`./${filename}`, Body);
};

export { upload, deleteImg, download };
