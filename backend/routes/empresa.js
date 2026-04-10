const express = require("express");
const router = express.Router();
const Empresa = require("../models/Empresa");
 
// ── Registrar empresa ─────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { nombre, correo, password, telefono, direccion } = req.body;
 
    const existe = await Empresa.findOne({ correo });
    if (existe) return res.status(400).json({ error: "El correo ya está registrado" });
 
    const nuevaEmpresa = new Empresa({ nombre, correo, password, telefono, direccion });
    await nuevaEmpresa.save();
 
    res.status(201).json({ message: "Empresa registrada correctamente. Espera aprobación del administrador." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// ── Empresas APROBADAS (para usuarios / sección pública) ──────
router.get("/aprobadas", async (req, res) => {
  try {
    const empresas = await Empresa.find({ aprobada: true })
      .select("nombre correo telefono direccion createdAt")
      .sort({ createdAt: -1 });
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// ── Empresas PENDIENTES (para admin) ─────────────────────────
router.get("/pendientes", async (req, res) => {
  try {
    const empresas = await Empresa.find({ aprobada: false })
      .select("nombre correo telefono direccion createdAt")
      .sort({ createdAt: -1 });
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// ── Aprobar empresa ────────────────────────────────────────────
router.put("/aprobar/:id", async (req, res) => {
  try {
    const empresa = await Empresa.findByIdAndUpdate(
      req.params.id,
      { aprobada: true },
      { new: true }
    );
    if (!empresa) return res.status(404).json({ error: "Empresa no encontrada" });
    res.json({ message: "Empresa aprobada correctamente", empresa });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// ── Rechazar / eliminar empresa ────────────────────────────────
router.delete("/rechazar/:id", async (req, res) => {
  try {
    const empresa = await Empresa.findByIdAndDelete(req.params.id);
    if (!empresa) return res.status(404).json({ error: "Empresa no encontrada" });
    res.json({ message: "Empresa rechazada y eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// ── Todas las empresas (para admin - gestión) ──────────────────
router.get("/todas", async (req, res) => {
  try {
    const empresas = await Empresa.find()
      .select("nombre correo telefono direccion aprobada createdAt")
      .sort({ createdAt: -1 });
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
module.exports = router;