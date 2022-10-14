const { AWS_BUCKET_NAME } = process.env; // 30 days by seconds
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

const authenticationAPI = (req, res, next) => {
  if (!req.session.isAuth) {
    return res.status(403).json({ success: false, message: 'unauthenticate' });
  }
  return next();
};

const Lang = require('./language');

const authentication = (req, res, next) => {
  const { locale } = req.query;
  const { isAuth } = req.session;
  // console.log(req.session.isAuth);

  if (!req.session.isAuth) {
    return res.status(403).render('login', {
      locale,
      locale_string: JSON.stringify(locale),
      lang: Lang[locale],
      isAuth,
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
      const newFileName = `${crypto.randomBytes(18).toString('hex').substr(0, 8)}${ext}`;
      const filePath = `images/uploads/${newFileName}`;
      cb(null, filePath.toString());
      req.filename = newFileName;
    },
  }),
  // SET DEFAULT FILE SIZE UPLOAD LIMIT
  limits: { fileSize: 1024 * 1024 * 2 }, // 2MB
  // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
  fileFilter(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    const err = new Error('Please submit image only!');
    err.status = 400;
    return cb(err, false);
  },
});

const checkImageExist = (req, res, next) => {
  if (!Object.keys(req.files).length) {
    const err = new Error('Please choose image before submit');
    err.status = 400;
    throw err;
  }
  next();
};

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
  authenticationAPI,
  checkImageExist,
};
