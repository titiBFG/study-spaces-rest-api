
function mostrarFavoritos() {
    const contenedor = document.getElementById("listaFavoritos");
    const cantidad = document.getElementById("cantidadFavoritos");

    const idsFavoritos = obtenerFavoritos();

    const lista = espacios.filter(function(espacio) {
        return idsFavoritos.includes(espacio.id);
    });

    contenedor.innerHTML = "";
    cantidad.textContent = lista.length + " espacios favoritos";

    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-resultados">
                <h3>Todavía no tenés favoritos ♡</h3>
                <p>Explorá los espacios y guardá los que más te gusten.</p>
                <a class="boton-detalle" href="index.html">Explorar espacios</a>
            </div>
        `;
        return;
    }

    lista.forEach(function(espacio) {
        contenedor.appendChild(crearTarjeta(espacio));
    });
}

mostrarFavoritos();
