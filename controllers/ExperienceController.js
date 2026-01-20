const Experience = require("../models/ExperienceModel.js");
const Users = require("../models/UserModel.js");

const getExperience = async (req, res) => {
    try {
        if (req.role === "admin") {
            const response = await Experience.findAll({
                include: [{
                    model: Users,
                    attributes: ['username', 'email', 'role']
                }],
            });
            res.status(200).json(response);
        } else {
            res.status(422).json(msg="Akses hanya untuk admin");
        }
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

const getExperienceById = async (req, res) => {
    try {
        let response;
        if (req.role === "admin") {
            response = await Experience.findOne({
                attributes: ['id', 'namaPerusahaan', 'divisi', 'alamat', 'status', 'periode', 'jobdesk'],
                where: {
                    id: req.params.id
                },
                include: [{
                    model: Users,
                    attributes: ['username', 'email']
                }]
            })
        } else {
            res.status(422).json(msg="Akses hanya untuk admin");
        }
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
};

const createExperience = async (req, res) => {
    const namaPerusahaan = req.body.namaPerusahaan;
    const divisi = req.body.divisi;
    const alamat = req.body.alamat;
    const status = req.body.status;
    const periode = req.body.periode;
    const jobdesk = req.body.jobdesk;

    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ error: "User ID not found in the request" });
        }

        await Experience.create({
            namaPerusahaan: namaPerusahaan,
            divisi: divisi,
            alamat: alamat,
            status: status,
            periode: periode,
            jobdesk: jobdesk,
            userId: req.userId
        });

        res.json({ msg: "Experience Created" });
    } catch (error) {
        console.log(error);
    }
};

const updateExperience = async (req, res) => {
    try {
        await Experience.update(req.body, {
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({ msg: "Experience Updated" })
    } catch (error) {
        console.log(error.message);
    }
};

const deleteExperience = async (req, res) => {
    try {
        await Experience.destroy({
            where: {
                id: req.params.id,
            },
        });
        res.status(200).json({ msg: "Experience Deleted" });
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
  getExperience,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
};