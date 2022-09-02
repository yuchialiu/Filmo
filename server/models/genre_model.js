const { pool } = require('./mysqlcon');

const insertGenreEn = async (genres, locale) => {
  try {
    // let arr = [];
    for (let i in genres) {
      let sql = 'INSERT INTO genre (ref_id) VALUES ';
      sql += '(?), ';
      sql = sql.slice(0, -2);
      let result = await pool.execute(sql, [genres[i].id]);
      let ref_id = result[0].insertId;

      let sqlLocale = 'INSERT INTO genre_translation (genre_id, locale, title) VALUES ';
      sqlLocale += '(?, ?, ?), ';
      sqlLocale = sqlLocale.slice(0, -2);
      await pool.execute(sqlLocale, [ref_id, locale, genres[i].name]);
    }
  } catch (err) {
    console.log(err);
    return 'failed';
  }
};

const insertGenreZh = async (genres, locale) => {
  try {
    const query = await pool.execute('SELECT * FROM genre');
    let data = query[0];
    console.log('data', data);
    for (let i in genres) {
      for (let j in data) {
        if (genres[i].id == data[j].ref_id) {
          let sqlLocale = 'INSERT INTO genre_translation (genre_id, locale, title) VALUES ';
          sqlLocale += '(?, ?, ?), ';
          sqlLocale = sqlLocale.slice(0, -2);
          await pool.execute(sqlLocale, [data[j].id, locale, genres[i].name]);
        }
      }
    }
  } catch (err) {
    console.log(err);
    return 'failed';
  }
};

const insertGenreFr = async (genres, locale) => {
  try {
    const query = await pool.execute('SELECT * FROM genre');
    let data = query[0];

    for (let i in genres) {
      for (let j in data) {
        if (genres[i].id == data[j].ref_id) {
          let sqlLocale = 'INSERT INTO genre_translation (genre_id, locale, title) VALUES ';
          sqlLocale += '(?, ?, ?), ';
          sqlLocale = sqlLocale.slice(0, -2);
          await pool.execute(sqlLocale, [data[j].id, locale, genres[i].name]);
        }
      }
    }
  } catch (err) {
    console.log(err);
    return 'failed';
  }
};

module.exports = {
  insertGenreEn,
  insertGenreZh,
  insertGenreFr,
};
