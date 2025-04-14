export function Search(container) {
    container.innerHTML = `
      <h2>Buscar Preguntas</h2>
      <input type="text" id="search-query" placeholder="Buscar por palabra clave (ej. Historia)">
      <button id="search-btn">Buscar</button>
      <div id="search-results"></div>
    `;
  
    // Función para manejar la búsqueda
    const searchButton = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-query');
    const searchResults = document.getElementById('search-results');
  
    searchButton.addEventListener('click', async () => {
      const query = searchInput.value.trim().toLowerCase();
      if (query) {
        searchResults.innerHTML = 'Cargando...';
        const questions = await fetchQuestions(query);
        if (questions.length > 0) {
          searchResults.innerHTML = questions.map(question => `<p>${question.question}</p>`).join('');
        } else {
          searchResults.innerHTML = 'No se encontraron preguntas.';
        }
      }
    });
  
    // Función para hacer la consulta a la API
    async function fetchQuestions(query) {
      try {
        const response = await fetch(`https://opentdb.com/api.php?amount=10&type=multiple&difficulty=easy&category=23&query=${query}`);
        const data = await response.json();
        return data.results;
      } catch (error) {
        console.error('Error al obtener las preguntas:', error);
        return [];
      }
    }
  }
  