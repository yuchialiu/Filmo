const User = require('../server/models/user_model');

const { TOKEN_SECRET, PROTOCOL } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // util from native nodejs library
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const authentication = (req, res, next) => {
  if (!req.session.isAuth) {
    return res.status(400).render('login');
  }
  return next();
};

// const authentication = (role) =>
//   async function (req, res, next) {
//     let accessToken = req.get('Authorization');
//     if (!accessToken) {
//       res.status(401).send({ error: 'Unauthorized' });
//       return;
//     }

//     accessToken = accessToken.replace('Bearer ', '');
//     if (accessToken == 'null') {
//       res.status(401).send({ error: 'Unauthorized' });
//       return;
//     }

//     try {
//       const user = await promisify(jwt.verify)(accessToken, TOKEN_SECRET);
//       req.user = user;
//       if (role == null) {
//         next();
//       } else {
//         let userDetail;
//         if (role == User.USER_ROLE.USER) {
//           userDetail = await User.getUserDetail(user.email);
//         } else {
//           userDetail = await User.getUserDetail(user.email, role);
//         }
//         if (!userDetail) {
//           res.status(403).send({ error: 'Forbidden' });
//         } else {
//           req.user.id = userDetail.id;
//           req.user.role = userDetail.role;
//           next();
//         }
//       }
//       return;
//     } catch (err) {
//       res.status(403).send({ error: 'Forbidden, not existed' });
//     }
// };

// multer setting
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const imagePath = path.join(__dirname, '../public/assets/images/uploads');
      if (!fs.existsSync(imagePath)) {
        fs.mkdirSync(imagePath);
      }
      cb(null, imagePath);
    },
    filename: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      let customFileName = '';
      if (file.fieldname === 'main_image') {
        customFileName = 'main';
      } else {
        customFileName = crypto.randomBytes(18).toString('hex').substr(0, 8);
      }
      const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
      if (mimetype && extname) {
        cb(null, `${customFileName}.${fileExtension}`);
      } else {
        cb(new Error('upload images only'), false);
      }
    },
  }),
});

module.exports = {
  upload,
  authentication,
};
