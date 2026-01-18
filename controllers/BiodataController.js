const Biodata = require("../models/BiodataModel.js");
const Users = require("../models/UserModel.js");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

const getRes = async (req, res) => {
  try {
    const data = {
      data: "data success",
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getBiodata = async (req, res) => {
    try {
        if (req.role === "admin") {
            const biodata = await Biodata.findAll({
                include: [{
                    model: Users,
                    attributes: ['username', 'email', 'role']
                }],
            });
            res.status(200).json(biodata);
        } else {
            res.status(422).json(msg="Akses hanya untuk admin");
        }
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

const getBiodataById = async (req, res) => {
    try {
        let response;
        if (req.role === "admin") {
            response = await Biodata.findOne({
                attributes: ['id', 'nama', 'gender', 'email', 'tglLahir', 'noHp', 'alamat', 'image', 'url'],
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

const createBiodata = async (req, res) => {
    if (req.files === null) return res.status(400).json({ msg: "No File Uploaded" })
    const nama = req.body.nama
    const gender = req.body.gender
    const email = req.body.email
    const tglLahir = req.body.tglLahir
    const noHp = req.body.noHp
    const alamat = req.body.alamat
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
            const biodata = await Biodata.create({
                nama: nama,
                gender: gender,
                email: email,
                tglLahir: tglLahir,
                noHp: noHp,
                alamat: alamat,
                image: fileName,
                url: url,
                userId: req.userId
            });
            res.status(201).json({
                id: biodata.id,
                msg: "Image berhasil di tambahkan"
            })
        } catch (error) {
            console.log(error.message);
        }
    })
}

const updateBiodata = async (req, res) => {
    const biodata = await Biodata.findOne({
        where: {
            id: req.params.id,
        },
    });
    if (!biodata) return res.status(404).json({ msg: "No Data Found" });

    let fileName = biodata.image;

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
        const filepath = `./public/images/${biodata.image}`;
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath); // Delete the old image
        }

        // Move the new file
        file.mv(`./public/images/${fileName}`, (err) => {
            if (err) return res.status(500).json({ msg: err.message });
        });
    }
    const nama = req.body.nama;
    const gender = req.body.gender;
    const email = req.body.email;
    const tglLahir = req.body.tglLahir;
    const noHp = req.body.noHp;
    const alamat = req.body.alamat;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

    try {
        await Biodata.update(
            {
                nama: nama,
                gender: gender,
                email: email,
                tglLahir: tglLahir,
                noHp: noHp,
                alamat: alamat,
                image: fileName,
                url: url,
            },
            {
                where: {
                    id: req.params.id,
                },
            }
        );
        res.status(200).json({ msg: "Biodata Updated Successfuly" });
    } catch (error) {
        console.log(error.message);
    }
};

const deleteBiodata = async (req, res) => {
    const biodata = await Biodata.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!biodata) return res.status(404).json({ msg: "No Data Found" });
  
    try {
      const filepath = `./public/images/${biodata.image}`;
      fs.unlinkSync(filepath);
      await Biodata.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.status(200).json({ msg: "Biodata Deleted Successfuly" });
    } catch (error) {
      console.log(error.message);
    }
  };

module.exports = {
  getRes,
  getBiodata,
  getBiodataById,
  createBiodata,
  updateBiodata,
  deleteBiodata,
};