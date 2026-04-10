const express  = require("express");
const router   = express.Router();
const Vacante  = require("../models/Vacante");

// ── Publicar vacante (empresa) ────────────────────────────────
router.post("/publicar", async (req, res) => {
  try {
    const { titulo, ubicacion, salario, tipoContrato, descripcion, empresaId, empresaNombre } = req.body;

    if (!titulo || !ubicacion || !salario || !descripcion || !empresaId || !empresaNombre)
      return res.status(400).json({ error: "Completa todos los campos obligatorios" });

    const nuevaVacante = new Vacante({ titulo, ubicacion, salario, tipoContrato, descripcion, empresaId, empresaNombre });
    await nuevaVacante.save();

    res.status(201).json({ message: "Vacante publicada correctamente", vacante: nuevaVacante });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Todas las vacantes activas (sección pública "Vacantes") ───
router.get("/todas", async (req, res) => {
  try {
    const vacantes = await Vacante.find({ activa: true }).sort({ createdAt: -1 });
    res.json(vacantes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Vacantes de UNA empresa (sección "Mis Vacantes") ─────────
router.get("/empresa/:empresaId", async (req, res) => {
  try {
    const vacantes = await Vacante.find({ empresaId: req.params.empresaId, activa: true }).sort({ createdAt: -1 });
    res.json(vacantes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Eliminar vacante (empresa dueña) ──────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const vacante = await Vacante.findByIdAndDelete(req.params.id);
    if (!vacante) return res.status(404).json({ error: "Vacante no encontrada" });
    res.json({ message: "Vacante eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Postularse a una vacante (candidato) ──────────────────────
router.post("/:id/postular", async (req, res) => {
  try {
    const { candidatoId, nombre, correo } = req.body;
    const vacante = await Vacante.findById(req.params.id);

    if (!vacante) return res.status(404).json({ error: "Vacante no encontrada" });

    // Verificar si ya se postuló
    const yaPostulado = vacante.postulantes.some(p => p.correo === correo);
    if (yaPostulado) return res.status(400).json({ error: "Ya te postulaste a esta vacante" });

    vacante.postulantes.push({ candidatoId, nombre, correo });
    await vacante.save();

    res.json({ message: "Postulación exitosa" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Ver postulantes de una vacante (empresa dueña) ────────────
router.get("/:id/postulantes", async (req, res) => {
  try {
    const vacante = await Vacante.findById(req.params.id).select("titulo postulantes");
    if (!vacante) return res.status(404).json({ error: "Vacante no encontrada" });
    res.json(vacante);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Editar vacante (empresa dueña) ────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { titulo, ubicacion, salario, tipoContrato, descripcion } = req.body;

    if (!titulo || !ubicacion || !salario)
      return res.status(400).json({ error: "Completa los campos obligatorios" });

    const vacante = await Vacante.findByIdAndUpdate(
      req.params.id,
      { titulo, ubicacion, salario, tipoContrato, descripcion },
      { returnDocument: 'after' } 
    );

    if (!vacante) return res.status(404).json({ error: "Vacante no encontrada" });

    res.json({ message: "Vacante actualizada correctamente", vacante });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Postulaciones de un candidato ─────────────────────────────
router.get("/candidato/:candidatoId", async (req, res) => {
  try {
    const vacantes = await Vacante.find({
      "postulantes.candidatoId": req.params.candidatoId
    }).select("titulo empresaNombre ubicacion salario tipoContrato fechaPostulacion");
    res.json(vacantes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
