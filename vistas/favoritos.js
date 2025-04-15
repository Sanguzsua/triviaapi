export function Favorites(container) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  container.innerHTML = '<h2>Favoritos</h2>';

  if (favorites.length === 0) {
    container.innerHTML += '<p>No tienes favoritos guardados.</p>';
    return;
  }

  favorites.forEach(q => {
    const questionDiv = document.createElement('div');
    const encodedQuestion = encodeURIComponent(JSON.stringify(q));
    const answers = Array.isArray(q.answers) ? q.answers : [];

    questionDiv.innerHTML = `
      <p><strong>${q.question}</strong></p>
      <ul>
        ${answers.map(ans => `<li>${ans}</li>`).join('')}
      </ul>
      <button class="remove-from-favorites-btn" data-question="${encodedQuestion}">Eliminar</button>
      <button class="edit-favorite-btn" data-question="${encodedQuestion}">Editar</button>
    `;
    container.appendChild(questionDiv);
  });

  container.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-from-favorites-btn')) {
      const encoded = event.target.getAttribute('data-question');
      const question = JSON.parse(decodeURIComponent(encoded));
      removeFromFavorites(question);
    }

    if (event.target.classList.contains('edit-favorite-btn')) {
      const encoded = event.target.getAttribute('data-question');
      const question = JSON.parse(decodeURIComponent(encoded));
      editFavorite(question);
    }
  });
}

// Función para eliminar de favoritos
function removeFromFavorites(question) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(q => q.question !== question.question);
  localStorage.setItem('favorites', JSON.stringify(favorites));

  const app = document.getElementById('app');
  Favorites(app);
}

// Función para editar favorito
function editFavorite(question) {
  const app = document.getElementById('app');
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  const allDivs = Array.from(app.querySelectorAll('div'));
  const questionDiv = allDivs.find(div => div.textContent.includes(question.question));

  if (!questionDiv) return;

  questionDiv.innerHTML = `
    <label>Pregunta:</label>
    <input type="text" id="edit-question" value="${question.question}" style="width: 100%; margin-bottom: 8px;" />

    <label>Respuestas (separadas por coma):</label>
    <input type="text" id="edit-answers" value="${(Array.isArray(question.answers) ? question.answers : []).join(', ')}" style="width: 100%; margin-bottom: 8px;" />

    <label>Respuesta correcta:</label>
    <input type="text" id="edit-correct-answer" value="${question.correctAnswer || ''}" style="width: 100%; margin-bottom: 8px;" />

    <button id="save-edit">Guardar ✅</button>
    <button id="cancel-edit">Cancelar ❌</button>
  `;

  questionDiv.querySelector('#save-edit').addEventListener('click', () => {
    const newQuestion = questionDiv.querySelector('#edit-question').value.trim();
    const newAnswersRaw = questionDiv.querySelector('#edit-answers').value.trim();
    const newCorrectAnswer = questionDiv.querySelector('#edit-correct-answer').value.trim();
    const newAnswers = newAnswersRaw.split(',').map(ans => ans.trim());

    if (!newQuestion || newAnswers.length === 0 || !newCorrectAnswer) {
      alert('Por favor completa todos los campos.');
      return;
    }

    if (!newAnswers.includes(newCorrectAnswer)) {
      alert('La respuesta correcta debe estar entre las opciones.');
      return;
    }

    const updatedFavorites = favorites.map(q =>
      q.question === question.question
        ? { ...q, question: newQuestion, answers: newAnswers, correctAnswer: newCorrectAnswer }
        : q
    );

    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    Favorites(app);
  });

  questionDiv.querySelector('#cancel-edit').addEventListener('click', () => {
    Favorites(app);
  });
}