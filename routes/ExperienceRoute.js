const express = require("express");
const {
    getAllExperience,
    getExperience,
    getExperienceById,
    createExperience,
    updateExperience,
    deleteExperience,
} = require("../controllers/ExperienceController.js")
const { verifyUser } = require("../middleware/AuthUser.js")

const router = express.Router()

router.get('/all-experience', getAllExperience)
router.get('/experience', verifyUser, getExperience)
router.get('/experience/:id', verifyUser, getExperienceById)
router.post('/experience', verifyUser, createExperience)
router.patch('/experience/:id', updateExperience)
router.delete('/experience/:id', verifyUser, deleteExperience)

module.exports = router;