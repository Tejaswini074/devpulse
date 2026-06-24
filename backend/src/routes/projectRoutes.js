const express = require('express');
const router = express.Router();

const authMiddleware =
    require('../middleware/authMiddleware');

const { createProject } = require('../controllers/projectController');

router.post('/', authMiddleware, createProject);

module.exports = router;