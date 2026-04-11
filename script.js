console.log("SCRIPT CARGADO");

// ══ PARTÍCULAS DEL FONDO ══════════════════════════════════
const particlesContainer = document.getElementById("particles");
const colores = ["rgba(240,165,0,.55)", "rgba(42,122,150,.6)", "rgba(255,255,255,.3)"];
for (let i = 0; i < 48; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = 1.5 + Math.random() * 2.5;
    p.style.cssText = `
        left: ${Math.random()*100}%;
        top: ${Math.random()*100}%;
        width: ${size}px; height: ${size}px;
        background: ${colores[Math.floor(Math.random()*colores.length)]};
        animation-delay: ${Math.random()*5}s;
        animation-duration: ${3.5 + Math.random()*4}s;
    `;
    particlesContainer.appendChild(p);
}

// ══ TABS ═════════════════════════════════════════════════
const tabRegistroBtn = document.getElementById("tabRegistroBtn");
const tabLoginBtn    = document.getElementById("tabLoginBtn");
const panelRegistro  = document.getElementById("formRegistro");
const panelLogin     = document.getElementById("formLogin");

function mostrarTab(tab) {
    const esRegistro = tab === "registro";
    panelRegistro.classList.toggle("active", esRegistro);
    panelLogin.classList.toggle("active",    !esRegistro);
    tabRegistroBtn.classList.toggle("active", esRegistro);
    tabLoginBtn.classList.toggle("active",    !esRegistro);
    document.getElementById("mensajeRegistro").style.display = "none";
    document.getElementById("mensajeLogin").style.display    = "none";
}

tabRegistroBtn.addEventListener("click", () => mostrarTab("registro"));
tabLoginBtn.addEventListener("click",    () => mostrarTab("login"));

// ══ ELEMENTOS ════════════════════════════════════════════
const formRegistro        = document.getElementById("formRegistro");
const formLogin           = document.getElementById("formLogin");

const nombreRegistro      = document.getElementById("nombreRegistro");
const correoRegistro      = document.getElementById("correoRegistro");
const telefonoRegistro    = document.getElementById("telefonoRegistro");
const passwordRegistro    = document.getElementById("passwordRegistro");
const passwordConfirm     = document.getElementById("passwordConfirm");

const camposEmpresa       = document.getElementById("camposEmpresa");
const camposCandidato     = document.getElementById("camposCandidato");
const rfcEmpresa          = document.getElementById("rfcEmpresa");
const sitioWeb            = document.getElementById("sitioWeb");
const direccionEmpresa    = document.getElementById("direccionEmpresa");
const edadCandidato       = document.getElementById("edadCandidato");
const ubicacionCandidato  = document.getElementById("ubicacionCandidato");

const checkPrivacidad     = document.getElementById("consentimientoPrivacidad");
const checkTerminos       = document.getElementById("consentimientoTerminos");
const checkAntiFraude     = document.getElementById("consentimientoAntiFraude");
const checkNotificaciones = document.getElementById("consentimientoNotificaciones");
const checkVerificacion   = document.getElementById("consentimientoVerificacion");
const checkboxVerificacionEmpresa = document.getElementById("checkboxVerificacionEmpresa");

const mensajeRegistro     = document.getElementById("mensajeRegistro");
const mensajeLogin        = document.getElementById("mensajeLogin");
const correoLogin         = document.getElementById("correoLogin");
const passwordLogin       = document.getElementById("passwordLogin");
const recordarme          = document.getElementById("recordarme");
const irLogin             = document.getElementById("irLogin");
const irRegistro          = document.getElementById("irRegistro");
const textoBotonRegistro  = document.getElementById("textoBotonRegistro");

const radiosTipoUsuario   = document.querySelectorAll('input[name="tipoUsuario"]');

