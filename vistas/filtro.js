export function Filter(container) {
  container.innerHTML = `
    <h2>Filtrar por Categoría</h2>
    <select id="category-select">
      <option value="">Selecciona una categoría</option>
      <!-- Las opciones de categorías se cargarán dinámicamente aquí -->
    </select>
    <button id="filter-btn">Mostrar Preguntas</button>
    <div id="filter-results"></div>
  `;

  const categorySelect = document.getElementById('category-select');
  const filterButton = document.getElementById('filter-btn');
  const filterResults = document.getElementById('filter-results');

  // Cargar las categorías disponibles desde la API
  async function loadCategories() {
    try {
      const response = await fetch('https://opentdb.com/api_category.php');
      const data = await response.json();
      const categories = data.trivia_categories;
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar las categorías:', error);
    }
  }

  // Filtrar preguntas por categoría
  filterButton.addEventListener('click', async () => {
    const categoryId = categorySelect.value;
    if (categoryId) {
      filterResults.innerHTML = 'Cargando preguntas...';
      const questions = await fetchQuestions(categoryId);
      if (questions.length > 0) {
        filterResults.innerHTML = questions.map(question => `<p>${question.question}</p>`).join('');
      } else {
        filterResults.innerHTML = 'No se encontraron preguntas en esta categoría.';
      }
    } else {
      filterResults.innerHTML = 'Por favor, selecciona una categoría.';
    }
  });

  // Función para obtener preguntas de una categoría específica
  async function fetchQuestions(categoryId) {
    try {
      const response = await fetch(`https://opentdb.com/api.php?amount=10&type=multiple&category=${categoryId}`);
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error al obtener las preguntas:', error);
      return [];
    }
  }

  // Llamar a la función para cargar las categorías cuando se cargue la vista
  loadCategories();
}
