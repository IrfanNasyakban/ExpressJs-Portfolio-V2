const Project = require("../models/ProjectModel.js");
const Users = require("../models/UserModel.js");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

const getAllProject = async (req, res) => {
    try {
        const response = await Project.findAll({
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

const getProject = async (req, res) => {
    try {
        if (req.role === "admin") {
            const response = await Project.findAll({
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

const getProjectById = async (req, res) => {
    try {
        let response;
        if (req.role === "admin") {
            response = await Project.findOne({
                attributes: ['id', 'judul', 'deskripsi', 'tags', 'techStack', 'link', 'github', 'image', 'url'],
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

const createProject = async (req, res) => {
    if (req.files === null) return res.status(400).json({ msg: "No File Uploaded" })
    const judul = req.body.judul
    const deskripsi = req.body.deskripsi
    const tags = req.body.tags
    const techStack = req.body.techStack
    const link = req.body.link
    const github = req.body.github
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
            const project = await Project.create({
                judul: judul,
                deskripsi: deskripsi,
                tags: tags,
                techStack: techStack,
                link: link,
                github: github,
                image: fileName,
                url: url,
                userId: req.userId
            });
            res.status(201).json({
                id: project.id,
                msg: "Image berhasil di tambahkan"
            })
        } catch (error) {
            console.log(error.message);
        }
    })
}

const updateProject = async (req, res) => {
    const project = await Project.findOne({
        where: {
            id: req.params.id,
        },
    });
    if (!project) return res.status(404).json({ msg: "No Data Found" });

    let fileName = project.image;

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
        const filepath = `./public/images/${project.image}`;
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath); // Delete the old image
        }

        // Move the new file
        file.mv(`./public/images/${fileName}`, (err) => {
            if (err) return res.status(500).json({ msg: err.message });
        });
    }
    const judul = req.body.judul;
    const deskripsi = req.body.deskripsi;
    const tags = req.body.tags;
    const techStack = req.body.techStack;
    const link = req.body.link;
    const github = req.body.github;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

    try {
        await Project.update(
            {
                judul: judul,
                deskripsi: deskripsi,
                tags: tags,
                techStack: techStack,
                link: link,
                github: github,
                image: fileName,
                url: url,
            },
            {
                where: {
                    id: req.params.id,
                },
            }
        );
        res.status(200).json({ msg: "Project Updated Successfuly" });
    } catch (error) {
        console.log(error.message);
    }
};

const deleteProject = async (req, res) => {
    const project = await Project.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!project) return res.status(404).json({ msg: "No Data Found" });
  
    try {
      const filepath = `./public/images/${project.image}`;
      fs.unlinkSync(filepath);
      await Project.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.status(200).json({ msg: "Project Deleted Successfuly" });
    } catch (error) {
      console.log(error.message);
    }
  };

module.exports = {
  getAllProject,
  getProject,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};