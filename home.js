// ── LEER SESIÓN ─────────────────────────────────────
const sesionActiva = sessionStorage.getItem("sesionActiva") || localStorage.getItem("sesionActiva");
const usuario = sesionActiva ? JSON.parse(sesionActiva) : null;

// ── APLICAR ROL ─────────────────────────────────────
function aplicarRol() {
  if (usuario) {
    // Primero, ocultar TODAS las secciones específicas por rol
    document.querySelectorAll(".solo-candidato").forEach(el => el.style.display = "none");
    document.querySelectorAll(".solo-empresa").forEach(el => el.style.display = "none");
    document.querySelectorAll(".solo-admin").forEach(el => el.style.display = "none");
    
    // Mostrar elementos para usuarios logueados
    document.querySelectorAll(".solo-logueado").forEach(el => el.style.display = "block");
    document.querySelectorAll(".solo-invitado").forEach(el => el.style.display = "none");
// ── ACTUALIZAR BIENVENIDA Y COLOR DEL MARCO ────────────
const infoUsuario = document.getElementById("infoUsuario");
const nombreUsuario = document.getElementById("nombreUsuario");

if (infoUsuario && nombreUsuario) {
  // Capitalizar primera letra del tipo de usuario
  const tipoUsuario = usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1);
  nombreUsuario.textContent = `¡Hola ${tipoUsuario}!`;
  
  // Cambiar color del marco según el rol
  switch(usuario.tipo) {
    case "admin":
      infoUsuario.style.borderColor = "red";
      break;
    case "candidato":
      infoUsuario.style.borderColor = "blue";
      break;
    case "empresa":
      infoUsuario.style.borderColor = "green"; // Color para empresa (opcional)
      break;
    default:
      infoUsuario.style.borderColor = "gray";
  }
}



    // ── ROL: CANDIDATO ────────────────────────────────
    if (usuario.tipo === "candidato") {
      // Mostrar SOLO las secciones de candidato
      document.querySelectorAll(".solo-candidato").forEach(el => el.style.display = "block");
      document.getElementById("tituloPagina").textContent = `Bienvenido/a, ${usuario.nombre}`;

      document.querySelectorAll(".btn-postular").forEach(btn => {
        // Remover event listeners anteriores para evitar duplicados
        btn.replaceWith(btn.cloneNode(true));
      });
      
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
      // Mostrar SOLO las secciones de empresa
      document.querySelectorAll(".solo-empresa").forEach(el => el.style.display = "block");
      document.getElementById("tituloPagina").textContent = "Panel de Empresa";

      document.querySelectorAll(".btn-postular").forEach(btn => {
        btn.textContent = "Ver Postulantes";
        btn.style.background = "#f0a500";
      });
    }

    // ── ROL: ADMIN ────────────────────────────────────
    if (usuario.tipo === "admin") {
      // Mostrar SOLO las secciones de admin
      document.querySelectorAll(".solo-admin").forEach(el => el.style.display = "block");
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
    document.querySelectorAll(".solo-candidato").forEach(el => el.style.display = "none");
    document.querySelectorAll(".solo-empresa").forEach(el => el.style.display = "none");
    document.querySelectorAll(".solo-admin").forEach(el => el.style.display = "none");

// Restablecer el mensaje de bienvenida para invitados
const infoUsuario = document.getElementById("infoUsuario");
const nombreUsuario = document.getElementById("nombreUsuario");
if (infoUsuario && nombreUsuario) {
  infoUsuario.style.display = "none";
}


  }
}

// ── CERRAR SESIÓN ────────────────────────────────────
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    sessionStorage.removeItem("sesionActiva");
    localStorage.removeItem("sesionActiva");
    window.location.href = "index.html";
  });
}

// ── INIT ─────────────────────────────────────────────
// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  aplicarRol();
});
// ── CERRAR SESIÓN ────────────────────────────────────
function cerrarSesion() {
  sessionStorage.removeItem("sesionActiva");
  localStorage.removeItem("sesionActiva");
  window.location.href = "login.html";
}

// Agregar event listener al botón de logout (si existe)
document.addEventListener('DOMContentLoaded', function() {
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", cerrarSesion);
  }
});
