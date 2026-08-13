document.addEventListener("DOMContentLoaded", function () {

    const URL_PARTE_DIARIO =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSRpElAT0stTkIdi4rF9mhzOlbjrz7pvlP_0R623W6MmbTyyME0yEOic-rA3b99lK9CNnZIz7TuZOW7/pub?gid=811133446&single=true&output=csv";

    const KG_POR_VIAJE = 36790;

    const INGENIOS = [
        "Marapa",
        "Bella Vista",
        "Concepcion",
        "Arcor",
        "Corona"
    ];

    let datosGlobales = null;


    // =========================================================
    // CARGAR GOOGLE SHEETS
    // =========================================================

    fetch(URL_PARTE_DIARIO)

        .then(function (respuesta) {

            if (!respuesta.ok) {
                throw new Error(
                    "No se pudo acceder a Google Sheets"
                );
            }

            return respuesta.text();

        })

        .then(function (csv) {

            const filas = convertirCSV(csv);

            if (!filas || filas.length < 2) {
                throw new Error(
                    "Google Sheets no contiene registros"
                );
            }

            const encabezados = filas[0];

            const registros = filas
                .slice(1)
                .filter(function (fila) {

                    return fila.some(function (celda) {
                        return String(celda).trim() !== "";
                    });

                });


            datosGlobales = {
                encabezados: encabezados,
                registros: registros
            };


            mostrarDashboard(datosGlobales);

        })

        .catch(function (error) {

            console.error(error);

            document.getElementById("estado").textContent =
                "Error al cargar los datos";

            document.getElementById("contenido-hojas").innerHTML =
                "<div class='mensaje-error'>" +
                "<h3>⚠️ Error cargando los datos</h3>" +
                "<p>" +
                error.message +
                "</p>" +
                "</div>";

        });


    // =========================================================
    // CONVERTIR CSV
    // =========================================================

    function convertirCSV(csv) {

        const filas = [];

        let fila = [];
        let celda = "";
        let dentroDeComillas = false;


        for (let i = 0; i < csv.length; i++) {

            const caracter = csv[i];
            const siguiente = csv[i + 1];


            if (caracter === '"') {

                if (
                    dentroDeComillas &&
                    siguiente === '"'
                ) {

                    celda += '"';
                    i++;

                } else {

                    dentroDeComillas =
                        !dentroDeComillas;

                }

            }

            else if (
                caracter === "," &&
                !dentroDeComillas
            ) {

                fila.push(celda);
                celda = "";

            }

            else if (
                (caracter === "\n" ||
                 caracter === "\r") &&
                !dentroDeComillas
            ) {

                if (
                    caracter === "\r" &&
                    siguiente === "\n"
                ) {
                    i++;
                }

                fila.push(celda);

                if (fila.length > 0) {
                    filas.push(fila);
                }

                fila = [];
                celda = "";

            }

            else {

                celda += caracter;

            }

        }


        if (
            celda !== "" ||
            fila.length > 0
        ) {

            fila.push(celda);
            filas.push(fila);

        }


        return filas;
    }


    // =========================================================
    // DASHBOARD PRINCIPAL
    // =========================================================

    function mostrarDashboard(datos) {

        const encabezados =
            datos.encabezados;

        const registros =
            datos.registros;


        document.getElementById("estado").textContent =
            "Datos cargados correctamente";


        document.getElementById(
            "ultima-actualizacion"
        ).textContent =
            new Date().toLocaleString("es-AR");


        const indiceFecha =
            buscarColumna(
                encabezados,
                "FECHA"
            );


        const indiceEmpresa =
            buscarColumna(
                encabezados,
                "EMPRESA"
            );


        const indiceFinca =
            buscarColumna(
                encabezados,
                "FINCA"
            );


        const indiceIngenio =
            buscarColumna(
                encabezados,
                "INGENIO"
            );


        const indiceViajes =
            buscarColumna(
                encabezados,
                "VIAJES"
            );


        if (indiceFecha === -1) {
            throw new Error(
                "No se encontró la columna FECHA"
            );
        }


        if (indiceIngenio === -1) {
            throw new Error(
                "No se encontró la columna INGENIO"
            );
        }


        if (indiceViajes === -1) {
            throw new Error(
                "No se encontró la columna VIAJES"
            );
        }


        // =====================================================
        // INDICADORES
        // =====================================================

        let viajesTotales = 0;

        const fechas = new Set();
        const empresas = new Set();
        const fincas = new Set();
        const ingenios = new Set();


        registros.forEach(function (fila) {

            const viajes =
                convertirNumero(
                    fila[indiceViajes]
                );


            viajesTotales += viajes;


            const fecha =
                obtenerFechaClave(
                    fila[indiceFecha]
                );


            if (fecha) {
                fechas.add(fecha);
            }


            if (
                indiceEmpresa >= 0 &&
                fila[indiceEmpresa]
            ) {
                empresas.add(
                    String(
                        fila[indiceEmpresa]
                    ).trim()
                );
            }


            if (
                indiceFinca >= 0 &&
                fila[indiceFinca]
            ) {
                fincas.add(
                    String(
                        fila[indiceFinca]
                    ).trim()
                );
            }


            if (
                indiceIngenio >= 0 &&
                fila[indiceIngenio]
            ) {

                const ingenio =
                    normalizarIngenio(
                        fila[indiceIngenio]
                    );

                if (INGENIOS.includes(ingenio)) {
                    ingenios.add(ingenio);
                }

            }

        });


        crearIndicadores({

            "🚜 Viajes": formatearNumero(
                viajesTotales
            ),

            "📅 Días": fechas.size,

            "🏭 Ingenios": ingenios.size,

            "🏢 Empresas": empresas.size,

            "🌱 Fincas": fincas.size,

            "📋 Registros": registros.length

        });


        // =====================================================
        // MENÚ
        // =====================================================

        const menu =
            document.getElementById(
                "menu-hojas"
            );


        menu.innerHTML = "";


        crearBotonMenu(
            "📊 Resumen",
            "resumen"
        );


        crearBotonMenu(
            "📋 Parte Diario",
            "parte-diario"
        );


        crearBotonMenu(
            "📈 Diario por Ingenio",
            "diario-ingenio"
        );


        // =====================================================
        // CONTENIDO
        // =====================================================

        const contenido =
            document.getElementById(
                "contenido-hojas"
            );


        contenido.innerHTML = "";


        crearTablaParteDiario(
            encabezados,
            registros
        );


        crearResumenDiarioIngenio(
            encabezados,
            registros
        );


        configurarBuscador();

    }


    // =========================================================
    // RESUMEN DIARIO POR INGENIO
    // =========================================================

    function crearResumenDiarioIngenio(
        encabezados,
        registros
    ) {

        const indiceFecha =
            buscarColumna(
                encabezados,
                "FECHA"
            );


        const indiceIngenio =
            buscarColumna(
                encabezados,
                "INGENIO"
            );


        const indiceViajes =
            buscarColumna(
                encabezados,
                "VIAJES"
            );


        const resumen = {};


        const fechasConDatos =
            new Set();


        // -----------------------------------------------------
        // AGRUPAR FECHA + INGENIO
        // -----------------------------------------------------

        registros.forEach(function (fila) {

            const fecha =
                obtenerFechaClave(
                    fila[indiceFecha]
                );


            if (!fecha) {
                return;
            }


            const ingenio =
                normalizarIngenio(
                    fila[indiceIngenio]
                );


            if (!INGENIOS.includes(ingenio)) {
                return;
            }


            const viajes =
                convertirNumero(
                    fila[indiceViajes]
                );


            const clave =
                fecha + "|" + ingenio;


            if (!resumen[clave]) {

                resumen[clave] = {
                    fecha: fecha,
                    ingenio: ingenio,
                    viajes: 0
                };

            }


            resumen[clave].viajes += viajes;

            fechasConDatos.add(fecha);

        });


        // -----------------------------------------------------
        // OBTENER LOS 2 ÚLTIMOS DÍAS CON DATOS
        // -----------------------------------------------------

        const ultimosDias =
            Array.from(fechasConDatos)
                .sort(function (a, b) {

                    return b.localeCompare(a);

                })
                .slice(0, 2);


        // -----------------------------------------------------
        // CREAR SECCIÓN
        // -----------------------------------------------------

        const seccion =
            document.createElement("div");


        seccion.className =
            "hoja";


        seccion.id =
            "diario-ingenio";


        const titulo =
            document.createElement("div");


        titulo.className =
            "hoja-titulo";


        titulo.innerHTML =
            "<h3>📈 Viajes diarios por Ingenio</h3>";


        seccion.appendChild(titulo);


        if (ultimosDias.length === 0) {

            seccion.innerHTML +=
                "<div class='mensaje-vacio'>" +
                "No hay datos diarios disponibles." +
                "</div>";

            document
                .getElementById("contenido-hojas")
                .appendChild(seccion);

            return;
        }


        // -----------------------------------------------------
        // CREAR TABLA
        // -----------------------------------------------------

        const contenedor =
            document.createElement("div");


        contenedor.className =
            "tabla-contenedor";


        const tabla =
            document.createElement("table");


        const thead =
            document.createElement("thead");


        const filaEncabezado =
            document.createElement("tr");


        [
            "Fecha",
            "Ingenio",
            "Viajes",
            "Kg totales"
        ].forEach(function (texto) {

            const th =
                document.createElement("th");

            th.textContent = texto;

            filaEncabezado.appendChild(th);

        });


        thead.appendChild(
            filaEncabezado
        );


        tabla.appendChild(
            thead
        );


        const tbody =
            document.createElement("tbody");


        // -----------------------------------------------------
        // GENERAR LOS 5 INGENIOS POR CADA DÍA
        // -----------------------------------------------------

        ultimosDias.forEach(function (fecha) {

            let totalViajesDia = 0;
            let totalKgDia = 0;


            INGENIOS.forEach(function (ingenio) {

                const clave =
                    fecha + "|" + ingenio;


                const registro =
                    resumen[clave];


                const viajes =
                    registro
                        ? registro.viajes
                        : 0;


                const kg =
                    viajes * KG_POR_VIAJE;


                totalViajesDia += viajes;
                totalKgDia += kg;


                const tr =
                    document.createElement("tr");


                agregarCelda(
                    tr,
                    formatearFechaClave(fecha)
                );


                agregarCelda(
                    tr,
                    ingenio
                );


                agregarCelda(
                    tr,
                    formatearNumero(viajes)
                );


                agregarCelda(
                    tr,
                    formatearNumero(kg) +
                    " kg"
                );


                tbody.appendChild(tr);

            });


            // -------------------------------------------------
            // TOTAL DEL DÍA
            // -------------------------------------------------

            const trTotal =
                document.createElement("tr");


            trTotal.style.fontWeight =
                "bold";


            const tdTotal =
                document.createElement("td");


            tdTotal.colSpan = 2;

            tdTotal.textContent =
                "TOTAL DEL DÍA";


            trTotal.appendChild(
                tdTotal
            );


            agregarCelda(
                trTotal,
                formatearNumero(
                    totalViajesDia
                )
            );


            agregarCelda(
                trTotal,
                formatearNumero(
                    totalKgDia
                ) + " kg"
            );


            tbody.appendChild(
                trTotal
            );

        });


        tabla.appendChild(
            tbody
        );


        contenedor.appendChild(
            tabla
        );


        seccion.appendChild(
            contenedor
        );


        document
            .getElementById(
                "contenido-hojas"
            )
            .appendChild(
                seccion
            );

    }


    // =========================================================
    // PARTE DIARIO
    // =========================================================

    function crearTablaParteDiario(
        encabezados,
        registros
    ) {

        const contenido =
            document.getElementById(
                "contenido-hojas"
            );


        const seccion =
            document.createElement("div");


        seccion.className =
            "hoja";


        seccion.id =
            "parte-diario";


        const titulo =
            document.createElement("div");


        titulo.className =
            "hoja-titulo";


        titulo.innerHTML =
            "<h3>📋 PARTE DIARO</h3>";


        seccion.appendChild(
            titulo
        );


        const contenedor =
            document.createElement("div");


        contenedor.className =
            "tabla-contenedor";


        const tabla =
            document.createElement("table");


        const thead =
            document.createElement("thead");


        const filaEncabezado =
            document.createElement("tr");


        encabezados.forEach(function (encabezado) {

            const th =
                document.createElement("th");


            th.textContent =
                encabezado;


            filaEncabezado.appendChild(th);

        });


        thead.appendChild(
            filaEncabezado
        );


        tabla.appendChild(
            thead
        );


        const tbody =
            document.createElement("tbody");


        registros.forEach(function (fila) {

            const tr =
                document.createElement("tr");


            encabezados.forEach(
                function (_, indice) {

                    const td =
                        document.createElement("td");


                    td.textContent =
                        fila[indice] || "";


                    tr.appendChild(td);

                }
            );


            tbody.appendChild(tr);

        });


        tabla.appendChild(
            tbody
        );


        contenedor.appendChild(
            tabla
        );


        seccion.appendChild(
            contenedor
        );


        contenido.appendChild(
            seccion
        );

    }


    // =========================================================
    // CELDA
    // =========================================================

    function agregarCelda(
        fila,
        valor
    ) {

        const td =
            document.createElement("td");


        td.textContent =
            valor;


        fila.appendChild(td);

    }


    // =========================================================
    // BUSCAR COLUMNA
    // =========================================================

    function buscarColumna(
        encabezados,
        nombre
    ) {

        const buscado =
            normalizarTexto(nombre);


        return encabezados.findIndex(
            function (encabezado) {

                return normalizarTexto(
                    encabezado
                ) === buscado;

            }
        );

    }


    // =========================================================
    // NORMALIZAR TEXTO
    // =========================================================

    function normalizarTexto(texto) {

        return String(texto || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );

    }


    // =========================================================
    // NORMALIZAR INGENIO
    // =========================================================

    function normalizarIngenio(nombre) {

        const texto =
            normalizarTexto(nombre);


        if (texto === "marapa") {
            return "Marapa";
        }


        if (texto === "bella vista") {
            return "Bella Vista";
        }


        if (texto === "concepcion") {
            return "Concepcion";
        }


        if (texto === "arcor") {
            return "Arcor";
        }


        if (texto === "corona") {
            return "Corona";
        }


        return String(nombre || "").trim();

    }


    // =========================================================
    // CONVERTIR NÚMERO
    // =========================================================

    function convertirNumero(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {
            return 0;
        }


        let texto =
            String(valor).trim();


        /*
        Si viene como 1.234,56
        */

        if (
            texto.includes(".") &&
            texto.includes(",")
        ) {

            texto =
                texto
                    .replace(/\./g, "")
                    .replace(",", ".");

        }

        /*
        Si viene como 1234,56
        */

        else if (
            texto.includes(",")
        ) {

            texto =
                texto.replace(",", ".");

        }


        const numero =
            parseFloat(texto);


        return isNaN(numero)
            ? 0
            : numero;

    }


    // =========================================================
    // FECHA
    // =========================================================

    function obtenerFechaClave(valor) {

        if (!valor) {
            return null;
        }


        const texto =
            String(valor).trim();


        /*
        DD/MM/YYYY
        */

        const partes =
            texto.split("/");


        if (partes.length >= 3) {

            const dia =
                partes[0].padStart(2, "0");


            const mes =
                partes[1].padStart(2, "0");


            const anio =
                partes[2].substring(0, 4);


            if (
                anio.length === 4 &&
                !isNaN(
                    Number(dia)
                ) &&
                !isNaN(
                    Number(mes)
                )
            ) {

                return (
                    anio +
                    "-" +
                    mes +
                    "-" +
                    dia
                );

            }

        }


        /*
        Intentar fecha estándar
        */

        const fecha =
            new Date(texto);


        if (isNaN(fecha.getTime())) {
            return null;
        }


        return (
            fecha.getFullYear() +
            "-" +
            String(
                fecha.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                fecha.getDate()
            ).padStart(2, "0")
        );

    }


    // =========================================================
    // FORMATEAR FECHA
    // =========================================================

    function formatearFechaClave(
        clave
    ) {

        const partes =
            clave.split("-");


        return (
            partes[2] +
            "/" +
            partes[1] +
            "/" +
            partes[0]
        );

    }


    // =========================================================
    // FORMATEAR NÚMERO
    // =========================================================

    function formatearNumero(numero) {

        return Number(numero)
            .toLocaleString(
                "es-AR",
                {
                    maximumFractionDigits: 0
                }
            );

    }


    // =========================================================
    // INDICADORES
    // =========================================================

    function crearIndicadores(
        indicadores
    ) {

        const contenedor =
            document.getElementById(
                "indicadores"
            );


        contenedor.innerHTML = "";


        Object.keys(indicadores)
            .forEach(function (titulo) {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "indicador";


                div.innerHTML =
                    "<span>" +
                    titulo +
                    "</span>" +

                    "<strong>" +
                    indicadores[titulo] +
                    "</strong>";


                contenedor.appendChild(
                    div
                );

            });

    }


    // =========================================================
    // BOTONES DEL MENÚ
    // =========================================================

    function crearBotonMenu(
        texto,
        destino
    ) {

        const boton =
            document.createElement(
                "button"
            );


        boton.textContent =
            texto;


        boton.onclick =
            function () {

                const elemento =
                    document.getElementById(
                        destino
                    );


                if (elemento) {

                    elemento.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            };


        document
            .getElementById(
                "menu-hojas"
            )
            .appendChild(
                boton
            );

    }


    // =========================================================
    // BUSCADOR
    // =========================================================

    function configurarBuscador() {

        const buscador =
            document.getElementById(
                "buscador"
            );


        if (!buscador) {
            return;
        }


        buscador.oninput =
            function () {

                const texto =
                    normalizarTexto(
                        buscador.value
                    );


                const filas =
                    document.querySelectorAll(
                        "#parte-diario tbody tr"
                    );


                filas.forEach(
                    function (fila) {

                        const contenido =
                            normalizarTexto(
                                fila.textContent
                            );


                        fila.style.display =
                            contenido.includes(texto)
                                ? ""
                                : "none";

                    }
                );

            };

    }


    // =========================================================
    // VOLVER ARRIBA
    // =========================================================

    const botonArriba =
        document.getElementById(
            "volver-arriba"
        );


    window.addEventListener(
        "scroll",
        function () {

            if (
                window.scrollY > 400
            ) {

                botonArriba.style.display =
                    "block";

            } else {

                botonArriba.style.display =
                    "none";

            }

        }
    );


    if (botonArriba) {

        botonArriba.onclick =
            function () {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            };

    }

});
