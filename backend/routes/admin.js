const express = require("express");
const router = express.Router();
const Empresa = require("../models/Empresa");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

// =========================
// Registro de admin
// =========================
router.post("/registro", async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;

        const adminExistente = await Admin.findOne({ correo });
        if (adminExistente) {
            return res.status(400).json({ mensaje: "El admin ya existe" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const nuevoAdmin = new Admin({ nombre, correo, password: passwordHash });
        await nuevoAdmin.save();

        res.status(201).json({ mensaje: "Admin registrado correctamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
});

// =========================
// Login de admin
// =========================
router.post("/login", async (req, res) => {
    try {
        const { correo, password } = req.body;

        const admin = await Admin.findOne({ correo });
        if (!admin) return res.status(400).json({ mensaje: "Admin no encontrado" });

        const passwordValido = await bcrypt.compare(password, admin.password);
        if (!passwordValido) return res.status(400).json({ mensaje: "Contraseña incorrecta" });

        // Aquí podrías generar un token JWT si quieres autenticar
        res.json({ mensaje: "Login exitoso", adminId: admin._id, nombre: admin.nombre });
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
});

// =========================
// Ver empresas pendientes
// =========================
router.get("/empresas-pendientes", async (req, res) => {
    try {
        const pendientes = await Empresa.find({ aprobada: false });
        res.json({ total: pendientes.length, empresas: pendientes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =========================
// Aprobar empresa
// =========================
router.put("/aprobar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const empresaActualizada = await Empresa.findByIdAndUpdate(
            id,
            { aprobada: true },
            { new: true }
        );

        if (!empresaActualizada) {
            return res.status(404).json({ message: "Empresa no encontrada" });
        }

        res.json({ message: "Empresa aprobada correctamente", empresa: empresaActualizada });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;