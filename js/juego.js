// Esperamos a que el documento esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {

    // Obtenemos los elementos HTML
    const tablero = document.getElementById("game-board");
    const spanContador = document.getElementById("contador");
    const botonReiniciar = document.getElementById("reiniciar-btn");
    const spanTiempo = document.getElementById("tiempo");
    const botonPowerup = document.getElementById("powerup-revelar");

    const selectorCategoria = document.getElementById("selector-categoria");
    const selectorNivel = document.getElementById("selector-nivel");
    const botonJugar = document.getElementById("boton-jugar");

    const sonidoAcierto = new Audio("assets/sonidos/correct.mp3");
    const sonidoFallo = new Audio("assets/sonidos/error.mp3");
    const sonidoTicTac = new Audio("assets/sonidos/tic-tac.mp3");
    const sonidoClockAlarm = new Audio("assets/sonidos/clock-alarm.mp3");

    sonidoAcierto.volume = 0.5;
    sonidoFallo.volume = 0.15;
    sonidoTicTac.volume = 0.5;
    sonidoClockAlarm.volume = 0.5;

    let categoriaActual = categorias.frutas;
    let nivelActual = parseInt(localStorage.getItem("nivelElegido")) || 1;
    const esTutorial = nivelActual === 1;
    let config = niveles[nivelActual];

    let tiempo = 0;
    let intervaloTiempo;

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

    const categoriaGuardada = localStorage.getItem("categoriaElegida");
    if (categoriaGuardada) {
        categoriaActual = categorias[categoriaGuardada];
        selectorCategoria.value = categoriaGuardada;
    }

    selectorCategoria.addEventListener("change", () => {
        localStorage.setItem("categoriaElegida", selectorCategoria.value);
        location.reload();
    });

    function actualizarContador(valor) {
        spanContador.textContent = valor;
    }

    function formatearTiempo(segundos) {
        const minutos = String(Math.floor(segundos / 60)).padStart(2, "0");
        const segs = String(segundos % 60).padStart(2, "0");
        return `${minutos}:${segs}`;
    }

    function actualizarPantallaTiempo() {
        spanTiempo.textContent = formatearTiempo(tiempo);
    }

    function mostrarMensajeFinal(intentos) {
        setTimeout(() => {
            alert(`Enhorabuena pichita, lo has conseguido en ${intentos} intentos.`);
        }, 300);
    }

    function crearCarta(cartaData) {
        const carta = document.createElement("div");
        carta.classList.add("card");
        carta.dataset.clave = cartaData.clave;
        carta.innerHTML =
            `<div class="cara cara-trasera"></div>
             <div class="cara cara-frontal">
                 <img src="${cartaData.src}" alt="${cartaData.clave}">
             </div>`;

        if (cartaData.clave === "joker") {
            carta.classList.add("joker");
        }
            
        return carta;
    }

    function barajarArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

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

    function castigoPorJoker(jokerCard) {
        jokerCard.classList.add("acertada"); // se queda fija
        const cartas = document.querySelectorAll(".card");
        cartas.forEach(carta => {
            if (!carta.classList.contains("acertada")) {
                carta.classList.remove("volteada");
            }
        });
        alert("¡Has encontrado al Joker! Todas las cartas se han girado.");
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

    function iniciarJuego() {
        detenerTodosLosSonidos();
        config = niveles[nivelActual];

        const totalCartas = config.filas * config.columnas;
        const cantidadParejas = totalCartas / 2;
        tablero.style.gridTemplateColumns = `repeat(${config.columnas}, 1fr)`;

        let cartasUnicas = categoriaActual.slice(0, cantidadParejas);

        if (!esTutorial) {
            cartasUnicas.pop(); // quitamos una normal
            cartasUnicas.push({ clave: "joker", src: "assets/cartas/especiales/joker.png" });
        }

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

        if (config.oscuridad) activarOscuridad();
        if (esTutorial) mostrarTutorial();

        cartas.forEach(cartaData => {
            const carta = crearCarta(cartaData);
            carta.addEventListener("click", () => {
                if (bloqueado || carta.classList.contains("volteada")) return;
                carta.classList.add("volteada");

                if (carta.dataset.clave === "joker") {
                    castigoPorJoker(carta);
                    return; // El Joker no forma pareja, no sigue la lógica normal
                }

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
                        } else {
                            primeraCarta.classList.remove("volteada");
                            segundaCarta.classList.remove("volteada");
                            sonidoFallo.play();
                            if (esTutorial && (tutorialPaso === 1 || tutorialPaso === 2)) siguienteTutorial();
                        }

                        primeraCarta = null;
                        segundaCarta = null;
                        bloqueado = false;

                        const cartasRestantes = document.querySelectorAll(".card:not(.acertada):not([data-clave='joker'])");
                        if (cartasRestantes.length === 0) {
                            clearInterval(intervaloTiempo);
                            mostrarMensajeFinal(intentos);
                        }
                    }, 1000);
                }
            });
            tablero.appendChild(carta);
        });
    }

    botonReiniciar.addEventListener("click", () => {
        if (esTutorial) tutorialPaso = 0;
        if (esTutorial) mostrarTutorial();
        iniciarJuego();
    });

    botonJugar.addEventListener("click", () => {
        const categoriaSeleccionada = selectorCategoria.value;
        categoriaActual = categorias[categoriaSeleccionada];
        nivelActual = parseInt(selectorNivel?.value || 1);
        iniciarJuego();
    });

    iniciarJuego();
});
