const express = require('express');
const router = express.Router();
const moviesRepo = require('../repositories/moviesRepository');

const movieCache = {};
const CACHE_TTL = 3600000;

router.get('/', (req, res) => {
    const movies = moviesRepo.findAll();
    res.status(200).json(movies);
});

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const movie = moviesRepo.findById(id);

    if (!movie) {
        return res.status(404).json({message: 'Filmul nu a fost gasit.'});
    }
    res.status(200).json(movie);
});

router.post('/', async (req, res) => {
    const {title} = req.body; 

    if (!title) {
        return res.status(400).json({ message: 'Numele filmului este obligatoriu!'});
    }

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

        if (omdbData.Response === "Flase") {
            return res.status(404).json({message: 'Nu am putut gasi acest film pe internet'});
        }

        movieCache[cacheKey] = {
            data: omdbData,
            timestamp: Date.now()
        };
        console.log(`Răspuns OMDb pentru "${title}":`, omdbData);
        }
        const movieTitle = omdbData.Title; 
        const existingMovie = moviesRepo.findByTitle(movieTitle);
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

        const newMovie = moviesRepo.create({ title: movieTitle, year, genre, poster, rating, rated, runtime, director, actors, plot });    
        res.status(201).json(newMovie);
    } catch (error) {
        console.error("Eroare la comunicarea cu OMDb:", error);
        res.status(500).json({ message: 'Eroare la salvarea filmului.' });
    }
});

router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { title, year, genre } = req.body;

    const existingMovie = moviesRepo.findById(id);
    if (!existingMovie) {
        return res.status(404).json({ message: 'Filmul nu a fost gasit pentru a fi actualizat.'});
    }

    const updateMovie = moviesRepo.update(id, { title, year, genre });
    res.status(200).json(updateMovie);
});

router.delete('/:id', (req, res) => {
    // 1. Ne asigurăm că transformăm ID-ul în număr
    const id = parseInt(req.params.id); 

    // 2. Căutăm filmul
    const existingMovie = moviesRepo.findById(id);

    // 3. Verificăm dacă există
    if (!existingMovie) {
        return res.status(404).json({message: 'Filmul nu a fost gasit.'});
    }

    // 4. Îl ștergem
    moviesRepo.delete(id);
    res.status(204).end();
});

module.exports = router;