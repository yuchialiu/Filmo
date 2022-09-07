require('dotenv').config();
const { pool } = require('./mysqlcon');
const bcrypt = require('bcrypt');
const salt = parseInt(process.env.BCRYPT_SALT);
const { TOKEN_EXPIRE, TOKEN_SECRET } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');

const USER_ROLE = {
  SUPER: 0,
  ADMIN: 1,
  USER: 2,
};

const CreateUser = async (name, roleId, email, password) => {
  const poolCon = await pool.getConnection();
  try {
    await poolCon.query('START TRANSACTION');
    const user = {
      name: name,
      role_id: roleId,
      email: email.toLowerCase(),
      password: bcrypt.hashSync(password, salt),
      picture: null,
      access_expired: TOKEN_EXPIRE,
    };

    const accessToken = jwt.sign(
      {
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
      TOKEN_SECRET
    );
    user.access_token = accessToken;

    const sql = 'INSERT INTO user (username, email, password, profile_image, role) VALUES (?, ?, ?, ?, ?)';
    const [result] = await conn.query(sql, user);
    user.id = result.insertId;

    await poolCon.query('COMMIT');

    return { user };
  } catch (err) {
    await poolCon.query('ROLLBACK');
    console.log(err);
    return {
      error: 'Email Already Exists',
      status: 403,
    };
  } finally {
    await poolCon.release();
  }
};

const GetUser = async (email) => {
  const poolCon = await pool.getConnection();
  try {
    const [users] = await pool.execute('SELECT * FROM user WHERE email = ?', [email]);
    if (!users[0]) {
      return { error: 'email has not registered' };
    }
    const user = users[0];
    return { user };
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getUserDetail = async (email, roleId) => {
  try {
    if (roleId) {
      const [users] = await pool.execute('SELECT * FROM user WHERE email = ? AND role_id = ?', [email, roleId]);
      return users[0];
    } else {
      const [users] = await pool.execute('SELECT * FROM user WHERE email = ?', [email]);
      return users[0];
    }
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = { USER_ROLE, CreateUser, GetUser, getUserDetail };
