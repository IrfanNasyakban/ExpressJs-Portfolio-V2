const express = require("express");
const {
    getAllEducation,
    getEducation,
    getEducationById,
    createEducation,
    updateEducation,
    deleteEducation,
} = require("../controllers/EducationController.js") 
const { verifyUser } = require("../middleware/AuthUser.js") 

const router = express.Router()

router.get('/all-education', getAllEducation)
router.get('/education', verifyUser, getEducation)
router.get('/education/:id', verifyUser, getEducationById)
router.post('/education', verifyUser, createEducation)
router.patch('/education/:id', updateEducation)
router.delete('/education/:id', verifyUser, deleteEducation)

module.exports = router;