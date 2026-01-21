const Organizations = require("../models/OrganizationsModel.js");
const Users = require("../models/UserModel.js");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

const getOrganizations = async (req, res) => {
    try {
        if (req.role === "admin") {
            const response = await Organizations.findAll({
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

const getOrganizationsById = async (req, res) => {
    try {
        let response;
        if (req.role === "admin") {
            response = await Organizations.findOne({
                attributes: ['id', 'organisasi', 'divisi', 'lokasi', 'periode', 'image', 'url'],
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

const createOrganizations = async (req, res) => {
    if (req.files === null) return res.status(400).json({ msg: "No File Uploaded" })
    const organisasi = req.body.organisasi
    const divisi = req.body.divisi
    const lokasi = req.body.lokasi
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
            const organizations = await Organizations.create({
                organisasi: organisasi,
                divisi: divisi,
                lokasi: lokasi,
                periode: periode,
                image: fileName,
                url: url,
                userId: req.userId
            });
            res.status(201).json({
                id: organizations.id,
                msg: "Image berhasil di tambahkan"
            })
        } catch (error) {
            console.log(error.message);
        }
    })
}

const updateOrganizations = async (req, res) => {
    const organizations = await Organizations.findOne({
        where: {
            id: req.params.id,
        },
    });
    if (!organizations) return res.status(404).json({ msg: "No Data Found" });

    let fileName = organizations.image;

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
        const filepath = `./public/images/${organizations.image}`;
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath); // Delete the old image
        }

        // Move the new file
        file.mv(`./public/images/${fileName}`, (err) => {
            if (err) return res.status(500).json({ msg: err.message });
        });
    }
    const organisasi = req.body.organisasi;
    const divisi = req.body.divisi;
    const lokasi = req.body.lokasi;
    const periode = req.body.periode;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

    try {
        await Organizations.update(
            {
                organisasi: organisasi,
                divisi: divisi,
                lokasi: lokasi,
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
        res.status(200).json({ msg: "organizations Updated Successfuly" });
    } catch (error) {
        console.log(error.message);
    }
};

const deleteOrganizations = async (req, res) => {
    const organizations = await Organizations.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!organizations) return res.status(404).json({ msg: "No Data Found" });
  
    try {
      const filepath = `./public/images/${organizations.image}`;
      fs.unlinkSync(filepath);
      await Organizations.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.status(200).json({ msg: "Organizations Deleted Successfuly" });
    } catch (error) {
      console.log(error.message);
    }
  };

module.exports = {
  getOrganizations,
  getOrganizationsById,
  createOrganizations,
  updateOrganizations,
  deleteOrganizations,
};