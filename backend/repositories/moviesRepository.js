const Movie = require('../models/Movie');

const moviesRepository = {
    findAllByUser: async (userId) => {
        return await Movie.find({ userId });
    },
    findByTitleAndUser: async (title, userId) => {
        return await Movie.findOne({ 
            title: { $regex: new RegExp(`^${title}$`, 'i') },
            userId 
        });
    },
    // ✅ adaugă asta
    findByIdAndUser: async (id, userId) => {
        return await Movie.findOne({ _id: id, userId });
    },
    create: async (movieData) => {
        const newMovie = new Movie(movieData);
        return await newMovie.save();
    },
    delete: async (id, userId) => {
        return await Movie.findOneAndDelete({ _id: id, userId });
    }
};

module.exports = moviesRepository;