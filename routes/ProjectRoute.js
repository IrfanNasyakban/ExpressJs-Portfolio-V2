const express = require("express");
const {
    getAllProject,
    getProject,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
} = require("../controllers/ProjectController.js")
const { verifyUser } = require("../middleware/AuthUser.js")

const router = express.Router()

router.get('/all-project', getAllProject)
router.get('/project', verifyUser, getProject)
router.get('/project/:id', verifyUser, getProjectById)
router.post('/project', verifyUser, createProject)
router.patch('/project/:id', updateProject)
router.delete('/project/:id', verifyUser, deleteProject)

module.exports = router;