// ══ VALIDACIONES ═════════════════════════════════════════
const validarEmail    = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validarTelefono = (v) => /^\d{10}$/.test(v.replace(/\s/g, ""));
const validarRFC      = (v) => /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(v.toUpperCase());
const validarPassword = (v) => /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v) && v.length >= 8;

const mostrarMensaje = (el, texto, tipo) => {
    el.textContent = texto;
    el.className = `mensaje ${tipo}`;
    el.style.display = "block";
    setTimeout(() => { el.style.display = "none"; }, 5000);
};

// ══ AVISOS COLAPSABLES ════════════════════════════════════
document.querySelectorAll("[data-aviso]").forEach(header => {
    header.addEventListener("click", () => {
        header.classList.toggle("open");
        header.nextElementSibling.classList.toggle("open");
    });
});

// ══ TOGGLE CONTRASEÑA ════════════════════════════════════
document.querySelectorAll(".toggle-pw").forEach(btn => {
    btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.target);
        input.type = input.type === "password" ? "text" : "password";
        btn.style.opacity = input.type === "text" ? "1" : "0.6";
    });
});

// ══ CAMBIO TIPO USUARIO ══════════════════════════════════
radiosTipoUsuario.forEach(radio => {
    radio.addEventListener("change", ({ target }) => {
        const esEmpresa = target.value === "empresa";
        camposEmpresa.style.display   = esEmpresa ? "grid" : "none";
        camposCandidato.style.display = esEmpresa ? "none" : "grid";
        checkboxVerificacionEmpresa.style.display = esEmpresa ? "flex" : "none";
        textoBotonRegistro.textContent = esEmpresa ? "Crear Cuenta como Empresa" : "Crear Cuenta como Candidato";

        rfcEmpresa.required        = esEmpresa;
        direccionEmpresa.required  = esEmpresa;
        checkVerificacion.required = esEmpresa;
        edadCandidato.required     = !esEmpresa;
        ubicacionCandidato.required = !esEmpresa;
    });
});

