const express = require("express");
const {Login, logOut, Me} = require("../controllers/Auth.js")
const { verifyUser } = require("../middleware/AuthUser.js");

const router = express.Router()

router.post('/login', Login);
router.get('/me', Me); // Protected route
router.delete('/logout', verifyUser, logOut);

module.exports = router