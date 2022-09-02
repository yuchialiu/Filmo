const { pool } = require('./mysqlcon');

let locale;

const insertCertification = async (certifications) => {
  try {
    // locale = 'en-US';
    let english = certifications.US;

    for (let i in english) {
      let sql = 'INSERT INTO certification (ref_id) VALUES ';
      sql += '(?), ';
      sql = sql.slice(0, -2);
      let result = await pool.execute(sql, [english[i].order]);
      let ref_id = result[0].insertId;

      let sqlLocale = 'INSERT INTO certification_translation (certification_id, locale, title, meaning) VALUES ';
      sqlLocale += '(?, ?, ?, ?), ';
      sqlLocale = sqlLocale.slice(0, -2);
      await pool.execute(sqlLocale, [ref_id, 'en-US', english[i].certification, english[i].meaning]);
    }

    // locale = 'fr-FR';
    let french = certifications.FR;

    for (let j in french) {
      let sqlLocale = 'INSERT INTO certification_translation (certification_id, locale, title, meaning) VALUES ';
      sqlLocale += '(?, ?, ?, ?), ';
      sqlLocale = sqlLocale.slice(0, -2);
      await pool.execute(sqlLocale, [french[j].order, 'fr-FR', french[j].certification, french[j].meaning]);
    }
  } catch (err) {
    console.log(err);
    return 'failed';
  }
};

module.exports = { insertCertification };
