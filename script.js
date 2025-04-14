import { Home } from './vistas/categorias.js';
import { Quiz } from './vistas/trivia.js';
import { Favorites } from './vistas/favoritos.js';
import { Search } from './vistas/buscador.js';
import { Filter } from './vistas/filtro.js';
import { info } from './vistas/informacion.js';

const app = document.getElementById('app');

const routes = {
  home: Home,
  quiz: Quiz,
  favorites: Favorites,
  search: Search,
  filter: Filter,
  info: info
};

function router() {
  const hash = location.hash.replace('#', '') || 'home';
  const render = routes[hash];
  if (render) {
    app.innerHTML = '';
    render(app);
  } else {
    app.innerHTML = '<h2>404 - Página no encontrada</h2>';
  }
}

// Función para eliminar de favoritos
window.removeFromFavorites = function (encodedQuestion) {
  const question = JSON.parse(decodeURIComponent(encodedQuestion));
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  favorites = favorites.filter(q => q.question !== question.question);

  localStorage.setItem('favorites', JSON.stringify(favorites));
  alert('Pregunta eliminada de favoritos ✅');

  // Volver a renderizar los favoritos sin recargar toda la página
  if (location.hash === '#favorites') {
    const app = document.getElementById('app');
    app.innerHTML = ''; // Limpia el contenedor
    Favorites(app); // Renderiza de nuevo los favoritos
  }
};

// Función para agregar a favoritos y mostrar alerta
window.addToFavorites = function (question) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  // Comprobar si la pregunta ya está en los favoritos
  const exists = favorites.some(q => q.question === question.question);

  if (!exists) {
    favorites.push(question);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Pregunta añadida a favoritos ✅');
  } else {
    alert('La pregunta ya está en favoritos ❗');
  }
};


window.addEventListener('hashchange', router);
window.addEventListener('load', router);
