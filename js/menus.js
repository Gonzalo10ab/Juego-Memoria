// Esperamos a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {

    // === ELEMENTOS DEL DOM ===

    // Secciones principales
    const menu1 = document.getElementById("menu1");      // Menú principal
    const menu2 = document.getElementById("menu2");      // Menú de selección de nivel
    const juego = document.getElementById("juego");      // Zona del juego

    // Botones del menú principal
    const btnJugar = document.getElementById("btn-jugar");        // Botón "Jugar"
    const btnCreditos = document.getElementById("btn-creditos");  // Botón "Créditos"
    const btnSonido = document.getElementById("btn-sonido");      // Botón para activar/desactivar sonido

    // Botones del menú de nivel
    const btnCancelar = document.getElementById("btn-cancelar");            // Botón para volver al menú principal
    const botonesNivel = document.querySelectorAll(".nivel");              // Todos los botones de nivel
    const modoSelect = document.getElementById("modo-select");             // Selector de modo (categoría de cartas)

    // Elementos del modal de créditos
    const modal = document.getElementById("modal-creditos");         // Fondo del modal
    const cerrarModal = document.getElementById("cerrar-creditos");  // Botón para cerrar el modal

    // === CONTROL DE SONIDO ===

    // Variable global para saber si el sonido está activo o no (por defecto está activado)
    window.sonidoActivo = true;

    // Cambiar el icono y el estado del sonido al pulsar el botón
    btnSonido.addEventListener("click", () => {
        window.sonidoActivo = !window.sonidoActivo;
        btnSonido.textContent = window.sonidoActivo ? "🔊" : "🔇";
    });

    // === NAVEGACIÓN ENTRE MENÚS ===

    // Ir al menú de selección de nivel
    btnJugar.addEventListener("click", () => {
        menu1.classList.add("oculto");
        menu2.classList.remove("oculto");
    });

    // Volver al menú principal desde el menú de niveles
    btnCancelar.addEventListener("click", () => {
        menu2.classList.add("oculto");
        menu1.classList.remove("oculto");
    });

    // === INICIAR JUEGO ===

    // Al pulsar un botón de nivel...
    botonesNivel.forEach(boton => {
        boton.addEventListener("click", () => {
            const nivel = boton.dataset.nivel;       // Obtenemos el nivel desde el atributo data-nivel
            const modo = modoSelect.value;           // Obtenemos la categoría seleccionada

            // Guardamos ambas opciones como variables globales para que las use main.js
            window.categoriaActual = categorias[modo];
            window.nivelActual = nivel === "tutorial" ? "tutorial" : parseInt(nivel);

            // Ocultamos el menú y mostramos la zona del juego
            menu2.classList.add("oculto");
            juego.classList.remove("oculto");

            // Lanzamos el juego si la función ya está disponible
            if (typeof iniciarJuego === "function") {
                iniciarJuego();
            }
        });
    });

    // === CRÉDITOS ===

    // Abrir el modal de créditos al pulsar el botón
    btnCreditos.addEventListener("click", () => {
        modal.classList.remove("oculto");
    });

    // Cerrar el modal de créditos
    cerrarModal.addEventListener("click", () => {
        modal.classList.add("oculto");
    });
});
