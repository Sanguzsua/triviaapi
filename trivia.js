// trivia.js COMPLETO Y FUNCIONAL ✅

let preguntas = [];
let indicePregunta = 0;
let respuestasCorrectas = 0;
let temporizador;
let tiempoRestante = 60;
let modoTiempoActivo = false;

// --- DOMContentLoaded principal ---
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const categoria = urlParams.get("categoria");
  const modo = urlParams.get("modo");

  const esFavoritos = window.location.pathname.includes("favoritas.html");
  const esJuego = window.location.pathname.includes("juego.html");

  if (modo === "tiempo" || esJuego) {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    if (favoritos.length === 0) {
      alert("No hay preguntas favoritas para jugar con tiempo.");
      return;
    }
    iniciarTrivia(favoritos, true);
  } else if (categoria) {
    obtenerPreguntas(categoria);
  } else if (esFavoritos) {
    mostrarFavoritos();
  }

  // Eventos comunes
  const checkbox = document.getElementById("modoOscuro");
  if (checkbox) {
    checkbox.addEventListener("change", () => {
      document.body.classList.toggle("modo-oscuro", checkbox.checked);
      localStorage.setItem("modoOscuro", checkbox.checked);
    });
    checkbox.checked = localStorage.getItem("modoOscuro") === "true";
    if (checkbox.checked) document.body.classList.add("modo-oscuro");
  }
});

// --- Obtener preguntas por categoría ---
function obtenerPreguntas(categoria) {
  fetch(`https://opentdb.com/api.php?amount=10&category=${categoria}&type=multiple`)
    .then(res => res.json())
    .then(data => iniciarTrivia(data.results, false))
    .catch(err => console.error("Error cargando preguntas:", err));
}

// --- Iniciar trivia ---
function iniciarTrivia(preguntasAPI, tiempo = false) {
  preguntas = preguntasAPI;
  indicePregunta = 0;
  respuestasCorrectas = 0;
  modoTiempoActivo = tiempo;

  const tiempoCont = document.getElementById("tiempo-container");
  if (tiempo) {
    tiempoRestante = 60;
    tiempoCont.style.display = "block";
    iniciarTemporizador();
  } else {
    tiempoCont.style.display = "none";
  }

  mostrarPregunta();
}

// --- Temporizador ---
function iniciarTemporizador() {
  const tiempoEl = document.getElementById("tiempo");
  tiempoEl.textContent = tiempoRestante;
  temporizador = setInterval(() => {
    tiempoRestante--;
    tiempoEl.textContent = tiempoRestante;
    if (tiempoRestante <= 0) {
      clearInterval(temporizador);
      mostrarResultado();
    }
  }, 1000);
}

// --- Mostrar pregunta ---
function mostrarPregunta() {
  const cont = document.getElementById("preguntas-container");
  cont.innerHTML = "";

  if (indicePregunta >= preguntas.length) {
    if (modoTiempoActivo) clearInterval(temporizador);
    mostrarResultado();
    return;
  }

  const pregunta = preguntas[indicePregunta];
  const opciones = [...pregunta.incorrect_answers, pregunta.correct_answer].sort(() => Math.random() - 0.5);

  cont.innerHTML = `
    <p><strong>Pregunta ${indicePregunta + 1}</strong>: ${pregunta.question}</p>
    <ul>
      ${opciones.map(op => `<li><button class="respuesta">${op}</button></li>`).join("")}
    </ul>
    <button onclick="agregarFavorito(${indicePregunta})">⭐ Agregar a favoritos</button>
  `;

  document.querySelectorAll(".respuesta").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.textContent === pregunta.correct_answer) respuestasCorrectas++;
      indicePregunta++;
      mostrarPregunta();
    });
  });
}

// --- Mostrar resultado ---
function mostrarResultado() {
  const cont = document.getElementById("preguntas-container");
  cont.innerHTML = `<h2>Terminaste 🎉</h2><p>Correctas: ${respuestasCorrectas} / ${preguntas.length}</p>`;
}

// --- Agregar a favoritos ---
function agregarFavorito(indice) {
  const fav = JSON.parse(localStorage.getItem("favoritos")) || [];
  const pregunta = preguntas[indice];
  if (!fav.some(f => f.question === pregunta.question)) {
    fav.push(pregunta);
    localStorage.setItem("favoritos", JSON.stringify(fav));
    alert("Pregunta agregada a favoritos");
  } else {
    alert("Ya está en favoritos");
  }
}

// --- Mostrar favoritos ---
function mostrarFavoritos() {
  const cont = document.getElementById("favoritos-container");
  const favs = JSON.parse(localStorage.getItem("favoritos")) || [];
  cont.innerHTML = favs.length === 0 ? "<p>No hay favoritas</p>" :
    favs.map((p, i) => `
      <div class="favorito-item">
        <p><strong>${p.question}</strong></p>
        <p>✅ ${p.correct_answer}</p>
        <button onclick="eliminarFavorito(${i})">❌ Eliminar</button>
      </div>
    `).join("");
}

// --- Eliminar favorito ---
function eliminarFavorito(index) {
  const fav = JSON.parse(localStorage.getItem("favoritos")) || [];
  fav.splice(index, 1);
  localStorage.setItem("favoritos", JSON.stringify(fav));
  mostrarFavoritos();
}




