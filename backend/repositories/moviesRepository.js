const db = require('../database/init');

const moviesRepository = {

    findAll: () => {
        const query = db.prepare('SELECT * FROM movies');
        return query.all();
    },

    findById: (id) => {
        const query = db.prepare('SELECT * FROM movies WHERE id = ?');
        return query.get(id);
    },

    findByTitle: (title) => {
        const query = db.prepare('Select * FROM movies WHERE title = ?');
        return query.get(title);
    },

    create: (movieData) => {
        const query = db.prepare('INSERT INTO movies (title, year, genre, poster, rating, rated, runtime, director, actors, plot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        const info = query.run(
        movieData.title, movieData.year, movieData.genre, movieData.poster, movieData.rating,
        movieData.rated, movieData.runtime, movieData.director, movieData.actors, movieData.plot
        );
        return {id: info.lastInsertRowid, ...movieData };
    },

    update: (id, movieData) => {
        const query = db.prepare('UPDATE movies SET title = ?, year = ?, genre = ?, poster = ?, rating = ? WHERE id = ?');
        query.run(movieData.title, movieData.year, movieData.genre, movieData.poster, movieData.rating, id);

        return {id, ...movieData};
    },

    delete: (id) => {
        const query = db.prepare('DELETE FROM movies WHERE id = ?');
        query.run(id);
    }
};

module.exports = moviesRepository;