const User = require('../models/User');

const usersRepository = {
    findByUsername: async (username) => {
        return await User.findOne({ username: username.toLowerCase() });
    },
    create: async (username, hashedPassword) => {
        const newUser = new User({ 
            username: username.toLowerCase(), 
            password: hashedPassword 
        });
        return await newUser.save();
    }
};

module.exports = usersRepository;