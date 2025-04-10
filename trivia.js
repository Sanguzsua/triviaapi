document.addEventListener("DOMContentLoaded", () => {
    const preguntasContainer = document.getElementById("preguntas-container");
    const favoritosContainer = document.getElementById("favoritos-container");
    const busquedaInput = document.getElementById("busqueda");
    const resultadosBusqueda = document.getElementById("resultados-busqueda");
    const tiempoContainer = document.getElementById("tiempo-container");
  
    let preguntas = [];
    let indice = 0;
    let correctas = 0;
    let temporizador = null;
    let tiempo = 60;
  
    const urlParams = new URLSearchParams(window.location.search);
    const categoria = urlParams.get("categoria");
    const modoTiempo = urlParams.get("modo") === "tiempo";
    const estaEnFavoritos = window.location.href.includes("favoritas");
  
    // 🟨 Buscar por texto
    if (busquedaInput && resultadosBusqueda) {
      const categorias = [
        { nombre: "Cine", url: "peliculas.html", id: "11" },
        { nombre: "Ciencia", url: "ciencia.html", id: "17" },
        { nombre: "Cultura", url: "cultura.html", id: "9" },
        { nombre: "Historia", url: "historia.html", id: "23" },
        { nombre: "Deportes", url: "deportes.html", id: "21" }
      ];
  
      busquedaInput.addEventListener("input", () => {
        const texto = busquedaInput.value.toLowerCase();
        resultadosBusqueda.innerHTML = "";
  
        const filtradas = categorias.filter(cat => cat.nombre.toLowerCase().includes(texto));
        if (filtradas.length === 0) {
          resultadosBusqueda.innerHTML = "<p>No se encontraron resultados.</p>";
          return;
        }
  
        filtradas.forEach(cat => {
          const link = document.createElement("a");
          link.href = `${cat.url}?categoria=${cat.id}`;
          link.textContent = cat.nombre;
          resultadosBusqueda.appendChild(link);
        });
      });
    }
  
    // 🟨 Cargar preguntas
    if (modoTiempo && estaEnFavoritos) {
      const favoritas = obtenerFavoritos();
      if (favoritas.length === 0) {
        alert("Agrega preguntas favoritas para poder jugar.");
        location.href = "inicio.html";
        return;
      }
      iniciarTrivia(favoritas, true);
    } else if (categoria) {
      fetch(`https://opentdb.com/api.php?amount=10&category=${categoria}&type=multiple`)
        .then(res => res.json())
        .then(data => {
          preguntas = data.results;
          iniciarTrivia(preguntas, false);
        });
    } else if (estaEnFavoritos && favoritosContainer) {
      cargarFavoritos();
    }
  
    // 🟨 Iniciar juego
    function iniciarTrivia(lista, conTiempo) {
      preguntas = lista;
      indice = 0;
      correctas = 0;
      mostrarPregunta();
  
      if (conTiempo && tiempoContainer) {
        tiempo = 60;
        tiempoContainer.style.display = "block";
        tiempoContainer.innerHTML = `<p>⏳ Tiempo restante: <span id="tiempo">${tiempo}</span> segundos</p>`;
        temporizador = setInterval(() => {
          tiempo--;
          document.getElementById("tiempo").textContent = tiempo;
          if (tiempo <= 0) {
            clearInterval(temporizador);
            mostrarResultado();
          }
        }, 1000);
      }
    }
  
    // 🟨 Mostrar pregunta
    function mostrarPregunta() {
      if (!preguntasContainer) return;
      preguntasContainer.innerHTML = "";
  
      if (indice >= preguntas.length) {
        if (temporizador) clearInterval(temporizador);
        mostrarResultado();
        return;
      }
  
      const pregunta = preguntas[indice];
      const respuestas = [...pregunta.incorrect_answers, pregunta.correct_answer].sort(() => Math.random() - 0.5);
  
      const div = document.createElement("div");
      div.innerHTML = `
        <h3>${pregunta.question}</h3>
        ${respuestas.map(r => `<button class="respuesta">${r}</button>`).join("")}
        <br><button onclick="agregarFavorito(${indice})">⭐ Agregar a favoritos</button>
      `;
      preguntasContainer.appendChild(div);
  
      document.querySelectorAll(".respuesta").forEach(btn => {
        btn.addEventListener("click", () => {
          if (btn.textContent === pregunta.correct_answer) correctas++;
          indice++;
          mostrarPregunta();
        });
      });
    }
  
    // 🟨 Resultado
    function mostrarResultado() {
      preguntasContainer.innerHTML = `
        <h2>¡Juego terminado!</h2>
        <p>Respondiste correctamente ${correctas} de ${preguntas.length}</p>
        <button onclick="location.reload()">🔁 Volver a jugar</button>
      `;
      if (tiempoContainer) tiempoContainer.style.display = "none";
    }
  
    // 🟨 Favoritos
    window.agregarFavorito = function (i) {
      const favs = obtenerFavoritos();
      const existe = favs.some(p => p.question === preguntas[i].question);
      if (!existe) {
        favs.push(preguntas[i]);
        localStorage.setItem("favoritos", JSON.stringify(favs));
        alert("Agregado a favoritos ⭐");
      } else {
        alert("Ya está en favoritos");
      }
    };
  
    function obtenerFavoritos() {
      return JSON.parse(localStorage.getItem("favoritos")) || [];
    }
  
    function cargarFavoritos() {
      const favs = obtenerFavoritos();
      if (favs.length === 0) {
        favoritosContainer.innerHTML = "<p>No tienes preguntas favoritas.</p>";
        return;
      }
  
      favoritosContainer.innerHTML = "";
      favs.forEach((f, i) => {
        const div = document.createElement("div");
        div.innerHTML = `
          <p><strong>${f.question}</strong></p>
          <button onclick="eliminarFavorito(${i})">❌ Eliminar</button>
        `;
        favoritosContainer.appendChild(div);
      });
    }
  
    window.eliminarFavorito = function (i) {
      let favs = obtenerFavoritos();
      favs.splice(i, 1);
      localStorage.setItem("favoritos", JSON.stringify(favs));
      cargarFavoritos();
    };
  });
  