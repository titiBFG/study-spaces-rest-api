function iniciarNotificaciones() {
    const boton = document.getElementById("botonNotificaciones");
    const panel = document.getElementById("panelNotificaciones");
    const botonMarcarTodas = document.getElementById("marcarTodasLeidas");

    if (!boton || !panel) {
        return;
    }

    cargarContadorNotificaciones();

    boton.addEventListener("click", function () {
        const estaAbierto = !panel.hidden;

        panel.hidden = estaAbierto;
        boton.setAttribute("aria-expanded", String(!estaAbierto));

        if (!estaAbierto) {
            cargarNotificaciones();
        }
    });

    if (botonMarcarTodas) {
        botonMarcarTodas.addEventListener("click", marcarTodasComoLeidas);
    }

    document.addEventListener("click", function (evento) {
        const clicEnBoton = boton.contains(evento.target);
        const clicEnPanel = panel.contains(evento.target);

        if (!clicEnBoton && !clicEnPanel) {
            panel.hidden = true;
            boton.setAttribute("aria-expanded", "false");
        }
    });
}

async function cargarNotificaciones() {
    const token = localStorage.getItem("token");
    const lista = document.getElementById("listaNotificaciones");

    if (!token || !lista) {
        return;
    }

    try {
        const respuesta = await fetch(
            "https://study-spaces-rest-api.onrender.com/notifications",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!respuesta.ok) {
            throw new Error("Error al cargar notificaciones");
        }

        const notificaciones = await respuesta.json();

        lista.innerHTML = "";

        if (notificaciones.length === 0) {
            const mensaje = document.createElement("p");
            mensaje.textContent = "Todavía no hay notificaciones.";
            lista.appendChild(mensaje);
            return;
        }

        notificaciones.forEach(function (notificacion) {
            const elemento = document.createElement("div");
            elemento.className = "notificacion";

            if (!notificacion.is_read) {
                elemento.classList.add("no-leida");
            }

            const mensaje = document.createElement("p");
            mensaje.textContent = notificacion.message;

            elemento.appendChild(mensaje);

            const fecha = document.createElement("small");
            fecha.className = "fecha-notificacion";

            fecha.textContent = tiempoTranscurrido(notificacion.created_at);

            elemento.appendChild(fecha);

            if (!notificacion.is_read) {
                const botonLeida = document.createElement("button");
                botonLeida.type = "button";
                botonLeida.className = "marcar-leida";
                botonLeida.textContent = "Marcar como leída";

                botonLeida.addEventListener("click", function () {
                    marcarNotificacionComoLeida(notificacion.id);
                });

                elemento.appendChild(botonLeida);
            }

            lista.appendChild(elemento);
        });

    } catch (error) {
        lista.textContent = "No se pudieron cargar las notificaciones.";
        console.error(error);
    }
}

async function cargarContadorNotificaciones() {
    const token = localStorage.getItem("token");
    const contador = document.getElementById("contadorNotificaciones");

    if (!token || !contador) {
        return;
    }

    try {
        const respuesta = await fetch(
            "https://study-spaces-rest-api.onrender.com/notifications/unread-count",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!respuesta.ok) {
            throw new Error("Error al cargar el contador");
        }

        const datos = await respuesta.json();

        contador.textContent = datos.unread;
        contador.hidden = datos.unread === 0;

    } catch (error) {
        contador.hidden = true;
        console.error(error);
    }
}

async function marcarTodasComoLeidas() {
    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {
        const respuesta = await fetch(
            "https://study-spaces-rest-api.onrender.com/notifications/read-all",
            {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!respuesta.ok) {
            throw new Error("Error al marcar las notificaciones como leídas");
        }

        await cargarNotificaciones();
        await cargarContadorNotificaciones();

    } catch (error) {
        console.error(error);
        alert("No se pudieron marcar las notificaciones como leídas.");
    }
}

async function marcarNotificacionComoLeida(id) {
    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {
        const respuesta = await fetch(
            `https://study-spaces-rest-api.onrender.com/notifications/${id}/read`,
            {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!respuesta.ok) {
            throw new Error("Error al marcar la notificación como leída");
        }

        await cargarNotificaciones();
        await cargarContadorNotificaciones();

    } catch (error) {
        console.error(error);
        alert("No se pudo marcar la notificación como leída.");
    }
}

function tiempoTranscurrido(fecha) {
    const ahora = new Date();
    const fechaNotificacion = new Date(fecha);

    const segundos = Math.max(
        0,
        Math.floor((ahora - fechaNotificacion) / 1000)
    );

    if (segundos < 60) {
        return "Hace un momento";
    }

    const minutos = Math.floor(segundos / 60);

    if (minutos < 60) {
        return `Hace ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;
    }

    const horas = Math.floor(minutos / 60);

    if (horas < 24) {
        return `Hace ${horas} ${horas === 1 ? "hora" : "horas"}`;
    }

    const dias = Math.floor(horas / 24);

    if (dias < 7) {
        return `Hace ${dias} ${dias === 1 ? "día" : "días"}`;
    }

    const semanas = Math.floor(dias / 7);

    if (dias < 30) {
        return `Hace ${semanas} ${semanas === 1 ? "semana" : "semanas"}`;
    }

    const meses = Math.floor(dias / 30);

    if (dias < 365) {
        return `Hace ${meses} ${meses === 1 ? "mes" : "meses"}`;
    }

    const anios = Math.floor(dias / 365);

    return `Hace ${anios} ${anios === 1 ? "año" : "años"}`;
}