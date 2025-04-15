export function Home(container) {
  container.innerHTML = `
    <div style="
      text-align: center;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <img src="imagenes/bienvenida.png" 
           alt="Bienvenido" 
           style="
             max-width:90%;
             height:10%;
             border-radius: 20px;
             box-shadow: 0 4px 12px rgba(0,0,0,0.3);
             margin-bottom: 20px;
           " />
    </div>
  `;
}


