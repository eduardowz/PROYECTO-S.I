const mongoose = require("mongoose");

const vacanteSchema = new mongoose.Schema({
  titulo:       { type: String, required: true },
  ubicacion:    { type: String, required: true },
  salario:      { type: String, required: true },
  tipoContrato: { type: String, default: "Tiempo completo" },
  descripcion:  { type: String, required: true },

  // Referencia a la empresa que la publicó
  empresaId:    { type: mongoose.Schema.Types.ObjectId, ref: "Empresa", required: true },
  empresaNombre:{ type: String, required: true },

  // Candidatos que se postularon
  postulantes:  [{
    candidatoId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    nombre:        String,
    correo:        String,
    fechaPostulacion: { type: Date, default: Date.now }
  }],

  activa: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Vacante", vacanteSchema);