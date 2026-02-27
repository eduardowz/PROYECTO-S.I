const express = require("express");
const router = express.Router();
const Empresa = require("../models/Empresa");

// Registrar empresa
router.post("/register", async (req, res) => {
try {
    const { nombre, correo, password, telefono, direccion } = req.body;

    const nuevaEmpresa = new Empresa({
nombre,
correo,
password,
telefono,
direccion
});

await nuevaEmpresa.save();

res.status(201).json({
message: "Empresa registrada correctamente",
empresa: nuevaEmpresa
});

} catch (error) {
res.status(500).json({ error: error.message });
}
});

// Login empresa
router.post("/login", async (req, res) => {
    try {
        console.log("Body recibido en login empresa:", req.body);

        const correo = req.body.correo || req.body.email;
        const { password } = req.body;

        const empresa = await Empresa.findOne({ correo });

        if (!empresa) {
            return res.status(400).json({ message: "Empresa no encontrada" });
        }

        if (empresa.password !== password) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        // 🔥 NUEVA VALIDACIÓN
        if (!empresa.aprobada) {
            return res.status(403).json({
                message: "Tu cuenta está pendiente de aprobación por el administrador"
            });
        }

        res.json({
            message: "Login exitoso",
            empresa: empresa
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;

