
const API_URL_ESPACIOS = "https://study-spaces-rest-api.onrender.com";

let espacios = [];
let favoritos = [];

const imagenEjemplo = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600";

function nombreRuido(nivel) {
    if (nivel === "low") {
        return "Bajo";
    }

    if (nivel === "medium") {
        return "Medio";
    }

    return "Alto";
}

function esFavorito(id) {
    return favoritos.includes(id);
}

async function cargarFavoritos() {
    favoritos = [];

    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {
        const respuesta = await fetch(API_URL_ESPACIOS + "/favorites", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (respuesta.ok) {
            const datos = await respuesta.json();

            favoritos = datos.map(function(espacio) {
                return espacio.id;
            });
        }
    } catch (error) {
        console.error("No se pudieron cargar los favoritos.");
    }
}

async function cambiarFavorito(id) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Iniciá sesión para guardar favoritos.");
        window.location.href = "login.html";
        return;
    }

    const guardado = esFavorito(id);

    let url = API_URL_ESPACIOS + "/favorites";
    let metodo = "POST";

    if (guardado) {
        url = url + "/" + id;
        metodo = "DELETE";
    }

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: guardado ? undefined : JSON.stringify({
                space_id: id
            })
        });

        if (!respuesta.ok) {
            alert("No se pudo actualizar favoritos.");
            return;
        }

        await cargarFavoritos();
        actualizarVista();
    } catch (error) {
        alert("No se pudo conectar con el servidor.");
    }
}

function crearTarjeta(espacio) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";

    const imagen = document.createElement("img");

    imagen.src = espacio.image_url || imagenEjemplo;
    imagen.alt = "Foto de " + espacio.name;

    imagen.onerror = function() {
        imagen.onerror = null;
        imagen.src = imagenEjemplo;
    };

    const informacion = document.createElement("div");
    informacion.className = "informacion";

    const titulo = document.createElement("div");
    titulo.className = "titulo-tarjeta";

    const nombre = document.createElement("h3");
    nombre.textContent = espacio.name;

    const corazon = document.createElement("button");
    corazon.className = "corazon";
    corazon.textContent = esFavorito(espacio.id) ? "♥" : "♡";
    corazon.setAttribute("aria-label", "Cambiar favorito");

    corazon.addEventListener("click", function() {
        cambiarFavorito(espacio.id);
    });

    titulo.appendChild(nombre);
    titulo.appendChild(corazon);

    const ciudad = document.createElement("p");
    ciudad.textContent = "📍 " + espacio.city;

    const descripcion = document.createElement("p");
    descripcion.textContent = espacio.description;

    const etiquetas = document.createElement("div");
    etiquetas.className = "etiquetas";

    etiquetas.textContent =
        (espacio.has_wifi ? "📶 WiFi  " : "") +
        (espacio.has_outlets ? "🔌 Enchufes  " : "") +
        "Ruido " + nombreRuido(espacio.noise_level).toLowerCase();

    const detalle = document.createElement("a");
    detalle.className = "boton-detalle";
    detalle.href = "detalle.html?id=" + espacio.id;
    detalle.textContent = "Ver detalle →";

    informacion.appendChild(titulo);
    informacion.appendChild(ciudad);
    informacion.appendChild(descripcion);
    informacion.appendChild(etiquetas);
    informacion.appendChild(detalle);

    tarjeta.appendChild(imagen);
    tarjeta.appendChild(informacion);

    return tarjeta;
}

function mostrarEspacios(lista) {
    const contenedor = document.getElementById("listaEspacios");

    if (!contenedor) {
        return;
    }

    const cantidad = document.getElementById("cantidad");

    contenedor.innerHTML = "";
    cantidad.textContent = lista.length + " espacios encontrados";

    if (lista.length === 0) {
        contenedor.textContent = "No se encontraron espacios con esos filtros.";
        return;
    }

    lista.forEach(function(espacio) {
        contenedor.appendChild(crearTarjeta(espacio));
    });
}

function filtrarEspacios() {
    const nombre = document.getElementById("buscar").value.toLowerCase();
    const wifi = document.getElementById("wifi").checked;
    const enchufes = document.getElementById("enchufes").checked;
    const ruido = document.getElementById("ruido").value;

    const filtrados = espacios.filter(function(espacio) {
        return espacio.name.toLowerCase().includes(nombre) &&
            (!wifi || espacio.has_wifi) &&
            (!enchufes || espacio.has_outlets) &&
            (!ruido || espacio.noise_level === ruido);
    });

    mostrarEspacios(filtrados);
}

function actualizarVista() {
    if (document.getElementById("listaEspacios")) {
        filtrarEspacios();
    }

    if (typeof mostrarFavoritos === "function") {
        mostrarFavoritos();
    }

    if (typeof mostrarDetalle === "function") {
        mostrarDetalle();
    }
}

async function iniciarEspacios() {
    try {
        const respuesta = await fetch(API_URL_ESPACIOS + "/spaces/");

        if (!respuesta.ok) {
            throw new Error("Error en la API");
        }

        espacios = await respuesta.json();

        await cargarFavoritos();

        actualizarVista();
    } catch (error) {
        const contenedor =
            document.getElementById("listaEspacios") ||
            document.getElementById("listaFavoritos") ||
            document.getElementById("detalleEspacio");

        if (contenedor) {
            contenedor.textContent =
                "No se pudieron cargar los espacios. Revisá que FastAPI esté funcionando.";
        }
    }
}

if (document.getElementById("listaEspacios")) {
    document.getElementById("botonBuscar").addEventListener("click", filtrarEspacios);

    document.getElementById("aplicarFiltros").addEventListener("click", filtrarEspacios);

    document.getElementById("buscar").addEventListener("keydown", function(evento) {
        if (evento.key === "Enter") {
            filtrarEspacios();
        }
    });

    document.getElementById("limpiarFiltros").addEventListener("click", function() {
        document.getElementById("buscar").value = "";
        document.getElementById("wifi").checked = false;
        document.getElementById("enchufes").checked = false;
        document.getElementById("ruido").value = "";

        filtrarEspacios();
    });
}

iniciarEspacios();
