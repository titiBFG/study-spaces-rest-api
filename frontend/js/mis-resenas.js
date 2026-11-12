
function mostrarMisResenas() {
    const contenedor = document.getElementById("listaMisResenas");
    const cantidad = document.getElementById("cantidadResenas");

    const resenas = JSON.parse(localStorage.getItem("resenas")) || [];

    contenedor.innerHTML = "";
    cantidad.textContent = resenas.length + " reseñas publicadas";

    if (resenas.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-resultados">
                <h3>Todavía no publicaste reseñas</h3>
                <p>Explorá los espacios y compartí tu experiencia.</p>
                <a class="boton-detalle" href="index.html">
                    Explorar espacios
                </a>
            </div>
        `;
        return;
    }

    resenas.forEach(function(resena) {
        const espacio = espacios.find(function(item) {
            return item.id === resena.espacioId;
        });

        const tarjeta = document.createElement("div");
        tarjeta.className = "detalle-tarjeta";
        tarjeta.style.marginBottom = "20px";

        const titulo = document.createElement("h3");
        titulo.textContent = espacio ? espacio.name : "Espacio no disponible";

        const nombre = document.createElement("p");
        nombre.textContent = "Publicado por: " + resena.nombre;

        const estrellas = document.createElement("div");
        estrellas.className = "estrellas";
        estrellas.textContent = "★".repeat(resena.calificacion) +
            "☆".repeat(5 - resena.calificacion);

        const comentario = document.createElement("p");
        comentario.textContent = resena.comentario;

        tarjeta.appendChild(titulo);
        tarjeta.appendChild(nombre);
        tarjeta.appendChild(estrellas);
        tarjeta.appendChild(comentario);

        if (espacio) {
            const enlace = document.createElement("a");
            enlace.className = "boton-detalle";
            enlace.href = "detalle.html?id=" + espacio.id;
            enlace.textContent = "Ver espacio →";

            tarjeta.appendChild(enlace);
        }

        contenedor.appendChild(tarjeta);
    });
}

mostrarMisResenas();
