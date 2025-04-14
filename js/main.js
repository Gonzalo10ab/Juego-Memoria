// script.js

document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("modoCambio");

    boton.addEventListener("click", () => {
        document.body.classList.toggle("estilo-claro");
    });
});
