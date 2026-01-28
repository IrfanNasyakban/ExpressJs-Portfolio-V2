const express = require("express");
const {
    getAllCertificate,
    getCertificate,
    getCertificateById,
    createCertificate,
    updateCertificate,
    deleteCertificate,
} = require("../controllers/CertificateController.js") 
const { verifyUser } = require("../middleware/AuthUser.js") 

const router = express.Router()

router.get('/all-certificate', getAllCertificate)
router.get('/certificate', verifyUser, getCertificate)
router.get('/certificate/:id', verifyUser, getCertificateById)
router.post('/certificate', verifyUser, createCertificate)
router.patch('/certificate/:id', updateCertificate)
router.delete('/certificate/:id', verifyUser, deleteCertificate)

module.exports = router;