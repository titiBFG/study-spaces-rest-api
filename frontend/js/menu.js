
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
