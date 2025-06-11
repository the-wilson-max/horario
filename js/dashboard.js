// Mapeo de secciones a archivos
const sectionToFile = {
  inicio: "inicio.html",
  horario: "horario.html",
  perfil: "perfil.html",
  integrantes: "integrantes.html", // <--- Cambia aquí el key a 'integrantes'
};

// Cambia el iframe según la sección seleccionada
function cambiarSeccion(nuevaSeccion) {
  const iframe = document.getElementById("contenido-principal");
  iframe.src = sectionToFile[nuevaSeccion];
}

// Manejo del sidebar y autenticación
document.addEventListener("DOMContentLoaded", async () => {
  // --- INICIO DE SESIÓN ---
  // Verifica si hay un usuario autenticado en localStorage
  const userId = localStorage.getItem("usuario_id");
  if (!userId) {
    // Si no hay usuario, redirige al login (o muestra alerta)
    window.location.href = "index.html";
    return;
  }

  // Selecciona todos los ítems del sidebar excepto logout
  const navItems = document.querySelectorAll(".nav-item[data-section]");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Quita la clase 'active' a todos y la agrega al actual
      navItems.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");
      // Cambia el contenido del iframe
      const seccion = item.getAttribute("data-section");
      cambiarSeccion(seccion);
    });
  });

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  // --- PASAR DATOS DE PERFIL/INTEGRANTES AL IFRAME ---
  // Escucha cambios en el iframe para enviar los datos cuando se abra perfil.html o integrantes.html
  const iframe = document.getElementById("contenido-principal");
  iframe.addEventListener("load", async () => {
    try {
      const iframePath = iframe.contentWindow.location.pathname;
      if (iframePath.endsWith("perfil.html")) {
        // PERFIL
        const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", userId)
          .single();
        if (error || !data) {
          iframe.contentWindow.postMessage(
            { type: "perfil-error", message: "No se pudo cargar el perfil." },
            "*"
          );
        } else {
          iframe.contentWindow.postMessage({ type: "perfil-data", data }, "*");
        }
      } else if (iframePath.endsWith("integrantes.html")) {
        // INTEGRANTES
        const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .order("id", { ascending: true });
        if (error || !data) {
          iframe.contentWindow.postMessage(
            {
              type: "integrantes-error",
              message: "No se pudo cargar la lista de integrantes.",
            },
            "*"
          );
        } else {
          iframe.contentWindow.postMessage(
            { type: "integrantes-data", data },
            "*"
          );
        }
      }
    } catch (e) {
      // Puede fallar si el iframe aún no está listo
      iframe.contentWindow.postMessage(
        { type: "perfil-error", message: "Error de conexión." },
        "*"
      );
    }
  });
});
