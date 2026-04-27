const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // vom separa app de server

// ID utilizator de test
const TEST_USER_ID = new mongoose.Types.ObjectId().toString();
let movieId; // salvăm ID-ul filmului creat pentru DELETE

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('GET /api/movies', () => {
    test('returnează lista goală pentru user nou', async () => {
        const res = await request(app)
            .get('/api/movies')
            .set('user-id', TEST_USER_ID);
        
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('POST /api/movies', () => {
    test('adaugă un film valid', async () => {
        const res = await request(app)
            .post('/api/movies')
            .set('user-id', TEST_USER_ID)
            .send({ title: 'Inception' });

        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Inception');
        expect(res.body.userId).toBe(TEST_USER_ID);
        
        movieId = res.body._id; // salvăm pentru testul de DELETE
    });

    test('returnează 409 dacă filmul există deja', async () => {
        const res = await request(app)
            .post('/api/movies')
            .set('user-id', TEST_USER_ID)
            .send({ title: 'Inception' });

        expect(res.status).toBe(409);
    });

    test('returnează 404 pentru titlu inexistent', async () => {
        const res = await request(app)
            .post('/api/movies')
            .set('user-id', TEST_USER_ID)
            .send({ title: 'xyzfilmcarenuexista99999' });

        expect(res.status).toBe(404);
    });

    test('returnează 400 dacă lipsește titlul', async () => {
        const res = await request(app)
            .post('/api/movies')
            .set('user-id', TEST_USER_ID)
            .send({});

        expect(res.status).toBe(400);
    });
});

describe('DELETE /api/movies/:id', () => {
    test('șterge filmul adăugat anterior', async () => {
        const res = await request(app)
            .delete(`/api/movies/${movieId}`)
            .set('user-id', TEST_USER_ID);

        expect(res.status).toBe(204);
    });

    test('returnează 404 pentru film inexistent', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .delete(`/api/movies/${fakeId}`)
            .set('user-id', TEST_USER_ID);

        expect(res.status).toBe(404);
    });
});