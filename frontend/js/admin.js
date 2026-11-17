
const API_ADMIN = "https://study-spaces-rest-api.onrender.com";

const contenedorPendientes = document.getElementById("contenedorPendientes");
const mensajeAdmin = document.getElementById("mensajeAdmin");

async function cargarPendientes() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const respuesta = await fetch(API_ADMIN + "/spaces/pending", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (respuesta.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (respuesta.status === 403) {
            mensajeAdmin.textContent =
                "Esta página es solo para administradores.";
            return;
        }

        if (!respuesta.ok) {
            mensajeAdmin.textContent =
                "No se pudieron cargar los espacios pendientes.";
            return;
        }

        const espacios = await respuesta.json();

        contenedorPendientes.innerHTML = "";

        if (espacios.length === 0) {
            mensajeAdmin.textContent =
                "No hay espacios pendientes de aprobación.";
            return;
        }

        mensajeAdmin.textContent = "";

        for (const espacio of espacios) {
            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjeta";

            const informacion = document.createElement("div");
            informacion.className = "informacion";

            const nombre = document.createElement("h3");
            nombre.textContent = espacio.name;

            const descripcion = document.createElement("p");
            descripcion.textContent = espacio.description;

            const direccion = document.createElement("p");
            direccion.textContent =
                "Dirección: " + espacio.address + ", " + espacio.city;

            const wifi = document.createElement("p");
            wifi.textContent =
                "WiFi: " + (espacio.has_wifi ? "Sí" : "No");

            const enchufes = document.createElement("p");
            enchufes.textContent =
                "Enchufes: " + (espacio.has_outlets ? "Sí" : "No");

            const ruido = document.createElement("p");
            ruido.textContent =
                "Nivel de ruido: " + espacio.noise_level;

            const boton = document.createElement("button");
            boton.textContent = "Aprobar espacio";

            boton.addEventListener("click", function() {
                aprobarEspacio(espacio.id);
            });

            informacion.appendChild(nombre);
            informacion.appendChild(descripcion);
            informacion.appendChild(direccion);
            informacion.appendChild(wifi);
            informacion.appendChild(enchufes);
            informacion.appendChild(ruido);
            informacion.appendChild(boton);

            if (espacio.image_url) {
                const imagen = document.createElement("img");
                imagen.src = espacio.image_url;
                imagen.alt = espacio.name;

                imagen.onerror = function() {
                    imagen.style.display = "none";
                };

                tarjeta.appendChild(imagen);
            }

            tarjeta.appendChild(informacion);
            contenedorPendientes.appendChild(tarjeta);
        }

    } catch (error) {
        mensajeAdmin.textContent =
            "No se pudo conectar con el servidor.";
    }
}

async function aprobarEspacio(id) {
    const token = localStorage.getItem("token");

    try {
        const respuesta = await fetch(
            API_ADMIN + "/spaces/" + id + "/approve",
            {
                method: "PATCH",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!respuesta.ok) {
            mensajeAdmin.textContent =
                "No se pudo aprobar el espacio.";
            return;
        }

        await cargarPendientes();

    } catch (error) {
        mensajeAdmin.textContent =
            "No se pudo conectar con el servidor.";
    }
}

cargarPendientes();
