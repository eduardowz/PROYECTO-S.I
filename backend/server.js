const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/users"); // 👈 IMPORTANTE

const app = express();

app.use(cors());
app.use(express.json());

// 👇 CONECTAMOS LAS RUTAS
app.use("/api/users", userRoutes);

mongoose.connect("mongodb+srv://admin:Admin2024@cluster0.aztiegb.mongodb.net/bolsa_trabajo?retryWrites=true&w=majority")
.then(() => console.log("Conectado a MongoDB Atlas"))
.catch((err) => console.log(err));

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

app.listen(3000, () => {
    console.log("Servidor en puerto 3000");
});
