document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("tiempo-container")) {
        const tiempoContainer = document.createElement("div");
        tiempoContainer.id = "tiempo-container";
        tiempoContainer.style.display = "none";
        const preguntasContainer = document.getElementById("preguntas-container");
        if (preguntasContainer && preguntasContainer.parentNode) {
            preguntasContainer.parentNode.insertBefore(tiempoContainer, preguntasContainer);
        } else {
            document.body.appendChild(tiempoContainer);
        }
    }

    let categoria = "";
    const urlParams = new URLSearchParams(window.location.search);
    categoria = urlParams.get("categoria");
    const esTiempoLimite = urlParams.get("modo") === "tiempo";
    const esPaginaFavoritos = window.location.href.includes("favoritas.html");

    if (!categoria && document.getElementById("preguntas-container") && !esPaginaFavoritos) {
        console.error("No se detectó categoría.");
        return;
    }

    if (esTiempoLimite) {
        let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
        if (favoritos.length === 0) {
            alert("No tienes preguntas favoritas para jugar con tiempo. Primero agrega algunas.");
            window.location.href = "index.html";
            return;
        }
        iniciarTrivia(favoritos, true);
    } else if (categoria) {
        let preguntasGuardadas = localStorage.getItem(`preguntas_${categoria}`);
        if (preguntasGuardadas) {
            iniciarTrivia(JSON.parse(preguntasGuardadas), false);
        } else {
            fetch(`https://opentdb.com/api.php?amount=10&category=${categoria}&type=multiple`)
                .then(response => response.json())
                .then(data => {
                    if (!data.results || data.results.length === 0) throw new Error("No se recibieron preguntas.");
                    localStorage.setItem(`preguntas_${categoria}`, JSON.stringify(data.results));
                    iniciarTrivia(data.results, false);
                })
                .catch(error => console.error("Error al obtener preguntas:", error));
        }
    }

    cargarFavoritos();
    configurarModoOscuro();
});

function mostrarNotificacionConBotones(mensaje, opciones, callback) {
    const notificacion = document.createElement("div");
    notificacion.className = "notificacion interactiva";
    notificacion.innerHTML = `
        <p>${mensaje}</p>
        <div>
            ${opciones.map(opcion => `<button class="notificacion-boton">${opcion}</button>`).join("")}
        </div>
    `;
    document.body.appendChild(notificacion);

    const botones = notificacion.querySelectorAll(".notificacion-boton");
    botones.forEach((boton, index) => {
        boton.addEventListener("click", () => {
            callback(index);
            document.body.removeChild(notificacion);
        });
    });
}

function agregarEventoBoton(idBoton, esTiempoLimite) {
    const boton = document.getElementById(idBoton);
    if (boton) {
        boton.addEventListener("click", () => {
            let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
            if (favoritos.length === 0) {
                mostrarNotificacion(`No tienes preguntas favoritas${esTiempoLimite ? " para jugar con tiempo" : ""}.`, "info");
                return;
            }

            if (!esTiempoLimite) {
                const jugarConTiempo = confirm("¿Quieres jugar con tiempo límite?");
                iniciarTrivia(favoritos, jugarConTiempo);
            } else {
                mostrarNotificacion("Modo tiempo activado. ¡Prepárate para jugar!", "info");
                iniciarTrivia(favoritos, true);
            }
        });
    }
}

agregarEventoBoton("btn-favoritos", false);
agregarEventoBoton("btn-tiempo", true);

let indicePregunta = 0;
let preguntas = [];
let respuestasCorrectas = 0;
let temporizador;
let tiempoRestante;
let modoTiempoActivo = false;

function iniciarTrivia(preguntasAPI, esTiempoLimite) {
    preguntas = preguntasAPI.map(p => ({ ...p, incorrect_answers: p.incorrect_answers || [] }));
    indicePregunta = 0;
    respuestasCorrectas = 0;
    tiempoRestante = 60;
    modoTiempoActivo = esTiempoLimite;

    if (temporizador) clearInterval(temporizador);

    const tiempoContainer = document.getElementById("tiempo-container");
    if (tiempoContainer) tiempoContainer.style.display = esTiempoLimite ? "block" : "none";

    if (esTiempoLimite) iniciarTemporizador();

    mostrarPregunta();
}

function iniciarTemporizador() {
    const tiempoContainer = document.getElementById("tiempo-container");
    if (!tiempoContainer) return;

    tiempoContainer.innerHTML = `<p>Tiempo restante: <span id="tiempo">${tiempoRestante}</span> segundos</p>`;

    if (temporizador) clearInterval(temporizador);

    temporizador = setInterval(() => {
        tiempoRestante--;
        const tiempoElement = document.getElementById("tiempo");
        if (tiempoElement) tiempoElement.textContent = tiempoRestante;

        if (tiempoRestante <= 0) {
            clearInterval(temporizador);
            mostrarResultadoFinal();
        }
    }, 1000);
}

