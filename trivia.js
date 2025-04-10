document.addEventListener("DOMContentLoaded", () => {
    // MODO OSCURO
    const modoOscuro = localStorage.getItem("modoOscuro") === "true";
    if (modoOscuro) document.body.classList.add("modo-oscuro");
  
    const checkbox = document.getElementById("modoOscuro");
    if (checkbox) {
      checkbox.checked = modoOscuro;
      checkbox.addEventListener("change", () => {
        document.body.classList.toggle("modo-oscuro");
        localStorage.setItem("modoOscuro", checkbox.checked);
      });
    }
  
    // CONFIGURAR JUEGO
    const params = new URLSearchParams(window.location.search);
    const categoria = params.get("categoria");
    const modo = params.get("modo");
  
    if (window.location.href.includes("favoritas.html")) {
      cargarFavoritos();
    } else if (modo === "tiempo") {
      const favoritas = obtenerFavoritos();
      if (favoritas.length === 0) {
        alert("Agrega preguntas a favoritos primero.");
        location.href = "index.html";
      } else {
        iniciarTrivia(favoritas, true);
      }
    } else if (categoria) {
      const guardadas = localStorage.getItem(`preguntas_${categoria}`);
      if (guardadas) {
        iniciarTrivia(JSON.parse(guardadas), false);
      } else {
        fetch(`https://opentdb.com/api.php?amount=10&category=${categoria}&type=multiple`)
          .then(res => res.json())
          .then(data => {
            localStorage.setItem(`preguntas_${categoria}`, JSON.stringify(data.results));
            iniciarTrivia(data.results, false);
          });
      }
    }
  
    // BOTÓN JUGAR FAVORITOS
    ["btn-favoritos", "btn-tiempo"].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => {
          const favoritas = obtenerFavoritos();
          if (favoritas.length === 0) {
            alert("No tienes favoritas guardadas.");
            return;
          }
  
          if (id === "btn-tiempo") {
            iniciarTrivia(favoritas, true);
          } else {
            const modoTiempo = confirm("¿Jugar con tiempo?");
            iniciarTrivia(favoritas, modoTiempo);
          }
        });
      }
    });
  
    // BUSCADOR DE CATEGORÍAS
    const input = document.getElementById("busqueda");
    const resultado = document.getElementById("resultados-busqueda");
    const categorias = [
      { nombre: "Cine", url: "peliculas.html", id: "11" },
      { nombre: "Ciencia", url: "ciencia.html", id: "17" },
      { nombre: "Cultura", url: "cultura.html", id: "10" },
      { nombre: "Historia", url: "historia.html", id: "23" },
      { nombre: "Deportes", url: "deportes.html", id: "21" }
    ];
  
    if (input && resultado) {
      input.addEventListener("input", () => {
        const q = input.value.toLowerCase();
        const matches = categorias.filter(c => c.nombre.toLowerCase().includes(q));
        resultado.innerHTML = matches.length
          ? matches.map(c => `<a href="${c.url}?categoria=${c.id}">${c.nombre}</a>`).join("<br>")
          : "<p>No se encontraron resultados.</p>";
      });
    }
  });
  
  // LÓGICA DE TRIVIA
  let preguntas = [];
  let indice = 0;
  let correctas = 0;
  let tiempo = 60;
  let temporizador = null;
  let modoTiempo = false;
  
  function iniciarTrivia(pregs, esTiempo) {
    preguntas = pregs;
    indice = 0;
    correctas = 0;
    modoTiempo = esTiempo;
    mostrarPregunta();
  
    if (temporizador) clearInterval(temporizador);
  
    const tiempoDiv = document.getElementById("tiempo-container");
    if (esTiempo && tiempoDiv) {
      tiempo = 60;
      tiempoDiv.style.display = "block";
      tiempoDiv.innerHTML = `<p>⏳ Tiempo restante: <span id="tiempo">${tiempo}</span>s</p>`;
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
  
  function mostrarPregunta() {
    const cont = document.getElementById("preguntas-container");
    const mensaje = document.getElementById("mensaje-container");
    const resultado = document.getElementById("resultado-container");
  
    if (!cont) return;
    cont.innerHTML = "";
    mensaje.innerHTML = "";
    resultado.innerHTML = "";
  
    if (indice >= preguntas.length) {
      if (temporizador) clearInterval(temporizador);
      return mostrarResultado();
    }
  
    const p = preguntas[indice];
    const opciones = [...p.incorrect_answers, p.correct_answer].sort(() => Math.random() - 0.5);
  
    const html = `
      <p><strong>Pregunta ${indice + 1}/${preguntas.length}:</strong> ${p.question}</p>
      ${opciones.map(o => `<button class="opcion">${o}</button>`).join("")}
      <br><button onclick="guardarFavorito()">⭐ Agregar a favoritos</button>
    `;
  
    cont.innerHTML = html;
  
    document.querySelectorAll(".opcion").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.textContent === p.correct_answer) {
          correctas++;
          mensaje.innerHTML = "✅ ¡Correcto!";
        } else {
          mensaje.innerHTML = `❌ Incorrecto. Respuesta: ${p.correct_answer}`;
        }
        indice++;
        setTimeout(mostrarPregunta, 1000);
      });
    });
  }
  
  function mostrarResultado() {
    const cont = document.getElementById("preguntas-container");
    cont.innerHTML = `
      <h2>¡Fin del juego!</h2>
      <p>Respuestas correctas: ${correctas} de ${preguntas.length}</p>
      <button onclick="iniciarTrivia(preguntas, ${modoTiempo})">🔁 Reintentar</button>
    `;
    const tiempoDiv = document.getElementById("tiempo-container");
    if (tiempoDiv) tiempoDiv.style.display = "none";
  }
  
  // FAVORITOS
  function obtenerFavoritos() {
    return JSON.parse(localStorage.getItem("favoritos") || "[]");
  }
  
  function guardarFavorito() {
    const p = preguntas[indice];
    let favs = obtenerFavoritos();
    if (!favs.some(f => f.question === p.question)) {
      favs.push(p);
      localStorage.setItem("favoritos", JSON.stringify(favs));
      alert("⭐ Pregunta agregada a favoritos.");
    } else {
      alert("Esta pregunta ya está en favoritos.");
    }
  }
  
  function cargarFavoritos() {
    const cont = document.getElementById("favoritos-container");
    if (!cont) return;
    const favs = obtenerFavoritos();
    if (favs.length === 0) {
      cont.innerHTML = "<p>No tienes preguntas favoritas aún.</p>";
      return;
    }
  
    cont.innerHTML = favs.map((f, i) => `
      <div class="favorito-item">
        <p><strong>${f.question}</strong></p>
        <button onclick="editarFavorita(${i})">✏️ Editar</button>
        <button onclick="eliminarFavorito(${i})">❌ Eliminar</button>
      </div>
    `).join("");
  }
  
  function eliminarFavorito(index) {
    const favs = obtenerFavoritos();
    favs.splice(index, 1);
    localStorage.setItem("favoritos", JSON.stringify(favs));
    cargarFavoritos();
  }
  
  function jugarUnaFavorita(index) {
    const favs = obtenerFavoritos();
    iniciarTrivia([favs[index]], false);
  }
  
  // MODAL DE EDICIÓN
  function editarFavorita(index) {
    const favs = obtenerFavoritos();
    const f = favs[index];
  
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-contenido">
        <h3>Editar Pregunta</h3>
        <label>Pregunta:</label>
        <input type="text" id="edit-question" value="${f.question}">
        <label>Respuesta correcta:</label>
        <input type="text" id="edit-correct" value="${f.correct_answer}">
        <label>Categoría:</label>
        <input type="text" id="edit-category" value="${f.category || ''}">
        <label>Incorrectas (separadas por coma):</label>
        <input type="text" id="edit-incorrects" value="${f.incorrect_answers.join(', ')}">
        <button onclick="guardarEdicionFavorito(${index})">Guardar</button>
        <button onclick="cerrarModal()">Cancelar</button>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  function guardarEdicionFavorito(index) {
    const favs = obtenerFavoritos();
    favs[index].question = document.getElementById("edit-question").value;
    favs[index].correct_answer = document.getElementById("edit-correct").value;
    favs[index].category = document.getElementById("edit-category").value;
    favs[index].incorrect_answers = document.getElementById("edit-incorrects").value.split(",").map(s => s.trim());
    localStorage.setItem("favoritos", JSON.stringify(favs));
    cerrarModal();
    cargarFavoritos();
    alert("✅ Pregunta editada correctamente.");
  }
  
  function cerrarModal() {
    const modal = document.querySelector(".modal");
    if (modal) document.body.removeChild(modal);
  }
  