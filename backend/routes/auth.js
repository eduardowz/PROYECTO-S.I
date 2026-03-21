const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Empresa = require("../models/Empresa");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

const intentosFallidos = {};

router.post("/login", async (req, res) => {
    try {
        const correo = req.body.correo || req.body.email;
        const { password } = req.body;

        if (!correo || !password)
            return res.status(400).json({ error: "Completa todos los campos" });

        const claveIntento = correo;
        const ahora = Date.now();
        const intento = intentosFallidos[claveIntento];

        // ── BLOQUEO POR INTENTOS ──────────────────────────
        if (intento && intento.contador >= 6) {
            const tiempoEspera = 120000;
            const transcurrido = ahora - intento.primerIntento;
            if (transcurrido < tiempoEspera) {
                const seg = Math.ceil((tiempoEspera - transcurrido) / 1000);
                return res.status(429).json({ error: `Demasiados intentos. Espera ${seg} segundos.` });
            } else {
                delete intentosFallidos[claveIntento];
            }
        }

        // ── BUSCAR EN ADMIN ───────────────────────────────
        let admin = await Admin.findOne({ correo });
        if (admin) {
            const passValida = await bcrypt.compare(password, admin.password);
            if (!passValida) {
                registrarIntento(claveIntento, ahora);
                const restantes = 6 - intentosFallidos[claveIntento].contador;
                return res.status(401).json({
                    error: restantes > 0
                        ? `Credenciales incorrectas. Te quedan ${restantes} intento(s).`
                        : "Has agotado tus 6 intentos. Espera 2 minutos."
                });
            }
            delete intentosFallidos[claveIntento];
            return res.json({ message: "Login exitoso", tipo: "admin", nombre: admin.nombre, correo: admin.correo, id: admin._id });
        }

        // ── BUSCAR EN EMPRESA ─────────────────────────────
        let empresa = await Empresa.findOne({ correo });
        if (empresa) {
            if (empresa.password !== password)
                return res.status(401).json({ error: "Credenciales incorrectas" });
            if (!empresa.aprobada)
                return res.status(403).json({ error: "Tu cuenta está pendiente de aprobación por el administrador" });
            return res.json({ message: "Login exitoso", tipo: "empresa", nombre: empresa.nombre, correo: empresa.correo, id: empresa._id });
        }

        // ── BUSCAR EN USUARIOS (candidatos) ───────────────
        let usuario = await User.findOne({ correo });
        if (usuario) {
            if (usuario.password !== password) {
                registrarIntento(claveIntento, ahora);
                const restantes = 6 - intentosFallidos[claveIntento].contador;
                return res.status(401).json({
                    error: restantes > 0
                        ? `Credenciales incorrectas. Te quedan ${restantes} intento(s).`
                        : "Has agotado tus 6 intentos. Espera 2 minutos."
                });
            }
            if (usuario.estado === "pendiente_verificacion")
                return res.status(403).json({ error: "Tu cuenta está en proceso de verificación." });
            delete intentosFallidos[claveIntento];
            return res.json({ message: "Login exitoso", tipo: usuario.tipo, nombre: usuario.nombre, correo: usuario.correo, id: usuario._id });
        }

        // ── NO ENCONTRADO ─────────────────────────────────
        registrarIntento(claveIntento, ahora);
        const restantes = 6 - intentosFallidos[claveIntento].contador;
        return res.status(401).json({
            error: restantes > 0
                ? `Credenciales incorrectas. Te quedan ${restantes} intento(s).`
                : "Has agotado tus 6 intentos. Espera 2 minutos."
        });

    } catch (error) {
        console.log("Error en auth/login:", error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
});

function registrarIntento(clave, ahora) {
    if (intentosFallidos[clave]) {
        intentosFallidos[clave].contador += 1;
        if (intentosFallidos[clave].contador === 6)
            intentosFallidos[clave].primerIntento = ahora;
    } else {
        intentosFallidos[clave] = { contador: 1, primerIntento: ahora };
    }
}

module.exports = router;