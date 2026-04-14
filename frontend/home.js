// ══════════════════════════════════════════════════════════════
//  home.js  —  Versión fusionada completa
//  Incluye: hamburguesa, Google Maps, animaciones modal CV,
//           tabla postulantes responsive, toast responsive
// ══════════════════════════════════════════════════════════════

// ── PROTECCIÓN DE RUTA ────────────────────────────────
(function protegerRuta() {
    const sesion = sessionStorage.getItem("sesionActiva") || localStorage.getItem("sesionActiva");
    if (!sesion) {
        window.location.replace("index.html");
    }
})();

const API = "https://proyecto-si-production.up.railway.app/api";

const sesionActiva = sessionStorage.getItem("sesionActiva") || localStorage.getItem("sesionActiva");
const usuario = sesionActiva ? JSON.parse(sesionActiva) : null;

function cerrarSesion() {
  sessionStorage.removeItem("sesionActiva");
  localStorage.removeItem("sesionActiva");
  window.location.href = "index.html";
}

// ══════════════════════════════════════════════════════════════
//  MENÚ HAMBURGUESA
// ══════════════════════════════════════════════════════════════
function initHamburger() {
  const hamburger   = document.getElementById("hamburger");
  const menuLateral = document.getElementById("menuLateral");
  const overlay     = document.getElementById("sidebarOverlay");

  if (!hamburger) return;

  hamburger.addEventListener("click", () => {
    const abierto = menuLateral.classList.toggle("abierto");
    hamburger.classList.toggle("open", abierto);
    overlay.classList.toggle("visible", abierto);
  });

  overlay.addEventListener("click", cerrarMenu);

  // Cerrar al hacer click en un enlace del menú en móvil
  document.querySelectorAll(".menu-lateral nav a").forEach(a => {
    a.addEventListener("click", () => {
      if (window.innerWidth <= 768) cerrarMenu();
    });
  });
}

function cerrarMenu() {
  document.getElementById("menuLateral")?.classList.remove("abierto");
  document.getElementById("hamburger")?.classList.remove("open");
  document.getElementById("sidebarOverlay")?.classList.remove("visible");
}

// ══════════════════════════════════════════════════════════════
//  NAVEGACIÓN
// ══════════════════════════════════════════════════════════════
function irAInicio() {
  document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
  document.querySelectorAll(".menu-lateral nav a").forEach(a => a.classList.remove("activo"));
  document.getElementById("sec-inicio")?.classList.add("activa");
}

function mostrarSeccion(id, el) {
  const soloAdmin     = ["gestionar-usuarios", "verificar-empresas"];
  const soloCandidato = ["mi-cv", "mis-postulaciones"];
  const soloEmpresa   = ["publicar-vacante", "mis-vacantes"];

  if (usuario) {
    if (id === "empresas" && usuario?.tipo === "empresa") { irAInicio(); return; }
    if (soloAdmin.includes(id)     && usuario.tipo !== "admin")     { irAInicio(); return; }
    if (soloCandidato.includes(id) && usuario.tipo !== "candidato") { irAInicio(); return; }
    if (soloEmpresa.includes(id)   && usuario.tipo !== "empresa")   { irAInicio(); return; }
  } else {
    if (!["inicio", "vacantes", "empresas"].includes(id)) { irAInicio(); return; }
  }

  document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
  document.querySelectorAll(".menu-lateral nav a").forEach(a => a.classList.remove("activo"));
  document.getElementById("sec-" + id)?.classList.add("activa");
  if (el) el.classList.add("activo");

  if (id === "vacantes")                                         cargarVacantes();
  if (id === "mis-vacantes"  && usuario?.tipo === "empresa")     cargarMisVacantes();
  if (id === "empresas")                                         cargarEmpresasAprobadas();
  if (id === "verificar-empresas" && usuario?.tipo === "admin")  cargarEmpresasPendientes();
  if (id === "gestionar-usuarios" && usuario?.tipo === "admin")  cargarUsuarios();
  if (id === "mi-perfil")                                        actualizarPerfil();
  if (id === "mi-cv")                                            cargarCV();
  if (id === "mis-postulaciones")                                cargarMisPostulaciones();
}

