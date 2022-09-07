const User = require('../server/models/user_model');
const { TOKEN_SECRET, PROTOCOL } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');

const authentication = (roleId) => {
  return async function (req, res, next) {
    let accessToken = req.get('Authorization');
    if (!accessToken) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    accessToken = accessToken.replace('Bearer ', '');
    if (accessToken == 'null') {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    try {
      const user = await promisify(jwt.verify)(accessToken, TOKEN_SECRET);
      req.user = user;
      if (roleId == null) {
        next();
      } else {
        let userDetail;
        if (roleId == User.USER_ROLE.ALL) {
          userDetail = await User.getUserDetail(user.email);
        } else {
          userDetail = await User.getUserDetail(user.email, roleId);
        }
        if (!userDetail) {
          res.status(403).send({ error: 'Forbidden' });
        } else {
          req.user.id = userDetail.id;
          req.user.role_id = userDetail.role_id;
          next();
        }
      }
      return;
    } catch (err) {
      res.status(403).send({ error: 'Forbidden' });
      return;
    }
  };
};

module.exports = {
  authentication,
};
