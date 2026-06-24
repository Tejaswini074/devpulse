const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./src/config/db');
const app = express();

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

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});