// ══════════════════════════════════════════════════════════════
//  APLICAR ROL
// ══════════════════════════════════════════════════════════════
function aplicarRol() {
  document.querySelectorAll(".solo-logueado, .solo-candidato, .solo-empresa, .solo-admin")
    .forEach(el => el.style.display = "none");
  document.querySelectorAll(".solo-invitado").forEach(el => el.style.display = "none");

  document.getElementById("bloque-consejos").style.display       = "none";
  document.getElementById("bloque-admin-inicio").style.display   = "none";
  document.getElementById("bloque-empresa-inicio").style.display = "none";

  if (!usuario) {
    document.querySelectorAll(".solo-invitado").forEach(el => el.style.display = "block");
    document.getElementById("bloque-consejos").style.display = "block";
    const infoUsuario = document.getElementById("infoUsuario");
    if (infoUsuario) infoUsuario.style.display = "none";
    return;
  }

  document.querySelectorAll(".solo-logueado").forEach(el => {
    el.style.display = el.tagName === "A" ? "flex" : "block";
  });

  const nombreUsuarioEl = document.getElementById("nombreUsuario");
  const correoUsuarioEl = document.getElementById("correoUsuario");
  const badge           = document.getElementById("badgeRol");
  const infoUsuario     = document.getElementById("infoUsuario");

  if (nombreUsuarioEl) nombreUsuarioEl.textContent = usuario.nombre;
  if (correoUsuarioEl) correoUsuarioEl.textContent  = usuario.correo;
  if (badge) {
    badge.textContent = usuario.tipo;
    badge.className   = `badge-rol badge-${usuario.tipo}`;
  }
  if (infoUsuario) {
    const colores = { admin: "red", candidato: "blue", empresa: "green" };
    infoUsuario.style.borderColor = colores[usuario.tipo] || "gray";
  }

  document.querySelectorAll(".solo-candidato").forEach(el => el.style.display = "none");
  document.querySelectorAll(".solo-empresa").forEach(el   => el.style.display = "none");
  document.querySelectorAll(".solo-admin").forEach(el     => el.style.display = "none");

  if (usuario.tipo === "candidato") {
    document.querySelectorAll(".solo-candidato").forEach(el => {
      el.style.display = el.tagName === "A" ? "flex" : "block";
    });
    document.getElementById("tituloPagina").innerHTML =
      `<i class="fa-solid fa-user-check"></i> Bienvenido/a, ${usuario.nombre}`;
    document.getElementById("subtituloPagina").textContent =
      "Encuentra tu próxima oportunidad y postúlate a las vacantes disponibles.";
    document.getElementById("bloque-consejos").style.display = "block";
  }

  if (usuario.tipo === "empresa") {
    document.querySelectorAll(".solo-empresa").forEach(el => {
      el.style.display = el.tagName === "A" ? "flex" : "block";
    });
    document.querySelector('[onclick*="mostrarSeccion(\'empresas\'"]')?.style.setProperty("display", "none", "important");
    document.getElementById("tituloPagina").innerHTML =
      `<i class="fa-solid fa-building"></i> Bienvenido/a, ${usuario.nombre}`;
    document.getElementById("subtituloPagina").textContent =
      "Gestiona tus vacantes y encuentra al candidato ideal para tu empresa.";
    document.getElementById("bloque-empresa-inicio").style.display = "block";
    cargarVacantesEmpresaInicio();
  }

  if (usuario.tipo === "admin") {
    document.querySelectorAll(".solo-admin").forEach(el => {
      el.style.display = el.tagName === "A" ? "flex" : "block";
    });
    document.getElementById("tituloPagina").innerHTML =
      `<i class="fa-solid fa-shield-halved"></i> Panel de Administrador`;
    document.getElementById("subtituloPagina").textContent =
      `Bienvenido/a, ${usuario.nombre}. Gestiona usuarios, empresas y el contenido de la plataforma.`;
    document.getElementById("bloque-admin-inicio").style.display = "block";
  }
}

// ══════════════════════════════════════════════════════════════
//  PERFIL
// ══════════════════════════════════════════════════════════════
function actualizarPerfil() {
  if (!usuario) return;
  document.getElementById("perfilAvatar").textContent  = usuario.nombre.charAt(0).toUpperCase();
  document.getElementById("perfilNombre").textContent  = usuario.nombre;
  document.getElementById("perfilCorreo").textContent  = usuario.correo;
  document.getElementById("perfilRol").textContent     = usuario.tipo;
  document.getElementById("perfilCorreo2").textContent = usuario.correo;
}

// ══════════════════════════════════════════════════════════════
//  VACANTES PÚBLICAS
// ══════════════════════════════════════════════════════════════
async function cargarVacantes() {
  const contenedor = document.getElementById("lista-vacantes");
  if (!contenedor) return;
  contenedor.innerHTML = `<p style="color:#888;padding:16px;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando vacantes...</p>`;

  try {
    const url = usuario?.tipo === "empresa" ? `${API}/vacantes/empresa/${usuario.id}` : `${API}/vacantes/todas`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const vacantes = await res.json();

    let idsPostuladas = [];
    if (usuario?.tipo === "candidato") {
      try {
        const resP = await fetch(`${API}/vacantes/candidato/${usuario.id}`);
        const postuladas = await resP.json();
        idsPostuladas = postuladas.map(v => String(v._id));
      } catch(e) { idsPostuladas = []; }
    }

    const vacantesFiltradas = usuario?.tipo === "candidato"
      ? vacantes.filter(v => !idsPostuladas.includes(String(v._id)))
      : vacantes;

    if (!vacantesFiltradas.length) {
      contenedor.innerHTML = `<p style="color:#888;padding:16px;">No hay vacantes disponibles por el momento.</p>`;
      return;
    }

    const esCandidato = usuario?.tipo === "candidato";

    contenedor.innerHTML = `<div class="vacantes">${vacantesFiltradas.map(v => `
      <div class="card" id="vac-pub-${v._id}">
        <h3>${v.titulo}</h3>
        <p><strong>Empresa:</strong> ${v.empresaNombre}</p>
        <p><strong>Ubicación:</strong> ${v.ubicacion}</p>
        <p><strong>Salario:</strong> ${v.salario}</p>
        <p><strong>Contrato:</strong> ${v.tipoContrato}</p>
        ${v.descripcion ? `<p style="font-size:13px;color:#555;margin-top:6px;line-height:1.5;">${v.descripcion}</p>` : ""}
        ${esCandidato ? `
          <button class="btn-postular" onclick="postularse('${v._id}', this)">
            <i class="fa-solid fa-paper-plane"></i> Postularme
          </button>` : ""}
        ${usuario?.tipo === "empresa" && v.empresaNombre === usuario.nombre ? `
          <button onclick="editarVacante('${v._id}',
                    '${v.titulo.replace(/'/g,"\\'")}',
                    '${v.ubicacion.replace(/'/g,"\\'")}',
                    '${v.salario.replace(/'/g,"\\'")}',
                    '${v.tipoContrato}',
                    '${v.descripcion.replace(/'/g,"\\'")}')"
            style="background:#1E56A0;color:#fff;border:none;padding:8px 14px;border-radius:6px;font-size:13px;cursor:pointer;margin-top:8px;">
            <i class="fa-solid fa-pen"></i> Editar
          </button>` : ""}
      </div>
    `).join("")}</div>`;

  } catch (err) {
    contenedor.innerHTML = `<p style="color:#c0392b;padding:16px;"><i class="fa-solid fa-triangle-exclamation"></i> Error al cargar vacantes.</p>`;
  }
}

