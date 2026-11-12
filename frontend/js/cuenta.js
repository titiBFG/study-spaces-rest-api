
const API_URL = "http://127.0.0.1:8000";

const formLogin = document.getElementById("formLogin");

if (formLogin) {
    formLogin.addEventListener("submit", async function(evento) {
        evento.preventDefault();

        const email = document.getElementById("emailLogin").value;
        const password = document.getElementById("passwordLogin").value;
        const mensaje = document.getElementById("mensajeLogin");

        mensaje.textContent = "Verificando datos...";

        try {
            const respuesta = await fetch(API_URL + "/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                localStorage.setItem("token", datos.access_token);
                window.location.href = "mi-cuenta.html";
            } else {
                mensaje.textContent = datos.detail || "No se pudo iniciar sesión.";
            }
        } catch (error) {
            mensaje.textContent = "No se pudo conectar con el servidor.";
        }
    });
}

const formRegistro = document.getElementById("formRegistro");

if (formRegistro) {
    formRegistro.addEventListener("submit", async function(evento) {
        evento.preventDefault();

        const nombre = document.getElementById("nombreRegistro").value;
        const email = document.getElementById("emailRegistro").value;
        const password = document.getElementById("passwordRegistro").value;
        const confirmar = document.getElementById("confirmarPassword").value;
        const mensaje = document.getElementById("mensajeRegistro");

        if (password !== confirmar) {
            mensaje.textContent = "Las contraseñas no coinciden.";
            return;
        }

        mensaje.textContent = "Registrando usuario...";

        try {
            const respuesta = await fetch(API_URL + "/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    full_name: nombre,
                    email: email,
                    password: password
                })
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                mensaje.textContent = "¡Cuenta creada correctamente! Ya podés iniciar sesión.";
                formRegistro.reset();
            } else if (typeof datos.detail === "string") {
                mensaje.textContent = datos.detail;
            } else {
                mensaje.textContent = "Revisá los datos ingresados.";
            }
        } catch (error) {
            mensaje.textContent = "No se pudo conectar con el servidor.";
        }
    });
}
