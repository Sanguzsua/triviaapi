// trivia.js completo con: editar, eliminar, buscador y temporizador funcionando

// Esperar a que cargue el DOM
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoria = urlParams.get("categoria");
    const esModoTiempo = urlParams.get("modo") === "tiempo";
    const esFavoritos = window.location.href.includes("favoritas.html");
  
    // Configurar modo oscuro si está activado
    if (localStorage.getItem("modoOscuro") === "true") {
      document.body.classList.add("modo-oscuro");
    }
    const chkOscuro = document.getElementById("modoOscuro");
    if (chkOscuro) {
      chkOscuro.checked = document.body.classList.contains("modo-oscuro");
      chkOscuro.addEventListener("change", () => {
        document.body.classList.toggle("modo-oscuro", chkOscuro.checked);
        localStorage.setItem("modoOscuro", chkOscuro.checked);
      });
    }
  
    // --- Buscador de categorías ---
    const inputBusqueda = document.getElementById("busqueda");
    const resultadosBusqueda = document.getElementById("resultados-busqueda");
    if (inputBusqueda && resultadosBusqueda) {
      const categorias = [
        { nombre: "Películas", id: "11", url: "peliculas.html" },
        { nombre: "Cultura", id: "9", url: "cultura.html" },
        { nombre: "Ciencia", id: "17", url: "ciencia.html" },
        { nombre: "Historia", id: "23", url: "historia.html" },
        { nombre: "Deportes", id: "21", url: "deportes.html" }
      ];
      inputBusqueda.addEventListener("input", () => {
        const query = inputBusqueda.value.toLowerCase();
        resultadosBusqueda.innerHTML = "";
        const filtradas = categorias.filter(cat => cat.nombre.toLowerCase().includes(query));
        filtradas.forEach(cat => {
          const div = document.createElement("div");
          div.innerHTML = `<a href="${cat.url}?categoria=${cat.id}">${cat.nombre}</a>`;
          resultadosBusqueda.appendChild(div);
        });
      });
    }
  
    // --- Trivia con preguntas (API o favoritos) ---
    if (document.getElementById("preguntas-container")) {
      if (esModoTiempo) {
        const favs = JSON.parse(localStorage.getItem("favoritos")) || [];
        if (favs.length === 0) return alert("Agrega preguntas favoritas para jugar con tiempo.");
        iniciarTrivia(favs, true);
      } else if (categoria) {
        fetch(`https://opentdb.com/api.php?amount=10&category=${categoria}&type=multiple`)
          .then(res => res.json())
          .then(data => iniciarTrivia(data.results, false));
      } else if (esFavoritos) {
        mostrarFavoritos();
      }
    }
  
    // --- Funciones Trivia ---
    let preguntas = [], index = 0, correctas = 0, timer, tiempo = 60;
  
    function iniciarTrivia(pregs, modoTiempo) {
      preguntas = pregs;
      index = 0;
      correctas = 0;
      if (modoTiempo) iniciarTemporizador();
      mostrarPregunta();
    }
  
    function iniciarTemporizador() {
      const divTiempo = document.getElementById("tiempo-container");
      if (divTiempo) divTiempo.style.display = "block";
      document.getElementById("tiempo").textContent = tiempo;
      timer = setInterval(() => {
        tiempo--;
        document.getElementById("tiempo").textContent = tiempo;
        if (tiempo <= 0) {
          clearInterval(timer);
          mostrarResultado();
        }
      }, 1000);
    }
  
    function mostrarPregunta() {
      const contenedor = document.getElementById("preguntas-container");
      if (!contenedor || index >= preguntas.length) return mostrarResultado();
      const pregunta = preguntas[index];
      const opciones = [...pregunta.incorrect_answers, pregunta.correct_answer].sort(() => Math.random() - 0.5);
      contenedor.innerHTML = `
        <p><strong>${pregunta.question}</strong></p>
        ${opciones.map(op => `<button class='opcion'>${op}</button>`).join("")}
        <br><button onclick='agregarAFavoritos(${JSON.stringify(pregunta).replace(/"/g, "&quot;")})'>⭐ Agregar a favoritos</button>
      `;
      document.querySelectorAll(".opcion").forEach(btn => {
        btn.addEventListener("click", () => {
          if (btn.textContent === pregunta.correct_answer) correctas++;
          index++;
          mostrarPregunta();
        });
      });
    }
  
    function mostrarResultado() {
      clearInterval(timer);
      const contenedor = document.getElementById("preguntas-container");
      contenedor.innerHTML = `<h2>Juego terminado</h2><p>Respuestas correctas: ${correctas} de ${preguntas.length}</p>`;
    }
  
    // --- CRUD Favoritos ---
    window.agregarAFavoritos = function(pregunta) {
      let favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
      if (!favs.some(p => p.question === pregunta.question)) {
        favs.push(pregunta);
        localStorage.setItem("favoritos", JSON.stringify(favs));
        alert("Agregado a favoritos");
      }
    }
  
    window.eliminarFavorito = function(i) {
      let favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
      favs.splice(i, 1);
      localStorage.setItem("favoritos", JSON.stringify(favs));
      mostrarFavoritos();
    }
  
    window.editarFavorito = function(i) {
      const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
      const pregunta = favs[i];
      const nuevaPregunta = prompt("Editar pregunta:", pregunta.question);
      if (nuevaPregunta) {
        favs[i].question = nuevaPregunta;
        localStorage.setItem("favoritos", JSON.stringify(favs));
        mostrarFavoritos();
      }
    }
  
    function mostrarFavoritos() {
      const contenedor = document.getElementById("favoritos-container");
      if (!contenedor) return;
      const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
      if (favs.length === 0) return contenedor.innerHTML = "<p>No tienes favoritos</p>";
      contenedor.innerHTML = favs.map((p, i) => `
        <div class="favorito-item">
          <p><strong>${p.question}</strong></p>
          <button onclick="eliminarFavorito(${i})">❌ Eliminar</button>
          <button onclick="editarFavorito(${i})">✏️ Editar</button>
        </div>
      `).join("");
    }
  });