// ══ REGISTRO ═════════════════════════════════════════════
formRegistro.addEventListener("submit", (e) => {
    e.preventDefault();
    mensajeRegistro.style.display = "none";

    const tipo     = document.querySelector('input[name="tipoUsuario"]:checked').value;
    const nombre   = nombreRegistro.value.trim();
    const correo   = correoRegistro.value.trim();
    const telefono = telefonoRegistro.value.trim();
    const pass     = passwordRegistro.value;
    const passConf = passwordConfirm.value;

    if (!nombre || !correo || !telefono || !pass || !passConf)
        return mostrarMensaje(mensajeRegistro, "Por favor, completa todos los campos obligatorios", "error");
    if (!validarEmail(correo))
        return mostrarMensaje(mensajeRegistro, "El correo electrónico no es válido", "error");
    if (!validarTelefono(telefono))
        return mostrarMensaje(mensajeRegistro, "El teléfono debe tener 10 dígitos", "error");
    if (!validarPassword(pass))
        return mostrarMensaje(mensajeRegistro, "La contraseña debe incluir mayúsculas, minúsculas y números (mín. 8 caracteres)", "error");
    if (pass !== passConf)
        return mostrarMensaje(mensajeRegistro, "Las contraseñas no coinciden", "error");

    if (tipo === "empresa") {
        const rfc       = rfcEmpresa.value.trim();
        const direccion = direccionEmpresa.value.trim();
        if (!rfc || !direccion)
            return mostrarMensaje(mensajeRegistro, "Completa todos los campos de la empresa", "error");
        if (!validarRFC(rfc))
            return mostrarMensaje(mensajeRegistro, "El RFC no tiene un formato válido", "error");
        if (!checkVerificacion.checked)
            return mostrarMensaje(mensajeRegistro, "Debes autorizar la verificación de tu empresa", "error");
    } else {
        const edad      = edadCandidato.value;
        const ubicacion = ubicacionCandidato.value.trim();
        if (!edad || !ubicacion)
            return mostrarMensaje(mensajeRegistro, "Completa todos los campos de candidato", "error");
        if (edad < 18)
            return mostrarMensaje(mensajeRegistro, "Debes ser mayor de 18 años para registrarte", "error");
    }

    if (!checkPrivacidad.checked)
        return mostrarMensaje(mensajeRegistro, "Debes aceptar el Aviso de Privacidad", "error");
    if (!checkTerminos.checked)
        return mostrarMensaje(mensajeRegistro, "Debes aceptar los Términos y Condiciones", "error");
    if (!checkAntiFraude.checked)
        return mostrarMensaje(mensajeRegistro, "Debes aceptar el Compromiso Anti-Fraude", "error");

    const nuevoUsuario = {
        tipo, nombre, correo, telefono, password: pass,
        notificaciones: checkNotificaciones.checked,
        ...(tipo === "empresa"
            ? { rfc: rfcEmpresa.value.trim(), sitioWeb: sitioWeb.value.trim(), direccion: direccionEmpresa.value.trim() }
            : { edad: edadCandidato.value, ubicacion: ubicacionCandidato.value.trim() })
    };

    const ruta = tipo === "empresa"
        ? "https://proyecto-si-production.up.railway.app/api/empresas/register"
        : "https://proyecto-si-production.up.railway.app/api/auth/register";

    fetch(ruta, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario)
    })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
        if (ok) {
            const msg = tipo === "empresa"
                ? "Registro exitoso. Tu empresa será verificada en 24-48 horas."
                : "Registro exitoso. Revisa tu correo para verificar tu cuenta.";
            mostrarMensaje(mensajeRegistro, msg, "exito");
            formRegistro.reset();
            camposEmpresa.style.display   = "none";
            camposCandidato.style.display = "grid";
            setTimeout(() => mostrarTab("login"), 3000);
        } else {
            mostrarMensaje(mensajeRegistro, data.error || "Error al registrarse", "error");
        }
    })
    .catch(() => mostrarMensaje(mensajeRegistro, "Error al conectar con el servidor", "error"));
});

// ══ LOGIN ════════════════════════════════════════════════
formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    mensajeLogin.style.display = "none";

    const correo   = correoLogin.value.trim();
    const password = passwordLogin.value;

    if (!correo || !password)
        return mostrarMensaje(mensajeLogin, "Por favor, completa todos los campos", "error");
    if (!validarEmail(correo))
        return mostrarMensaje(mensajeLogin, "El correo electrónico no es válido", "error");

    fetch("https://proyecto-si-production.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password })
    })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
        if (ok) {
            const datosSesion = JSON.stringify({
                tipo:   data.tipo,
                correo: data.correo,
                nombre: data.nombre,
                id:     data.id
            });
            sessionStorage.setItem("sesionActiva", datosSesion);
            if (recordarme.checked) localStorage.setItem("sesionActiva", datosSesion);

            mostrarMensaje(mensajeLogin, `Bienvenido, ${data.nombre}`, "exito");
            setTimeout(() => { window.location.href = "home.html"; }, 1200);
        } else {
            mostrarMensaje(mensajeLogin, data.error || "Credenciales incorrectas", "error");
        }
    })
    .catch(() => mostrarMensaje(mensajeLogin, "Error al conectar con el servidor", "error"));
});

// ══ NAVEGACIÓN ═══════════════════════════════════════════
irLogin.addEventListener("click",    (e) => { e.preventDefault(); mostrarTab("login"); });
irRegistro.addEventListener("click", (e) => { e.preventDefault(); mostrarTab("registro"); });

// ══ INICIALIZACIÓN ════════════════════════════════════════
const sesionActiva = localStorage.getItem("sesionActiva");
if (sesionActiva) {
    const u = JSON.parse(sesionActiva);
    console.log(`Sesión activa: ${u.nombre} (${u.tipo})`);
}

console.log("Sistema cargado");