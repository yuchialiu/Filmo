require('dotenv').config();
const validator = require('validator');
const User = require('../models/user_model');

const signUp = async (req, res) => {
  const { email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).send({ error: 'Request Error: name, email and password are required.' });
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).send({ error: 'Request Error: Invalid email format' });
    return;
  }

  name = validator.escape(name);

  const result = await User.CreateUser(name, User.USER_ROLE.USER, email, password);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({ error: 'Database Query Error' });
    return;
  }

  res.status(201).send({
    data: {
      access_token: user.access_token,
      access_expired: user.access_expired,
      user: {
        id: user.id,
        name: user.name,
        role: 'user',
        email: user.email,
        picture: user.picture,
      },
    },
  });
};

const signIn = async (email, password) => {
  if (!email || !password) {
    return { error: 'Request Error: email and password are required.', status: 400 };
  }

  try {
    let tokenInfo = validateUser(email, password);
    res.status(201).send({
      response: tokenInfo,
    });
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getUserDetail = async (req, res) => {
  res.status(200).send({
    data: {
      provider: req.user.provider,
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture,
    },
  });
  return;
};

function validateUser(email, password) {
  let user = User.GetUser(email);
  if (!bcrypt.compareSync(password, user.password)) {
    console.log({ email, error: 'Password is wrong' });
    return { error: 'Email or password is wrong' };
  }

  let token = generateJWT(user);
  let result = {};
  result.access_token = token;
  return result;
}

function generateJWT(user) {
  const accessToken = jwt.sign(
    {
      name: user.name,
      id: user.id,
      role: user.name,
      email: user.email,
      picture: user.profile_image,
    },
    TOKEN_SECRET,
    { expiresIn: TOKEN_EXPIRE }
  );

  return accessToken;
}

module.exports = { signUp, signIn, getUserDetail };
