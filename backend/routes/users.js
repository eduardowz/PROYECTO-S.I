const express = require("express");
const router = express.Router();
const User = require("../models/User");
 
// ── Registrar candidato ───────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { nombre, correo, password, telefono, tipo, edad, ubicacion } = req.body;
 
    const existe = await User.findOne({ correo });
    if (existe) return res.status(400).json({ error: "El correo ya está registrado" });
 
    const nuevoUsuario = new User({
      tipo: tipo || "candidato",
      nombre, correo, password, telefono,
      edad, ubicacion,
      estado: "activo"
    });
    await nuevoUsuario.save();
 
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// ── Obtener todos los usuarios (para admin) ───────────────────
router.get("/todos", async (req, res) => {
  try {
    const usuarios = await User.find()
      .select("nombre correo tipo estado fechaRegistro")
      .sort({ fechaRegistro: -1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// ── Eliminar usuario (admin) ───────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const usuario = await User.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Guardar CV del candidato ───────────────────────────────────
router.put("/cv/:id", async (req, res) => {
  try {
    const { nombreCompleto, telefono, habilidades, experiencia } = req.body;
    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      { cv: { nombreCompleto, telefono, habilidades, experiencia }, cvSubido: true },
       { returnDocument: 'after' } 
    );
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "CV guardado correctamente", cv: usuario.cv });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Obtener CV de un candidato ─────────────────────────────────
router.get("/cv/:id", async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id).select("cv cvSubido nombre correo");
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
module.exports = router;
