// --- CONFIGURACIÓN ---
const HORAS_MANANA = [
  "07:30 - 08:15",
  "08:15 - 09:00",
  "09:00 - 09:45",
  "09:45 - 10:15", // recreo
  "10:15 - 11:00",
  "11:00 - 11:45",
  "11:45 - 12:30",
];
const HORAS_TARDE = [
  "13:00 - 13:45",
  "13:45 - 14:30",
  "14:30 - 15:15",
  "15:15 - 15:45", // recreo
  "15:45 - 16:30",
  "16:30 - 17:15",
  "17:15 - 18:00",
];
const BLOQUE_RECREO = 3;
const SECCIONES_MANANA = ["1°A", "2°A", "3°A", "4°A", "5°A"];
const SECCIONES_TARDE = ["1°B", "2°B", "3°C", "4°C", "5°C"];
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

// --- VARIABLES ELEM DOM ---
const turnoSelect = document.getElementById("turnoSelect");
const horarioHead = document.getElementById("horarioHead");
const horarioBody = document.getElementById("horarioBody");
const tablaHorario = document.getElementById("tablaHorario");
const exportBtn = document.getElementById("exportPDF");
const exportCSVBtn = document.getElementById("exportCSV");
const importCSVInput = document.getElementById("importCSV");

// --- GENERAR ENCABEZADO DINÁMICO ---
function crearEncabezado(turno) {
  const secciones = turno === "mañana" ? SECCIONES_MANANA : SECCIONES_TARDE;
  let html = `
    <tr>
      <th colspan="${
        secciones.length + 1
      }" class="titulo-turno" style="text-align:center; color:green; font-weight: bold;">
        TURNO ${turno.toUpperCase()}
      </th>
    </tr>
    <tr>
      <th>Hora</th>
      ${secciones.map((s) => `<th>${s}</th>`).join("")}
    </tr>
  `;
  horarioHead.innerHTML = html;
}

// --- CREAR TABLA HORARIO ---
function crearHorario(turno = "mañana") {
  const horas = turno === "mañana" ? HORAS_MANANA : HORAS_TARDE;
  const secciones = turno === "mañana" ? SECCIONES_MANANA : SECCIONES_TARDE;
  horarioBody.innerHTML = "";

  for (let i = 0; i < horas.length; i++) {
    let row = document.createElement("tr");
    let celdaHora = document.createElement("td");
    celdaHora.textContent = horas[i];
    row.appendChild(celdaHora);

    for (let j = 0; j < secciones.length; j++) {
      let celda = document.createElement("td");
      celda.dataset.seccion = secciones[j];
      celda.dataset.hora = horas[i];

      if (i === BLOQUE_RECREO) {
        celda.className = "celda-recreo";
        celda.innerHTML = `<span>RECREO</span>
          <div class="celda-estado">
            <label><input type="checkbox" class="feriadoCheck"> Feriado</label>
          </div>`;
      } else {
        let selectProf = document.createElement("select");
        selectProf.innerHTML =
          `<option value="">(Profesor)</option>` +
          PROFESORES.map((p) => `<option value="${p}">${p}</option>`).join("");
        selectProf.className = "profesorSelect";

        let selectCurso = document.createElement("select");
        selectCurso.innerHTML =
          `<option value="">(Curso)</option>` +
          Object.keys(CURSO_COLOR_CLASE)
            .map(
              (c) =>
                `<option value="${c}">${
                  c.charAt(0).toUpperCase() + c.slice(1)
                }</option>`
            )
            .join("");
        selectCurso.className = "cursoSelect";

        let estadoDiv = document.createElement("div");
        estadoDiv.className = "celda-estado";
        estadoDiv.innerHTML = `
          <label><input type="checkbox" class="ausenteCheck"> Ausente</label>
          <label><input type="checkbox" class="feriadoCheck"> Feriado</label>
        `;

        celda.appendChild(selectProf);
        celda.appendChild(selectCurso);
        celda.appendChild(estadoDiv);

        selectCurso.addEventListener("change", function () {
          Object.values(CURSO_COLOR_CLASE).forEach((clase) =>
            celda.classList.remove(clase)
          );
          let curso = (this.value || "").trim().toLowerCase();
          if (CURSO_COLOR_CLASE[curso]) {
            celda.classList.add(CURSO_COLOR_CLASE[curso]);
          }
        });

        estadoDiv
          .querySelector(".feriadoCheck")
          .addEventListener("change", function () {
            celda.classList.toggle("celda-feriado", this.checked);
          });
        estadoDiv
          .querySelector(".ausenteCheck")
          .addEventListener("change", function () {
            celda.classList.toggle("celda-ausente", this.checked);
          });
      }

      row.appendChild(celda);
    }
    horarioBody.appendChild(row);
  }
}

