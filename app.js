document.addEventListener("DOMContentLoaded", function () {

    const URL_PARTE_DIARIO =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSRpElAT0stTkIdi4rF9mhzOlbjrz7pvlP_0R623W6MmbTyyME0yEOic-rA3b99lK9CNnZIz7TuZOW7/pub?gid=811133446&single=true&output=csv";


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
                        return celda.trim() !== "";
                    });

                });


            const datos = {
                encabezados: encabezados,
                registros: registros
            };


            mostrarDashboard(datos);

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


    /*
    ==================================================
    CONVERTIR CSV
    ==================================================
    */

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

                celda = "";


                if (fila.length > 0) {
                    filas.push(fila);
                }


                fila = [];

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


    /*
    ==================================================
    DASHBOARD
    ==================================================
    */

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


        /*
        ==============================================
        BUSCAR COLUMNAS
        ==============================================
        */

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


        /*
        ==============================================
        INDICADORES
        ==============================================
        */

        let viajesTotales = 0;

        const fechas = new Set();

        const empresas = new Set();

        const fincas = new Set();

        const ingenios = new Set();


        registros.forEach(function (fila) {

            if (indiceViajes >= 0) {

                const viajes =
                    parseFloat(
                        String(
                            fila[indiceViajes] || "0"
                        ).replace(",", ".")
                    );

                if (!isNaN(viajes)) {
                    viajesTotales += viajes;
                }

            }


            if (indiceFecha >= 0) {

                const fecha =
                    fila[indiceFecha];

                if (fecha) {
                    fechas.add(fecha);
                }

            }


            if (indiceEmpresa >= 0) {

                const empresa =
                    fila[indiceEmpresa];

                if (empresa) {
                    empresas.add(empresa);
                }

            }


            if (indiceFinca >= 0) {

                const finca =
                    fila[indiceFinca];

                if (finca) {
                    fincas.add(finca);
                }

            }


            if (indiceIngenio >= 0) {

                const ingenio =
                    fila[indiceIngenio];

                if (ingenio) {
                    ingenios.add(ingenio);
                }

            }

        });


        crearIndicadores({

            "🚜 Viajes": viajesTotales.toLocaleString("es-AR"),

            "📅 Días": fechas.size,

            "🏭 Ingenios": ingenios.size,

            "🏢 Empresas": empresas.size,

            "🌱 Fincas": fincas.size,

            "📋 Registros": registros.length

        });


        /*
        ==============================================
        MENÚ
        ==============================================
        */

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


        /*
        ==============================================
        INFORMACIÓN
        ==============================================
        */

        const contenido =
            document.getElementById(
                "contenido-hojas"
            );


        contenido.innerHTML = "";


        crearTablaParteDiario(
            encabezados,
            registros
        );


        /*
        ==============================================
        BUSCADOR
        ==============================================
        */

        configurarBuscador();

    }


    /*
    ==================================================
    BUSCAR COLUMNA
    ==================================================
    */

    function buscarColumna(
        encabezados,
        nombre
    ) {

        const buscado =
            normalizar(nombre);


        return encabezados.findIndex(
            function (encabezado) {

                return normalizar(
                    encabezado
                ) === buscado;

            }
        );

    }


    /*
    ==================================================
    NORMALIZAR TEXTO
    ==================================================
    */

    function normalizar(texto) {

        return String(texto || "")
            .trim()
            .toUpperCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );

    }


    /*
    ==================================================
    INDICADORES
    ==================================================
    */

    function crearIndicadores(indicadores) {

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


    /*
    ==================================================
    BOTONES DEL MENÚ
    ==================================================
    */

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


    /*
    ==================================================
    TABLA PARTE DIARIO
    ==================================================
    */

    function crearTablaParteDiario(
        encabezados,
        registros
    ) {

        const contenido =
            document.getElementById(
                "contenido-hojas"
            );


        const seccion =
            document.createElement(
                "div"
            );


        seccion.className =
            "hoja";


        seccion.id =
            "parte-diario";


        const titulo =
            document.createElement(
                "div"
            );


        titulo.className =
            "hoja-titulo";


        titulo.innerHTML =
            "<h3>📋 PARTE DIARO</h3>";


        seccion.appendChild(
            titulo
        );


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


        /*
        ENCABEZADO
        */

        const thead =
            document.createElement(
                "thead"
            );


        const filaEncabezado =
            document.createElement(
                "tr"
            );


        encabezados.forEach(
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


        /*
        CUERPO
        */

        const tbody =
            document.createElement(
                "tbody"
            );


        registros.forEach(
            function (fila) {

                const tr =
                    document.createElement(
                        "tr"
                    );


                encabezados.forEach(
                    function (_, indice) {

                        const td =
                            document.createElement(
                                "td"
                            );


                        td.textContent =
                            fila[indice] || "";


                        tr.appendChild(
                            td
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


        contenido.appendChild(
            seccion
        );

    }


    /*
    ==================================================
    BUSCADOR
    ==================================================
    */

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
                    normalizar(
                        buscador.value
                    );


                const filas =
                    document.querySelectorAll(
                        "#parte-diario tbody tr"
                    );


                filas.forEach(
                    function (fila) {

                        const contenido =
                            normalizar(
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

});
