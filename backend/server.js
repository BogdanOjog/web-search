require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));

app.use(express.json());

// Conectare MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectat cu succes la MongoDB Atlas'))
    .catch(err => console.error('Eroare de conectare MongoDB:', err));

app.use('/api/users', usersRouter);
app.use('/api/movies', moviesRouter);

app.listen(PORT, () => {
    console.log(`Serverul rulează pe http://localhost:${PORT}`);
});