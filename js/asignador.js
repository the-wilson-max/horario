// CONFIGURACIÓN
const PROFESORES = [
  "MANRIQUE",
  "AQUIJE",
  "GARCIA",
  "ROJAS",
  "MARITA",
  "MELVA",
  "TORRES",
  "YEREN",
  "BALDEON",
  "NAVARETE",
  "ZAIDA",
  "EDMUNDO",
  "CONSILLA",
  "OFELIA",
  "MANSILLA",
  "BULEJE",
];
const CURSO_COLOR_CLASE = {
  matemática: "celda-curso-matematica",
  comunicación: "celda-curso-comunicacion",
  "ciencia y tecnología": "celda-curso-cyt",
  inglés: "celda-curso-ingles",
  historia: "celda-curso-historia",
  arte: "celda-curso-arte",
  "educación física": "celda-curso-ef",
  religión: "celda-curso-religion",
  computación: "celda-curso-computacion",
  "educación cívica": "celda-curso-civica",
  tutoría: "celda-curso-tutoria",
  dpcc: "celda-curso-dpcc",
};
const CURSO_COLOR_CSS = {
  matemática: "--color-matematica",
  comunicación: "--color-comunicacion",
  "ciencia y tecnología": "--color-cyt",
  inglés: "--color-ingles",
  historia: "--color-historia",
  arte: "--color-arte",
  "educación física": "--color-ef",
  religión: "--color-religion",
  computación: "--color-computacion",
  "educación cívica": "--color-civica",
  tutoría: "--color-tutoria",
  dpcc: "--color-dpcc",
};
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const HORA_INICIO = 7 * 60 + 30; // 07:30 en minutos
const HORA_FIN = 13 * 60; // 13:00 en minutos
const BLOQUE_MINUTOS = 45;

let calendarBlocks = []; // [{dia, inicio, fin, profesor, curso}]

function minutosToStr(m) {
  let h = Math.floor(m / 60);
  let mm = m % 60;
  return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}
function strToMin(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

// Generar bloques horarios
function getBloques() {
  let bloques = [];
  for (let t = HORA_INICIO; t < HORA_FIN; t += BLOQUE_MINUTOS) {
    bloques.push({ inicio: t, fin: t + BLOQUE_MINUTOS });
  }
  return bloques;
}

// Renderizador
function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  let bloques = getBloques();
  let html = `<div class="calendar-grid" style="grid-template-rows: 50px repeat(${bloques.length}, 45px)">`;
  html += `<div></div>`;
  for (let d = 0; d < 5; ++d)
    html += `<div class="calendar-day">${DIAS[d]}</div>`;
  for (let i = 0; i < bloques.length; ++i) {
    html += `<div class="calendar-time">${minutosToStr(
      bloques[i].inicio
    )}<br>${minutosToStr(bloques[i].fin)}</div>`;
    for (let d = 0; d < 5; ++d) {
      html += `<div class="calendar-cell" data-dia="${d}" data-inicio="${bloques[i].inicio}" data-fin="${bloques[i].fin}"></div>`;
    }
  }
  html += `</div>`;
  grid.innerHTML = html;
  for (let block of calendarBlocks) renderBlock(block);
}
function renderBlock(block) {
  let bloques = getBloques();
  const diaIdx = DIAS.indexOf(block.dia);
  let filaInicio = bloques.findIndex((b) => block.inicio === b.inicio);
  let filaFin = bloques.findIndex((b) => block.fin === b.fin);
  if (filaInicio === -1) filaInicio = 0;
  if (filaFin === -1) filaFin = bloques.length - 1;
  let top = 50 + filaInicio * 45;
  let height = (filaFin - filaInicio + 1) * 45 - 4;
  const grid = document.querySelector(".calendar-grid");
  let cell = grid.querySelector(
    `.calendar-cell[data-dia="${diaIdx}"][data-inicio="${bloques[filaInicio].inicio}"]`
  );
  if (!cell) return;
  let blockDiv = document.createElement("div");
  blockDiv.className =
    "calendar-block " + (CURSO_COLOR_CLASE[block.curso] || "");
  blockDiv.style.background = `var(${
    CURSO_COLOR_CSS[block.curso] || "--primary"
  })`;
  blockDiv.style.top = `${top}px`;
  blockDiv.style.height = `${height}px`;
  blockDiv.style.gridColumn = diaIdx + 2;
  blockDiv.style.gridRow = `1 / span ${bloques.length + 1}`;
  blockDiv.style.position = "absolute";
  blockDiv.style.left = "0";
  blockDiv.style.right = "0";
  blockDiv.style.margin = "0 2px";
  blockDiv.innerHTML = `<span class="block-text">${block.profesor}<br>${
    block.curso
  }<br>${minutosToStr(block.inicio)} - ${minutosToStr(block.fin)}</span>
    <button class="block-delete" title="Eliminar bloque">✕</button>`;
  blockDiv.querySelector(".block-delete").onclick = function (e) {
    e.stopPropagation();
    calendarBlocks = calendarBlocks.filter((b) => b !== block);
    renderCalendar();
  };
  grid.appendChild(blockDiv);
}

