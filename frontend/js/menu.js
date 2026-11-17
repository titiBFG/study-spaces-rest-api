
const pagina = window.location.pathname.split("/").pop();
const navegacion = document.querySelector("nav");

function colocarLogo() {
    const titulo = document.querySelector("header .barra h1");

    if (!titulo) {
        return;
    }

    titulo.textContent = "";

    const imagen = document.createElement("img");
    imagen.src = "img/logo.png";
    imagen.alt = "Logo de StudySpaces";
    imagen.style.width = "42px";
    imagen.style.height = "42px";
    imagen.style.borderRadius = "10px";
    imagen.style.verticalAlign = "middle";
    imagen.style.marginRight = "10px";

    titulo.appendChild(imagen);
    titulo.appendChild(document.createTextNode("StudySpaces"));
}

function crearEnlace(nombre, destino) {
    const enlace = document.createElement("a");
    enlace.href = destino;
    enlace.textContent = nombre;

    if (pagina === destino) {
        enlace.classList.add("activo");
    }

    if (pagina === "detalle.html" && destino === "index.html") {
        enlace.classList.add("activo");
    }

    return enlace;
}

function armarMenu(usuario) {
    if (!navegacion) {
        return;
    }

    navegacion.innerHTML = "";

    navegacion.appendChild(crearEnlace("Inicio", "index.html"));

    if (usuario.role === "student") {
        navegacion.appendChild(
            crearEnlace("Favoritos", "favoritos.html")
        );

        navegacion.appendChild(
            crearEnlace("Mis listas", "mis-listas.html")
        );

        navegacion.appendChild(
            crearEnlace("Mis reseñas", "mis-resenas.html")
        );
    }

    if (usuario.role === "business") {
        navegacion.appendChild(
            crearEnlace("Mis espacios", "mis-espacios.html")
        );
    }

    if (usuario.role === "admin") {
        navegacion.appendChild(
            crearEnlace("Administración", "admin.html")
        );
    }

    const enlaceCuenta = crearEnlace("", "mi-cuenta.html");

    const inicial = usuario.full_name.trim().charAt(0).toUpperCase();

    const circulo = document.createElement("span");
    circulo.textContent = inicial;
    circulo.style.display = "inline-flex";
    circulo.style.alignItems = "center";
    circulo.style.justifyContent = "center";
    circulo.style.width = "32px";
    circulo.style.height = "32px";
    circulo.style.borderRadius = "50%";
    circulo.style.backgroundColor = "#e9c4a5";
    circulo.style.color = "#70462f";
    circulo.style.fontWeight = "bold";

    enlaceCuenta.appendChild(circulo);
    enlaceCuenta.title = usuario.full_name;
    enlaceCuenta.setAttribute(
        "aria-label",
        "Mi cuenta: " + usuario.full_name
    );

    navegacion.appendChild(enlaceCuenta);
}

async function mostrarUsuario() {
    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {
        const respuesta = await fetch(
            "http://127.0.0.1:8000/users/me",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!respuesta.ok) {
            localStorage.removeItem("token");
            return;
        }

        const usuario = await respuesta.json();

        armarMenu(usuario);

        const nombreCuenta = document.getElementById("nombreCuenta");
        const emailCuenta = document.getElementById("emailCuenta");
        const inicialCuenta = document.getElementById("inicialCuenta");
        const perfilCuenta = document.getElementById("perfilCuenta");
        const accesoCuenta = document.getElementById("accesoCuenta");

        if (nombreCuenta) {
            nombreCuenta.textContent = usuario.full_name;
            emailCuenta.textContent = usuario.email;
            inicialCuenta.textContent =
                usuario.full_name.trim().charAt(0).toUpperCase();

            perfilCuenta.hidden = false;
            accesoCuenta.hidden = true;

            if (usuario.role === "business") {
                let enlaceEspacios = document.getElementById(
                    "enlaceAdministrarEspacios"
                );

                if (!enlaceEspacios) {
                    enlaceEspacios = document.createElement("a");
                    enlaceEspacios.id = "enlaceAdministrarEspacios";
                    enlaceEspacios.href = "mis-espacios.html";
                    enlaceEspacios.className = "boton-detalle";
                    enlaceEspacios.textContent = "Administrar mis espacios";

                    const botonCerrar = document.getElementById("cerrarSesion");

                    if (
                        botonCerrar &&
                        botonCerrar.parentElement === perfilCuenta
                    ) {
                        perfilCuenta.insertBefore(
                            enlaceEspacios,
                            botonCerrar
                        );
                    } else {
                        perfilCuenta.appendChild(enlaceEspacios);
                    }
                }
            }
        }
    } catch (error) {
        const mensaje = document.getElementById("mensajeCuenta");

        if (mensaje) {
            mensaje.textContent = "No se pudo conectar con el servidor.";
        }
    }
}

colocarLogo();
mostrarUsuario();

const botonCerrarSesion = document.getElementById("cerrarSesion");

if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener("click", function() {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    });
}
