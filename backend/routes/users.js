const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
    try {
        console.log("Datos recibidos:", req.body);

        const nuevoUsuario = new User(req.body);
        await nuevoUsuario.save();

        console.log("Usuario guardado en MongoDB");

        res.json({ mensaje: "Usuario registrado correctamente" });

    } catch (error) {
        console.log("Error al guardar:", error);
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});

// Login usuario
router.post("/login", async (req, res) => {
    try {
        const correo = req.body.correo || req.body.email;
        const { password } = req.body;

        const usuario = await User.findOne({ correo });

        if (!usuario) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        if (usuario.password !== password) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        res.json({
            message: "Login exitoso",
            user: usuario
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
