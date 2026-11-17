
const API_LISTAS = "https://study-spaces-rest-api.onrender.com";
const tokenListas = localStorage.getItem("token");

const contenedorListas = document.getElementById("contenedorListas");
const mensajeListas = document.getElementById("mensajeListas");

const botonNuevaLista = document.getElementById("botonNuevaLista");
const crearLista = document.getElementById("crearLista");

botonNuevaLista.addEventListener("click", function() {
    crearLista.hidden = !crearLista.hidden;
});

document.getElementById("cancelarLista").addEventListener("click", function() {
    crearLista.hidden = true;
    document.getElementById("formLista").reset();
});

async function pedirDatos(url, metodo = "GET", datos = null) {
    const opciones = {
        method: metodo,
        headers: {
            "Authorization": "Bearer " + tokenListas,
            "Content-Type": "application/json"
        }
    };

    if (datos !== null) {
        opciones.body = JSON.stringify(datos);
    }

    const respuesta = await fetch(API_LISTAS + url, opciones);

    if (!respuesta.ok) {
        throw new Error("No se pudo completar la operación.");
    }

    if (respuesta.status === 204) {
        return null;
    }

    return await respuesta.json();
}

async function iniciarListas() {
    if (!tokenListas) {
        window.location.href = "login.html";
        return;
    }

    try {
        const usuario = await pedirDatos("/users/me");

        if (usuario.role !== "student") {
            window.location.href = "mi-cuenta.html";
            return;
        }

        cargarListas();
    } catch (error) {
        mensajeListas.textContent = "No se pudo cargar tu cuenta.";
    }
}

async function cargarListas() {
    try {
        const listas = await pedirDatos("/lists");

        contenedorListas.innerHTML = "";

        const personalizadas = listas.filter(function(lista) {
            return lista.list_type !== "favorites";
        });

        if (personalizadas.length === 0) {
            contenedorListas.textContent = "Todavía no creaste listas.";
            return;
        }

        personalizadas.forEach(function(lista) {
            mostrarLista(lista);
        });
    } catch (error) {
        mensajeListas.textContent = "No se pudieron cargar las listas.";
    }
}