// ══════════════════════════════════════════════════════════════
//  POSTULARSE
// ══════════════════════════════════════════════════════════════
async function postularse(vacanteId, btn) {
  if (!usuario) { window.location.href = "index.html"; return; }
  btn.disabled  = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

  try {
    const res  = await fetch(`${API}/vacantes/${vacanteId}/postular`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidatoId: usuario.id, nombre: usuario.nombre, correo: usuario.correo })
    });
    const data = await res.json();

    if (res.ok) {
      btn.innerHTML        = '<i class="fa-solid fa-circle-check"></i> Postulado';
      btn.style.background = "#28a745";
      mostrarToast("✅ ¡Postulación enviada correctamente!", "exito");
      setTimeout(() => btn.closest('.card')?.remove(), 1000);
    } else {
      btn.disabled  = false;
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Postularme';
      mostrarToast(data.error || "Error al postularse", "error");
    }
  } catch (err) {
    btn.disabled  = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Postularme';
    mostrarToast("Error de conexión", "error");
  }
}

// ══════════════════════════════════════════════════════════════
//  EDITAR VACANTE
// ══════════════════════════════════════════════════════════════
async function editarVacante(id, titulo, ubicacion, salario, contrato, descripcion) {
  const card = document.getElementById(`vac-pub-${id}`);
  if (!card) return;

  if (card.querySelector('.form-editar')) {
    card.querySelector('.form-editar').remove();
    return;
  }

  const formHTML = `
    <div class="form-editar" style="margin-top:12px;border-top:1px solid #e0e6ef;padding-top:12px;display:flex;flex-direction:column;gap:8px;">
      <label style="font-size:12px;font-weight:600;color:#1a2a4a;">Título</label>
      <input id="edit-titulo-${id}" value="${titulo}" style="padding:8px;border:1px solid #ccc;border-radius:6px;font-size:13px;">
      <label style="font-size:12px;font-weight:600;color:#1a2a4a;">Ubicación</label>
      <input id="edit-ubicacion-${id}" value="${ubicacion}" style="padding:8px;border:1px solid #ccc;border-radius:6px;font-size:13px;">
      <label style="font-size:12px;font-weight:600;color:#1a2a4a;">Salario</label>
      <input id="edit-salario-${id}" value="${salario}" style="padding:8px;border:1px solid #ccc;border-radius:6px;font-size:13px;">
      <label style="font-size:12px;font-weight:600;color:#1a2a4a;">Tipo de contrato</label>
      <select id="edit-contrato-${id}" style="padding:8px;border:1px solid #ccc;border-radius:6px;font-size:13px;">
        <option ${contrato==='Tiempo completo'?'selected':''}>Tiempo completo</option>
        <option ${contrato==='Medio tiempo'?'selected':''}>Medio tiempo</option>
        <option ${contrato==='Por proyecto'?'selected':''}>Por proyecto</option>
        <option ${contrato==='Freelance'?'selected':''}>Freelance</option>
      </select>
      <label style="font-size:12px;font-weight:600;color:#1a2a4a;">Descripción</label>
      <textarea id="edit-descripcion-${id}" style="padding:8px;border:1px solid #ccc;border-radius:6px;font-size:13px;min-height:80px;">${descripcion}</textarea>
      <div style="display:flex;gap:8px;">
        <button onclick="guardarEdicionVacante('${id}')"
          style="background:#1a7a4a;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-size:13px;cursor:pointer;">
          <i class="fa-solid fa-floppy-disk"></i> Guardar
        </button>
        <button onclick="document.querySelector('#vac-pub-${id} .form-editar').remove()"
          style="background:#888;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-size:13px;cursor:pointer;">
          <i class="fa-solid fa-xmark"></i> Cancelar
        </button>
      </div>
    </div>`;

  card.insertAdjacentHTML('beforeend', formHTML);
}

async function guardarEdicionVacante(id) {
  const titulo      = document.getElementById(`edit-titulo-${id}`).value.trim();
  const ubicacion   = document.getElementById(`edit-ubicacion-${id}`).value.trim();
  const salario     = document.getElementById(`edit-salario-${id}`).value.trim();
  const contrato    = document.getElementById(`edit-contrato-${id}`).value;
  const descripcion = document.getElementById(`edit-descripcion-${id}`).value.trim();

  if (!titulo || !ubicacion || !salario)
    return mostrarToast("Completa los campos obligatorios", "error");

  try {
    const res = await fetch(`${API}/vacantes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, ubicacion, salario, tipoContrato: contrato, descripcion })
    });
    if (res.ok) {
      mostrarToast("✅ Vacante actualizada correctamente", "exito");
      cargarVacantes();
    } else {
      mostrarToast("Error al guardar cambios", "error");
    }
  } catch (err) {
    mostrarToast("Error de conexión", "error");
  }
}

// ══════════════════════════════════════════════════════════════
//  PUBLICAR VACANTE
// ══════════════════════════════════════════════════════════════
async function publicarVacante(e) {
  e.preventDefault();

  const titulo       = document.getElementById("inp-titulo").value.trim();
  const ubicacion    = document.getElementById("inp-ubicacion").value.trim();
  const salario      = document.getElementById("inp-salario").value.trim();
  const tipoContrato = document.getElementById("inp-contrato").value;
  const descripcion  = document.getElementById("inp-descripcion").value.trim();

  if (!titulo || !ubicacion || !salario || !descripcion)
    return mostrarToast("Completa todos los campos obligatorios", "error");

  const btn = document.getElementById("btn-publicar-vacante");
  btn.disabled  = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publicando...';

  try {
    const res  = await fetch(`${API}/vacantes/publicar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo, ubicacion, salario, tipoContrato, descripcion,
        empresaId:     usuario.id,
        empresaNombre: usuario.nombre
      })
    });
    const data = await res.json();

    if (res.ok) {
      mostrarToast("✅ Vacante publicada correctamente", "exito");
      document.getElementById("form-publicar-vacante").reset();
      cargarVacantesEmpresaInicio();
    } else {
      mostrarToast(data.error || "Error al publicar", "error");
    }
  } catch (err) {
    mostrarToast("Error de conexión", "error");
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Publicar Vacante';
  }
}

