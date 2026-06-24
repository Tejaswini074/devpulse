const db = require('../config/db');

exports.getUsers = (req, res) => {

  const sql = `
    SELECT
      id,
      name,
      email,
      role,
      status,
      created_at
    FROM users
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.status(200).json(results);

  });

};