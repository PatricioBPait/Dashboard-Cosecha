```javascript
document.addEventListener("DOMContentLoaded", function () {

    console.log("APP.JS funcionando correctamente");

    const URL_PARTE_DIARIO =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSRpElAT0stTkIdi4rF9mhzOlbjrz7pvlP_0R623W6MmbTyyME0yEOic-rA3b99lK9CNnZIz7TuZOW7/pub?gid=811133446&single=true&output=csv";

    fetch(URL_PARTE_DIARIO)
        .then(function (respuesta) {
            console.log("Google Sheets respondió:", respuesta.status);
            return respuesta.text();
        })
        .then(function (csv) {
            console.log("CSV recibido correctamente");
            console.log(csv.substring(0, 500));
        })
        .catch(function (error) {
            console.error("ERROR:", error);
        });

});
