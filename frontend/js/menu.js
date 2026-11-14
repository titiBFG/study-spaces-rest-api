
const pagina = window.location.pathname.split("/").pop();

document.querySelectorAll("nav a").forEach(function(enlace) {
    if (enlace.textContent.trim() === "Mi cuenta") {
        enlace.href = "mi-cuenta.html";
    }

    const destino = enlace.getAttribute("href");

    if (destino === pagina) {
        enlace.classList.add("activo");
    }

    if (pagina === "detalle.html" && destino === "index.html") {
        enlace.classList.add("activo");
    }

    if (
        (pagina === "login.html" || pagina === "registro.html") &&
        destino === "mi-cuenta.html"
    ) {
        enlace.classList.add("activo");
    }
});

async function mostrarUsuario() {
    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {
        const respuesta = await fetch("http://127.0.0.1:8000/users/me", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!respuesta.ok) {
            localStorage.removeItem("token");
            return;
        }

        const usuario = await respuesta.json();
        const enlaceCuenta = document.querySelector('nav a[href="mi-cuenta.html"]');

        if (enlaceCuenta) {
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

            enlaceCuenta.textContent = "";
            enlaceCuenta.appendChild(circulo);
            enlaceCuenta.title = usuario.full_name;
            enlaceCuenta.setAttribute("aria-label", "Mi cuenta: " + usuario.full_name);
        }

        const nombreCuenta = document.getElementById("nombreCuenta");
        const emailCuenta = document.getElementById("emailCuenta");
        const inicialCuenta = document.getElementById("inicialCuenta");
        const perfilCuenta = document.getElementById("perfilCuenta");
        const accesoCuenta = document.getElementById("accesoCuenta");

        if (nombreCuenta) {
            nombreCuenta.textContent = usuario.full_name;
            emailCuenta.textContent = usuario.email;
            inicialCuenta.textContent = usuario.full_name.trim().charAt(0).toUpperCase();

            perfilCuenta.hidden = false;
            accesoCuenta.hidden = true;
        }
    } catch (error) {
        const mensaje = document.getElementById("mensajeCuenta");

        if (mensaje) {
            mensaje.textContent = "No se pudo conectar con el servidor.";
        }
    }
}

mostrarUsuario();

const botonCerrarSesion = document.getElementById("cerrarSesion");

if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener("click", function() {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    });
}
