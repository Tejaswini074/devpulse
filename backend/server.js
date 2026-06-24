const express = require('express');
const cors = require('cors');

require('dotenv').config();
require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const projectRoutes = require('./src/routes/projectRoutes');

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());


/* Routes */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

/* Server */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});