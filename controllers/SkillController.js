const Skill = require("../models/SkillModel.js");
const Users = require("../models/UserModel.js");

const getAllSkill = async (req, res) => {
    try {
        const response = await Skill.findAll({
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

const getSkill = async (req, res) => {
    try {
        if (req.role === "admin") {
            const response = await Skill.findOne({
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

const getSkillById = async (req, res) => {
    try {
        let response;
        if (req.role === "admin") {
            response = await Skill.findOne({
                attributes: ['id', 'languages', 'databases', 'tools', 'frameworks', 'other'],
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

const createSkill = async (req, res) => {
    const languages = req.body.languages;
    const databases = req.body.databases;
    const tools = req.body.tools;
    const frameworks = req.body.frameworks;
    const other = req.body.other;

    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ error: "User ID not found in the request" });
        }

        await Skill.create({
            languages: languages,
            databases: databases,
            tools: tools,
            frameworks: frameworks,
            other: other,
            userId: req.userId
        });

        res.json({ msg: "Skill Created" });
    } catch (error) {
        console.log(error);
    }
};

const updateSkill = async (req, res) => {
    try {
        await Skill.update(req.body, {
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({ msg: "Skill Updated" })
    } catch (error) {
        console.log(error.message);
    }
};

const deleteSkill = async (req, res) => {
    try {
        await Skill.destroy({
            where: {
                id: req.params.id,
            },
        });
        res.status(200).json({ msg: "Skill Deleted" });
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
  getAllSkill,
  getSkill,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
};