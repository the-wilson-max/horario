document.addEventListener("DOMContentLoaded", async () => {
  // Saludo con nombre almacenado
  const nombre = localStorage.getItem("nombre") || "Profesor";
  document.getElementById("nombreUsuario").textContent = nombre;

  // Hora y fecha actual
  function actualizarHoraFecha() {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString("es-ES");
    const fecha = ahora.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    document.getElementById("horaActual").textContent = hora;
    document.getElementById("fechaActual").textContent =
      fecha[0].toUpperCase() + fecha.slice(1);
  }
  actualizarHoraFecha();
  setInterval(actualizarHoraFecha, 1000);

  // Temperatura actual (Open-Meteo API)
  const lat = -12.0464,
    lon = -77.0428;
  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  )
    .then((res) => res.json())
    .then((data) => {
      if (
        data.current_weather &&
        data.current_weather.temperature !== undefined
      ) {
        document.getElementById(
          "temperaturaActual"
        ).textContent = `${data.current_weather.temperature} °C`;
      } else {
        document.getElementById("temperaturaActual").textContent = "N/D";
      }
    })
    .catch(() => {
      document.getElementById("temperaturaActual").textContent = "N/D";
    });

  // GÉNERO desde Supabase
  let usuarios = [];
  if (typeof supabase !== "undefined") {
    try {
      let { data, error } = await supabase
        .from("usuarios")
        .select("nombre,apellido,fecha_nacimiento,genero");
      if (error || !data) throw error || "No se pudo obtener datos";
      usuarios = data;
      let total = usuarios.length;
      let masculinos = usuarios.filter((u) =>
        (u.genero || "").toLowerCase().startsWith("m")
      ).length;
      let femeninos = usuarios.filter((u) =>
        (u.genero || "").toLowerCase().startsWith("f")
      ).length;
      let porcentajeM = total ? Math.round((masculinos / total) * 100) : 0;
      let porcentajeF = total ? Math.round((femeninos / total) * 100) : 0;
      const circle = document.getElementById("generoCircle");
      const dasharray = 2 * Math.PI * 42;
      const porcentaje = porcentajeM;
      const offset = dasharray - (dasharray * porcentaje) / 100;
      circle.style.strokeDasharray = dasharray;
      circle.style.strokeDashoffset = dasharray;
      setTimeout(() => {
        circle.style.transition =
          "stroke-dashoffset 1.2s cubic-bezier(.7,1,.3,1)";
        circle.style.strokeDashoffset = offset;
      }, 150);
      document.getElementById(
        "generoPorcentaje"
      ).textContent = `${porcentaje}%`;
      document.getElementById(
        "generoDetalle"
      ).innerHTML = `<span style="color:#4f8cff">M: ${masculinos}</span> / <span style="color:#ff6b6b">F: ${femeninos}</span>`;
    } catch (err) {
      document.getElementById("generoPorcentaje").textContent = "--%";
      document.getElementById("generoDetalle").textContent = "N/D";
      // Usuarios simulados en caso de error o para cumpleaños
      usuarios = [
        {
          nombre: "Monica",
          apellido: "Conilla",
          fecha_nacimiento: "2025-06-11",
        },
        { nombre: "Carlos", apellido: "Perez", fecha_nacimiento: "2025-06-15" },
        { nombre: "Ana", apellido: "Sol", fecha_nacimiento: "2025-07-02" },
      ];
    }
  } else {
    // Usuarios simulados si no hay Supabase (modo demo)
    usuarios = [
      { nombre: "Monica", apellido: "Conilla", fecha_nacimiento: "2025-06-11" },
      { nombre: "Carlos", apellido: "Perez", fecha_nacimiento: "2025-06-15" },
      { nombre: "Ana", apellido: "Sol", fecha_nacimiento: "2025-07-02" },
    ];
  }

  // CUMPLEAÑOS PRÓXIMO
  function getProximoCumple(usuarios) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let proximos = usuarios
      .map((u) => {
        if (!u.fecha_nacimiento) return null;
        let [yyyy, mm, dd] = u.fecha_nacimiento.split("-");
        let cumple = new Date(hoy.getFullYear(), mm - 1, dd);
        if (cumple < hoy) cumple.setFullYear(hoy.getFullYear() + 1);
        return { ...u, cumple, distancia: cumple - hoy };
      })
      .filter(Boolean)
      .sort((a, b) => a.distancia - b.distancia);
    return proximos[0] || null;
  }

  // Esperar a que el DOM tenga el cuadro, o ejecuta directo si existe
  setTimeout(() => {
    const proximo = getProximoCumple(usuarios);
    const box = document.getElementById("cuadroCumple");
    const info = document.getElementById("cumpleInfo");
    const fecha = document.getElementById("cumpleFecha");
    if (!box || !info || !fecha) return;

    if (!proximo) {
      info.textContent = "Sin cumpleaños próximos";
      fecha.textContent = "";
      box.classList.remove("cumple-today");
    } else {
      const nombre = `${proximo.nombre} ${proximo.apellido}`.trim();
      const options = { day: "2-digit", month: "2-digit" };
      const fechaStr = proximo.cumple.toLocaleDateString("es-ES", options);
      info.textContent = nombre;
      fecha.textContent = `🎂 ${fechaStr}`;
      // Hoy es cumple
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (proximo.cumple.getTime() === hoy.getTime()) {
        box.classList.add("cumple-today");
        confettiAnim();
      } else {
        box.classList.remove("cumple-today");
      }
    }
  }, 250);

  // FRASE DEL DÍA
  const extraBox = document.getElementById("extraBox");
  if (extraBox) {
    const frases = [
      "¡Que tengas un gran día de clases!",
      "Recuerda: la educación construye el futuro.",
      "Cada día es una nueva oportunidad.",
      "Sonríe, hoy puede ser tu mejor jornada.",
      "Gracias por tu dedicación, profe.",
    ];
    extraBox.textContent = frases[Math.floor(Math.random() * frases.length)];
  }

  // ANIMACIÓN CONFETTI
  function confettiAnim() {
    if (document.getElementById("confetti-birth")) return;
    const confetti = document.createElement("div");
    confetti.id = "confetti-birth";
    confetti.style.position = "fixed";
    confetti.style.inset = "0";
    confetti.style.pointerEvents = "none";
    confetti.style.zIndex = "9999";
    confetti.innerHTML = Array(50)
      .fill(0)
      .map(() => `<div class="confetti"></div>`)
      .join("");
    document.body.appendChild(confetti);
    document.querySelectorAll(".confetti").forEach((c) => {
      c.style.position = "absolute";
      c.style.top = Math.random() * 70 + "vh";
      c.style.left = Math.random() * 98 + "vw";
      c.style.width = "10px";
      c.style.height = "18px";
      c.style.background = `hsl(${Math.random() * 360},90%,60%)`;
      c.style.borderRadius = "3px";
      c.style.opacity = "0.85";
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      c.style.animation = `confettiFall 1.5s ease ${Math.random()}s 1 forwards`;
    });
    setTimeout(() => confetti.remove(), 2200);
  }
});

// CSS para confetti
const confettiCSS = document.createElement("style");
confettiCSS.textContent = `
@keyframes confettiFall {
  from { opacity:1;}
  to { transform: translateY(70vh) rotate(360deg); opacity:0.1;}
}`;
document.head.appendChild(confettiCSS);
