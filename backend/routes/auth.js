const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Empresa = require("../models/Empresa");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);
const intentosFallidos = {};

// ── REGISTRO USUARIO/CANDIDATO ────────────────────────
router.post("/register", async (req, res) => {
    try {
        const { nombre, correo, password, tipo, telefono, edad, ubicacion } = req.body;

        if (!nombre || !correo || !password || !tipo)
            return res.status(400).json({ error: "Completa todos los campos" });

        const existe = await User.findOne({ correo });
        if (existe)
            return res.status(400).json({ error: "El correo ya está registrado" });

        const token  = crypto.randomBytes(32).toString("hex");
        const expira = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const nuevoUsuario = new User({
            nombre, correo, password, tipo, telefono, edad, ubicacion,
            verificada: false,
            estado: "pendiente_verificacion",
            verificationToken: token,
            tokenExpira: expira
        });

        await nuevoUsuario.save();

        const link = `${process.env.BASE_URL}/api/auth/verificar/${token}`;

        await resend.emails.send({
            from: "no-reply@innovatalentos.tech",
            to: correo,
            subject: "Verifica tu cuenta - InnovaTalentos",
            html: `
                <div style="font-family:Arial,sans-serif; max-width:500px; margin:auto;">
                    <h2>¡Hola ${nombre}!</h2>
                    <p>Gracias por registrarte en InnovaTalentos. Haz clic para verificar tu cuenta:</p>
                    <a href="${link}"
                       style="background:#2a7a96; color:white; padding:12px 24px;
                              text-decoration:none; border-radius:5px; display:inline-block;">
                        Verificar mi cuenta
                    </a>
                    <p style="color:#999; margin-top:20px;">Este enlace expira en 24 horas.</p>
                </div>
            `
        });

        res.status(201).json({ message: "Registro exitoso. Revisa tu correo para verificar tu cuenta." });

    } catch (error) {
        console.error("Error en register:", error);
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});

// ── VERIFICAR TOKEN ───────────────────────────────────
router.get("/verificar/:token", async (req, res) => {
    try {
        const { token } = req.params;

        const usuario = await User.findOne({
            verificationToken: token,
            tokenExpira: { $gt: new Date() }
        });

        if (!usuario)
            return res.status(400).json({ error: "Token inválido o expirado" });

        usuario.verificada        = true;
        usuario.estado            = "activo";
        usuario.verificationToken = null;
        usuario.tokenExpira       = null;

        await usuario.save();

        res.redirect(`${process.env.FRONTEND_URL}/index.html?verificado=true`);

    } catch (error) {
        console.error("Error al verificar:", error);
        res.status(500).json({ error: "Error al verificar cuenta" });
    }
});

// ── LOGIN ─────────────────────────────────────────────
router.post("/login", async (req, res) => {
    try {
        const correo = req.body.correo || req.body.email;
        const { password } = req.body;

        if (!correo || !password)
            return res.status(400).json({ error: "Completa todos los campos" });

        const claveIntento = correo;
        const ahora = Date.now();
        const intento = intentosFallidos[claveIntento];

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

        let empresa = await Empresa.findOne({ correo });
        if (empresa) {
            if (empresa.password !== password)
                return res.status(401).json({ error: "Credenciales incorrectas" });
            if (!empresa.aprobada)
                return res.status(403).json({ error: "Tu cuenta está pendiente de aprobación por el administrador" });
            return res.json({ message: "Login exitoso", tipo: "empresa", nombre: empresa.nombre, correo: empresa.correo, id: empresa._id.toString() });
        }

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
                return res.status(403).json({ error: "Debes verificar tu correo antes de iniciar sesión." });
            delete intentosFallidos[claveIntento];
            return res.json({ message: "Login exitoso", tipo: usuario.tipo, nombre: usuario.nombre, correo: usuario.correo, id: usuario._id });
        }

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