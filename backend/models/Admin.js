const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fechaRegistro: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Admin", adminSchema);