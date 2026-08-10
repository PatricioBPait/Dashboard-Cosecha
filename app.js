document.addEventListener("DOMContentLoaded", function () {

    fetch("datos.json")
        .then(function (respuesta) {

            if (!respuesta.ok) {
                throw new Error("No se pudo cargar datos.json");
            }

            return respuesta.json();
        })

        .then(function (datos) {

            document.getElementById("ultima-actualizacion").textContent =
                datos.fecha || "Sin información";

            document.getElementById("estado").textContent =
                "Datos cargados correctamente";

            mostrarDatos(datos);

        })

        .catch(function (error) {

            console.error(error);

            document.getElementById("estado").textContent =
                "Error al cargar los datos";

            document.getElementById("contenido-hojas").innerHTML =
                "<div class='mensaje-error'>" +
                "<h3>⚠️ Error cargando los datos</h3>" +
                "<p>" + error.message + "</p>" +
                "</div>";

        });

});


function mostrarDatos(datos) {

    var menu = document.getElementById("menu-hojas");
    var contenido = document.getElementById("contenido-hojas");
    var indicadores = document.getElementById("indicadores");

    menu.innerHTML = "";
    contenido.innerHTML = "";
    indicadores.innerHTML = "";


    var hojas = datos.hojas || {};


    /*
       HOJAS QUE NO QUEREMOS MOSTRAR
    */

    var excluidas = [
        "PADRON",
        "PADRON_LOTE",
        "PADRON POR LOTE",
        "PADRON POR LOTE"
    ];


    var nombres = Object.keys(hojas);


    nombres.forEach(function (nombre) {

        var nombreNormalizado =
            nombre
                .trim()
                .toUpperCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[-\s]+/g, "_");


        if (
            excluidas.indexOf(nombreNormalizado) !== -1
        ) {
            return;
        }


        crearBoton(nombre);

        crearHoja(
            nombre,
            hojas[nombre]
        );

    });


    crearIndicadores(
        nombres,
        hojas,
        excluidas
    );


    document.getElementById("estado").textContent =
        "Dashboard cargado correctamente";

}


function crearIndicadores(nombres, hojas, excluidas) {

    var cantidadHojas = 0;
    var cantidadRegistros = 0;


    nombres.forEach(function (nombre) {

        var normalizado =
            nombre
                .trim()
                .toUpperCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[-\s]+/g, "_");


        if (excluidas.indexOf(normalizado) !== -1) {
            return;
        }


        cantidadHojas++;


        if (Array.isArray(hojas[nombre])) {

            cantidadRegistros +=
                Math.max(
                    hojas[nombre].length - 1,
                    0
                );

        }

    });


    crearIndicador(
        "📄 Hojas",
        cantidadHojas
    );


    crearIndicador(
        "📋 Registros",
        cantidadRegistros
    );


    crearIndicador(
        "🟢 Estado",
        "OK"
    );

}


function crearIndicador(titulo, valor) {

    var div =
        document.createElement("div");

    div.className =
        "indicador";

    div.innerHTML =
        "<span>" + titulo + "</span>" +
        "<strong>" + valor + "</strong>";

    document
        .getElementById("indicadores")
        .appendChild(div);

}


function crearBoton(nombre) {

    var boton =
        document.createElement("button");

    boton.textContent =
        nombre;


    boton.onclick = function () {

        var id =
            crearID(nombre);

        var elemento =
            document.getElementById(id);


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


function crearHoja(nombre, filas) {

    var seccion =
        document.createElement("div");

    seccion.className =
        "hoja";

    seccion.id =
        crearID(nombre);


    var titulo =
        document.createElement("div");

    titulo.className =
        "hoja-titulo";

    titulo.innerHTML =
        "<h3>📄 " + nombre + "</h3>";

    seccion.appendChild(titulo);


    if (!Array.isArray(filas) || filas.length === 0) {

        seccion.innerHTML +=
            "<div class='mensaje-vacio'>" +
            "Esta hoja no tiene datos." +
            "</div>";

        document
            .getElementById("contenido-hojas")
            .appendChild(seccion);

        return;
    }


    var tabla =
        document.createElement("table");


    var encabezados =
        filas[0] || [];


    var thead =
        document.createElement("thead");


    var filaEncabezado =
        document.createElement("tr");


    encabezados.forEach(function (celda) {

        var th =
            document.createElement("th");

        th.textContent =
            celda || "";

        filaEncabezado.appendChild(th);

    });


    thead.appendChild(filaEncabezado);

    tabla.appendChild(thead);


    var tbody =
        document.createElement("tbody");


    filas.slice(1).forEach(function (fila) {

        var tr =
            document.createElement("tr");


        encabezados.forEach(function (_, indice) {

            var td =
                document.createElement("td");

            td.textContent =
                fila[indice] || "";

            tr.appendChild(td);

        });


        tbody.appendChild(tr);

    });


    tabla.appendChild(tbody);


    var contenedor =
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
        nombre
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

}
