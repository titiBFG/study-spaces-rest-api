
const espacios = [
    {
        id: 1,
        name: "Biblioteca Central",
        description: "Biblioteca tranquila con mesas para estudiar.",
        address: "Av. Corrientes 1234",
        city: "Buenos Aires",
        has_wifi: true,
        has_outlets: true,
        noise_level: "low",
        image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600"
    },
    {
        id: 2,
        name: "Café del Centro",
        description: "Café cómodo para estudiar y trabajar.",
        address: "Av. Santa Fe 1500",
        city: "Buenos Aires",
        has_wifi: true,
        has_outlets: true,
        noise_level: "medium",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600"
    },
    {
        id: 3,
        name: "Sala de Estudio",
        description: "Espacio silencioso ideal para concentrarse.",
        address: "Av. Córdoba 2000",
        city: "Buenos Aires",
        has_wifi: false,
        has_outlets: true,
        noise_level: "low",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600"
    },
    {
        id: 4,
        name: "Espacio Universitario",
        description: "Lugar amplio para estudiar en grupo.",
        address: "Av. Independencia 800",
        city: "Buenos Aires",
        has_wifi: true,
        has_outlets: false,
        noise_level: "high",
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600"
    }
];

function nombreRuido(nivel) {
    if (nivel === "low") {
        return "Bajo";
    }

    if (nivel === "medium") {
        return "Medio";
    }

    return "Alto";
}

function obtenerFavoritos() {
    return JSON.parse(localStorage.getItem("favoritos")) || [];
}

function esFavorito(id) {
    return obtenerFavoritos().includes(id);
}

function cambiarFavorito(id) {
    let favoritos = obtenerFavoritos();

    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(function(item) {
            return item !== id;
        });
    } else {
        favoritos.push(id);
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

function crearTarjeta(espacio) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";

    tarjeta.innerHTML = `
        <img src="${espacio.image}" alt="Foto del espacio">

        <div class="informacion">
            <div class="titulo-tarjeta">
                <h3>${espacio.name}</h3>
                <button class="corazon"
                    onclick="alternarFavorito(${espacio.id})"
                    aria-label="Cambiar favorito">
                    ${esFavorito(espacio.id) ? "♥" : "♡"}
                </button>
            </div>

            <p>📍 ${espacio.city}</p>
            <p>${espacio.description}</p>

            <div class="etiquetas">
                ${espacio.has_wifi ? "<span>📶 WiFi</span>" : ""}
                ${espacio.has_outlets ? "<span>🔌 Enchufes</span>" : ""}
                <span>Ruido ${nombreRuido(espacio.noise_level).toLowerCase()}</span>
            </div>

            <a class="boton-detalle" href="detalle.html?id=${espacio.id}">
                Ver detalle →
            </a>
        </div>
    `;

    return tarjeta;
}

function alternarFavorito(id) {
    cambiarFavorito(id);

    if (document.getElementById("listaEspacios")) {
        filtrarEspacios();
    }

    if (document.getElementById("listaFavoritos")) {
        mostrarFavoritos();
    }
}

function mostrarEspacios(lista) {
    const contenedor = document.getElementById("listaEspacios");
    const cantidad = document.getElementById("cantidad");

    contenedor.innerHTML = "";
    cantidad.textContent = lista.length + " espacios encontrados";

    if (lista.length === 0) {
        contenedor.innerHTML =
            '<p class="sin-resultados">No se encontraron espacios con esos filtros.</p>';
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
        if (!espacio.name.toLowerCase().includes(nombre)) {
            return false;
        }

        if (wifi && !espacio.has_wifi) {
            return false;
        }

        if (enchufes && !espacio.has_outlets) {
            return false;
        }

        if (ruido !== "" && espacio.noise_level !== ruido) {
            return false;
        }

        return true;
    });

    mostrarEspacios(filtrados);
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

        mostrarEspacios(espacios);
    });

    mostrarEspacios(espacios);
}

// Navegación y menú activo
const paginaActual = window.location.pathname.split("/").pop();

document.querySelectorAll("nav a").forEach(function(enlace) {
    if (enlace.textContent.trim() === "Mi cuenta") {
        enlace.href = "mi-cuenta.html";
    }

    const destino = enlace.getAttribute("href");

    if (destino === paginaActual) {
        enlace.classList.add("activo");
    }

    if (paginaActual === "detalle.html" && destino === "index.html") {
        enlace.classList.add("activo");
    }
});
