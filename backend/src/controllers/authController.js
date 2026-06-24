const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.register = async (req, res) => {
  try {

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'All fields required'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (name,email,password,role) VALUES (?,?,?,?) `;

    db.query(
      sql,
      [name, email, hashedPassword, role || 'Developer'
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        res.status(201).json({
          message: 'User Registered'
        });

      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.login = async (req, res) => {
  res.status(200).json({
    message: 'Login API coming soon'
  });
};