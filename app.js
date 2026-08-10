const HOJAS_EXCLUIDAS = new Set([
    "PADRON",
    "PADRON_LOTE"
]);

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {
    try {
        const respuesta = await fetch("./datos.json?v=3");

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar datos.json");
        }

        const datos = await respuesta.json();

        console.log("DATOS RECIBIDOS:", datos);

        mostrarFecha(datos.fecha);

        construirPagina(datos);

    } catch (error) {
        console.error(error);

        document.getElementById("estado").textContent =
            "Error al cargar los datos";

        document.getElementById("contenido-hojas").innerHTML = `
            <div class="mensaje-error">
                <h3>⚠️ Error</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}


function construirPagina(datos) {

    const menu = document.getElementById("menu-hojas");
    const contenido = document.getElementById("contenido-hojas");
    const indicadores = document.getElementById("indicadores");

    menu.innerHTML = "";
    contenido.innerHTML = "";
    indicadores.innerHTML = "";


    const todasLasHojas = datos.hojas || {};


    /*
     * FILTRO DEFINITIVO
     *
     * Solamente se muestran las hojas cuyo
     * nombre NO sea PADRON ni PADRON_LOTE.
     */

    const hojas = {};

    Object.keys(todasLasHojas).forEach(nombre => {

        const nombreLimpio =
            String(nombre)
                .trim()
                .toUpperCase();

        if (HOJAS_EXCLUIDAS.has(nombreLimpio)) {

            console.log(
                "HOJA EXCLUIDA:",
                nombre
            );

            return;
        }

        hojas[nombre] =
            todasLasHojas[nombre];

    });


    const nombres = Object.keys(hojas);


    // Indicadores

    crearIndicador(
        "📄 Hojas",
        nombres.length
    );


    let registros = 0;

    nombres.forEach(nombre => {

        if (Array.isArray(hojas[nombre])) {

            registros +=
                Math.max(
                    hojas[nombre].length - 1,
                    0
                );

        }

    });


    crearIndicador(
        "📋 Registros",
        registros
    );


    crearIndicador(
        "🟢 Estado",
        "OK"
    );


    // Crear las hojas

    nombres.forEach(nombre => {

        crearBoton(nombre);

        crearTabla(nombre, hojas[nombre]);

    });


    document.getElementById("estado").textContent =
        `${nombres.length} hojas cargadas correctamente`;

}


function crearIndicador(titulo, valor) {

    const div =
        document.createElement("div");

    div.className =
        "indicador";

    div.innerHTML = `
        <span>${titulo}</span>
        <strong>${valor}</strong>
    `;

    document
        .getElementById("indicadores")
        .appendChild(div);
}


function crearBoton(nombre) {

    const boton =
        document.createElement("button");

    boton.textContent =
        nombre;

    boton.onclick = function() {

        const elemento =
            document.getElementById(
                crearID(nombre)
            );

        if (elemento) {

            elemento.scrollIntoView({
                behavior: "smooth"
            });

        }

    };

    document
        .getElementById("menu-hojas")
        .appendChild(boton);
}


function crearTabla(nombre, filas) {

    const seccion =
        document.createElement("div");

    seccion.className =
        "hoja";

    seccion.id =
        crearID(nombre);


    const titulo =
        document.createElement("div");

    titulo.className =
        "hoja-titulo";

    titulo.innerHTML =
        `<h3>📄 ${nombre}</h3>`;

    seccion.appendChild(titulo);


    if (!Array.isArray(filas) || filas.length === 0) {

        seccion.innerHTML += `
            <div class="mensaje-vacio">
                Esta hoja no tiene datos.
            </div>
        `;

        document
            .getElementById("contenido-hojas")
            .appendChild(seccion);

        return;
    }


    const tabla =
        document.createElement("table");


    const encabezados =
        filas[0] || [];


    const thead =
        document.createElement("thead");

    const trHead =
        document.createElement("tr");


    encabezados.forEach(celda => {

        const th =
            document.createElement("th");

        th.textContent =
            celda ?? "";

        trHead.appendChild(th);

    });


    thead.appendChild(trHead);

    tabla.appendChild(thead);


    const tbody =
        document.createElement("tbody");


    filas.slice(1).forEach(fila => {

        const tr =
            document.createElement("tr");


        encabezados.forEach((_, indice) => {

            const td =
                document.createElement("td");

            td.textContent =
                fila[indice] ?? "";

            tr.appendChild(td);

        });


        tbody.appendChild(tr);

    });


    tabla.appendChild(tbody);


    const contenedor =
        document.createElement("div");

    contenedor.className =
        "tabla-contenedor";

    contenedor.appendChild(tabla);

    seccion.appendChild(contenedor);


    document
        .getElementById("contenido-hojas")
        .appendChild(seccion);
}


function crearID(nombre) {

    return "hoja-" +
        String(nombre)
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
}


function mostrarFecha(fecha) {

    const elemento =
        document.getElementById(
            "ultima-actualizacion"
        );

    elemento.textContent =
        fecha || "Sin información";
}
