const bcrypt = require('bcryptjs');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
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

    db.query(sql, [name, email, hashedPassword, role || 'Developer'], (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.status(201).json({
        message: 'User Registered'
      });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.login = (req, res) => {

  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';

  db.query(sql, [email], async (err, results) => {

    if (err) {
      return res.status(500).json(err);
    }

    if (results.length === 0) {
      return res.status(400).json({
        message: 'Invalid Email'
      });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid Password'
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },

      process.env.JWT_SECRET, { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login Successful', token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  }
  );
};