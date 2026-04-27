const express = require('express');
const router = express.Router();
const moviesRepo = require('../repositories/moviesRepository');

const movieCache = {};
const CACHE_TTL = 3600000;

router.get('/', async (req, res) => {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(400).json({ message: 'ID utilizator lipsă.' });

    try {
        const movies = await moviesRepo.findAllByUser(userId);
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Eroare la aducerea filmelor.' });
    }
});

router.get('/:id', async (req, res) => {
    const userId = req.headers['user-id'];
    const id = req.params.id;

    if (!userId) return res.status(400).json({ message: 'ID utilizator lipsă.' });

    try {
        const movie = await moviesRepo.findByIdAndUser(id, userId);

        if (!movie) {
            return res.status(404).json({ message: 'Filmul nu a fost gasit.' });
        }
        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ message: 'Eroare la aducerea filmului.' });
    }
});

router.post('/', async (req, res) => {
    const userId = req.headers['user-id'];
    const { title } = req.body; 

    if (!userId) return res.status(400).json({ message: 'ID utilizator lipsă.' });
    if (!title) return res.status(400).json({ message: 'Numele filmului este obligatoriu!'});

    try {
        const cacheKey = title.toLowerCase().trim();
        let omdbData;

        if(movieCache[cacheKey] && (Date.now() - movieCache[cacheKey].timestamp < CACHE_TTL)) {
            console.log(`SUCCES CACHE: Se folosesc datele din memorie pentru "${title}"`);
            omdbData = movieCache[cacheKey].data;
        } else {
            console.log(`LIPSA CACHE: Se cauta pe internet pentru "${title}"...`);
            const omdbKey = process.env.OMDB_API_KEY;        
            const safeTitle = encodeURIComponent(title); 
            const omdbResponse = await fetch(`http://www.omdbapi.com/?t=${safeTitle}&apikey=${omdbKey}`);
            omdbData = await omdbResponse.json();

            // Corectat din "Flase" in "False"
            if (omdbData.Response === "False") {
                return res.status(404).json({ message: 'Nu am putut gasi acest film pe internet' });
            }

            movieCache[cacheKey] = {
                data: omdbData,
                timestamp: Date.now()
            };
            console.log(`Răspuns OMDb pentru "${title}":`, omdbData);
        }

        const movieTitle = omdbData.Title; 
        const existingMovie = await moviesRepo.findByTitleAndUser(movieTitle, userId);
        
        if (existingMovie) {
            console.log(`Filmul "${movieTitle}" exista deja in baza de date. Oprire salvare`);
            return res.status(409).json({ message: 'Acest film exista deja in colectie!'});
        }

        const year = omdbData.Year !== 'N/A' ? omdbData.Year : 'Necunoscut';
        const genre = omdbData.Genre !== 'N/A' ? omdbData.Genre : 'Necunoscut';
        const poster = omdbData.Poster !== 'N/A' ? omdbData.Poster : 'https://placehold.co/250x350/png?text=Fara+Poster';
        const rating = omdbData.imdbRating !== 'N/A' ? omdbData.imdbRating : '-';
        const runtime = omdbData.Runtime !== 'N/A' ? omdbData.Runtime : 'Necunoscut';
        const director = omdbData.Director !== 'N/A' ? omdbData.Director : 'Necunoscut';
        const actors = omdbData.Actors !== 'N/A' ? omdbData.Actors : 'Necunoscut';
        const plot = omdbData.Plot !== 'N/A' ? omdbData.Plot : 'Fără descriere disponibilă.';
        const rated = omdbData.Rated !== 'N/A' ? omdbData.Rated : 'Necunoscut';

        const newMovie = await moviesRepo.create({ 
            userId, 
            title: movieTitle, 
            year, 
            genre, 
            poster, 
            rating, 
            rated, 
            runtime, 
            director, 
            actors, 
            plot 
        });    
        res.status(201).json(newMovie);

    } catch (error) {
        console.error("Eroare la comunicarea cu OMDb:", error);
        res.status(500).json({ message: 'Eroare la salvarea filmului.' });
    }
});

router.put('/:id', async (req, res) => {
    const userId = req.headers['user-id'];
    const id = req.params.id;
    const { title, year, genre } = req.body;

    if (!userId) return res.status(400).json({ message: 'ID utilizator lipsă.' });

    try {
        const existingMovie = await moviesRepo.findByIdAndUser(id, userId);
        if (!existingMovie) {
            return res.status(404).json({ message: 'Filmul nu a fost gasit pentru a fi actualizat.'});
        }

        const updateMovie = await moviesRepo.update(id, userId, { title, year, genre });
        res.status(200).json(updateMovie);
    } catch (error) {
        res.status(500).json({ message: 'Eroare la actualizarea filmului.'});
    }
});

router.delete('/:id', async (req, res) => {
    const userId = req.headers['user-id'];
    const id = req.params.id; 

    if (!userId) return res.status(400).json({ message: 'ID utilizator lipsă.' });

    try {
        const existingMovie = await moviesRepo.findByIdAndUser(id, userId);

        if (!existingMovie) {
            return res.status(404).json({message: 'Filmul nu a fost gasit.'});
        }

        await moviesRepo.delete(id, userId);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: 'Eroare la ștergerea filmului.' });
    }
});

module.exports = router;