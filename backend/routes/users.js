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

module.exports = router;