async function mostrarLista(lista) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "detalle-tarjeta";
    tarjeta.style.marginBottom = "20px";

    const encabezado = document.createElement("div");
    encabezado.style.display = "flex";
    encabezado.style.justifyContent = "space-between";
    encabezado.style.alignItems = "center";
    encabezado.style.gap = "15px";

    const titulo = document.createElement("h3");
    titulo.textContent = lista.name;

    const botonOpciones = document.createElement("button");
    botonOpciones.type = "button";
    botonOpciones.textContent = "⋯ Opciones";

    encabezado.appendChild(titulo);
    encabezado.appendChild(botonOpciones);
    tarjeta.appendChild(encabezado);

    const contenido = document.createElement("div");
    tarjeta.appendChild(contenido);

    const opciones = document.createElement("div");
    opciones.hidden = true;
    opciones.style.marginTop = "20px";
    opciones.style.padding = "15px";
    opciones.style.borderTop = "1px solid #ddd";

    const botonesOpciones = document.createElement("div");
    botonesOpciones.style.display = "flex";
    botonesOpciones.style.flexWrap = "wrap";
    botonesOpciones.style.alignItems = "center";
    botonesOpciones.style.gap = "15px";

    botonOpciones.addEventListener("click", function() {
        opciones.hidden = !opciones.hidden;

        contenido.querySelectorAll(".boton-quitar").forEach(function(boton) {
            boton.hidden = opciones.hidden;
        });
    });

    const botonNombre = document.createElement("button");
    botonNombre.type = "button";
    botonNombre.textContent = "Cambiar nombre";

    botonNombre.addEventListener("click", function() {
        cambiarNombre(lista);
    });

    const botonAgregar = document.createElement("button");
    botonAgregar.type = "button";
    botonAgregar.textContent = "Agregar espacio";

    const seccionAgregar = document.createElement("div");
    seccionAgregar.hidden = true;
    seccionAgregar.style.marginTop = "20px";
    seccionAgregar.style.display = "none";

    botonAgregar.addEventListener("click", function() {
        if (seccionAgregar.style.display === "none") {
            seccionAgregar.style.display = "block";
        } else {
            seccionAgregar.style.display = "none";
        }
    });

    const selector = document.createElement("select");
    selector.style.marginRight = "15px";
    selector.style.marginBottom = "10px";

    const botonGuardarEspacio = document.createElement("button");
    botonGuardarEspacio.type = "button";
    botonGuardarEspacio.textContent = "Guardar espacio";

    seccionAgregar.appendChild(selector);
    seccionAgregar.appendChild(botonGuardarEspacio);

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.textContent = "Eliminar lista";
    botonEliminar.style.marginLeft = "auto";

    botonEliminar.addEventListener("click", function() {
        eliminarLista(lista);
    });

    botonesOpciones.appendChild(botonNombre);
    botonesOpciones.appendChild(botonAgregar);
    botonesOpciones.appendChild(botonEliminar);

    opciones.appendChild(botonesOpciones);
    opciones.appendChild(seccionAgregar);

    tarjeta.appendChild(opciones);
    contenedorListas.appendChild(tarjeta);

    try {
        const guardados = await pedirDatos(
            "/lists/" + lista.id + "/spaces"
        );

        const tituloEspacios = document.createElement("p");
        tituloEspacios.textContent =
            guardados.length + " espacios guardados";

        contenido.appendChild(tituloEspacios);

        if (guardados.length === 0) {
            const vacio = document.createElement("p");
            vacio.textContent = "Esta lista está vacía.";
            contenido.appendChild(vacio);
        }

        guardados.forEach(function(espacio) {
            const fila = document.createElement("div");
            fila.style.display = "flex";
            fila.style.flexDirection = "column";
            fila.style.gap = "12px";
            fila.style.padding = "15px 0";
            fila.style.borderBottom = "1px solid #eee";

            const enlace = document.createElement("a");
            enlace.href = "detalle.html?id=" + espacio.id;
            enlace.textContent = espacio.name;

            const contenedorQuitar = document.createElement("div");
            contenedorQuitar.style.display = "flex";
            contenedorQuitar.style.justifyContent = "flex-end";

            const botonQuitar = document.createElement("button");
            botonQuitar.type = "button";
            botonQuitar.textContent = "Quitar";
            botonQuitar.className = "boton-quitar";
            botonQuitar.hidden = true;

            botonQuitar.addEventListener("click", async function() {
                if (!confirm("¿Querés quitar este espacio de la lista?")) {
                    return;
                }

                try {
                    await pedirDatos(
                        "/lists/" + lista.id + "/spaces/" + espacio.id,
                        "DELETE"
                    );

                    mensajeListas.textContent = "Espacio quitado.";
                    cargarListas();
                } catch (error) {
                    mensajeListas.textContent =
                        "No se pudo quitar el espacio.";
                }
            });

            contenedorQuitar.appendChild(botonQuitar);

            fila.appendChild(enlace);
            fila.appendChild(contenedorQuitar);

            contenido.appendChild(fila);
        });

        const respuesta = await fetch(API_LISTAS + "/spaces/");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los espacios");
        }

        const espacios = await respuesta.json();

        espacios.forEach(function(espacio) {
            const yaGuardado = guardados.some(function(item) {
                return item.id === espacio.id;
            });

            if (!yaGuardado) {
                const opcion = document.createElement("option");
                opcion.value = espacio.id;
                opcion.textContent = espacio.name;
                selector.appendChild(opcion);
            }
        });

        if (selector.options.length === 0) {
            const opcion = document.createElement("option");
            opcion.textContent = "No hay más espacios para agregar";
            opcion.value = "";
            selector.appendChild(opcion);
        }

        botonGuardarEspacio.addEventListener("click", async function() {
            if (!selector.value) {
                return;
            }

            try {
                await pedirDatos(
                    "/lists/" + lista.id + "/spaces",
                    "POST",
                    {
                        space_id: Number(selector.value)
                    }
                );

                mensajeListas.textContent = "Espacio agregado.";
                cargarListas();
            } catch (error) {
                mensajeListas.textContent =
                    "No se pudo agregar el espacio.";
            }
        });

    } catch (error) {
        contenido.textContent =
            "No se pudieron cargar los espacios de esta lista.";
    }
}

document.getElementById("formLista").addEventListener(
    "submit",
    async function(evento) {
        evento.preventDefault();

        const nombre = document.getElementById("nombreLista").value.trim();

        if (!nombre) {
            return;
        }

        try {
            await pedirDatos("/lists", "POST", {
                name: nombre
            });

            document.getElementById("formLista").reset();
            crearLista.hidden = true;

            mensajeListas.textContent = "Lista creada correctamente.";
            cargarListas();
        } catch (error) {
            mensajeListas.textContent = "No se pudo crear la lista.";
        }
    }
);

async function cambiarNombre(lista) {
    const nombre = prompt("Nuevo nombre de la lista:", lista.name);

    if (!nombre || !nombre.trim()) {
        return;
    }

    try {
        await pedirDatos(
            "/lists/" + lista.id,
            "PATCH",
            {
                name: nombre.trim()
            }
        );

        mensajeListas.textContent = "Nombre actualizado.";
        cargarListas();
    } catch (error) {
        mensajeListas.textContent = "No se pudo cambiar el nombre.";
    }
}

async function eliminarLista(lista) {
    if (!confirm("¿Querés eliminar la lista " + lista.name + "?")) {
        return;
    }

    try {
        await pedirDatos("/lists/" + lista.id, "DELETE");

        mensajeListas.textContent = "Lista eliminada.";
        cargarListas();
    } catch (error) {
        mensajeListas.textContent = "No se pudo eliminar la lista.";
    }
}

iniciarListas();