// ══════════════════════════════════════════════════════════════
//  MIS VACANTES
// ══════════════════════════════════════════════════════════════
async function cargarMisVacantes() {
  const contenedor = document.getElementById("lista-mis-vacantes");
  if (!contenedor) return;
  contenedor.innerHTML = `<p style="color:#888;padding:16px;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando tus vacantes...</p>`;

  try {
    const res     = await fetch(`${API}/vacantes/empresa/${usuario.id}`);
    if (!res.ok) throw new Error();
    const vacantes = await res.json();

    if (!vacantes.length) {
      contenedor.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:#888;">
          <i class="fa-solid fa-folder-open" style="font-size:36px;display:block;margin-bottom:12px;"></i>
          <strong>No has publicado vacantes aún.</strong><br>
          <small>Ve a "Publicar Vacante" para agregar una.</small>
        </div>`;
      return;
    }

    contenedor.innerHTML = vacantes.map(v => `
      <div class="vacante-admin" id="mis-vac-${v._id}" style="flex-direction:column;align-items:flex-start;gap:10px;">
        <div style="display:flex;justify-content:space-between;width:100%;align-items:flex-start;flex-wrap:wrap;gap:8px;">
          <div>
            <h4>${v.titulo}</h4>
            <p>${v.ubicacion} · ${v.salario} · <em>${v.tipoContrato}</em></p>
            <small style="color:#666;">${v.descripcion}</small>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button style="background:#1E56A0;color:#fff;border:none;padding:8px 14px;border-radius:6px;font-size:13px;cursor:pointer;"
                    onclick="verPostulantes('${v._id}', '${v.titulo.replace(/'/g,"\\'")}')">
              <i class="fa-solid fa-users"></i> Postulantes (${v.postulantes?.length || 0})
            </button>
            <button class="btn-eliminar" style="padding:8px 14px;font-size:13px;"
                    onclick="eliminarVacante('${v._id}', '${v.titulo.replace(/'/g,"\\'")}')">
              <i class="fa-solid fa-trash"></i> Eliminar
            </button>
          </div>
        </div>
        <div id="postulantes-${v._id}" style="display:none;width:100%;"></div>
      </div>
    `).join("");

  } catch (err) {
    contenedor.innerHTML = `<p style="color:#c0392b;padding:16px;">Error al cargar tus vacantes.</p>`;
  }
}

async function verPostulantes(vacanteId, titulo) {
  const panel = document.getElementById(`postulantes-${vacanteId}`);
  if (!panel) return;

  if (panel.style.display === "block") { panel.style.display = "none"; return; }

  panel.style.display = "block";
  panel.innerHTML = `<p style="color:#888;font-size:13px;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando postulantes...</p>`;

  try {
    const res  = await fetch(`${API}/vacantes/${vacanteId}/postulantes`);
    const data = await res.json();

    if (!data.postulantes?.length) {
      panel.innerHTML = `<p style="color:#888;font-size:13px;padding:8px 0;"><i class="fa-solid fa-user-slash"></i> Aún no hay postulantes para esta vacante.</p>`;
      return;
    }

    panel.innerHTML = `
      <div style="border-top:1px solid #e0e6ef;padding-top:10px;margin-top:4px;">
        <p style="font-size:13px;font-weight:600;color:#1a2a4a;margin-bottom:8px;">
          <i class="fa-solid fa-users"></i> Postulantes para "${titulo}":
        </p>
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:400px;">
            <thead>
              <tr style="background:#f0f4fa;">
                <th style="padding:8px 12px;text-align:left;">Nombre</th>
                <th style="padding:8px 12px;text-align:left;">Correo</th>
                <th style="padding:8px 12px;text-align:left;">Fecha</th>
                <th style="padding:8px 12px;text-align:left;">CV</th>
              </tr>
            </thead>
            <tbody>
              ${data.postulantes.map(p => `
                <tr style="border-bottom:1px solid #e0e6ef;">
                  <td style="padding:8px 12px;">${p.nombre}</td>
                  <td style="padding:8px 12px;"><a href="mailto:${p.correo}" style="color:#1E56A0;">${p.correo}</a></td>
                  <td style="padding:8px 12px;color:#888;">${new Date(p.fechaPostulacion).toLocaleDateString("es-MX")}</td>
                  <td style="padding:8px 12px;">
                    <button onclick="verCVCandidato('${p.candidatoId}')"
                      style="background:#1a7a4a;color:#fff;border:none;padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;">
                      <i class="fa-solid fa-file-lines"></i> Ver CV
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>`;

  } catch (err) {
    panel.innerHTML = `<p style="color:#c0392b;font-size:13px;">Error al cargar postulantes.</p>`;
  }
}

async function eliminarVacante(id, titulo) {
  if (!confirm(`¿Eliminar la vacante "${titulo}"?`)) return;
  try {
    const res = await fetch(`${API}/vacantes/${id}`, { method: "DELETE" });
    if (res.ok) {
      const item = document.getElementById(`mis-vac-${id}`);
      if (item) { item.style.opacity = "0"; setTimeout(() => { item.remove(); checkListaVacia("lista-mis-vacantes", "vacante-admin", "No tienes vacantes publicadas."); }, 300); }
      mostrarToast(`🗑️ Vacante "${titulo}" eliminada`, "error");
      cargarVacantesEmpresaInicio();
    }
  } catch (err) { mostrarToast("Error de conexión", "error"); }
}

async function cargarVacantesEmpresaInicio() {
  const bloque = document.getElementById("lista-vacantes-inicio-empresa");
  if (!bloque) return;
  try {
    const res     = await fetch(`${API}/vacantes/empresa/${usuario.id}`);
    const vacantes = await res.json();
    if (!vacantes.length) { bloque.innerHTML = `<p style="color:#888;font-size:13px;">No has publicado vacantes aún.</p>`; return; }
    bloque.innerHTML = vacantes.map(v => `
      <div class="vacante-admin" style="margin-bottom:8px;">
        <div><h4>${v.titulo}</h4><p>${v.ubicacion} · ${v.salario}</p></div>
        <span style="font-size:12px;color:#1E56A0;font-weight:600;">
          <i class="fa-solid fa-users"></i> ${v.postulantes?.length || 0} postulante(s)
        </span>
      </div>
    `).join("");
  } catch (err) { bloque.innerHTML = `<p style="color:#c0392b;font-size:13px;">Error al cargar.</p>`; }
}

// ══════════════════════════════════════════════════════════════
//  EMPRESAS APROBADAS + GOOGLE MAPS
// ══════════════════════════════════════════════════════════════
async function cargarEmpresasAprobadas() {
  const contenedor = document.getElementById("lista-empresas");
  if (!contenedor) return;
  contenedor.innerHTML = `<p style="color:#888;padding:16px;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando empresas...</p>`;
  try {
    const res     = await fetch(`${API}/empresas/aprobadas`);
    if (!res.ok) throw new Error();
    const empresas = await res.json();
    if (!empresas.length) { contenedor.innerHTML = `<p style="color:#888;padding:16px;">No hay empresas registradas aún.</p>`; return; }
    const esAdmin = usuario?.tipo === "admin";
    contenedor.innerHTML = empresas.map(emp => {
      const direccion = emp.direccion || "";
      const mapsQuery = encodeURIComponent(direccion || emp.nombre);
      return `
        <div class="empresa-card" id="empresa-aprobada-${emp._id}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
            <div>
              <h4>${emp.nombre} <span class="badge-verificada"><i class="fa-solid fa-circle-check"></i> Verificada</span></h4>
              <p class="emp-info"><a href="mailto:${emp.correo}" style="color:#1E56A0;">${emp.correo}</a></p>
              ${emp.telefono ? `<p class="emp-info"><i class="fa-solid fa-phone" style="color:#888;font-size:11px;"></i> ${emp.telefono}</p>` : ""}
              ${direccion ? `
                <button class="empresa-direccion-link" onclick="abrirGoogleMaps('${mapsQuery}')">
                  <i class="fa-solid fa-location-dot"></i> ${direccion}
                </button>
                <br>
                <button class="btn-ver-mapa" onclick="toggleMapa('mapa-${emp._id}', '${mapsQuery}')">
                  <i class="fa-solid fa-map"></i> Ver en mapa
                </button>
                <div class="mapa-container" id="mapa-${emp._id}"></div>
              ` : `<p class="emp-info" style="color:#aaa;font-style:italic;">Sin dirección registrada</p>`}
            </div>
            ${esAdmin ? `
              <button class="btn-eliminar" style="padding:8px 14px;font-size:13px;"
                      onclick="darDeBajaEmpresa('${emp._id}', '${emp.nombre}')">
                <i class="fa-solid fa-building-circle-xmark"></i> Dar de baja
              </button>` : ""}
          </div>
        </div>
      `;
    }).join("");
  } catch (err) { contenedor.innerHTML = `<p style="color:#c0392b;padding:16px;">Error al cargar empresas.</p>`; }
}

function abrirGoogleMaps(query) {
  window.open(`https://www.google.com/maps/search/${query}`, "_blank");
}

function toggleMapa(mapaId, query) {
  const div = document.getElementById(mapaId);
  if (!div) return;

  if (div.classList.contains("visible")) {
    div.classList.remove("visible");
    div.innerHTML = "";
    return;
  }

  div.classList.add("visible");
  div.innerHTML = `<iframe src="https://www.google.com/maps?q=${query}&output=embed" allowfullscreen></iframe>`;
}

async function darDeBajaEmpresa(id, nombre) {
  if (!confirm(`¿Dar de baja a "${nombre}"?`)) return;
  try {
    const res = await fetch(`${API}/empresas/rechazar/${id}`, { method: "DELETE" });
    if (res.ok) {
      const item = document.getElementById(`empresa-aprobada-${id}`);
      if (item) { item.style.opacity = "0"; setTimeout(() => item.remove(), 400); }
      mostrarToast(`🏢 "${nombre}" dada de baja`, "error");
    }
  } catch (err) { mostrarToast("Error de conexión", "error"); }
}

// ══════════════════════════════════════════════════════════════
//  EMPRESAS PENDIENTES
// ══════════════════════════════════════════════════════════════
async function cargarEmpresasPendientes() {
  const contenedor = document.getElementById("lista-empresas-pendientes");
  if (!contenedor) return;
  contenedor.innerHTML = `<p style="color:#888;padding:16px;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando...</p>`;
  try {
    const res  = await fetch(`${API}/admin/empresas-pendientes`);
    const data = await res.json();
    if (!res.ok) { contenedor.innerHTML = `<p style="color:#c0392b;">Error al cargar.</p>`; return; }
    if (data.total === 0) {
      contenedor.innerHTML = `<div style="text-align:center;padding:40px 20px;color:#888;"><i class="fa-solid fa-circle-check" style="font-size:40px;color:#28a745;display:block;margin-bottom:12px;"></i><strong>No hay empresas pendientes.</strong></div>`;
      return;
    }
    contenedor.innerHTML = "";
    data.empresas.forEach(empresa => {
      const fecha = empresa.createdAt ? new Date(empresa.createdAt).toLocaleDateString("es-MX") : "—";
      const item  = document.createElement("div");
      item.className = "empresa-item"; item.id = `empresa-${empresa._id}`;
      item.innerHTML = `
        <div>
          <h4>${empresa.nombre}</h4><p>Registrada el ${fecha}</p>
          <small style="color:#888;">${empresa.correo}</small>
          ${empresa.telefono  ? `<br><small style="color:#888;">Tel: ${empresa.telefono}</small>`  : ""}
          ${empresa.direccion ? `<br><small style="color:#888;">${empresa.direccion}</small>` : ""}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn-verificar" onclick="verificarEmpresa('${empresa._id}', this)">
            <i class="fa-solid fa-check"></i> Verificar
          </button>
          <button class="btn-eliminar" style="padding:8px 14px;font-size:13px;"
                  onclick="rechazarEmpresa('${empresa._id}', '${empresa.nombre}')">
            <i class="fa-solid fa-xmark"></i> Rechazar
          </button>
        </div>`;
      contenedor.appendChild(item);
    });
  } catch (err) { contenedor.innerHTML = `<p style="color:#c0392b;padding:16px;">No se pudo conectar.</p>`; }
}

async function verificarEmpresa(id, btn) {
  btn.disabled = true; btn.textContent = "Verificando...";
  try {
    const res  = await fetch(`${API}/admin/aprobar/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" } });
    const data = await res.json();
    if (res.ok) {
      const item = document.getElementById(`empresa-${id}`);
      if (item) { item.style.opacity = "0"; setTimeout(() => { item.remove(); checkListaVacia("lista-empresas-pendientes", "empresa-item", "Todas las empresas han sido verificadas."); }, 400); }
      mostrarToast(`✅ ${data.empresa?.nombre || "Empresa"} verificada`, "exito");
    } else {
      btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-check"></i> Verificar';
      mostrarToast(data.message || "Error", "error");
    }
  } catch (err) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-check"></i> Verificar'; mostrarToast("Error de conexión", "error"); }
}

async function rechazarEmpresa(id, nombre) {
  if (!confirm(`¿Rechazar "${nombre}"?`)) return;
  try {
    const res = await fetch(`${API}/empresas/rechazar/${id}`, { method: "DELETE" });
    if (res.ok) {
      const item = document.getElementById(`empresa-${id}`);
      if (item) { item.style.opacity = "0"; setTimeout(() => { item.remove(); checkListaVacia("lista-empresas-pendientes", "empresa-item", "No hay empresas pendientes."); }, 400); }
      mostrarToast(`🗑️ "${nombre}" rechazada`, "error");
    }
  } catch (err) { mostrarToast("Error de conexión", "error"); }
}

// ══════════════════════════════════════════════════════════════
//  GESTIONAR USUARIOS
// ══════════════════════════════════════════════════════════════
async function cargarUsuarios() {
  const tbody = document.getElementById("tbody-usuarios");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="4" style="color:#888;padding:16px;text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando...</td></tr>`;
  try {
    const res  = await fetch(`${API}/users/todos`);
    const lista = await res.json();
    if (!lista.length) { tbody.innerHTML = `<tr><td colspan="4" style="color:#888;padding:16px;text-align:center;">No hay usuarios.</td></tr>`; return; }
    tbody.innerHTML = lista
      .filter(u => u.tipo !== "admin")
      .map(u => `
        <tr id="user-${u._id}">
          <td>${u.nombre}</td><td>${u.correo}</td>
          <td><span class="badge-rol badge-${u.tipo}">${u.tipo}</span></td>
          <td><button class="btn-eliminar" style="padding:5px 12px;font-size:12px;"
                      onclick="eliminarUsuario('${u._id}', '${u.nombre}')">
            <i class="fa-solid fa-trash"></i> Eliminar
          </button></td>
        </tr>`).join("");
  } catch (err) { tbody.innerHTML = `<tr><td colspan="4" style="color:#c0392b;padding:16px;text-align:center;">Error al cargar usuarios.</td></tr>`; }
}

async function eliminarUsuario(id, nombre) {
  if (!confirm(`¿Eliminar a "${nombre}"?`)) return;
  try {
    const res = await fetch(`${API}/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      const fila = document.getElementById(`user-${id}`);
      if (fila) { fila.style.opacity = "0"; setTimeout(() => fila.remove(), 300); }
      mostrarToast(`🗑️ "${nombre}" eliminado`, "error");
    }
  } catch (err) { mostrarToast("Error de conexión", "error"); }
}

// ══════════════════════════════════════════════════════════════
//  CV CANDIDATO
// ══════════════════════════════════════════════════════════════
async function cargarCV() {
  if (!usuario) return;
  try {
    const res  = await fetch(`${API}/users/cv/${usuario.id}`);
    const data = await res.json();
    if (data.cv) {
      document.getElementById("cv-nombre").value      = data.cv.nombreCompleto || "";
      document.getElementById("cv-telefono").value    = data.cv.telefono       || "";
      document.getElementById("cv-habilidades").value = data.cv.habilidades    || "";
      document.getElementById("cv-experiencia").value = data.cv.experiencia    || "";
    }
  } catch (err) { console.error("Error al cargar CV:", err); }
}

async function guardarCV() {
  if (!usuario) return;
  const nombreCompleto = document.getElementById("cv-nombre").value.trim();
  const telefono       = document.getElementById("cv-telefono").value.trim();
  const habilidades    = document.getElementById("cv-habilidades").value.trim();
  const experiencia    = document.getElementById("cv-experiencia").value.trim();

  if (!nombreCompleto) return mostrarToast("El nombre es obligatorio", "error");

  try {
    const res = await fetch(`${API}/users/cv/${usuario.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombreCompleto, telefono, habilidades, experiencia })
    });
    if (res.ok) mostrarToast("✅ CV guardado correctamente", "exito");
    else mostrarToast("Error al guardar CV", "error");
  } catch (err) { mostrarToast("Error de conexión", "error"); }
}

// ══════════════════════════════════════════════════════════════
//  VER CV CANDIDATO — Modal con animaciones
// ══════════════════════════════════════════════════════════════
async function verCVCandidato(candidatoId) {
  try {
    const res  = await fetch(`${API}/users/cv/${candidatoId}`);
    const data = await res.json();

    if (!data.cv || !data.cv.nombreCompleto) {
      mostrarToast("Este candidato aún no ha subido su CV", "error");
      return;
    }

    const nombreCompleto = data.cv.nombreCompleto || data.nombre || "?";
    const iniciales = nombreCompleto.split(" ").slice(0, 2).map(p => p[0].toUpperCase()).join("");

    const habilidadesRaw = data.cv.habilidades || "";
    const habilidadesArr = habilidadesRaw
      ? habilidadesRaw.split(/,|\n/).map(h => h.trim()).filter(h => h.length > 0)
      : [];
    const habilidadesHTML = habilidadesArr.length
      ? habilidadesArr.map(h => `
          <span style="background:#e8f0fb;color:#1E56A0;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;display:inline-block;">${h}</span>`).join("")
      : `<span style="font-size:13px;color:#999;font-style:italic;">Sin habilidades registradas.</span>`;

    const experienciaHTML = data.cv.experiencia
      ? `<p style="font-size:13.5px;color:#444;line-height:1.7;margin:0;white-space:pre-wrap;">${data.cv.experiencia}</p>`
      : `<p style="font-size:13px;color:#999;font-style:italic;margin:0;">Sin experiencia registrada.</p>`;

    // Inyectar animaciones CSS solo una vez
    if (!document.getElementById("modal-cv-styles")) {
      const style = document.createElement("style");
      style.id = "modal-cv-styles";
      style.textContent = `
        #modal-cv { animation: fadeInModal 0.2s ease; }
        @keyframes fadeInModal {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        #modal-cv .cv-inner { animation: slideUpModal 0.22s ease; }
        @keyframes slideUpModal {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        #modal-cv .cv-close-btn:hover  { background: rgba(255,255,255,0.25) !important; }
        #modal-cv .cv-action-btn:hover { background: #0d1f4a !important; }
        #modal-cv .cv-cancel-btn:hover { background: #e8ecf3 !important; }
      `;
      document.head.appendChild(style);
    }

    const modal = document.createElement("div");
    modal.id = "modal-cv";
    modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(10,20,50,0.55);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;`;

    modal.innerHTML = `
      <div class="cv-inner" style="background:#fff;border-radius:18px;width:100%;max-width:500px;box-shadow:0 24px 60px rgba(10,20,50,0.25);overflow:hidden;position:relative;">

        <div style="background:linear-gradient(135deg,#0d1f4a 0%,#163172 50%,#1E56A0 100%);padding:26px 28px 22px;position:relative;">
          <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.06);pointer-events:none;"></div>
          <button class="cv-close-btn" onclick="document.getElementById('modal-cv').remove()" style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.15);border:none;color:white;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:background 0.2s;line-height:1;">✕</button>
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="width:58px;height:58px;border-radius:50%;background:rgba(255,255,255,0.18);border:2px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:white;flex-shrink:0;letter-spacing:1px;">${iniciales}</div>
            <div>
              <p style="font-size:17px;font-weight:700;color:white;margin:0 0 3px;">${nombreCompleto}</p>
              <span style="background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.9);font-size:11px;font-weight:600;padding:2px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.6px;">Candidato</span>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #edf0f7;">
          <div style="padding:14px 20px;border-right:1px solid #edf0f7;">
            <p style="font-size:10.5px;color:#999;margin:0 0 3px;text-transform:uppercase;letter-spacing:0.7px;font-weight:600;">Teléfono</p>
            <p style="font-size:14px;color:#1a2a4a;margin:0;font-weight:600;">
              <i class="fa-solid fa-phone" style="color:#1E56A0;font-size:11px;margin-right:4px;"></i>${data.cv.telefono || "—"}
            </p>
          </div>
          <div style="padding:14px 20px;">
            <p style="font-size:10.5px;color:#999;margin:0 0 3px;text-transform:uppercase;letter-spacing:0.7px;font-weight:600;">Correo</p>
            <p style="font-size:13px;color:#1E56A0;margin:0;font-weight:600;word-break:break-all;">
              <i class="fa-solid fa-envelope" style="font-size:11px;margin-right:4px;"></i>${data.correo || "—"}
            </p>
          </div>
        </div>

        <div style="padding:20px 24px;display:flex;flex-direction:column;gap:18px;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
              <div style="width:4px;height:16px;background:#1E56A0;border-radius:2px;"></div>
              <p style="font-size:11px;font-weight:700;color:#888;margin:0;text-transform:uppercase;letter-spacing:0.8px;">Habilidades</p>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:7px;">${habilidadesHTML}</div>
          </div>
          <div style="border-top:1px solid #edf0f7;"></div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
              <div style="width:4px;height:16px;background:#1a7a4a;border-radius:2px;"></div>
              <p style="font-size:11px;font-weight:700;color:#888;margin:0;text-transform:uppercase;letter-spacing:0.8px;">Experiencia laboral</p>
            </div>
            <div style="background:#f6f8fd;border-radius:10px;padding:14px 16px;border:1px solid #e8edf6;">${experienciaHTML}</div>
          </div>
        </div>

        <div style="padding:14px 24px 18px;border-top:1px solid #edf0f7;display:flex;justify-content:flex-end;gap:10px;background:#f9fbff;">
          <button class="cv-cancel-btn" onclick="document.getElementById('modal-cv').remove()" style="padding:9px 20px;border-radius:8px;border:1px solid #d0daea;background:white;color:#555;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:background 0.2s;">Cerrar</button>
          <a href="mailto:${data.correo}" style="text-decoration:none;">
            <button class="cv-action-btn" style="padding:9px 20px;border-radius:8px;border:none;background:#163172;color:white;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:background 0.2s;display:flex;align-items:center;gap:7px;">
              <i class="fa-solid fa-envelope"></i> Contactar
            </button>
          </a>
        </div>

      </div>`;

    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });

  } catch (err) {
    mostrarToast("Error al cargar el CV", "error");
  }
}

// ══════════════════════════════════════════════════════════════
//  MIS POSTULACIONES
// ══════════════════════════════════════════════════════════════
async function cargarMisPostulaciones() {
  const contenedor = document.getElementById("sec-mis-postulaciones");
  if (!contenedor || !usuario) return;

  contenedor.innerHTML = `
    <h2><i class="fa-solid fa-paper-plane"></i> Mis Postulaciones</h2>
    <p style="color:#888;padding:16px;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando...</p>`;

  try {
    const res = await fetch(`${API}/vacantes/candidato/${usuario.id}`);
    const vacantes = await res.json();

    if (!vacantes.length) {
      contenedor.innerHTML = `
        <h2><i class="fa-solid fa-paper-plane"></i> Mis Postulaciones</h2>
        <div style="text-align:center;padding:40px 20px;color:#888;">
          <i class="fa-solid fa-paper-plane" style="font-size:36px;display:block;margin-bottom:12px;"></i>
          <strong>Aún no te has postulado a ninguna vacante.</strong>
        </div>`;
      return;
    }

    contenedor.innerHTML = `
      <h2><i class="fa-solid fa-paper-plane"></i> Mis Postulaciones</h2>
      <div class="vacantes">${vacantes.map(v => `
        <div class="card">
          <h3>${v.titulo}</h3>
          <p><strong>Empresa:</strong> ${v.empresaNombre}</p>
          <p><strong>Ubicación:</strong> ${v.ubicacion}</p>
          <p><strong>Salario:</strong> ${v.salario}</p>
          <p><strong>Contrato:</strong> ${v.tipoContrato}</p>
          <span style="display:inline-block;margin-top:8px;padding:4px 12px;background:#e8f8f2;color:#1a7a4a;border-radius:20px;font-size:12px;font-weight:600;">
            <i class="fa-solid fa-circle-check"></i> Postulado
          </span>
        </div>
      `).join("")}</div>`;

  } catch (err) {
    contenedor.innerHTML = `
      <h2><i class="fa-solid fa-paper-plane"></i> Mis Postulaciones</h2>
      <p style="color:#c0392b;padding:16px;">Error al cargar postulaciones.</p>`;
  }
}

