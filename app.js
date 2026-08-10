const EXCLUIR = [
    "padron",
    "padron_lote"
];

document.addEventListener("DOMContentLoaded", cargarDashboard);

async function cargarDashboard() {

    try {

        const respuesta = await fetch("./datos.json?v=" + Date.now());

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar datos.json");
        }

        const datos = await respuesta.json();

        console.log("Datos cargados:", datos);

        document.getElementById("ultima-actualizacion").textContent =
            datos.fecha || "Sin información";

        document.getElementById("estado").textContent =
            "Datos cargados correctamente";

        document.getElementById("estado-footer").textContent =
            "Sistema automático";

        mostrarDashboard(datos);

    } catch (error) {

        console.error("ERROR:", error);

        document.getElementById("estado").textContent =
            "Error al cargar datos";

        document.getElementById("contenido-hojas").innerHTML = `
            <div class="mensaje-error">
                <h3>⚠️ Error cargando los datos</h3>
                <p>${error.message}</p>
            </div>
        `;

    }

}


function mostrarDashboard(datos) {

    const menu =
        document.getElementById("menu-hojas");

    const contenido =
        document.getElementById("contenido-hojas");

    const indicadores =
        document.getElementById("indicadores");


    menu.innerHTML = "";
    contenido.innerHTML = "";
    indicadores.innerHTML = "";


    const hojas = datos.hojas || {};

    const nombres = Object.keys(hojas)
        .filter(nombre => {

            const nombreNormalizado =
                normalizar(nombre);

            return !EXCLUIR.includes(nombreNormalizado);

        });


    // =====================================
    // INDICADORES
    // =====================================

    crearIndicador(
        "📄 Hojas",
        nombres.length
    );


    let totalRegistros = 0;

    nombres.forEach(nombre => {

        const filas = hojas[nombre];

        if (Array.isArray(filas)) {

            totalRegistros +=
                Math.max(filas.length - 1, 0);

        }

    });


    crearIndicador(
        "📋 Registros",
        totalRegistros
    );


    crearIndicador(
        "🟢 Estado",
        "OK"
    );


    // =====================================
    // CREAR HOJAS
    // =====================================

    nombres.forEach(nombre => {

        crearBotonMenu(nombre);

        crearHoja(
            nombre,
            hojas[nombre]
        );

    });

}


function crearIndicador(titulo, valor) {

    const div =
        document.createElement("div");

    div.className = "indicador";

    div.innerHTML = `
        <span>${titulo}</span>
        <strong>${valor}</strong>
    `;

    document
        .getElementById("indicadores")
        .appendChild(div);

}


function crearBotonMenu(nombre) {

    const boton =
        document.createElement("button");

    boton.textContent =
        nombre;

    boton.onclick = () => {

        const id =
            crearId(nombre);

        const elemento =
            document.getElementById(id);

        if (elemento) {

            elemento.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    };

    document
        .getElementById("menu-hojas")
        .appendChild(boton);

}


function crearHoja(nombre, filas) {

    const contenedor =
        document.createElement("div");

    contenedor.className =
        "hoja";

    contenedor.id =
        crearId(nombre);


    contenedor.innerHTML = `
        <div class="hoja-titulo">
            <h3>📄 ${nombre}</h3>
        </div>
    `;


    if (!Array.isArray(filas) || filas.length === 0) {

        contenedor.innerHTML += `
            <div class="mensaje-vacio">
                Esta hoja no tiene datos.
            </div>
        `;

        document
            .getElementById("contenido-hojas")
            .appendChild(contenedor);

        return;
    }


    const tabla =
        document.createElement("table");


    const encabezados =
        filas[0];


    const thead =
        document.createElement("thead");

    const filaHeader =
        document.createElement("tr");


    encabezados.forEach(celda => {

        const th =
            document.createElement("th");

        th.textContent =
            celda ?? "";

        filaHeader.appendChild(th);

    });


    thead.appendChild(filaHeader);

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


    const tablaContenedor =
        document.createElement("div");

    tablaContenedor.className =
        "tabla-contenedor";

    tablaContenedor.appendChild(tabla);


    contenedor.appendChild(tablaContenedor);


    document
        .getElementById("contenido-hojas")
        .appendChild(contenedor);

}


function normalizar(texto) {

    return String(texto)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


function crearId(texto) {

    return "hoja-" +
        normalizar(texto)
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

}
