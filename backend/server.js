const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes    = require("./routes/users");
const empresaRoutes = require("./routes/empresa");
const adminRoutes   = require("./routes/admin");
const authRoutes    = require("./routes/auth");
const vacanteRoutes = require("./routes/vacantes");

const app = express();

app.use(cors({
    origin: ["https://innovatalentos.tech", "https://dainty-pika-186e81.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

app.use("/api/users",    userRoutes);
app.use("/api/empresas", empresaRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/auth",     authRoutes);
app.use("/api/vacantes", vacanteRoutes);

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Conectado a MongoDB Atlas");
    console.log("Base de datos:", mongoose.connection.name);
})
.catch((err) => console.log(err));

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor en puerto", process.env.PORT || 3000);
});