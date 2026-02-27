const mongoose = require("mongoose");

const empresaSchema = new mongoose.Schema({
nombre: {
    type: String,
    required: true
},
correo: {
    type: String,
    required: true,
    unique: true
},
password: {
    type: String,
    required: true
},
telefono: {
    type: String
},
direccion: {
    type: String
},
aprobada: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Empresa", empresaSchema);