const express = require("express");
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const path = require('path');
const fs = require('fs');
const db = require("../backend/config/database.js");
const cookieParser = require("cookie-parser");
const FileUpload = require("express-fileupload");
const cors = require("cors");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize");

const AuthRoute = require("./routes/AuthRoute.js");
const UserRoute = require("./routes/UserRoute.js");
const BiodataRoute = require("./routes/BiodataRoute.js");
const ProjectRoute = require("./routes/ProjectRoute.js");
const CertificateRoute = require("./routes/CertificateRoute.js");
const SkillRoute = require("./routes/SkillRoute.js");
const ExperienceRoute = require("./routes/ExperienceRoute.js");
const EducationRoute = require("./routes/EducationRoute.js");
const OrganizationsRoute = require("./routes/OrganizationsRoute.js");

dotenv.config();
const app = express();

const sessionStore = SequelizeStore(session.Store)

const store = new sessionStore({
    db: db
})

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173'
];

// SINGLE CORS Configuration - NO manual middleware
app.use(cors({
    origin: function (origin, callback) {
        console.log('CORS Check - Origin:', origin);

        // Allow requests with no origin (mobile apps, curl, postman, etc.)
        if (!origin) {
            console.log('CORS Allowed: No origin (direct access)');
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            console.log('CORS Allowed:', origin);
            callback(null, true);
        } else {
            console.log('CORS Rejected:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));

// Session Configuration
app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}))

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(FileUpload());

// Static Files - Let main CORS handle it
app.use(express.static("public"));

// Images - Let main CORS handle it
app.use("/images", express.static("./public/images"));

app.use(AuthRoute);
app.use(UserRoute);
app.use(BiodataRoute);
app.use(ProjectRoute);
app.use(CertificateRoute);
app.use(SkillRoute);
app.use(ExperienceRoute);
app.use(EducationRoute);
app.use(OrganizationsRoute);

// Error handling untuk CORS
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({
            error: 'CORS policy violation',
            message: 'Origin not allowed',
            origin: req.headers.origin
        });
    } else {
        console.error('Server error:', err);
        res.status(500).json({
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
        });
    }
});

app.listen(process.env.APP_PORT, ()=> console.log(`Server running on port ${process.env.APP_PORT}`));