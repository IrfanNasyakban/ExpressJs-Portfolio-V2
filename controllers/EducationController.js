const Education = require("../models/EducationModel.js");
const Users = require("../models/UserModel.js");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

const getAllEducation = async (req, res) => {
    try {
        const response = await Education.findAll({
            include: [{
                model: Users,
                attributes: ['username', 'email', 'role']
            }],
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

const getEducation = async (req, res) => {
    try {
        if (req.role === "admin") {
            const response = await Education.findAll({
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

const getEducationById = async (req, res) => {
    try {
        let response;
        if (req.role === "admin") {
            response = await Education.findOne({
                attributes: ['id', 'instansi', 'bagian', 'periode', 'image', 'url'],
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

const createEducation = async (req, res) => {
    if (req.files === null) return res.status(400).json({ msg: "No File Uploaded" })
    const instansi = req.body.instansi
    const bagian = req.body.bagian
    const periode = req.body.periode
    const file = req.files.file
    const fileSize = file.data.length
    const ext = path.extname(file.name)
    const now = Date.now();
    const fileName = now + file.md5 + ext
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`
    const allowedType = ['.png', '.jpg', '.jpeg']

    if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ msg: "Invalid Image" })

    if (fileSize > 5000000) return res.status(422).json({ msg: "Image must be less than 5 MB" })

    file.mv(`./public/images/${fileName}`, async (err) => {
        if (err) return res.status(500).json({ msg: err.message })
        try {
            const education = await Education.create({
                instansi: instansi,
                bagian: bagian,
                periode: periode,
                image: fileName,
                url: url,
                userId: req.userId
            });
            res.status(201).json({
                id: education.id,
                msg: "Image berhasil di tambahkan"
            })
        } catch (error) {
            console.log(error.message);
        }
    })
}

const updateEducation = async (req, res) => {
    const education = await Education.findOne({
        where: {
            id: req.params.id,
        },
    });
    if (!education) return res.status(404).json({ msg: "No Data Found" });

    let fileName = education.image;

    if (req.files && req.files.file) {
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        fileName = file.md5 + ext;
        const allowedType = [".png", ".jpg", ".jpeg"];

        if (!allowedType.includes(ext.toLowerCase())) {
            return res.status(422).json({ msg: "Invalid Image Format" });
        }
        if (fileSize > 5000000) {
            return res.status(422).json({ msg: "Image must be less than 5 MB" });
        }

        // Delete the old image file
        const filepath = `./public/images/${education.image}`;
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath); // Delete the old image
        }

        // Move the new file
        file.mv(`./public/images/${fileName}`, (err) => {
            if (err) return res.status(500).json({ msg: err.message });
        });
    }
    const instansi = req.body.instansi;
    const bagian = req.body.bagian;
    const periode = req.body.periode;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

    try {
        await Education.update(
            {
                instansi: instansi,
                bagian: bagian,
                periode: periode,
                image: fileName,
                url: url,
            },
            {
                where: {
                    id: req.params.id,
                },
            }
        );
        res.status(200).json({ msg: "Education Updated Successfuly" });
    } catch (error) {
        console.log(error.message);
    }
};

const deleteEducation = async (req, res) => {
    const education = await Education.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!education) return res.status(404).json({ msg: "No Data Found" });
  
    try {
      const filepath = `./public/images/${education.image}`;
      fs.unlinkSync(filepath);
      await Education.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.status(200).json({ msg: "Education Deleted Successfuly" });
    } catch (error) {
      console.log(error.message);
    }
  };

module.exports = {
  getAllEducation,
  getEducation,
  getEducationById,
  createEducation,
  updateEducation,
  deleteEducation,
};