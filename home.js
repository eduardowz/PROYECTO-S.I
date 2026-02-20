

// ── LEER SESIÓN ─────────────────────────────────────
const sesionActiva = sessionStorage.getItem("sesionActiva") || localStorage.getItem("sesionActiva");
const usuario = sesionActiva ? JSON.parse(sesionActiva) : null;

// ── APLICAR ROL ─────────────────────────────────────
function aplicarRol() {
  if (usuario) {
    document.querySelectorAll(".solo-logueado").forEach(el => el.style.display = "block");
    document.querySelectorAll(".solo-invitado").forEach(el => el.style.display = "none");

    document.getElementById("nombreUsuario").textContent = usuario.nombre;
    document.getElementById("correoUsuario").textContent = usuario.correo;

    const badge = document.getElementById("badgeRol");
    badge.textContent = usuario.tipo;
    badge.className = `badge-rol badge-${usuario.tipo}`;

    // ── ROL: CANDIDATO ────────────────────────────────
    if (usuario.tipo === "candidato") {
      document.querySelectorAll(".solo-candidato").forEach(el => el.style.display = "block");
      document.querySelectorAll(".solo-admin").forEach(el => el.style.display = "none");    // ← NUEVO
      document.querySelectorAll(".solo-empresa").forEach(el => el.style.display = "none");  // ← NUEVO
      document.getElementById("tituloPagina").textContent = `Bienvenido/a, ${usuario.nombre}`;

      document.querySelectorAll(".btn-postular").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const card = e.target.closest(".card");
          const vacante = card.querySelector("h3").textContent;
          btn.textContent = "Postulado";
          btn.disabled = true;
          btn.style.background = "#28a745";
          console.log(`${usuario.nombre} se postuló a: ${vacante}`);
        });
      });
    }

    // ── ROL: EMPRESA ──────────────────────────────────
    if (usuario.tipo === "empresa") {
      document.querySelectorAll(".solo-empresa").forEach(el => el.style.display = "block");
      document.querySelectorAll(".solo-admin").forEach(el => el.style.display = "none");      // ← NUEVO
      document.querySelectorAll(".solo-candidato").forEach(el => el.style.display = "none");  // ← NUEVO
      document.getElementById("tituloPagina").textContent = "Panel de Empresa";

      const nombreEmpresa = document.getElementById("nombreEmpresa");
      if (nombreEmpresa) nombreEmpresa.textContent = usuario.nombre;

      document.querySelectorAll(".btn-postular").forEach(btn => {
        btn.textContent = "Ver Postulantes";
        btn.style.background = "#f0a500";
      });
    }

    // ── ROL: ADMIN ────────────────────────────────────
    if (usuario.tipo === "admin") {
      document.querySelectorAll(".solo-admin").forEach(el => el.style.display = "block");
      document.querySelectorAll(".solo-empresa").forEach(el => el.style.display = "none");    // ← NUEVO
      document.querySelectorAll(".solo-candidato").forEach(el => el.style.display = "none");  // ← NUEVO
      document.getElementById("tituloPagina").textContent = "Panel de Administración";

      document.querySelectorAll(".btn-postular").forEach(btn => {
        btn.textContent = "Eliminar Vacante";
        btn.style.background = "#c0392b";
      });
    }

  } else {
    // ── SIN SESIÓN (INVITADO) ─────────────────────────
    document.querySelectorAll(".solo-invitado").forEach(el => el.style.display = "block");
    document.querySelectorAll(".solo-logueado").forEach(el => el.style.display = "none");

    document.querySelectorAll(".btn-postular").forEach(btn => {
      btn.addEventListener("click", () => {
        document.getElementById("avisoInvitado").style.display = "block";
      });
    });
  }
}

// ── CERRAR SESIÓN ────────────────────────────────────
document.getElementById("btnLogout").addEventListener("click", () => {
  sessionStorage.removeItem("sesionActiva");
  localStorage.removeItem("sesionActiva");
  window.location.href = "index.html";
});

// ── INIT ─────────────────────────────────────────────
aplicarRol();


