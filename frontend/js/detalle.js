
const parametros = new URLSearchParams(window.location.search);
const idEspacio = Number(parametros.get("id"));

const espacio = espacios.find(function(item) {
    return item.id === idEspacio;
});

const contenedorDetalle = document.getElementById("detalleEspacio");

function obtenerResenas() {
    return JSON.parse(localStorage.getItem("resenas")) || [];
}

function guardarResena(evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombreResena").value.trim();
    const calificacion = Number(document.getElementById("calificacion").value);
    const comentario = document.getElementById("comentario").value.trim();

    if (!nombre || !comentario || !calificacion) {
        alert("Completá todos los campos.");
        return;
    }

    const resenas = obtenerResenas();

    const nuevaResena = {
        espacioId: espacio.id,
        nombre: nombre,
        calificacion: calificacion,
        comentario: comentario
    };

    resenas.push(nuevaResena);
    localStorage.setItem("resenas", JSON.stringify(resenas));

    mostrarDetalle();
}

function mostrarResenas() {
    const lista = document.getElementById("listaResenas");

    const resenas = obtenerResenas().filter(function(resena) {
        return resena.espacioId === espacio.id;
    });

    lista.innerHTML = "";

    if (resenas.length === 0) {
        lista.textContent = "Todavía no hay reseñas para este espacio.";
        return;
    }

    let suma = 0;

    resenas.forEach(function(resena) {
        suma += resena.calificacion;

        const tarjeta = document.createElement("div");
        tarjeta.className = "resena";

        const nombre = document.createElement("h4");
        nombre.textContent = resena.nombre;

        const estrellas = document.createElement("div");
        estrellas.className = "estrellas";
        estrellas.textContent = "★".repeat(resena.calificacion) +
            "☆".repeat(5 - resena.calificacion);

        const comentario = document.createElement("p");
        comentario.textContent = resena.comentario;

        tarjeta.appendChild(nombre);
        tarjeta.appendChild(estrellas);
        tarjeta.appendChild(comentario);

        lista.appendChild(tarjeta);
    });

    const promedio = suma / resenas.length;

    document.getElementById("promedioResenas").textContent =
        "Calificación promedio: " + promedio.toFixed(1) +
        " / 5 (" + resenas.length + " reseñas)";
}

function mostrarDetalle() {
    if (!espacio) {
        contenedorDetalle.innerHTML = `
            <div class="sin-resultados">
                <h2>Espacio no encontrado</h2>
                <p>No pudimos encontrar el espacio que buscás.</p>
                <a href="index.html">Volver al inicio</a>
            </div>
        `;
        return;
    }

    contenedorDetalle.innerHTML = `
        <div class="detalle-tarjeta">
            <div class="detalle-titulo">
                <h2>${espacio.name}</h2>
                <button class="boton-favorito" onclick="favoritoDetalle()">
                    ${esFavorito(espacio.id) ? "♥ Quitar de favoritos" : "♡ Agregar a favoritos"}
                </button>
            </div>

            <p>📍 ${espacio.address}, ${espacio.city}</p>

            <img class="detalle-imagen" src="${espacio.image}" alt="Foto del espacio">

            <h3>Sobre este espacio</h3>
            <p>${espacio.description}</p>

            <h3>Características</h3>

            <div class="etiquetas">
                <span>📶 WiFi: ${espacio.has_wifi ? "Sí" : "No"}</span>
                <span>🔌 Enchufes: ${espacio.has_outlets ? "Sí" : "No"}</span>
                <span>🔊 Nivel de ruido: ${nombreRuido(espacio.noise_level)}</span>
            </div>

            <h3>Reseñas y calificaciones</h3>
            <p id="promedioResenas"></p>
            <div id="listaResenas"></div>

            <div class="formulario-resena">
                <h3>Dejá tu reseña</h3>

                <form id="formResena">
                    <label for="nombreResena">Tu nombre</label>
                    <input type="text" id="nombreResena" required maxlength="80">

                    <label for="calificacion">Calificación</label>
                    <select id="calificacion" required>
                        <option value="">Seleccioná una calificación</option>
                        <option value="5">★★★★★ - Excelente</option>
                        <option value="4">★★★★☆ - Muy bueno</option>
                        <option value="3">★★★☆☆ - Bueno</option>
                        <option value="2">★★☆☆☆ - Regular</option>
                        <option value="1">★☆☆☆☆ - Malo</option>
                    </select>

                    <label for="comentario">Tu comentario</label>
                    <textarea id="comentario" required maxlength="1000"
                        placeholder="Contanos cómo fue tu experiencia..."></textarea>

                    <button type="submit">Publicar reseña</button>
                </form>
            </div>
        </div>
    `;

    mostrarResenas();

    document.getElementById("formResena").addEventListener("submit", guardarResena);
}

function favoritoDetalle() {
    cambiarFavorito(espacio.id);
    mostrarDetalle();
}

mostrarDetalle();
