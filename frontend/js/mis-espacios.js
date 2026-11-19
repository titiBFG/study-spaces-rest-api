const API = "https://study-spaces-rest-api.onrender.com";
const token = localStorage.getItem("token");

const formulario = document.getElementById("formEspacio");
const mensaje = document.getElementById("mensajeEspacio");
const lista = document.getElementById("listaMisEspacios");

let espaciosPropios = [];
let espacioEditando = null;

if (!token) {
    window.location.href = "login.html";
} else {
    iniciar();
}

async function iniciar() {
    try {
        const respuesta = await fetch(API + "/users/me", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!respuesta.ok) {
            window.location.href = "login.html";
            return;
        }

        const usuario = await respuesta.json();

        if (usuario.role !== "business") {
            window.location.href = "mi-cuenta.html";
            return;
        }

        cargarEspacios();
    } catch (error) {
        mensaje.textContent = "No se pudo conectar con el servidor.";
    }
}

async function cargarEspacios() {
    try {
        const respuesta = await fetch(API + "/spaces/mine", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!respuesta.ok) {
            mensaje.textContent = "No se pudieron cargar los espacios.";
            return;
        }

        espaciosPropios = await respuesta.json();
        lista.innerHTML = "";

        if (espaciosPropios.length === 0) {
            lista.textContent = "Todavía no agregaste espacios.";
        }

        espaciosPropios.forEach(function(espacio) {
            const contenedor = document.createElement("div");
            const nombre = document.createElement("p");
            const estado = document.createElement("p");
            const boton = document.createElement("button");

            nombre.textContent = espacio.name + " - " + espacio.address;

            if (espacio.is_approved) {
                estado.textContent = "✓ Aprobado";
                estado.style.color = "#427a4b";
            } else if (espacio.is_rejected) {
                estado.textContent = "✕ Rechazado";
                estado.style.color = "#b94a48";
            } else {
                estado.textContent = "⏳ Pendiente de aprobación";
                estado.style.color = "#a66a45";
            }

            estado.style.fontWeight = "bold";
            estado.style.margin = "8px 0";

            boton.textContent = "Editar";
            boton.type = "button";

            boton.addEventListener("click", function() {
                editarEspacio(espacio);
            });

            contenedor.appendChild(nombre);
            contenedor.appendChild(estado);

            if (espacio.image_url) {
                const imagen = document.createElement("img");
                imagen.src = espacio.image_url;
                imagen.alt = espacio.name;
                imagen.style.width = "140px";
                imagen.style.maxWidth = "100%";
                imagen.style.borderRadius = "8px";
                imagen.style.display = "block";
                imagen.style.marginBottom = "10px";

                contenedor.appendChild(imagen);
            }

            contenedor.appendChild(boton);
            lista.appendChild(contenedor);
        });
    } catch (error) {
        mensaje.textContent = "No se pudo conectar con el servidor.";
    }
}

function editarEspacio(espacio) {
    espacioEditando = espacio.id;

    document.getElementById("tituloFormulario").textContent = "Editar espacio";
    document.getElementById("nombreEspacio").value = espacio.name;
    document.getElementById("descripcionEspacio").value = espacio.description;
    document.getElementById("imagenEspacio").value = espacio.image_url || "";
    document.getElementById("direccionEspacio").value = espacio.address;
    document.getElementById("ciudadEspacio").value = espacio.city;
    document.getElementById("latitudEspacio").value = espacio.latitude;
    document.getElementById("longitudEspacio").value = espacio.longitude;
    document.getElementById("ruidoEspacio").value = espacio.noise_level;
    document.getElementById("horarioEspacio").value = espacio.opening_hours || "";
    document.getElementById("wifiEspacio").checked = espacio.has_wifi;
    document.getElementById("enchufesEspacio").checked = espacio.has_outlets;

    mensaje.textContent = "";
    formulario.scrollIntoView();
}

document.getElementById("cancelarEdicion").addEventListener("click", function() {
    formulario.reset();
    espacioEditando = null;
    document.getElementById("tituloFormulario").textContent = "Agregar espacio";
    mensaje.textContent = "";
});

function validarImagen(url) {
    return new Promise(function(resolve) {
        const imagen = new Image();

        imagen.onload = function() {
            resolve(true);
        };

        imagen.onerror = function() {
            resolve(false);
        };

        imagen.src = url;
    });
}

formulario.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const urlImagen = document.getElementById("imagenEspacio").value.trim();

    if (urlImagen) {
        mensaje.textContent = "Comprobando imagen...";

        const imagenValida = await validarImagen(urlImagen);

        if (!imagenValida) {
            mensaje.textContent =
                "La imagen no se puede cargar. Pegá una URL directa a una imagen válida.";
            return;
        }
    }

    const datos = {
        name: document.getElementById("nombreEspacio").value,
        description: document.getElementById("descripcionEspacio").value,
        image_url: urlImagen || null,
        address: document.getElementById("direccionEspacio").value,
        city: document.getElementById("ciudadEspacio").value,
        latitude: Number(document.getElementById("latitudEspacio").value),
        longitude: Number(document.getElementById("longitudEspacio").value),
        noise_level: document.getElementById("ruidoEspacio").value,
        opening_hours: document.getElementById("horarioEspacio").value || null,
        has_wifi: document.getElementById("wifiEspacio").checked,
        has_outlets: document.getElementById("enchufesEspacio").checked
    };

    let url = API + "/spaces/";
    let metodo = "POST";

    if (espacioEditando !== null) {
        url = API + "/spaces/" + espacioEditando;
        metodo = "PUT";
    }

    mensaje.textContent = "Guardando...";

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(datos)
        });

        if (respuesta.ok) {
            formulario.reset();
            espacioEditando = null;
            document.getElementById("tituloFormulario").textContent = "Agregar espacio";
            mensaje.textContent = "Espacio guardado correctamente.";
            cargarEspacios();
        } else {
            mensaje.textContent = "No se pudo guardar el espacio.";
        }
    } catch (error) {
        mensaje.textContent = "No se pudo conectar con el servidor.";
    }
});