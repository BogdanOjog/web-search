const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const usersRepo = require('../repositories/usersRepository');

// Pasul 1: verifică dacă username-ul există deja
router.post('/check', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username obligatoriu.' });

    try {
        const user = await usersRepo.findByUsername(username);
        res.json({ exists: !!user });
    } catch {
        res.status(500).json({ message: 'Eroare server.' });
    }
});

// Pasul 2: login dacă există, register dacă nu există
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username și parola sunt obligatorii.' });
    }

    try {
        let user = await usersRepo.findByUsername(username);

        if (!user) {
            // Cont nou — creează cu parola hashată
            const hash = await bcrypt.hash(password, 10);
            user = await usersRepo.create(username, hash);
            return res.status(201).json({ _id: user._id, username: user.username });
        }

        // Cont existent — verifică parola
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Parolă incorectă.' });
        }

        res.status(200).json({ _id: user._id, username: user.username });
    } catch (error) {
        res.status(500).json({ message: 'Eroare la autentificare.' });
    }
});

module.exports = router;