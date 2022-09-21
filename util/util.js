const User = require('../server/models/user_model');

const { TOKEN_SECRET, PROTOCOL, AWS_BUCKET_NAME } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // util from native nodejs library
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// multer S3
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const { getDefaultRoleAssumerWithWebIdentity } = require('@aws-sdk/client-sts');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');

const provider = defaultProvider({
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
});
const s3 = new S3Client({ credentialDefaultProvider: provider, region: 'us-west-2' });

const authentication = (req, res, next) => {
  const { locale } = req.query;

  if (!req.session.isAuth) {
    return res.status(400).render('login', {
      locale,
      locale_string: JSON.stringify(locale),
    });
  }
  return next();
};

const upload = multer({
  storage: multerS3({
    s3,
    bucket: AWS_BUCKET_NAME,
    metadata(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
      const ext = path.extname(file.originalname);
      const newFileName = `uploads/${crypto.randomBytes(18).toString('hex').substr(0, 8)}${ext}`;
      cb(null, newFileName.toString());
    },
  }),
});

// // multer setting
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       const imagePath = path.join(__dirname, '../public/assets/images/uploads');
//       if (!fs.existsSync(imagePath)) {
//         fs.mkdirSync(imagePath);
//       }
//       cb(null, imagePath);
//     },
//     filename: (req, file, cb) => {
//       const filetypes = /jpeg|jpg|png|gif/;
//       const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//       const mimetype = filetypes.test(file.mimetype);
//       let customFileName = '';
//       if (file.fieldname === 'main_image') {
//         customFileName = 'main';
//       } else {
//         customFileName = crypto.randomBytes(18).toString('hex').substr(0, 8);
//       }
//       const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
//       if (mimetype && extname) {
//         cb(null, `${customFileName}.${fileExtension}`);
//       } else {
//         cb(new Error('upload images only'), false);
//       }
//     },
//   }),
// });

module.exports = {
  upload,
  authentication,
};
