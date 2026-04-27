const Movie = require('../models/Movie');

const moviesRepository = {
    findAllByUser: async (userId) => {
        return await Movie.find({ userId }); //Afisarea filmelor pentru un utilizator
    },
    findByTitleAndUser: async (title, userId) => {
        return await Movie.findOne({ 
            title: { $regex: new RegExp(`^${title}$`, 'i') }, //Afisare filmelor specifice
            userId 
        });
    },
    create: async (movieData) => {
        const newMovie = new Movie(movieData); //adaugare film
        return await newMovie.save();
    },
    delete: async (id, userId) => {
        return await Movie.findOneAndDelete({ _id: id, userId }); //stergere film
    }
};

module.exports = moviesRepository;