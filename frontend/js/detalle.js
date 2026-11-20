
const parametros = new URLSearchParams(window.location.search);
const idEspacio = Number(parametros.get("id"));

const contenedorDetalle = document.getElementById("detalleEspacio");
const API_RESENAS = "https://study-spaces-rest-api.onrender.com";

async function mostrarResenas() {
    const lista = document.getElementById("listaResenas");
    const promedio = document.getElementById("promedioResenas");

    try {
        const respuesta = await fetch(
            API_RESENAS + "/reviews/space/" + idEspacio
        );

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las reseñas");
        }

        const resenas = await respuesta.json();

        lista.innerHTML = "";
        promedio.textContent = "";

        if (resenas.length === 0) {
            lista.textContent = "Todavía no hay reseñas para este espacio.";
            return;
        }

        let suma = 0;

        resenas.forEach(function (resena) {
            suma += resena.rating;

            const tarjeta = document.createElement("div");
            tarjeta.className = "resena";

            const nombre = document.createElement("h4");
            nombre.textContent = resena.author_name;

            const estrellas = document.createElement("div");
            estrellas.className = "estrellas";
            estrellas.textContent =
                "★".repeat(resena.rating) +
                "☆".repeat(5 - resena.rating);

            const comentario = document.createElement("p");
            comentario.textContent = resena.comment;

            tarjeta.appendChild(nombre);
            tarjeta.appendChild(estrellas);
            tarjeta.appendChild(comentario);

            if (resena.images && resena.images.length > 0) {
                resena.images.forEach(function (url) {
                    const imagen = document.createElement("img");
                    imagen.src = url;
                    imagen.alt = "Imagen de la reseña";
                    imagen.className = "imagen-resena";
                    imagen.loading = "lazy";

                    tarjeta.appendChild(imagen);
                });
            }

            const votos = document.createElement("div");
            votos.className = "votos-resena";

            const botonUtil = document.createElement("button");
            botonUtil.type = "button";
            botonUtil.textContent = "👍 Útil (" + (resena.useful_votes ?? 0) + ")";
            botonUtil.addEventListener("click", function () {
                votarResena(resena.id, true);
            });

            const botonNoUtil = document.createElement("button");
            botonNoUtil.type = "button";
            botonNoUtil.textContent =
                "👎 No útil (" + (resena.not_useful_votes ?? 0) + ")";

            botonNoUtil.addEventListener("click", function () {
                votarResena(resena.id, false);
            });

            votos.appendChild(botonUtil);
            votos.appendChild(botonNoUtil);

            tarjeta.appendChild(votos);
            lista.appendChild(tarjeta);
        });

        promedio.textContent =
            "Calificación promedio: " +
            (suma / resenas.length).toFixed(1) +
            " / 5 (" + resenas.length + " reseñas)";
    } catch (error) {
        lista.textContent = "No se pudieron cargar las reseñas.";
    }
}

async function votarResena(idResena, esUtil) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Iniciar sesión para votar una reseña.");
        window.location.href = "login.html";
        return;
    }

    try {
        const respuesta = await fetch(
            API_RESENAS + "/reviews/" + idResena + "/vote",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    is_useful: esUtil
                })
            }
        );

        if (respuesta.ok) {
            mostrarResenas();
        } else {
            const error = await respuesta.json();
            alert(error.detail || "No se pudo registrar el voto.");
        }
    } catch (error) {
        alert("No se pudo conectar con el servidor.");
    }
}

async function guardarResena(evento) {
    evento.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Tenés que iniciar sesión para publicar una reseña.");
        window.location.href = "login.html";
        return;
    }

    const calificacion = Number(
        document.getElementById("calificacion").value
    );

    const comentario = document.getElementById("comentario").value.trim();

    const textoImagenes = document.getElementById("imagenesResena").value.trim();

    const imagenes = textoImagenes
        ? textoImagenes.split("\n").map(function (url) {
            return url.trim();
        }).filter(function (url) {
            return url !== "";
        })
        : [];

    if (imagenes.length > 5) {
        alert("Podés agregar como máximo 5 imágenes.");
        return;
    }

    for (const url of imagenes) {
        try {
            const direccion = new URL(url);

            if (direccion.protocol !== "http:" &&
                direccion.protocol !== "https:") {
                throw new Error("URL inválida");
            }
        } catch (error) {
            alert("Ingresá URLs válidas que comiencen con http:// o https://.");
            return;
        }
    }

    if (!calificacion || !comentario) {
        alert("Completá todos los campos.");
        return;
    }

    try {
        const respuesta = await fetch(
            API_RESENAS + "/reviews/space/" + idEspacio,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    rating: calificacion,
                    comment: comentario,
                    images: imagenes
                })
            }
        );

        if (respuesta.ok) {
            alert("Reseña publicada correctamente.");
            document.getElementById("formResena").reset();
            mostrarResenas();
        } else {
            const error = await respuesta.json();

            if (respuesta.status === 403) {
                alert("Solo los estudiantes pueden publicar reseñas.");
            } else {
                alert(error.detail || "No se pudo publicar la reseña.");
            }
        }
    } catch (error) {
        alert("No se pudo conectar con el servidor.");
    }
}

function mostrarDetalle() {
    const espacio = espacios.find(function (item) {
        return item.id === idEspacio;
    });

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
                <h2 id="nombreDetalle"></h2>
                <button class="boton-favorito" id="favoritoDetalle"></button>
            </div>

            <p id="direccionDetalle"></p>

            <img class="detalle-imagen" id="imagenDetalle"
                alt="Foto del espacio">

            <h3>Sobre este espacio</h3>
            <p id="descripcionDetalle"></p>

            <h3>Características</h3>
            <div class="etiquetas" id="caracteristicasDetalle"></div>

            <h3>Reseñas y calificaciones</h3>
            <p id="promedioResenas"></p>
            <div id="listaResenas"></div>

            <div class="formulario-resena">
                <h3>Dejá tu reseña</h3>

                <form id="formResena">
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

                    <label for="imagenesResena">Imágenes (opcional)</label>
                    <textarea id="imagenesResena"
                        placeholder="Pegá hasta 5 URLs de imágenes, una por línea"></textarea>

                    <button type="submit">Publicar reseña</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById("nombreDetalle").textContent = espacio.name;

    document.getElementById("direccionDetalle").textContent =
        "📍 " + espacio.address + ", " + espacio.city;

    const imagen = document.getElementById("imagenDetalle");
    imagen.src = espacio.image_url || imagenEjemplo;
    imagen.alt = "Foto de " + espacio.name;

    imagen.onerror = function () {
        imagen.onerror = null;
        imagen.src = imagenEjemplo;
    };

    document.getElementById("descripcionDetalle").textContent =
        espacio.description;

    document.getElementById("caracteristicasDetalle").textContent =
        "📶 WiFi: " + (espacio.has_wifi ? "Sí" : "No") +
        "  🔌 Enchufes: " + (espacio.has_outlets ? "Sí" : "No") +
        "  🔊 Nivel de ruido: " + nombreRuido(espacio.noise_level);

    const botonFavorito = document.getElementById("favoritoDetalle");

    botonFavorito.textContent = esFavorito(espacio.id)
        ? "♥ Quitar de favoritos"
        : "♡ Agregar a favoritos";

    botonFavorito.addEventListener("click", function () {
        cambiarFavorito(espacio.id);
    });

    document.getElementById("formResena").addEventListener(
        "submit",
        guardarResena
    );

    mostrarResenas();
}
