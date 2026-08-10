const EXCLUIR_HOJAS = [
    "PADRON",
    "POR_LOTE"
];

const contenidoHojas = document.getElementById("contenido-hojas");
const menuHojas = document.getElementById("menu-hojas");
const indicadores = document.getElementById("indicadores");
const buscador = document.getElementById("buscador");

let datosOriginales = null;


// ==========================================
// INICIO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    cargarDatos();

    configurarBuscador();

    configurarBotonArriba();

});


// ==========================================
// CARGAR DATOS
// ==========================================

async function cargarDatos() {

    try {

        const respuesta = await fetch("datos.json?nocache=" + Date.now());

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar datos.json");
        }

        datosOriginales = await respuesta.json();

        mostrarFecha(datosOriginales.fecha);

        mostrarEstado("Datos cargados correctamente");

        construirDashboard(datosOriginales);

    } catch (error) {

        console.error(error);

        mostrarEstado("Error al cargar los datos");

        contenidoHojas.innerHTML = `
            <div class="mensaje-error">
                <h3>⚠️ No se pudieron cargar los datos</h3>
                <p>
                    Verificá que el archivo <strong>datos.json</strong>
                    exista en el repositorio.
                </p>
            </div>
        `;

    }

}


// ==========================================
// CONSTRUIR DASHBOARD
// ==========================================

function construirDashboard(datos) {

    limpiarDashboard();

    const hojas = datos.hojas || {};

    const nombresHojas = Object.keys(hojas)
        .filter(nombre => !esHojaExcluida(nombre));


    if (nombresHojas.length === 0) {

        contenidoHojas.innerHTML = `
            <div class="mensaje-vacio">
                No hay hojas disponibles para mostrar.
            </div>
        `;

        return;
    }


    crearMenu(nombresHojas);

    crearIndicadores(nombresHojas, hojas);

    nombresHojas.forEach((nombre, indice) => {

        crearSeccionHoja(
            nombre,
            hojas[nombre],
            indice
        );

    });

}


// ==========================================
// EXCLUIR HOJAS
// ==========================================

function esHojaExcluida(nombre) {

    const nombreNormalizado =
        normalizarTexto(nombre);

    return EXCLUIR_HOJAS.includes(
        nombreNormalizado
    );

}


function normalizarTexto(texto) {

    return String(texto)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


// ==========================================
// MENÚ
// ==========================================

function crearMenu(nombresHojas) {

    nombresHojas.forEach((nombre, indice) => {

        const boton =
            document.createElement("button");

        boton.textContent =
            nombre;

        boton.addEventListener("click", () => {

            const seccion =
                document.getElementById(
                    generarId(nombre)
                );

            if (seccion) {

                seccion.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

        menuHojas.appendChild(boton);

    });

}


// ==========================================
// INDICADORES
// ==========================================

function crearIndicadores(nombresHojas, hojas) {

    indicadores.innerHTML = "";

    const totalHojas =
        nombresHojas.length;


    crearIndicador(
        "📄 Hojas",
        totalHojas
    );


    let totalFilas = 0;

    nombresHojas.forEach(nombre => {

        const filas =
            hojas[nombre];

        if (Array.isArray(filas)) {

            totalFilas += filas.length;

        }

    });


    crearIndicador(
        "📋 Registros",
        totalFilas
    );


    crearIndicador(
        "🟢 Estado",
        "Actualizado"
    );

}


function crearIndicador(titulo, valor) {

    const div =
        document.createElement("div");

    div.className =
        "indicador";

    div.innerHTML = `
        <span>${escaparHTML(titulo)}</span>
        <strong>${escaparHTML(valor)}</strong>
    `;

    indicadores.appendChild(div);

}


// ==========================================
// CREAR SECCIÓN DE UNA HOJA
// ==========================================

function crearSeccionHoja(
    nombre,
    filas,
    indice
) {

    const seccion =
        document.createElement("div");

    seccion.className =
        "hoja";

    seccion.id =
        generarId(nombre);


    const titulo =
        document.createElement("div");

    titulo.className =
        "hoja-titulo";


    const h3 =
        document.createElement("h3");

    h3.textContent =
        "📄 " + nombre;


    titulo.appendChild(h3);

    seccion.appendChild(titulo);


    if (!Array.isArray(filas) || filas.length === 0) {

        seccion.innerHTML += `
            <div class="mensaje-vacio">
                Esta hoja no contiene datos.
            </div>
        `;

        contenidoHojas.appendChild(seccion);

        return;
    }


    const tabla =
        crearTabla(filas);


    const contenedor =
        document.createElement("div");

    contenedor.className =
        "tabla-contenedor";

    contenedor.appendChild(tabla);

    seccion.appendChild(contenedor);

    contenidoHojas.appendChild(seccion);

}


// ==========================================
// CREAR TABLA
// ==========================================

function crearTabla(filas) {

    const tabla =
        document.createElement("table");


    const thead =
        document.createElement("thead");

    const tbody =
        document.createElement("tbody");


    const encabezados =
        filas[0] || [];


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


    tabla.appendChild(thead);

    tabla.appendChild(tbody);


    return tabla;

}


// ==========================================
// BUSCADOR
// ==========================================

function configurarBuscador() {

    buscador.addEventListener(
        "input",
        function () {

            const texto =
                normalizarTexto(
                    this.value
                );


            const hojas =
                document.querySelectorAll(
                    ".hoja"
                );


            hojas.forEach(hoja => {

                const contenido =
                    normalizarTexto(
                        hoja.textContent
                    );


                if (
                    texto === "" ||
                    contenido.includes(texto)
                ) {

                    hoja.style.display =
                        "";

                } else {

                    hoja.style.display =
                        "none";

                }

            });

        }
    );

}


// ==========================================
// BOTÓN VOLVER ARRIBA
// ==========================================

function configurarBotonArriba() {

    const boton =
        document.getElementById(
            "volver-arriba"
        );


    window.addEventListener(
        "scroll",
        () => {

            if (window.scrollY > 400) {

                boton.style.display =
                    "block";

            } else {

                boton.style.display =
                    "none";

            }

        }
    );


    boton.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


// ==========================================
// FECHA
// ==========================================

function mostrarFecha(fecha) {

    const elemento =
        document.getElementById(
            "ultima-actualizacion"
        );


    if (!fecha) {

        elemento.textContent =
            "Sin información";

        return;
    }


    elemento.textContent =
        fecha;

}


// ==========================================
// ESTADO
// ==========================================

function mostrarEstado(texto) {

    const estado =
        document.getElementById(
            "estado"
        );

    const footer =
        document.getElementById(
            "estado-footer"
        );


    if (estado) {
        estado.textContent =
            texto;
    }

    if (footer) {
        footer.textContent =
            texto;
    }

}


// ==========================================
// LIMPIAR DASHBOARD
// ==========================================

function limpiarDashboard() {

    menuHojas.innerHTML = "";

    contenidoHojas.innerHTML = "";

}


// ==========================================
// GENERAR ID
// ==========================================

function generarId(texto) {

    return "hoja-" +
        normalizarTexto(texto)
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

}


// ==========================================
// SEGURIDAD HTML
// ==========================================

function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
