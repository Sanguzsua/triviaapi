export function Favorites(container) {
  // Obtén los favoritos del localStorage o un arreglo vacío si no existe
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  container.innerHTML = '<h2>Favoritos</h2>';

  // Si no hay favoritos, muestra un mensaje
  if (favorites.length === 0) {
    container.innerHTML += '<p>No tienes favoritos guardados.</p>';
    return;
  }

  // Renderiza cada favorito
  favorites.forEach(q => {
    const questionDiv = document.createElement('div');
    const encodedQuestion = encodeURIComponent(JSON.stringify(q)); // Codificar la pregunta para pasarla a los botones

    // Aseguramos que 'answers' siempre sea un array
    const answers = Array.isArray(q.answers) ? q.answers : [];

    // Generar el HTML de cada pregunta favorita
    questionDiv.innerHTML = `
      <p><strong>${q.question}</strong></p>
      <ul>
        ${answers.map(answer => `<li>${answer}</li>`).join('')}
      </ul>
      <button class="remove-from-favorites-btn" data-question="${encodedQuestion}">Eliminar</button>
      <button class="edit-favorite-btn" data-question="${encodedQuestion}">Editar</button>
    `;
    container.appendChild(questionDiv);
  });

  // Asignar los eventos de clic para eliminar y editar de favoritos
  container.addEventListener('click', (event) => {
    // Eliminar favorito
    if (event.target.classList.contains('remove-from-favorites-btn')) {
      const encodedQuestion = event.target.getAttribute('data-question');
      const question = JSON.parse(decodeURIComponent(encodedQuestion));
      removeFromFavorites(question);
    }

    // Editar favorito
    if (event.target.classList.contains('edit-favorite-btn')) {
      const encodedQuestion = event.target.getAttribute('data-question');
      const question = JSON.parse(decodeURIComponent(encodedQuestion));
      editFavorite(question);
    }
  });
}

// Función para eliminar de favoritos
window.removeFromFavorites = function (question) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  favorites = favorites.filter(q => q.question !== question.question);
  localStorage.setItem('favorites', JSON.stringify(favorites));

  // Vuelve a renderizar
  if (location.hash === '#favorites') {
    const app = document.getElementById('app');
    app.innerHTML = '';
    Favorites(app);
  }
};

// Función para agregar a favoritos
window.addToFavorites = function (question) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  const exists = favorites.some(q => q.question === question.question);

  if (!exists) {
    favorites.push(question);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Pregunta añadida a favoritos ✅');
  } else {
    alert('La pregunta ya está en favoritos ❗');
  }

  if (location.hash === '#favorites') {
    const app = document.getElementById('app');
    app.innerHTML = '';
    Favorites(app);
  }
};

// Función para editar favorito directamente en pantalla
window.editFavorite = function (question) {
  const app = document.getElementById('app');
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  // Encuentra el div donde está esa pregunta
  const allDivs = Array.from(app.querySelectorAll('div'));
  const questionDiv = allDivs.find(div => div.textContent.includes(question.question));

  if (!questionDiv) return;

  questionDiv.innerHTML = `
  <label>Pregunta:</label>
  <input type="text" id="edit-question" value="${question.question}" style="width: 100%; margin-bottom: 8px;" />
  
  <label>Respuestas (separadas por coma):</label>
  <input type="text" id="edit-answers" value="${(Array.isArray(question.answers) ? question.answers : []).join(', ')}" style="width: 100%; margin-bottom: 8px;" />
  
  <button id="save-edit">Guardar ✅</button>
  <button id="cancel-edit">Cancelar ❌</button>
`;


  // Guardar cambios
  questionDiv.querySelector('#save-edit').addEventListener('click', () => {
    const newQuestion = questionDiv.querySelector('#edit-question').value.trim();
    const newAnswersRaw = questionDiv.querySelector('#edit-answers').value.trim();
    const newAnswers = newAnswersRaw.split(',').map(ans => ans.trim());

    if (!newQuestion || newAnswers.length === 0) {
      alert('Por favor ingresa una pregunta y al menos una respuesta.');
      return;
    }

    const updatedFavorites = favorites.map(q =>
      q.question === question.question
        ? { ...q, question: newQuestion, answers: newAnswers }
        : q
    );

    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    Favorites(app); // vuelve a renderizar
  });

  // Cancelar edición
  questionDiv.querySelector('#cancel-edit').addEventListener('click', () => {
    Favorites(app);
  });
};
