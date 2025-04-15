export function info(container) {
  container.innerHTML = `
    <div style="
      position: relative;
      overflow: hidden;
      padding: 20px;
      min-height: 100vh;
      font-family: 'Arial', sans-serif;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
    ">

      <!-- Fondo borroso -->
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('imagenes/imagen_iconica.gif');
        background-size: cover;
        background-position: center;
        filter: blur(10px);
        z-index: 0;
      "></div>

      <!-- Contenido -->
      <div style="position: relative; z-index: 1; color: white;">
        <h1 style="font-size: 2.2em; margin-bottom: 15px; color: black;">API: Open Trivia DataBase "Opentdb"</h1>


        <img src="imagenes/tematica.png" alt="Trivia Icon" style="width: 150px; margin: 0 auto 20px;" />

        <div style="
          background-color: rgba(0,0,0,0.6);
          padding: 15px;
          border-radius: 10px;
          margin: 0 auto 20px;
          width: 90%;
          max-width: 400px;
          font-size: 1em;
        ">
          <p>
            Esta app usa una API que ofrece preguntas de trivia de diferentes categorías como ciencia, cine, historia y más.
            ¡Perfecta para poner a prueba tus conocimientos!
          </p>
        </div>

        <!-- Estos en negro -->
        <p style="font-size: 1em; color: black;">GitHub: 
          <a href="https://github.com/Sanguzsua" target="_blank" style="color: black;">@Sanguzsua</a>
        </p>

        <p style="font-size: 1em; color: black;">Versión de la app: <strong>V.1.0.0</strong></p>

        <footer style="margin-top: 30px; font-size: 0.9em; color: black;">
          Hecho por <strong>Santiago Guzman Suarez</strong>
        </footer>
      </div>
    </div>
  `;
}
