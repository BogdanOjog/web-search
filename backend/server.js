require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectat cu succes la MongoDB Atlas'))
    .catch(err => console.error('Eroare de conectare MongoDB:', err));

app.listen(PORT, () => {
    console.log(`Serverul rulează pe http://localhost:${PORT}`);
});