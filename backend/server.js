const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./src/config/db');
const app = express();
const authRoutes = require('./src/routes/authRoutes');
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('DevPulse API Running');
});
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'DevPulse Backend Running'
    });
});
app.use('/api/auth', authRoutes);
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});