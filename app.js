document.addEventListener("DOMContentLoaded", function () {

    console.log("APP.JS FUNCIONANDO");

    const URL_PARTE_DIARIO =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSRpElAT0stTkIdi4rF9mhzOlbjrz7pvlP_0R623W6MmbTyyME0yEOic-rA3b99lK9CNnZIz7TuZOW7/pub?gid=811133446&single=true&output=csv";

    fetch(URL_PARTE_DIARIO)
        .then(function (respuesta) {

            console.log(
                "Respuesta Google Sheets:",
                respuesta.status
            );

            if (!respuesta.ok) {
                throw new Error(
                    "Google Sheets respondió con error"
                );
            }

            return respuesta.text();
        })

        .then(function (csv) {

            console.log(
                "CSV RECIBIDO CORRECTAMENTE"
            );

            console.log(
                csv.substring(0, 500)
            );

        })

        .catch(function (error) {

            console.error(
                "ERROR:",
                error
            );

        });

});