function showModal(onSubmit) {
  const root = document.getElementById("modalRoot");
  let bloques = getBloques();
  let html = `<div class="modal-bg"><div class="modal-content">
    <h2>Agregar Clase</h2>
    <form id="blockForm">
      <label>Día</label>
      <select name="dia" required>
        ${DIAS.map((d) => `<option value="${d}">${d}</option>`).join("")}
      </select>
      <label>Profesor</label>
      <select name="profesor" required>
        <option value="">(Profesor)</option>
        ${PROFESORES.map((p) => `<option value="${p}">${p}</option>`).join("")}
      </select>
      <label>Curso</label>
      <select name="curso" required>
        <option value="">(Curso)</option>
        ${Object.keys(CURSO_COLOR_CLASE)
          .map(
            (c) =>
              `<option value="${c}">${
                c.charAt(0).toUpperCase() + c.slice(1)
              }</option>`
          )
          .join("")}
      </select>
      <label>Hora de inicio</label>
      <select name="inicio" id="inicioSelect" required>
        ${bloques
          .map(
            (b, i) =>
              `<option value="${b.inicio}">${minutosToStr(b.inicio)}</option>`
          )
          .join("")}
      </select>
      <label>Duración (bloques de 45min)</label>
      <select name="duracion" id="duracionSelect" required>
        <option value="1">1 bloque</option>
        <option value="2">2 bloques</option>
        <option value="3">3 bloques</option>
        <option value="4">4 bloques</option>
        <option value="5">5 bloques</option>
        <option value="6">6 bloques</option>
      </select>
      <div id="finInfo" style="margin-top:0.5em;color:var(--muted);font-weight:600;">Hora de fin: 08:15</div>
      <div class="modal-actions">
        <button type="submit" class="calendar-add-btn">Agregar</button>
        <button type="button" class="cancel-btn">Cancelar</button>
      </div>
    </form>
    <div style="margin-top:1em; color:#fa8b8b; font-weight:700;" id="modalError"></div>
  </div></div>`;
  root.innerHTML = html;
  const form = document.getElementById("blockForm");
  const inicioSelect = form.inicio;
  const duracionSelect = form.duracion;
  const finInfo = document.getElementById("finInfo");

  // Actualizar posibles duraciones según inicio
  function updateDuraciones() {
    let inicioIdx = bloques.findIndex((b) => b.inicio == inicioSelect.value);
    let maxBloques = bloques.length - inicioIdx;
    let val = +duracionSelect.value;
    if (val > maxBloques) duracionSelect.value = maxBloques;
    duracionSelect.innerHTML = Array.from(
      { length: maxBloques },
      (_, i) =>
        `<option value="${i + 1}">${i + 1} bloque${i ? "s" : ""}</option>`
    ).join("");
    updateFin();
  }
  function updateFin() {
    let inicioIdx = bloques.findIndex((b) => b.inicio == inicioSelect.value);
    let dur = +duracionSelect.value;
    let finMin = bloques[Math.min(bloques.length - 1, inicioIdx + dur - 1)].fin;
    finInfo.textContent = "Hora de fin: " + minutosToStr(finMin);
  }
  inicioSelect.onchange = () => {
    updateDuraciones();
  };
  duracionSelect.onchange = () => {
    updateFin();
  };
  updateDuraciones();

  form.onsubmit = function (e) {
    e.preventDefault();
    const dia = form.dia.value;
    const profesor = form.profesor.value;
    const curso = form.curso.value;
    const inicio = +form.inicio.value;
    const dur = +form.duracion.value;
    const fin =
      getBloques()[getBloques().findIndex((b) => b.inicio == inicio) + dur - 1]
        .fin;
    // Validación de solapamientos
    let error = "";
    for (let b of calendarBlocks) {
      if (b.dia === dia && Math.max(inicio, b.inicio) < Math.min(fin, b.fin)) {
        error = `Ya existe una clase en ese horario (${b.profesor}, ${b.curso})`;
        break;
      }
    }
    if (error) {
      document.getElementById("modalError").innerText = error;
      return;
    }
    onSubmit({ dia, inicio, fin, profesor, curso });
    root.innerHTML = "";
  };
  form.querySelector(".cancel-btn").onclick = () => (root.innerHTML = "");
}

