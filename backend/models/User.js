const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    tipo: String,
    nombre: String,
    correo: { type: String, unique: true },
    telefono: String,
    password: String,
    edad: String,
    ubicacion: String,
    rfc: String,
    sitioWeb: String,
    direccion: String,
    estado: String,
    fechaRegistro: String
});

module.exports = mongoose.model("User", UserSchema);
