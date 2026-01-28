const express = require("express");
const {
    getAllSkill,
    getSkill,
    getSkillById,
    createSkill,
    updateSkill,
    deleteSkill,
} = require("../controllers/SkillController.js")
const { verifyUser } = require("../middleware/AuthUser.js")

const router = express.Router()

router.get('/all-skill', getAllSkill)
router.get('/skill', verifyUser, getSkill)
router.get('/skill/:id', verifyUser, getSkillById)
router.post('/skill', verifyUser, createSkill)
router.patch('/skill/:id', updateSkill)
router.delete('/skill/:id', verifyUser, deleteSkill)

module.exports = router;