// Botón agregar clase
document.getElementById("addBlockBtn").onclick = function () {
  showModal((block) => {
    calendarBlocks.push(block);
    renderCalendar();
  });
};

// EXPORTAR CSV
document.getElementById("exportCSVBtn").onclick = function () {
  let csv = "Día,Profesor,Curso,HoraInicio,HoraFin\n";
  for (let b of calendarBlocks) {
    csv += `"${b.dia}","${b.profesor}","${b.curso}","${minutosToStr(
      b.inicio
    )}","${minutosToStr(b.fin)}"\n`;
  }
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "horario-bloques.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// IMPORTAR CSV
const importInput = document.getElementById("importCSVInput");
const csvFileName = document.getElementById("csvFileName");
importInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  csvFileName.textContent = file ? file.name : "";
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    let csv = event.target.result.trim().replace(/\r/g, "");
    let lines = csv.split("\n");
    lines.shift(); // quitar cabecera
    let bloques = [];
    let error = "";
    for (let line of lines) {
      let [dia, profesor, curso, inicio, fin] = line
        .split(",")
        .map((v) => v.replace(/"/g, "").trim());
      if (!DIAS.includes(dia)) {
        error = `Día inválido: ${dia}`;
        break;
      }
      if (!PROFESORES.includes(profesor)) {
        error = `Profesor inválido: ${profesor}`;
        break;
      }
      if (!CURSO_COLOR_CLASE[curso]) {
        error = `Curso inválido: ${curso}`;
        break;
      }
      let ini = strToMin(inicio),
        fni = strToMin(fin);
      if (isNaN(ini) || isNaN(fni)) {
        error = `Hora inválida: ${inicio} - ${fin}`;
        break;
      }
      bloques.push({ dia, inicio: ini, fin: fni, profesor, curso });
    }
    if (error) {
      alert(error);
      return;
    }
    // Checa solapamientos
    for (let i = 0; i < bloques.length; ++i)
      for (let j = i + 1; j < bloques.length; ++j) {
        let a = bloques[i],
          b = bloques[j];
        if (
          a.dia === b.dia &&
          Math.max(a.inicio, b.inicio) < Math.min(a.fin, b.fin)
        ) {
          alert(`Conflicto en ${a.dia} entre ${a.profesor} y ${b.profesor}`);
          return;
        }
      }
    calendarBlocks = bloques;
    renderCalendar();
  };
  reader.readAsText(file, "utf-8");
});

window.addEventListener("DOMContentLoaded", renderCalendar);
