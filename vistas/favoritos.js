export function Favorites(container) {
  // Obtén los favoritos del localStorage
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
  container.innerHTML = '<h2>Favoritos</h2>';

  // Si no hay favoritos, muestra un mensaje
  if (favorites.length === 0) {
    container.innerHTML += '<p>No tienes favoritos guardados.</p>';
    return;
  }

  // Renderiza cada favorito
  favorites.forEach(q => {
    const question = document.createElement('div');
    question.innerHTML = `
      <p>${q.question}</p>
      <button class="remove-from-favorites-btn" data-question='${JSON.stringify(q)}'>Eliminar</button>
    `;
    container.appendChild(question);
  });

  // Asignar el evento de clic para eliminar de favoritos
  const removeButtons = document.querySelectorAll('.remove-from-favorites-btn');
  removeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const question = JSON.parse(event.target.getAttribute('data-question')); // Obtener la pregunta desde el atributo
      removeFromFavorites(question); // Llamada a la función de eliminación
    });
  });
}

// Función para eliminar de favoritos
window.removeFromFavorites = function (question) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  // Filtra los favoritos para eliminar la pregunta
  favorites = favorites.filter(q => q.question !== question.question);

  // Guarda los nuevos favoritos en localStorage
  localStorage.setItem('favorites', JSON.stringify(favorites));
  alert('Pregunta eliminada de favoritos ✅');

  // Volver a renderizar los favoritos sin recargar toda la página
  if (location.hash === '#favorites') {
    const app = document.getElementById('app');
    app.innerHTML = ''; // Limpia el contenedor
    Favorites(app); // Renderiza de nuevo los favoritos
  }
};

