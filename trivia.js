document.addEventListener("DOMContentLoaded", function () {
    // Crear contenedor del temporizador si no existe
    if (!document.getElementById("tiempo-container")) {
        const tiempoContainer = document.createElement("div");
        tiempoContainer.id = "tiempo-container";
        tiempoContainer.style.display = "none";
        // Insertar antes del contenedor de preguntas
        const preguntasContainer = document.getElementById("preguntas-container");
        if (preguntasContainer && preguntasContainer.parentNode) {
            preguntasContainer.parentNode.insertBefore(tiempoContainer, preguntasContainer);
        } else {
            document.body.appendChild(tiempoContainer);
        }
    }

    // Configuración de eventos y carga inicial
    let categoria = "";
    const urlParams = new URLSearchParams(window.location.search);
    categoria = urlParams.get("categoria");
    const esTiempoLimite = urlParams.get("modo") === "tiempo";
    
    // Si estamos en la página de favoritos, no necesitamos categoría
    const esPaginaFavoritos = window.location.href.includes("favoritos.html");
    
    // Solo verificar categoría si no estamos en la página de favoritos
    if (!categoria && document.getElementById("preguntas-container") && !esPaginaFavoritos) {
        console.error("No se detectó categoría.");
        return;
    }

    // Si estamos en modo Juego con Tiempo, siempre usamos favoritos
    if (esTiempoLimite) {
        let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
        if (favoritos.length === 0) {
            alert("No tienes preguntas favoritas para jugar con tiempo. Primero agrega algunas preguntas a favoritos.");
            // Redirigir a la página principal o de favoritos
            window.location.href = "index.html";
            return;
        }
        iniciarTrivia(favoritos, true);
    }
    // Si hay categoría y no estamos en modo tiempo, cargar las preguntas de la API
    else if (categoria) {
        console.log("Cargando preguntas para la categoría:", categoria);
        let preguntasGuardadas = localStorage.getItem(`preguntas_${categoria}`);
        
        if (preguntasGuardadas) {
            iniciarTrivia(JSON.parse(preguntasGuardadas), false);
        } else {
            fetch(`https://opentdb.com/api.php?amount=10&category=${categoria}&type=multiple`)
                .then(response => response.json())
                .then(data => {
                    if (!data.results || data.results.length === 0) {
                        throw new Error("No se recibieron preguntas.");
                    }
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
            callback(index); // Ejecuta el callback con el índice del botón presionado
            document.body.removeChild(notificacion); // Elimina la notificación
        });
    });
}


function agregarEventoBoton(idBoton, esTiempoLimite) {
    const boton = document.getElementById(idBoton);
    if (boton) {
        boton.addEventListener("click", () => {
            let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
            if (favoritos.length === 0) {
                mostrarNotificacion(`No tienes preguntas favoritas${esTiempoLimite ? " para jugar con tiempo" : ""}. ¡Agrega algunas primero!`, "info");
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

// Reutilizamos la función para ambos botones
agregarEventoBoton("btn-favoritos", false); // Botón favoritos con confirmación
agregarEventoBoton("btn-tiempo", true);    // Botón de modo tiempo


let indicePregunta = 0;
let preguntas = [];
let respuestasCorrectas = 0;
let temporizador;
let tiempoRestante;
let modoTiempoActivo = false;

function iniciarTrivia(preguntasAPI, esTiempoLimite) {
    console.log("Iniciando trivia con", preguntasAPI.length, "preguntas. Modo tiempo:", esTiempoLimite);
    
    // Verificar estructura de las preguntas y corregir si es necesario
    preguntas = preguntasAPI.map(pregunta => {
        if (!pregunta.incorrect_answers || !Array.isArray(pregunta.incorrect_answers)) {
            console.log("Corrigiendo estructura de pregunta:", pregunta);
            pregunta.incorrect_answers = pregunta.incorrect_answers || [];
        }
        return pregunta;
    });
    
    indicePregunta = 0;
    respuestasCorrectas = 0;
    tiempoRestante = 60;
    modoTiempoActivo = esTiempoLimite;
    
    if (temporizador) {
        clearInterval(temporizador);
    }

    // Mostrar el temporizador si es necesario
    const tiempoContainer = document.getElementById("tiempo-container");
    if (tiempoContainer) {
        tiempoContainer.style.display = esTiempoLimite ? "block" : "none";
    }

    if (esTiempoLimite) {
        iniciarTemporizador();
    }
    
    mostrarPregunta();
}

function iniciarTemporizador() {
    const tiempoContainer = document.getElementById("tiempo-container");
    if (!tiempoContainer) return;

    // Establece el contenido inicial del temporizador
    tiempoContainer.innerHTML = `<p>Tiempo restante: <span id="tiempo">${tiempoRestante}</span> segundos</p>`;
    
    // Asegurarse de limpiar el temporizador anterior si ya existe
    if (temporizador) {
        clearInterval(temporizador);
    }
    
    // Inicia el temporizador con el intervalo de 1 segundo
    temporizador = setInterval(() => {
        tiempoRestante--; // Decrementa el tiempo
        const tiempoElement = document.getElementById("tiempo");
       
        if (tiempoElement) {
            tiempoElement.textContent = tiempoRestante; // Actualiza el tiempo mostrado
        }

        if (tiempoRestante <= 0) {
            clearInterval(temporizador); // Detiene el temporizador cuando llega a 0
            mostrarResultadoFinal(); // Muestra el resultado final
        }
    }, 1000); // 1000ms = 1 segundo
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
    
    // Asegurar estructura correcta
    if (!pregunta || !pregunta.question) {
        console.error("Pregunta sin estructura correcta:", pregunta);
        indicePregunta++;
        mostrarPregunta();
        return;
    }

    const respuestas = [...pregunta.incorrect_answers, pregunta.correct_answer].sort(() => Math.random() - 0.5);
    
    const divPregunta = document.createElement("div");
    divPregunta.innerHTML = `
        <p><strong>Pregunta ${indicePregunta + 1} de ${preguntas.length}:</strong> ${pregunta.question}</p>
        <ul>
            ${respuestas.map(respuesta => `<li><button class="respuesta">${respuesta}</button></li>`).join("")}
        </ul>
        <button class="favorito">⭐ Agregar a favoritos</button>
    `;
    contenedor.appendChild(divPregunta);

    document.querySelectorAll(".respuesta").forEach(boton => {
        boton.addEventListener("click", () => {
            if (boton.textContent === pregunta.correct_answer) {
                respuestasCorrectas++;
            }
            indicePregunta++;
            mostrarPregunta();
        });
    });

    document.querySelector(".favorito").addEventListener("click", () => {
        agregarAFavoritos(pregunta);
    });
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
    botonReiniciar.addEventListener("click", () => {
        iniciarTrivia(preguntas, modoTiempoActivo);
    });
    resultadoContainer.appendChild(botonReiniciar);
    
    contenedor.parentNode.appendChild(resultadoContainer);

    const tiempoContainer = document.getElementById("tiempo-container");
    if (tiempoContainer) tiempoContainer.style.display = "none";
}

function agregarAFavoritos(preguntaObj) {
    if (!preguntaObj.incorrect_answers) {
        preguntaObj.incorrect_answers = [];
    }

    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    if (!favoritos.some(p => p.question === preguntaObj.question)) {
        favoritos.push(preguntaObj);
        localStorage.setItem("favoritos", JSON.stringify(favoritos));
        alert("Pregunta agregada a favoritos ⭐");
    } else {
        alert("Esta pregunta ya está en favoritos.");
    }
}

// Función mejorada para cargar preguntas favoritas
function cargarFavoritos() {
    const container = document.getElementById("favoritos-container");
    if (!container) return;

    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    container.innerHTML = favoritos.length === 0
        ? "<p>No tienes preguntas favoritas aún.</p>"
        : favoritos.map((pregunta, index) => `
            <div class="favorito-item">
                <p><strong>${pregunta.question}</strong></p>
                <button onclick="confirmarEliminar(${index})">Eliminar</button>
                <button onclick="mostrarFormularioEditar(${index})">Editar</button>
            </div>
        `).join("");
}

// --- CONFIGURACIÓN: MODO OSCURO ---
document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    const modoOscuroCheckbox = document.getElementById("modoOscuro");
    const modoOscuroActivo = localStorage.getItem("modoOscuro") === "true";

    if (modoOscuroActivo) {
        body.classList.add("modo-oscuro");
    }

    if (modoOscuroCheckbox) {
        modoOscuroCheckbox.checked = modoOscuroActivo;
        modoOscuroCheckbox.addEventListener("change", function () {
            body.classList.toggle("modo-oscuro", this.checked);
            localStorage.setItem("modoOscuro", this.checked);
        });
    }
});


// Función para confirmar eliminación
function confirmarEliminar(index) {
    if (confirm("¿Estás seguro de que deseas eliminar esta pregunta de tus favoritos?")) {
        eliminarFavorito(index);
    }
}

// Función mejorada para eliminar favorito
function eliminarFavorito(index) {
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    if (index >= 0 && index < favoritos.length) {
        favoritos.splice(index, 1); // Elimina la pregunta del array
        localStorage.setItem("favoritos", JSON.stringify(favoritos)); // Guarda cambios en localStorage
        cargarFavoritos(); // Actualiza la vista
        mostrarNotificacion("Pregunta eliminada de favoritos", "exito");
    } else {
        mostrarNotificacion("Error al eliminar la pregunta", "error");
    }
}

function mostrarFormularioEditar(index) {
    // Recuperar favoritos actualizados desde localStorage
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    const pregunta = favoritos[index]; // Obtener la pregunta actualizada

    // Crear el modal para edición
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
        <div class="modal-contenido">
            <h2>Editar Pregunta</h2>
            <form id="form-editar-favorito">
                <label for="pregunta">Pregunta:</label>
                <input type="text" id="pregunta" value="${pregunta.question}" required>

                <label for="categoria">Categoría:</label>
                <input type="text" id="categoria" value="${pregunta.category}" required>

                <label for="respuesta-correcta">Respuesta Correcta:</label>
                <input type="text" id="respuesta-correcta" value="${pregunta.correct_answer}" required>

                <label for="respuestas-incorrectas">Respuestas Incorrectas:</label>
                <div id="respuestas-incorrectas">
                    ${pregunta.incorrect_answers.map((respuesta, idx) => `
                        <input type="text" class="respuesta-incorrecta" value="${respuesta}" placeholder="Respuesta incorrecta ${idx + 1}">
                    `).join("")}
                </div>
                <button type="button" id="agregar-incorrecta">+ Agregar respuesta incorrecta</button>
                <button type="submit">Guardar Cambios</button>
                <button type="button" class="btn-cancelar">Cancelar</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Evento para agregar respuestas incorrectas
    document.getElementById("agregar-incorrecta").addEventListener("click", function () {
        const container = document.getElementById("respuestas-incorrectas");
        const input = document.createElement("input");
        input.type = "text";
        input.className = "respuesta-incorrecta";
        input.placeholder = `Respuesta incorrecta ${container.children.length + 1}`;
        container.appendChild(input);
    });

    // Evento para cancelar edición
    modal.querySelector(".btn-cancelar").addEventListener("click", function () {
        document.body.removeChild(modal);
    });

    document.getElementById("form-editar-favorito").addEventListener("submit", function (e) {
        e.preventDefault();
    
        // Recopilar datos del formulario
        const preguntaEditada = {
            question: document.getElementById("pregunta").value,
            category: document.getElementById("categoria").value,
            correct_answer: document.getElementById("respuesta-correcta").value,
            incorrect_answers: Array.from(document.querySelectorAll(".respuesta-incorrecta"))
                .map(input => input.value)
                .filter(value => value.trim() !== "")
        };
    
        // Actualizar en localStorage
        actualizarFavorito(index, preguntaEditada);
    
        // Actualizar la vista dinámica
        cargarFavoritos(); // Refresca la lista de favoritos
    
        // Eliminar el modal de edición
        document.body.removeChild(modal);
    
        // Mostrar notificación de éxito
        mostrarNotificacion("¡Pregunta editada y guardada exitosamente!", "exito");
    });
    


    function actualizarFavorito(index, preguntaEditada) {
        let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    
        if (index >= 0 && index < favoritos.length) {
            favoritos[index] = preguntaEditada;
            localStorage.setItem("favoritos", JSON.stringify(favoritos));
    
            // Refrescar la lista visible
            cargarFavoritos();
    
            // Mostrar notificación de éxito
            mostrarNotificacion("¡Pregunta actualizada correctamente!", "exito");
        } else {
            mostrarNotificacion("Hubo un error al actualizar la pregunta", "error");
        }
    }
    
}
function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement("div");
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;

    document.body.appendChild(notificacion);

    setTimeout(() => {
        if (document.body.contains(notificacion)) {
            document.body.removeChild(notificacion);
        }
    }, 3000); // La notificación desaparece automáticamente después de 3 segundos
}


document.addEventListener("DOMContentLoaded", () => {
    const categorias = [
        { nombre: "Cine", url: "peliculas.html", id: "11" },  // Add proper category IDs
        { nombre: "Ciencia", url: "ciencia.html", id: "17" },
        { nombre: "Cultura", url: "cultura.html", id: "10" },
        { nombre: "Historia", url: "historia.html", id: "23" },
        { nombre: "Deportes", url: "deportes.html", id: "21" }
    ];

    const inputBusqueda = document.getElementById("busqueda");
    const resultadosBusqueda = document.getElementById("resultados-busqueda");

    if (inputBusqueda) {
        inputBusqueda.addEventListener("input", () => {
            const query = inputBusqueda.value.toLowerCase();
            resultadosBusqueda.innerHTML = "";

            // Filtrar categorías que coincidan con la búsqueda
            const resultados = categorias.filter(categoria =>
                categoria.nombre.toLowerCase().includes(query)
            );

            if (resultados.length === 0) {
                resultadosBusqueda.innerHTML = "<p>No se encontraron resultados.</p>";
                return;
            }

            // Mostrar categorías filtradas como enlaces con parámetro de categoría
            resultados.forEach(categoria => {
                const divResultado = document.createElement("div");
                divResultado.className = "resultado-item";
                // Agregar el parámetro de categoría a la URL
                divResultado.innerHTML = `<a href="${categoria.url}?categoria=${categoria.id}">${categoria.nombre}</a>`;
                resultadosBusqueda.appendChild(divResultado);
            });
        });
    }
});



