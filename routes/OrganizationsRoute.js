const express = require("express");
const {
    getOrganizations,
    getOrganizationsById,
    createOrganizations,
    updateOrganizations,
    deleteOrganizations,
} = require("../controllers/OrganizationsController.js") 
const { verifyUser } = require("../middleware/AuthUser.js") 

const router = express.Router()

router.get('/organizations', verifyUser, getOrganizations)
router.get('/organizations/:id', verifyUser, getOrganizationsById)
router.post('/organizations', verifyUser, createOrganizations)
router.patch('/organizations/:id', updateOrganizations)
router.delete('/organizations/:id', verifyUser, deleteOrganizations)

module.exports = router;