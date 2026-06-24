const db = require('../config/db');

exports.createProject = (req, res) => {

    const { project_name, description, start_date, end_date } = req.body;

    const created_by = req.user.id;

    const sql = `
        INSERT INTO projects
    ( project_name, description,start_date, end_date, created_by)
    VALUES (?,?,?,?,?)
  `;

    db.query(sql, [project_name, description, start_date, end_date, created_by], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }
        res.status(201).json({
            message: 'Project Created'
        });

    }
    );

};