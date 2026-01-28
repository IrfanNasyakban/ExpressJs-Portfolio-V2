const express = require("express");
const {
    getRes,
    getAllBiodata,
    getBiodata,
    getBiodataById,
    createBiodata,
    updateBiodata,
    deleteBiodata,
} = require("../controllers/BiodataController.js") 
const { verifyUser } = require("../middleware/AuthUser.js") 

const router = express.Router()

router.get('/', getRes)
router.get('/all-biodata', getAllBiodata)
router.get('/biodata', verifyUser, getBiodata)
router.get('/biodata/:id', verifyUser, getBiodataById)
router.post('/biodata', verifyUser, createBiodata)
router.patch('/biodata/:id', updateBiodata)
router.delete('/biodata/:id', verifyUser, deleteBiodata)

module.exports = router;