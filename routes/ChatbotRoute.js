const express = require("express");
const {
    chatWithAI,
    getPortfolioContext
} = require("../controllers/ChatbotController.js") 

const router = express.Router()

router.post('/chat', chatWithAI);
router.get('/portfolio-context', getPortfolioContext);

module.exports = router;