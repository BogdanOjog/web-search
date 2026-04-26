require('dotenv').config();

const config = {
    server: {
        port: parseInt(process.env.PORT) || 3000,
        env: process.env.NODE_ENV || 'development',
        isDevelopment: process.env.NODE_ENV !== 'production',
    },
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
    },
};

module.exports = config;