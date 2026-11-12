
const formLogin = document.getElementById("formLogin");

if (formLogin) {
    formLogin.addEventListener("submit", function(evento) {
        evento.preventDefault();

        document.getElementById("mensajeLogin").textContent =
            "El inicio de sesión estará disponible cuando conectemos el backend.";
    });
}

const formRegistro = document.getElementById("formRegistro");

if (formRegistro) {
    formRegistro.addEventListener("submit", function(evento) {
        evento.preventDefault();

        const password = document.getElementById("passwordRegistro").value;
        const confirmar = document.getElementById("confirmarPassword").value;
        const mensaje = document.getElementById("mensajeRegistro");

        if (password !== confirmar) {
            mensaje.textContent = "Las contraseñas no coinciden.";
            return;
        }

        mensaje.textContent =
            "El registro estará disponible cuando conectemos el backend.";
    });
}
