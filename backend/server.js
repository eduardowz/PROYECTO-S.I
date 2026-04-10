const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes    = require("./routes/users");
const empresaRoutes = require("./routes/empresa");
const adminRoutes   = require("./routes/admin");
const authRoutes    = require("./routes/auth");   // ← NUEVO
const vacanteRoutes = require("./routes/vacantes");

const app = express();

app.use(cors());
app.use(express.json());

// ══ RUTAS ══════════════════════════════════════════
app.use("/api/users",   userRoutes);
app.use("/api/empresas", empresaRoutes);
app.use("/api/admin",   adminRoutes);
app.use("/api/auth",    authRoutes);
app.use("/api/vacantes", vacanteRoutes);  // ← NUEVO

mongoose.connect("mongodb+srv://admin:Admin2024@cluster0.aztiegb.mongodb.net/bolsa_trabajo?retryWrites=true&w=majority")
.then(() => {
    console.log("Conectado a MongoDB Atlas");
    console.log("Base de datos:", mongoose.connection.name);
})
.catch((err) => console.log(err));

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

app.listen(3000, () => {
    console.log("Servidor en puerto 3000");
});