// --- PDF EXPORT ---
exportBtn.addEventListener("click", () => {
  let tabla = tablaHorario;
  const nombreColegio = "I.E. JOSE DE LA TORRE UGARTE-ICA";
  const turnoActual =
    turnoSelect.value.charAt(0).toUpperCase() + turnoSelect.value.slice(1);
  html2canvas(tabla, { backgroundColor: "#23283b" }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new window.jspdf.jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    let y = 30;
    pdf.setFontSize(16);
    pdf.text(nombreColegio, pageWidth / 2, y, { align: "center" });
    y += 24;
    pdf.setFontSize(12);
    pdf.text(`Turno: ${turnoActual}`, pageWidth / 2, y, { align: "center" });
    const ratio = pageWidth / canvas.width;
    const imgHeight = canvas.height * ratio;
    pdf.addImage(imgData, "PNG", 0, y + 20, pageWidth, imgHeight);
    pdf.save("horario-profesores.pdf");
  });
});

// --- CSV EXPORT ---
exportCSVBtn.addEventListener("click", () => {
  const turno = turnoSelect.value;
  const horas = turno === "mañana" ? HORAS_MANANA : HORAS_TARDE;
  const secciones = turno === "mañana" ? SECCIONES_MANANA : SECCIONES_TARDE;

  let csv = ["Hora,Sección,Profesor,Curso,Ausente,Feriado"];
  for (let i = 0; i < horas.length; i++) {
    for (let j = 0; j < secciones.length; j++) {
      const celda = horarioBody.rows[i].cells[j + 1];
      if (i === BLOQUE_RECREO) {
        const feriado = celda.querySelector(".feriadoCheck").checked
          ? "SI"
          : "NO";
        csv.push(`"${horas[i]}","${secciones[j]}","","RECREO","","${feriado}"`);
      } else {
        const selectProf = celda.querySelector(".profesorSelect");
        const selectCurso = celda.querySelector(".cursoSelect");
        const ausente = celda.querySelector(".ausenteCheck").checked
          ? "SI"
          : "NO";
        const feriado = celda.querySelector(".feriadoCheck").checked
          ? "SI"
          : "NO";
        csv.push(
          `"${horas[i]}","${secciones[j]}","${selectProf.value}","${selectCurso.value}","${ausente}","${feriado}"`
        );
      }
    }
  }

  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `horario_${turno}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
});

// --- CSV IMPORT ---
importCSVInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    const csv = event.target.result;
    importarHorarioDesdeCSV(csv);
  };
  reader.readAsText(file, "utf-8");
});

function importarHorarioDesdeCSV(csv) {
  const turno = turnoSelect.value;
  const horas = turno === "mañana" ? HORAS_MANANA : HORAS_TARDE;
  const secciones = turno === "mañana" ? SECCIONES_MANANA : SECCIONES_TARDE;
  const filas = csv.trim().split("\n");
  // Quita cabecera
  filas.shift();
  for (const fila of filas) {
    const [hora, seccion, profesor, curso, ausente, feriado] = fila
      .split(",")
      .map((v) => v.replace(/(^"|"$)/g, ""));
    const i = horas.indexOf(hora);
    const j = secciones.indexOf(seccion);
    if (i === -1 || j === -1) continue;
    const celda = horarioBody.rows[i].cells[j + 1];
    if (i === BLOQUE_RECREO) {
      celda.querySelector(".feriadoCheck").checked = feriado === "SI";
    } else {
      celda.querySelector(".profesorSelect").value = profesor || "";
      celda.querySelector(".cursoSelect").value = curso || "";
      celda.querySelector(".ausenteCheck").checked = ausente === "SI";
      celda.querySelector(".feriadoCheck").checked = feriado === "SI";
      // Aplica color en base al curso al importar
      Object.values(CURSO_COLOR_CLASE).forEach((clase) =>
        celda.classList.remove(clase)
      );
      let cursoKey = (curso || "").trim().toLowerCase();
      if (CURSO_COLOR_CLASE[cursoKey]) {
        celda.classList.add(CURSO_COLOR_CLASE[cursoKey]);
      }
      celda.classList.toggle("celda-feriado", feriado === "SI");
      celda.classList.toggle("celda-ausente", ausente === "SI");
    }
  }
}

// --- EVENTOS ---
turnoSelect.addEventListener("change", () => {
  crearEncabezado(turnoSelect.value);
  crearHorario(turnoSelect.value);
});

// --- INICIALIZACIÓN ---
window.addEventListener("DOMContentLoaded", () => {
  crearEncabezado("mañana");
  crearHorario("mañana");
});
// Mostrar el nombre del archivo CSV seleccionado
importCSVInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  document.getElementById("csvFileName").textContent = file ? file.name : "";
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    const csv = event.target.result;
    importarHorarioDesdeCSV(csv);
  };
  reader.readAsText(file, "utf-8");
});
