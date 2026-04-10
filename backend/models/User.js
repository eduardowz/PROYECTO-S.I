const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    tipo:         { type: String, required: true },
    nombre:       { type: String, required: true },
    correo:       { type: String, unique: true, required: true },
    telefono:     String,
    password:     { type: String, required: true },
    edad:         String,
    ubicacion:    String,
    rfc:          String,
    sitioWeb:     String,
    direccion:    String,
    estado:       { type: String, default: "activo" },
    fechaRegistro:{ type: String, default: () => new Date().toLocaleString() },
    notificaciones:  { type: Boolean, default: false },
    cvSubido:        { type: Boolean, default: false },
    postulaciones:   { type: Array,   default: [] },
    verificada:      { type: Boolean, default: false },

    cv: {
    nombreCompleto: String,
    telefono:       String,
    habilidades:    String,
    experiencia:    String
    }

    

});



module.exports = mongoose.model("User", UserSchema);