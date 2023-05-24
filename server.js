const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const knex = require('knex')({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        port: 5432,
        user: 'postgres',
        password: 'yX)cYb=B46<^8Cy`',
        database: 'bfrb'
    }
});

const saltRounds = 10;
const clarifai = {
    USER_ID: 'clarifai',
    PAT: '099d95e9d8b548c3ae3fff888c73ffe3',
    APP_ID: 'main',
    MODEL_ID: 'face-detection'
};

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.json('server is working'));
app.post('/register/crypt/:code', register.missingCode(knex));
app.post('/register/code', register.generateCode(knex));
app.post('/register', register.handleRegister(knex, bcrypt, saltRounds));
app.post('/signin', signin.handleSignIn(knex, bcrypt));
app.post('/profile/', profile.handleProfile(knex));
app.put('/image', image.handleImage(knex, clarifai));

app.listen(3000, () => console.log('app is running, port: 3000'));