// ══════════════════════════════════════════════════════════════
//  UTILIDADES
// ══════════════════════════════════════════════════════════════
function checkListaVacia(contenedorId, selector, mensaje) {
  const c = document.getElementById(contenedorId);
  if (c && !c.querySelector(`.${selector}`)) {
    c.innerHTML = `<div style="text-align:center;padding:40px 20px;color:#888;"><i class="fa-solid fa-circle-check" style="font-size:36px;color:#28a745;display:block;margin-bottom:12px;"></i><strong>${mensaje}</strong></div>`;
  }
}

function mostrarToast(mensaje, tipo) {
  const toast = document.createElement("div");
  toast.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;background:${tipo === "exito" ? "#1a7a4a" : "#c0392b"};color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,.25);opacity:0;transition:opacity 0.3s ease;max-width:calc(100vw - 48px);`;
  toast.textContent = mensaje;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.style.opacity = "1");
  setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ══════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  aplicarRol();
  initHamburger();

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) btnLogout.addEventListener("click", cerrarSesion);

  const formVacante = document.getElementById("form-publicar-vacante");
  if (formVacante) formVacante.addEventListener("submit", publicarVacante);

  if (document.getElementById("sec-vacantes")?.classList.contains("activa")) cargarVacantes();
  if (document.getElementById("sec-empresas")?.classList.contains("activa")) cargarEmpresasAprobadas();
});