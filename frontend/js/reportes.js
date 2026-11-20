
const API_REPORTES = "https://study-spaces-rest-api.onrender.com";

async function enviarReporte(tipo, id, motivo, mensaje) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Tenés que iniciar sesión para reportar contenido.");
        window.location.href = "login.html";
        return false;
    }

    mensaje.textContent = "Enviando reporte...";

    try {
        const respuesta = await fetch(
            API_REPORTES + "/reports/" + tipo + "/" + id,
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    reason: motivo
                })
            }
        );

        if (respuesta.ok) {
            mensaje.textContent =
                "Reporte enviado. Un administrador lo revisará.";
            return true;
        }

        const error = await respuesta.json();

        mensaje.textContent =
            typeof error.detail === "string"
                ? error.detail
                : "No se pudo enviar el reporte.";

    } catch (error) {
        mensaje.textContent =
            "No se pudo conectar con el servidor.";
    }

    return false;
}

// Reportar un espacio

const formularioEspacio = document.getElementById("formReporteEspacio");

if (formularioEspacio) {
    formularioEspacio.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const motivo = document.getElementById("motivoEspacio").value.trim();
        const mensaje = document.getElementById("mensajeReporteEspacio");

        const id = new URLSearchParams(
            window.location.search
        ).get("id");

        if (!id || !motivo) {
            return;
        }

        const enviado = await enviarReporte(
            "spaces",
            id,
            motivo,
            mensaje
        );

        if (enviado) {
            formularioEspacio.reset();
        }
    });
}

// Reportar reseñas

const detalleContenedor = document.getElementById("detalleEspacio");

if (detalleContenedor) {
    const observador = new MutationObserver(function () {
        const listaResenas = document.getElementById("listaResenas");

        if (!listaResenas) {
            return;
        }

        const tarjetas = listaResenas.querySelectorAll(".resena");

        tarjetas.forEach(function (tarjeta, indice) {
            if (tarjeta.querySelector(".boton-reportar-resena")) {
                return;
            }

            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "boton-reportar-resena";
            boton.textContent = "Reportar reseña";

            boton.style.marginTop = "10px";
            boton.style.backgroundColor = "#a66a45";

            boton.addEventListener("click", async function () {
                const motivo = prompt(
                    "¿Por qué querés reportar esta reseña?"
                );

                if (motivo === null) {
                    return;
                }

                if (!motivo.trim() || motivo.trim().length > 500) {
                    alert("Ingresá un motivo de entre 1 y 500 caracteres.");
                    return;
                }

                try {
                    const idEspacio = new URLSearchParams(
                        window.location.search
                    ).get("id");

                    const respuesta = await fetch(
                        API_REPORTES + "/reviews/space/" + idEspacio
                    );

                    if (!respuesta.ok) {
                        throw new Error();
                    }

                    const resenas = await respuesta.json();

                    if (!resenas[indice]) {
                        return;
                    }

                    const mensaje = document.createElement("p");
                    tarjeta.appendChild(mensaje);

                    await enviarReporte(
                        "reviews",
                        resenas[indice].id,
                        motivo.trim(),
                        mensaje
                    );

                } catch (error) {
                    alert(
                        "No se pudo identificar la reseña. Intentá nuevamente."
                    );
                }
            });

            tarjeta.appendChild(boton);
        });
    });

    observador.observe(detalleContenedor, {
        childList: true,
        subtree: true
    });
}