function mostrarPregunta() {
    const contenedor = document.getElementById("preguntas-container");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (indicePregunta >= preguntas.length) {
        if (temporizador) clearInterval(temporizador);
        mostrarResultadoFinal();
        return;
    }

    const pregunta = preguntas[indicePregunta];
    const respuestas = [...pregunta.incorrect_answers, pregunta.correct_answer].sort(() => Math.random() - 0.5);

    const divPregunta = document.createElement("div");
    divPregunta.innerHTML = `
        <p><strong>Pregunta ${indicePregunta + 1}:</strong> ${pregunta.question}</p>
        <ul>${respuestas.map(r => `<li><button class="respuesta">${r}</button></li>`).join("")}</ul>
        <button class="favorito">⭐ Agregar a favoritos</button>
    `;
    contenedor.appendChild(divPregunta);

    document.querySelectorAll(".respuesta").forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.textContent === pregunta.correct_answer) respuestasCorrectas++;
            indicePregunta++;
            mostrarPregunta();
        });
    });

    document.querySelector(".favorito").addEventListener("click", () => agregarAFavoritos(pregunta));
}

function mostrarResultadoFinal() {
    const contenedor = document.getElementById("preguntas-container");
    if (!contenedor) return;

    if (temporizador) clearInterval(temporizador);
    contenedor.innerHTML = `<h2>¡Juego terminado!</h2>`;

    const resultadoContainer = document.createElement("div");
    resultadoContainer.id = "resultado-container";
    resultadoContainer.innerHTML = `<p>Respondiste correctamente ${respuestasCorrectas} de ${preguntas.length} preguntas.</p>`;

    const botonReiniciar = document.createElement("button");
    botonReiniciar.textContent = "Volver a jugar";
    botonReiniciar.addEventListener("click", () => iniciarTrivia(preguntas, modoTiempoActivo));

    resultadoContainer.appendChild(botonReiniciar);
    contenedor.parentNode.appendChild(resultadoContainer);

    const tiempoContainer = document.getElementById("tiempo-container");
    if (tiempoContainer) tiempoContainer.style.display = "none";
}

function agregarAFavoritos(p) {
    if (!p.incorrect_answers) p.incorrect_answers = [];
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    if (!favoritos.some(f => f.question === p.question)) {
        favoritos.push(p);
        localStorage.setItem("favoritos", JSON.stringify(favoritos));
        alert("Pregunta agregada a favoritos ⭐");
    } else {
        alert("Esta pregunta ya está en favoritos.");
    }
}

function cargarFavoritos() {
    const container = document.getElementById("favoritos-container");
    if (!container) return;
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    container.innerHTML = favoritos.length === 0
        ? "<p>No tienes preguntas favoritas aún.</p>"
        : favoritos.map((p, i) => `
            <div class="favorito-item">
                <p><strong>${p.question}</strong></p>
                <button onclick="confirmarEliminar(${i})">Eliminar</button>
                <button onclick="mostrarFormularioEditar(${i})">Editar</button>
            </div>
        `).join("");
}

function confirmarEliminar(index) {
    if (confirm("¿Estás seguro de eliminar esta pregunta?")) eliminarFavorito(index);
}

function eliminarFavorito(index) {
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    if (index >= 0 && index < favoritos.length) {
        favoritos.splice(index, 1);
        localStorage.setItem("favoritos", JSON.stringify(favoritos));
        cargarFavoritos();
        mostrarNotificacion("Pregunta eliminada", "exito");
    } else {
        mostrarNotificacion("Error al eliminar", "error");
    }
}

function mostrarFormularioEditar(index) {
    // Igual que ya lo tienes
}

function mostrarNotificacion(mensaje, tipo) {
    const n = document.createElement("div");
    n.className = `notificacion ${tipo}`;
    n.textContent = mensaje;
    document.body.appendChild(n);
    setTimeout(() => {
        if (document.body.contains(n)) document.body.removeChild(n);
    }, 3000);
}

function configurarModoOscuro() {
    const body = document.body;
    const modoOscuroCheckbox = document.getElementById("modoOscuro");
    const modoOscuroActivo = localStorage.getItem("modoOscuro") === "true";
    if (modoOscuroActivo) body.classList.add("modo-oscuro");
    if (modoOscuroCheckbox) {
        modoOscuroCheckbox.checked = modoOscuroActivo;
        modoOscuroCheckbox.addEventListener("change", function () {
            body.classList.toggle("modo-oscuro", this.checked);
            localStorage.setItem("modoOscuro", this.checked);
        });
    }
}

// ✅ HACEMOS PÚBLICAS LAS FUNCIONES NECESARIAS PARA ELIMINAR
window.eliminarFavorito = eliminarFavorito;
window.confirmarEliminar = confirmarEliminar;



