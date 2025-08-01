require('dotenv').config();
const path = require('node:path');
const express = require('express');
const userRouter = require('./routes/userRouter');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('./config/passport');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(passport.session());

app.use((req, res, next) => {
    console.log('--- Session Info ---');
    console.log(req.session);
    console.log('--- User Info ---');
    console.log(req.user);
    next();
});

app.use('/', userRouter);

const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}...`));