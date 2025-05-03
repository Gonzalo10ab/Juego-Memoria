// Esperamos a que el documento esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {

    // Obtenemos los elementos HTML
    const tablero = document.getElementById("game-board"); // Donde se colocan las cartas
    const spanContador = document.getElementById("contador"); // Contador de intentos
    const botonReiniciar = document.getElementById("reiniciar-btn"); // Botón para reiniciar
    const spanTiempo = document.getElementById("tiempo"); // Muestra el cronómetro
    const botonPowerup = document.getElementById("powerup-revelar"); // Botón para usar el powerup

    // Selectores del menú
    const selectorCategoria = document.getElementById("selector-categoria");
    const selectorNivel = document.getElementById("selector-nivel");
    const botonJugar = document.getElementById("boton-jugar");

    // Instanciamos los sonidos
    const sonidoAcierto = new Audio("assets/sonidos/correct.mp3");
    const sonidoFallo = new Audio("assets/sonidos/error.mp3");
    const sonidoTicTac = new Audio("assets/sonidos/tic-tac.mp3");
    const sonidoClockAlarm = new Audio("assets/sonidos/clock-alarm.mp3")

    // Ajustamos el volumen de los sonidos 
    sonidoAcierto.volume = 0.5;
    sonidoFallo.volume = 0.15;
    sonidoTicTac.volume = 0.5;
    sonidoClockAlarm.volume = 0.5;

    // === VARIABLES GLOBALES ===
    let categoriaActual = categorias.frutas; // Categoría por defecto
    let nivelActual = parseInt(localStorage.getItem("nivelElegido")) || 1; // Nivel por defecto
    const esTutorial = nivelActual === 1; // Bandera para detectar si estamos en el nivel de tutorial
    let config = niveles[nivelActual]; // Configuración inicial del nivel

    let tiempo = 0; // Tiempo transcurrido o restante
    let intervaloTiempo; // Referencia al intervalo del cronómetro

    // === TUTORIAL ===
    const tutorialMensajes = [
        "¡Bienvenido al juego de memoria!, Haz clic en una carta para girarla",
        "Ahora, encuentra otra carta que sea igual.",
        "Si las cartas no coinciden, se girarán de nuevo.",
        "Si coinciden, se quedarán boca arriba.",
        "Completa todas las parejas para ganar.",
        "¡Bien hecho!"
    ];
    let tutorialPaso = 0;

    function mostrarTutorial() {
        const tutorialDiv = document.getElementById("tutorial-mensaje");
        if (tutorialPaso < tutorialMensajes.length) {
            tutorialDiv.textContent = tutorialMensajes[tutorialPaso];
        } else {
            tutorialDiv.style.display = "none";
        }
    }

    function siguienteTutorial() {
        tutorialPaso++;
        mostrarTutorial();
    }

    // Reiniciar la página cuando se cambia de temática
    const categoriaGuardada = localStorage.getItem("categoriaElegida");
    if (categoriaGuardada) {
        categoriaActual = categorias[categoriaGuardada];
        selectorCategoria.value = categoriaGuardada;
    }

    // Evento para cambiar categoría y recargar
    selectorCategoria.addEventListener("change", () => {
        localStorage.setItem("categoriaElegida", selectorCategoria.value);
        location.reload();
    });

    // === FUNCIONES AUXILIARES ===

    // Muestra el número de intentos en pantalla
    function actualizarContador(valor) {
        spanContador.textContent = valor;
    }

    // Convierte un número de segundos a formato mm:ss
    function formatearTiempo(segundos) {
        const minutos = String(Math.floor(segundos / 60)).padStart(2, "0");
        const segs = String(segundos % 60).padStart(2, "0");
        return `${minutos}:${segs}`;
    }

    // Actualiza el cronómetro en la pantalla con el formato correcto
    function actualizarPantallaTiempo() {
        spanTiempo.textContent = formatearTiempo(tiempo);
    }

    // Muestra un mensaje final de victoria al completar el juego
    function mostrarMensajeFinal(intentos) {
        setTimeout(() => {
            alert(`Enhorabuena pichita, lo has conseguido en ${intentos} intentos.`);
        }, 300);
    }

    // Crea dinámicamente una carta con su estructura HTML
    function crearCarta(cartaData) {
        const carta = document.createElement("div");
        carta.classList.add("card");
        carta.dataset.clave = cartaData.clave;
        carta.innerHTML =
            `<div class="cara cara-trasera"></div>
             <div class="cara cara-frontal">
                 <img src="${cartaData.src}" alt="${cartaData.clave}">
             </div>`;
        return carta;
    }

    // Función que baraja un array usando el algoritmo Fisher-Yates
    function barajarArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Inicia el cronómetro para abajo (modo contrarreloj)
    function iniciarCronometroRegresivo() {
        tiempo = 20;
        clearInterval(intervaloTiempo);
        actualizarPantallaTiempo();

        intervaloTiempo = setInterval(() => {
            tiempo--;

            if (tiempo === 10) sonidoTicTac.play();

            if (tiempo < 0) {
                clearInterval(intervaloTiempo);
                sonidoTicTac.pause();
                sonidoTicTac.currentTime = 0;
                sonidoClockAlarm.play();
                setTimeout(() => {
                    alert("¡Tiempo agotado!");
                    iniciarJuego();
                }, 300);
                return;
            }

            actualizarPantallaTiempo();
        }, 1000);
    }

    // Inicia el cronómetro ascendente (modo sin tiempo límite)
    function iniciarCronometroNormal() {
        tiempo = 0;
        clearInterval(intervaloTiempo);
        intervaloTiempo = setInterval(() => {
            tiempo++;
            actualizarPantallaTiempo();
        }, 1000);
    }

    function detenerTodosLosSonidos() {
        sonidoTicTac.pause(); sonidoTicTac.currentTime = 0;
        sonidoClockAlarm.pause(); sonidoClockAlarm.currentTime = 0;
        sonidoAcierto.pause(); sonidoAcierto.currentTime = 0;
        sonidoFallo.pause(); sonidoFallo.currentTime = 0;
    }

    function activarPowerups() {
        botonPowerup.style.display = "inline-block";
        botonPowerup.disabled = false;
    }

    function desactivarPowerups() {
        botonPowerup.style.display = "none";
        botonPowerup.disabled = true;
    }

    function revelarCartasTemporales() {
        const cartas = document.querySelectorAll(".card:not(.acertada)");
        cartas.forEach(carta => carta.classList.add("volteada"));
        botonPowerup.disabled = true;
        setTimeout(() => {
            cartas.forEach(carta => carta.classList.remove("volteada"));
        }, 2000);
    }

    function activarJoker() {
        console.log("Joker activado");
    }

    function activarOscuridad() {
        document.body.classList.add("luz-apagada");
        document.addEventListener("mousemove", (e) => {
            const x = e.clientX + "px";
            const y = e.clientY + "px";
            document.body.style.setProperty("--x", x);
            document.body.style.setProperty("--y", y);
        });
    }

    botonPowerup.addEventListener("click", revelarCartasTemporales);

    // ===============================
    // FUNCIÓN PRINCIPAL DEL JUEGO
    // ===============================

    function iniciarJuego() {
        detenerTodosLosSonidos();
        config = niveles[nivelActual];

        const totalCartas = config.filas * config.columnas;
        const cantidadParejas = totalCartas / 2;
        tablero.style.gridTemplateColumns = `repeat(${config.columnas}, 1fr)`;
        let cartasUnicas = categoriaActual.slice(0, cantidadParejas);
        const cartas = [...cartasUnicas, ...cartasUnicas];
        barajarArray(cartas);
        tablero.innerHTML = "";

        let primeraCarta = null;
        let segundaCarta = null;
        let bloqueado = false;
        let intentos = 0;
        actualizarContador(intentos);

        if (config.contrarreloj) iniciarCronometroRegresivo();
        else iniciarCronometroNormal();

        if (config.powerups) activarPowerups();
        else desactivarPowerups();

        if (config.joker) activarJoker();
        if (config.oscuridad) activarOscuridad();

        if (esTutorial) mostrarTutorial();

        cartas.forEach(cartaData => {
            const carta = crearCarta(cartaData);
            carta.addEventListener("click", () => {
                if (bloqueado || carta.classList.contains("volteada")) return;
                carta.classList.add("volteada");

                if (!primeraCarta) {
                    if (esTutorial && tutorialPaso === 0) siguienteTutorial();
                    primeraCarta = carta;
                } else {
                    segundaCarta = carta;
                    bloqueado = true;
                    intentos++;
                    actualizarContador(intentos);

                    setTimeout(() => {
                        if (primeraCarta.dataset.clave === segundaCarta.dataset.clave) {
                            primeraCarta.classList.add("acertada");
                            segundaCarta.classList.add("acertada");
                            sonidoAcierto.play();
                            if (esTutorial && tutorialPaso < 5) siguienteTutorial();

                            const cartasRestantes = document.querySelectorAll(".card:not(.acertada)");
                            if (cartasRestantes.length === 0) {
                                clearInterval(intervaloTiempo);
                                mostrarMensajeFinal(intentos);
                            }
                        } else {
                            primeraCarta.classList.remove("volteada");
                            segundaCarta.classList.remove("volteada");
                            sonidoFallo.play();
                            if (esTutorial && (tutorialPaso === 1 || tutorialPaso === 2)) siguienteTutorial();
                        }

                        primeraCarta = null;
                        segundaCarta = null;
                        bloqueado = false;
                    }, 1000);
                }
            });
            tablero.appendChild(carta);
        });
    }

    // Evento que reinicia el juego al pulsar el botón
    botonReiniciar.addEventListener("click", () => {
        if (esTutorial) tutorialPaso = 0;
        if (esTutorial) mostrarTutorial();
        iniciarJuego();
    });

    // Evento que inicia el juego al seleccionar nivel y categoría y pulsar "Jugar"
    botonJugar.addEventListener("click", () => {
        const categoriaSeleccionada = selectorCategoria.value;
        categoriaActual = categorias[categoriaSeleccionada];
        nivelActual = parseInt(selectorNivel.value);
        iniciarJuego();
    });

    // Inicia el juego automáticamente al cargar la página
    iniciarJuego();
});
