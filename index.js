const express = require("express");
const dotenv = require("dotenv");
const db = require("../backend/config/database.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize");

const AuthRoute = require("./routes/AuthRoute.js");
const UserRoute = require("./routes/UserRoute.js");
const BiodataRoute = require("./routes/BiodataRoute.js");

dotenv.config();
const app = express();

const sessionStore = SequelizeStore(session.Store)

const store = new sessionStore({
    db: db
})

app.use(cors({ credentials: true, origin: 'http://localhost:3000'}));

app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        secure: 'auto'
    }
}))

app.use(cookieParser());
app.use(express.json());

app.use(AuthRoute);
app.use(UserRoute);
app.use(BiodataRoute);

app.listen(5000, ()=> console.log("Server Sedang berjalan di http://localhost:5000"));