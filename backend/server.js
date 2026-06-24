const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./src/config/db');
const app = express();
const authRoutes = require('./src/routes/authRoutes');
app.use(cors());
app.use(express.json());
const userRoutes =
    require('./src/routes/userRoutes');

app.use('/api/users', userRoutes);

app.use('/api/auth', authRoutes);
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});