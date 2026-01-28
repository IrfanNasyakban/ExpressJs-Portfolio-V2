const Users = require("../models/UserModel.js");
const argon = require("argon2");

const getUsers = async(req, res) => {
    try {
        const response = await Users.findAll({
            attributes: ['uuid', 'username', 'email', 'role']
        })
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}

const getUsersById = async(req, res) => {
    try {
        const response = await Users.findOne({
            attributes: ['uuid', 'username', 'email', 'role'],
            where: {
                uuid: req.params.id
            }
        })
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}

const createUsers = async(req, res) => {
    const {username, email, password, confPassword, role} = req.body
    if (password !== confPassword) return res.status(400).json({msg: "Password dan confirm password tidak cocok"})
    const hashPassword = await argon.hash(password)
    try {
        await Users.create({
            username: username,
            email: email,
            password: hashPassword,
            role: role
        })
        res.status(201).json({msg: "Register berhasil!"})
    } catch (error) {
        res.status(400).json({msg: error.message})
    }
}

const updateUsers = async(req, res) =>{
    const user = await Users.findOne({
        where: {
            uuid: req.params.id
        }
    });
    if(!user) return res.status(404).json({msg: "User tidak ditemukan"});

    const {
        username = user.username,
        email = user.email,
        password = "",
        confPassword = "",
        role = user.role,
    } = req.body;

    let hashPassword;
    if (!password || password === "") {
        // Gunakan password lama jika password tidak diubah
        hashPassword = user.password;
    } else {
        // Hash password baru
        if (password !== confPassword) {
            return res
                .status(400)
                .json({ msg: "Password dan Confirm Password tidak cocok" });
        }
        hashPassword = await argon.hash(password);
    }
    
    try {
        await Users.update({
            username: username,
            email: email,
            password: hashPassword,
            role: role
        },{
            where:{
                id: user.id
            }
        });
        res.status(200).json({msg: "User Updated"});
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
}

const changePassword = async(req, res) => {
    try {
        // Mendapatkan id user dari token JWT yang sudah diverifikasi di middleware
        const userId = req.userId;
        
        // Mendapatkan data dari request body
        const { oldPassword, newPassword, confNewPassword } = req.body;
        
        // Validasi input
        if (!oldPassword || !newPassword || !confNewPassword) {
            return res.status(400).json({ 
                msg: "Semua field harus diisi" 
            });
        }
        
        // Cek apakah password baru dan konfirmasi password sama
        if (newPassword !== confNewPassword) {
            return res.status(400).json({ 
                msg: "Password baru dan konfirmasi password tidak cocok" 
            });
        }
        
        // Cari user berdasarkan id
        const user = await Users.findOne({
            where: {
                id: userId
            }
        });
        
        if (!user) {
            return res.status(404).json({ 
                msg: "User tidak ditemukan" 
            });
        }
        
        // Verifikasi password lama
        const validPassword = await argon.verify(user.password, oldPassword);
        if (!validPassword) {
            return res.status(400).json({ 
                msg: "Password lama tidak valid" 
            });
        }
        
        // Jika password lama valid, hash password baru
        const hashNewPassword = await argon.hash(newPassword);
        
        // Update password user
        await Users.update(
            { password: hashNewPassword },
            {
                where: {
                    id: userId
                }
            }
        );
        
        res.status(200).json({ 
            msg: "Password berhasil diubah" 
        });
        
    } catch (error) {
        res.status(500).json({ 
            msg: error.message 
        });
    }
};

const deleteUsers = async(req, res) => {
    const user = await Users.findOne({
        where: {
            uuid: req.params.id
        }
    })
    if (!user) return res.status(404).json({msg: "User tidak ditemukan"})
    try {
        await Users.destroy({
            where:{
                id: user.id
            }
        })
        res.status(200).json({msg: "User Deleted"})
    } catch (error) {
        res.status(400).json({msg: error.message})
    }
}

module.exports = {
    getUsers,
    getUsersById,
    createUsers,
    updateUsers,
    changePassword,
    deleteUsers
};