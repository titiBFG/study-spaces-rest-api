
const API_MIS_RESENAS = "http://127.0.0.1:8000";

async function mostrarMisResenas() {
    const contenedor = document.getElementById("listaMisResenas");
    const cantidad = document.getElementById("cantidadResenas");

    const token = localStorage.getItem("token");

    contenedor.innerHTML = "";

    if (!token) {
        cantidad.textContent = "Mis reseñas";

        contenedor.innerHTML = `
            <div class="sin-resultados">
                <h3>Iniciá sesión para ver tus reseñas</h3>
                <a class="boton-detalle" href="login.html">
                    Iniciar sesión
                </a>
            </div>
        `;
        return;
    }

    try {
        const respuesta = await fetch(API_MIS_RESENAS + "/reviews/mine", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!respuesta.ok) {
            if (respuesta.status === 403) {
                contenedor.textContent =
                    "Las reseñas están disponibles para estudiantes.";
                return;
            }

            throw new Error("No se pudieron cargar las reseñas");
        }

        const resenas = await respuesta.json();

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
                return item.id === resena.space_id;
            });

            const tarjeta = document.createElement("div");
            tarjeta.className = "detalle-tarjeta";
            tarjeta.style.marginBottom = "20px";

            const titulo = document.createElement("h3");
            titulo.textContent = espacio
                ? espacio.name
                : "Espacio no disponible";

            const estrellas = document.createElement("div");
            estrellas.className = "estrellas";
            estrellas.textContent =
                "★".repeat(resena.rating) +
                "☆".repeat(5 - resena.rating);

            const comentario = document.createElement("p");
            comentario.textContent = resena.comment;

            tarjeta.appendChild(titulo);
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
    } catch (error) {
        contenedor.textContent =
            "No se pudieron cargar las reseñas. Revisá la conexión.";
    }
}

async function iniciarMisResenas() {
    try {
        const respuesta = await fetch(API_MIS_RESENAS + "/spaces/");

        if (!respuesta.ok) {
            throw new Error("Error al cargar espacios");
        }

        espacios = await respuesta.json();
        mostrarMisResenas();
    } catch (error) {
        document.getElementById("listaMisResenas").textContent =
            "No se pudieron cargar los espacios.";
    }
}

iniciarMisResenas();
