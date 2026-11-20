
const API_MODERACION = "https://study-spaces-rest-api.onrender.com";

const contenedorReportes = document.getElementById("contenedorReportes");
const mensajeReportes = document.getElementById("mensajeReportes");

async function cargarReportes() {
    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    mensajeReportes.textContent = "Cargando reportes...";

    try {
        const respuesta = await fetch(
            API_MODERACION + "/reports?status=pending",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (respuesta.status === 403) {
            mensajeReportes.textContent =
                "Solo los administradores pueden ver reportes.";
            return;
        }

        if (!respuesta.ok) {
            throw new Error();
        }

        const reportes = await respuesta.json();

        contenedorReportes.innerHTML = "";

        if (reportes.length === 0) {
            mensajeReportes.textContent =
                "No hay reportes pendientes.";
            return;
        }

        mensajeReportes.textContent = "";

        reportes.forEach(function (reporte) {
            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjeta";

            const informacion = document.createElement("div");
            informacion.className = "informacion";

            const titulo = document.createElement("h3");
            titulo.textContent =
                "Reporte #" + reporte.id + " - " + reporte.type;

            const objetivo = document.createElement("p");

            if (reporte.review_id) {
                objetivo.textContent =
                    "Reseña #" + reporte.review_id;
            } else if (reporte.post_id) {
                objetivo.textContent =
                    "Publicación #" + reporte.post_id;
            } else if (reporte.space_id) {
                objetivo.textContent =
                    "Espacio #" + reporte.space_id;
            } else {
                objetivo.textContent =
                    "Usuario #" + reporte.reported_user_id;
            }

            const motivo = document.createElement("p");
            motivo.textContent = "Motivo: " + reporte.reason;

            const resolver = document.createElement("button");

            if (reporte.type === "study_space") {
                resolver.textContent = "Marcar como revisado";
            } else {
                resolver.textContent = "Resolver";
            }

            resolver.addEventListener("click", function () {
                gestionarReporte(reporte.id, "resolve");
            });

            const descartar = document.createElement("button");
            descartar.textContent = "Descartar";
            descartar.style.marginLeft = "10px";
            descartar.style.backgroundColor = "#a66a45";

            descartar.addEventListener("click", function () {
                gestionarReporte(reporte.id, "dismiss");
            });

            informacion.appendChild(titulo);
            informacion.appendChild(objetivo);
            informacion.appendChild(motivo);
            informacion.appendChild(resolver);
            informacion.appendChild(descartar);

            tarjeta.appendChild(informacion);
            contenedorReportes.appendChild(tarjeta);
        });

    } catch (error) {
        mensajeReportes.textContent =
            "No se pudieron cargar los reportes.";
    }
}

async function gestionarReporte(id, accion) {
    const texto = accion === "resolve"
        ? "marcar como revisado o resolver"
        : "descartar";

    if (!confirm("¿Querés " + texto + " el reporte #" + id + "?")) {
        return;
    }

    const token = localStorage.getItem("token");

    try {
        const respuesta = await fetch(
            API_MODERACION + "/reports/" + id + "/" + accion,
            {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!respuesta.ok) {
            const error = await respuesta.json();

            mensajeReportes.textContent =
                typeof error.detail === "string"
                    ? error.detail
                    : "No se pudo gestionar el reporte.";

            return;
        }

        await cargarReportes();

    } catch (error) {
        mensajeReportes.textContent =
            "No se pudo conectar con el servidor.";
    }
}

cargarReportes();
