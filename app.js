document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // CONFIGURACIÓN
    // =========================================================

    const KG_POR_VIAJE = 36790;

    const URL_PARTE_DIARIO =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSRpElAT0stTkIdi4rF9mhzOlbjrz7pvlP_0R623W6MmbTyyME0yEOic-rA3b99lK9CNnZIz7TuZOW7/pub?gid=811133446&single=true&output=csv";

    const URL_POR_EMPRESA =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSRpElAT0stTkIdi4rF9mhzOlbjrz7pvlP_0R623W6MmbTyyME0yEOic-rA3b99lK9CNnZIz7TuZOW7/pub?gid=1305832325&single=true&output=csv";

    const URL_POR_INGENIO =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSRpElAT0stTkIdi4rF9mhzOlbjrz7pvlP_0R623W6MmbTyyME0yEOic-rA3b99lK9CNnZIz7TuZOW7/pub?gid=655253802&single=true&output=csv";


    const INGENIOS = [
        "Marapa",
        "Bella Vista",
        "Concepcion",
        "Arcor",
        "Corona"
    ];


    let datosParteDiario = null;
    let datosPorEmpresa = null;
    let datosPorIngenio = null;


    // =========================================================
    // INICIO
    // =========================================================

    console.log("APP.JS FUNCIONANDO");


    Promise.all([

        cargarCSV(
            URL_PARTE_DIARIO
        ),

        cargarCSV(
            URL_POR_EMPRESA
        ),

        cargarCSV(
            URL_POR_INGENIO
        )

    ])

    .then(function (resultados) {

        datosParteDiario =
            convertirDatos(resultados[0]);

        datosPorEmpresa =
            convertirDatos(resultados[1]);

        datosPorIngenio =
            convertirDatos(resultados[2]);


        console.log(
            "PARTE DIARIO cargado:",
            datosParteDiario
        );

        console.log(
            "POR EMPRESA cargado:",
            datosPorEmpresa
        );

        console.log(
            "POR INGENIO cargado:",
            datosPorIngenio
        );


        construirDashboard();

    })

    .catch(function (error) {

        console.error(error);


        document.getElementById(
            "estado"
        ).textContent =
            "Error al cargar los datos";


        document.getElementById(
            "contenido-hojas"
        ).innerHTML =

            "<div class='mensaje-error'>" +

            "<h3>⚠️ Error cargando los datos</h3>" +

            "<p>" +
            error.message +
            "</p>" +

            "</div>";

    });


    // =========================================================
    // CARGAR CSV
    // =========================================================

    function cargarCSV(url) {

        return fetch(url)

            .then(function (respuesta) {

                if (!respuesta.ok) {

                    throw new Error(
                        "No se pudo cargar Google Sheets"
                    );

                }

                return respuesta.text();

            });

    }


    // =========================================================
    // CONVERTIR DATOS
    // =========================================================

    function convertirDatos(csv) {

        const filas =
            convertirCSV(csv);


        if (
            !filas ||
            filas.length < 1
        ) {

            return {
                encabezados: [],
                registros: []
            };

        }


        return {

            encabezados:
                filas[0],

            registros:
                filas
                    .slice(1)
                    .filter(function (fila) {

                        return fila.some(
                            function (celda) {

                                return String(
                                    celda || ""
                                ).trim() !== "";

                            }
                        );

                    })

        };

    }


    // =========================================================
    // PARSER CSV
    // =========================================================

    function convertirCSV(csv) {

        const filas = [];

        let fila = [];

        let celda = "";

        let dentroDeComillas =
            false;


        for (
            let i = 0;
            i < csv.length;
            i++
        ) {

            const caracter =
                csv[i];

            const siguiente =
                csv[i + 1];


            if (
                caracter === '"'
            ) {

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
                (
                    caracter === "\n" ||
                    caracter === "\r"
                ) &&
                !dentroDeComillas
            ) {

                if (
                    caracter === "\r" &&
                    siguiente === "\n"
                ) {

                    i++;

                }


                fila.push(celda);


                if (
                    fila.length > 0
                ) {

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
    // CONSTRUIR DASHBOARD
    // =========================================================

    function construirDashboard() {

        document.getElementById(
            "estado"
        ).textContent =
            "Datos cargados correctamente";


        document.getElementById(
            "ultima-actualizacion"
        ).textContent =
            new Date().toLocaleString(
                "es-AR"
            );


        construirMenu();

        construirResumen();

        construirDiarioIngenio();

        construirPorEmpresa();

        construirParteDiario();

        configurarBuscador();


        document.getElementById(
            "estado-footer"
        ).textContent =
            "Datos actualizados automáticamente";


        console.log(
            "Dashboard cargado correctamente"
        );

    }


    // =========================================================
    // MENÚ
    // =========================================================

    function construirMenu() {

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
            "📈 Diario por Ingenio",
            "diario-ingenio"
        );


        crearBotonMenu(
            "🏢 Por Empresa",
            "por-empresa"
        );


        crearBotonMenu(
            "📋 Parte Diario",
            "parte-diario"
        );

    }


    // =========================================================
    // BOTÓN MENÚ
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
    // RESUMEN
    // =========================================================

    function construirResumen() {

        const datos =
            datosParteDiario;


        const encabezados =
            datos.encabezados;


        const registros =
            datos.registros;


        const indiceFecha =
            buscarColumna(
                encabezados,
                "FECHA"
            );


        const indiceViajes =
            buscarColumna(
                encabezados,
                "VIAJES"
            );


        if (
            indiceFecha === -1 ||
            indiceViajes === -1
        ) {

            throw new Error(
                "No se encontraron FECHA o VIAJES en PARTE DIARO"
            );

        }


        let viajesTotales = 0;

        const fechas =
            new Set();


        registros.forEach(
            function (fila) {

                const viajes =
                    convertirNumero(
                        fila[indiceViajes]
                    );


                viajesTotales +=
                    viajes;


                const fecha =
                    obtenerFechaClave(
                        fila[indiceFecha]
                    );


                if (fecha) {

                    fechas.add(fecha);

                }

            }
        );


        const fechasOrdenadas =
            Array.from(fechas)
                .sort(function (a, b) {

                    return b.localeCompare(a);

                });


        const ultimoDia =
            fechasOrdenadas[0];


        let viajesUltimoDia = 0;


        if (ultimoDia) {

            registros.forEach(
                function (fila) {

                    const fecha =
                        obtenerFechaClave(
                            fila[indiceFecha]
                        );


                    if (
                        fecha === ultimoDia
                    ) {

                        viajesUltimoDia +=
                            convertirNumero(
                                fila[indiceViajes]
                            );

                    }

                }
            );

        }


        const kgUltimoDia =
            viajesUltimoDia *
            KG_POR_VIAJE;


        const kgTotales =
            viajesTotales *
            KG_POR_VIAJE;


        const indicadores =
            document.getElementById(
                "indicadores"
            );


        indicadores.innerHTML = "";


        crearIndicador(
            "🚜 Viajes totales",
            formatearNumero(
                viajesTotales
            )
        );


        crearIndicador(
            "📅 Días registrados",
            formatearNumero(
                fechas.size
            )
        );


        crearIndicador(
            "🚜 Viajes del último día",
            formatearNumero(
                viajesUltimoDia
            ) +
            (
                ultimoDia
                    ? " — " +
                      formatearFechaClave(
                          ultimoDia
                      )
                    : ""
            )
        );


        crearIndicador(
            "⚖️ Kg del último día",
            formatearNumero(
                kgUltimoDia
            ) +
            " kg"
        );


        crearIndicador(
            "⚖️ Kg totales cosechados",
            formatearNumero(
                kgTotales
            ) +
            " kg"
        );

    }


    // =========================================================
    // INDICADOR
    // =========================================================

    function crearIndicador(
        titulo,
        valor
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "indicador";


        const span =
            document.createElement(
                "span"
            );


        span.textContent =
            titulo;


        const strong =
            document.createElement(
                "strong"
            );


        strong.textContent =
            valor;


        div.appendChild(span);

        div.appendChild(strong);


        document
            .getElementById(
                "indicadores"
            )
            .appendChild(div);

    }


    // =========================================================
    // DIARIO POR INGENIO
    // =========================================================

    function construirDiarioIngenio() {

        const datos =
            datosParteDiario;


        const encabezados =
            datos.encabezados;


        const registros =
            datos.registros;


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

        const fechas =
            new Set();


        registros.forEach(
            function (fila) {

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


                if (
                    !INGENIOS.includes(
                        ingenio
                    )
                ) {

                    return;

                }


                const viajes =
                    convertirNumero(
                        fila[indiceViajes]
                    );


                const clave =
                    fecha +
                    "|" +
                    ingenio;


                if (!resumen[clave]) {

                    resumen[clave] = 0;

                }


                resumen[clave] +=
                    viajes;


                fechas.add(fecha);

            }
        );


        const ultimosDias =
            Array.from(fechas)
                .sort(function (a, b) {

                    return b.localeCompare(a);

                })
                .slice(0, 2);


        const seccion =
            document.createElement(
                "div"
            );


        seccion.className =
            "hoja";


        seccion.id =
            "diario-ingenio";


        seccion.innerHTML =
            "<div class='hoja-titulo'>" +
            "<h3>📈 Diario por Ingenio</h3>" +
            "</div>";


        if (
            ultimosDias.length === 0
        ) {

            seccion.innerHTML +=
                "<div class='mensaje-vacio'>" +
                "No hay datos disponibles." +
                "</div>";

            agregarSeccion(
                seccion
            );

            return;

        }


        const contenedor =
            document.createElement(
                "div"
            );


        contenedor.className =
            "tabla-contenedor";


        const tabla =
            document.createElement(
                "table"
            );


        const thead =
            document.createElement(
                "thead"
            );


        const encabezado =
            document.createElement(
                "tr"
            );


        [
            "Fecha",
            "Ingenio",
            "Viajes",
            "Kg totales"
        ].forEach(
            function (texto) {

                const th =
                    document.createElement(
                        "th"
                    );


                th.textContent =
                    texto;


                encabezado.appendChild(
                    th
                );

            }
        );


        thead.appendChild(
            encabezado
        );


        tabla.appendChild(
            thead
        );


        const tbody =
            document.createElement(
                "tbody"
            );


        ultimosDias.forEach(
            function (fecha) {

                const filasDia =
                    INGENIOS.map(
                        function (ingenio) {

                            const clave =
                                fecha +
                                "|" +
                                ingenio;


                            const viajes =
                                resumen[clave] || 0;


                            return {

                                ingenio:
                                    ingenio,

                                viajes:
                                    viajes,

                                kg:
                                    viajes *
                                    KG_POR_VIAJE

                            };

                        }
                    );


                // MAYOR A MENOR
                filasDia.sort(
                    function (a, b) {

                        return (
                            b.viajes -
                            a.viajes
                        );

                    }
                );


                let totalViajes =
                    0;


                let totalKg =
                    0;


                filasDia.forEach(
                    function (registro) {

                        totalViajes +=
                            registro.viajes;


                        totalKg +=
                            registro.kg;


                        const tr =
                            document.createElement(
                                "tr"
                            );


                        agregarCelda(
                            tr,
                            formatearFechaClave(
                                fecha
                            )
                        );


                        agregarCelda(
                            tr,
                            registro.ingenio
                        );


                        agregarCelda(
                            tr,
                            formatearNumero(
                                registro.viajes
                            )
                        );


                        agregarCelda(
                            tr,
                            formatearNumero(
                                registro.kg
                            ) +
                            " kg"
                        );


                        tbody.appendChild(
                            tr
                        );

                    }
                );


                const trTotal =
                    document.createElement(
                        "tr"
                    );


                trTotal.style.fontWeight =
                    "bold";


                const tdTotal =
                    document.createElement(
                        "td"
                    );


                tdTotal.colSpan = 2;

                tdTotal.textContent =
                    "TOTAL " +
                    formatearFechaClave(
                        fecha
                    );


                trTotal.appendChild(
                    tdTotal
                );


                agregarCelda(
                    trTotal,
                    formatearNumero(
                        totalViajes
                    )
                );


                agregarCelda(
                    trTotal,
                    formatearNumero(
                        totalKg
                    ) +
                    " kg"
                );


                tbody.appendChild(
                    trTotal
                );

            }
        );


        tabla.appendChild(
            tbody
        );


        contenedor.appendChild(
            tabla
        );


        seccion.appendChild(
            contenedor
        );


        agregarSeccion(
            seccion
        );

    }


    // =========================================================
    // POR EMPRESA
    // =========================================================

    function construirPorEmpresa() {

        construirTablaDesdeDatos(
            datosPorEmpresa,
            "por-empresa",
            "🏢 Por Empresa"
        );

    }


    // =========================================================
    // POR INGENIO
    // =========================================================

    function construirPorIngenio() {

        construirTablaDesdeDatos(
            datosPorIngenio,
            "por-ingenio",
            "📈 Por Ingenio"
        );

    }


    // =========================================================
    // PARTE DIARIO
    // =========================================================

    function construirParteDiario() {

        construirTablaDesdeDatos(
            datosParteDiario,
            "parte-diario",
            "📋 Parte Diario"
        );

    }


    // =========================================================
    // TABLA DESDE GOOGLE SHEETS
    // =========================================================

    function construirTablaDesdeDatos(
        datos,
        id,
        titulo
    ) {

        const seccion =
            document.createElement(
                "div"
            );


        seccion.className =
            "hoja";


        seccion.id =
            id;


        seccion.innerHTML =
            "<div class='hoja-titulo'>" +
            "<h3>" +
            titulo +
            "</h3>" +
            "</div>";


        if (
            !datos ||
            !datos.encabezados ||
            datos.encabezados.length === 0
        ) {

            seccion.innerHTML +=
                "<div class='mensaje-vacio'>" +
                "No hay datos disponibles." +
                "</div>";


            agregarSeccion(
                seccion
            );


            return;

        }


        const contenedor =
            document.createElement(
                "div"
            );


        contenedor.className =
            "tabla-contenedor";


        const tabla =
            document.createElement(
                "table"
            );


        const thead =
            document.createElement(
                "thead"
            );


        const filaEncabezado =
            document.createElement(
                "tr"
            );


        datos.encabezados.forEach(
            function (encabezado) {

                const th =
                    document.createElement(
                        "th"
                    );


                th.textContent =
                    encabezado;


                filaEncabezado.appendChild(
                    th
                );

            }
        );


        thead.appendChild(
            filaEncabezado
        );


        tabla.appendChild(
            thead
        );


        const tbody =
            document.createElement(
                "tbody"
            );


        datos.registros.forEach(
            function (fila) {

                const tr =
                    document.createElement(
                        "tr"
                    );


                datos.encabezados.forEach(
                    function (_, indice) {

                        agregarCelda(
                            tr,
                            fila[indice] || ""
                        );

                    }
                );


                tbody.appendChild(
                    tr
                );

            }
        );


        tabla.appendChild(
            tbody
        );


        contenedor.appendChild(
            tabla
        );


        seccion.appendChild(
            contenedor
        );


        agregarSeccion(
            seccion
        );

    }


    // =========================================================
    // AGREGAR SECCIÓN
    // =========================================================

    function agregarSeccion(
        seccion
    ) {

        document
            .getElementById(
                "contenido-hojas"
            )
            .appendChild(
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
            document.createElement(
                "td"
            );


        td.textContent =
            valor;


        fila.appendChild(
            td
        );

    }


    // =========================================================
    // BUSCAR COLUMNA
    // =========================================================

    function buscarColumna(
        encabezados,
        nombre
    ) {

        const buscado =
            normalizarTexto(
                nombre
            );


        return encabezados.findIndex(
            function (encabezado) {

                return (
                    normalizarTexto(
                        encabezado
                    ) === buscado
                );

            }
        );

    }


    // =========================================================
    // NORMALIZAR TEXTO
    // =========================================================

    function normalizarTexto(
        texto
    ) {

        return String(
            texto || ""
        )
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

    function normalizarIngenio(
        nombre
    ) {

        const texto =
            normalizarTexto(
                nombre
            );


        if (
            texto === "marapa"
        ) {

            return "Marapa";

        }


        if (
            texto === "bella vista"
        ) {

            return "Bella Vista";

        }


        if (
            texto === "concepcion"
        ) {

            return "Concepcion";

        }


        if (
            texto === "arcor"
        ) {

            return "Arcor";

        }


        if (
            texto === "corona"
        ) {

            return "Corona";

        }


        return String(
            nombre || ""
        ).trim();

    }


    // =========================================================
    // CONVERTIR NÚMERO
    // =========================================================

    function convertirNumero(
        valor
    ) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            return 0;

        }


        let texto =
            String(valor).trim();


        if (
            texto.includes(".") &&
            texto.includes(",")
        ) {

            texto =
                texto
                    .replace(
                        /\./g,
                        ""
                    )
                    .replace(
                        ",",
                        "."
                    );

        }

        else if (
            texto.includes(",")
        ) {

            texto =
                texto.replace(
                    ",",
                    "."
                );

        }


        const numero =
            parseFloat(
                texto
            );


        return isNaN(numero)
            ? 0
            : numero;

    }


    // =========================================================
    // OBTENER FECHA
    // =========================================================

    function obtenerFechaClave(
        valor
    ) {

        if (!valor) {
            return null;
        }


        const texto =
            String(valor).trim();


        const partes =
            texto.split("/");


        if (
            partes.length >= 3
        ) {

            const dia =
                partes[0].padStart(
                    2,
                    "0"
                );


            const mes =
                partes[1].padStart(
                    2,
                    "0"
                );


            const anio =
                partes[2]
                    .substring(0, 4);


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


        const fecha =
            new Date(texto);


        if (
            isNaN(
                fecha.getTime()
            )
        ) {

            return null;

        }


        return (
            fecha.getFullYear() +
            "-" +
            String(
                fecha.getMonth() + 1
            ).padStart(
                2,
                "0"
            ) +
            "-" +
            String(
                fecha.getDate()
            ).padStart(
                2,
                "0"
            )
        );

    }


    // =========================================================
    // FORMATEAR FECHA
    // =========================================================

    function formatearFechaClave(
        clave
    ) {

        if (!clave) {
            return "—";
        }


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

    function formatearNumero(
        numero
    ) {

        return Number(
            numero
        ).toLocaleString(
            "es-AR",
            {
                maximumFractionDigits: 0
            }
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
                        "tbody tr"
                    );


                filas.forEach(
                    function (fila) {

                        const contenido =
                            normalizarTexto(
                                fila.textContent
                            );


                        fila.style.display =
                            contenido.includes(
                                texto
                            )
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


    if (botonArriba) {

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


        botonArriba.onclick =
            function () {

                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            };

    }

});
