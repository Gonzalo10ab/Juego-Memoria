// Esperamos a que el documento esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {

    // === LECTURA DE CATEGORÍA DESDE localStorage ===
    const selectorCategoria = document.getElementById("selector-categoria");
    // Declaramos categoriaActual con valor por defecto
    let categoriaActual = categorias.frutas;
    // Leemos lo que hubiera guardado el menú
    const categoriaGuardada = localStorage.getItem("categoriaElegida");
    // Si existe y es una categoría válida, la usamos
    if (categoriaGuardada && categorias[categoriaGuardada]) {
        categoriaActual = categorias[categoriaGuardada];
        selectorCategoria.value = categoriaGuardada;
    }

    // Evento para cambiar categoría y recargar el juego
    selectorCategoria.addEventListener("change", () => {
        localStorage.setItem("categoriaElegida", selectorCategoria.value);
        location.reload();
    });

    // === RÉSTO DE VARIABLES GLOBALES ===
    const tablero = document.getElementById("game-board");
    const spanContador = document.getElementById("contador");
    const botonReiniciar = document.getElementById("reiniciar-btn");
    const spanTiempo = document.getElementById("tiempo");
    const botonPowerup = document.getElementById("powerup-revelar");

    const selectorNivel = document.getElementById("selector-nivel");
    const botonJugar = document.getElementById("boton-jugar");

    const sonidoAcierto    = new Audio("assets/sonidos/correct.mp3");
    const sonidoFallo      = new Audio("assets/sonidos/error.mp3");
    const sonidoTicTac     = new Audio("assets/sonidos/tic-tac.mp3");
    const sonidoClockAlarm = new Audio("assets/sonidos/clock-alarm.mp3");

    sonidoAcierto.volume    = 0.5;
    sonidoFallo.volume      = 0.15;
    sonidoTicTac.volume     = 0.5;
    sonidoClockAlarm.volume = 0.5;

    let nivelActual = parseInt(localStorage.getItem("nivelElegido")) || 1;
    const esTutorial = nivelActual === 1;
    let config = niveles[nivelActual];

    let tiempo = 0;
    let intervaloTiempo;

    // Mensajes tutorial
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

    // Funciones auxiliares
    function actualizarContador(v) { spanContador.textContent = v; }
    function formatearTiempo(s) {
        const m = String(Math.floor(s/60)).padStart(2,"0");
        const sec = String(s%60).padStart(2,"0");
        return `${m}:${sec}`;
    }
    function actualizarPantallaTiempo() { spanTiempo.textContent = formatearTiempo(tiempo); }
    function mostrarMensajeFinal(intentos) {
        setTimeout(() => {
            alert(`Enhorabuena pichita, lo has conseguido en ${intentos} intentos.`);
        }, 300);
    }

    function crearCarta(data) {
        const carta = document.createElement("div");
        carta.classList.add("card");
        carta.dataset.clave = data.clave;
        carta.innerHTML = `
            <div class="cara cara-trasera"></div>
            <div class="cara cara-frontal">
                <img src="${data.src}" alt="${data.clave}">
            </div>`;
        if (data.clave === "joker") carta.classList.add("joker");
        return carta;
    }

    function barajarArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
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
                sonidoTicTac.pause(); sonidoTicTac.currentTime = 0;
                sonidoClockAlarm.play();
                setTimeout(iniciarJuego, 300);
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
        [sonidoTicTac, sonidoClockAlarm, sonidoAcierto, sonidoFallo].forEach(s => {
            s.pause(); s.currentTime = 0;
        });
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
        const sinAcertar = document.querySelectorAll(".card:not(.acertada)");
        sinAcertar.forEach(c => c.classList.add("volteada"));
        botonPowerup.disabled = true;
        setTimeout(() => sinAcertar.forEach(c => c.classList.remove("volteada")), 2000);
    }

    function castigoPorJoker(jokerCard) {
        // Joker se queda boca arriba
        jokerCard.classList.add("acertada");
        // Todas las demás se reinician (incluso acertadas)
        document.querySelectorAll(".card").forEach(c => {
            if (c !== jokerCard) {
                c.classList.remove("volteada");
                c.classList.remove("acertada");
            }
        });
        alert("¡Has encontrado al Joker! Todas las cartas se han reiniciado.");
    }

    function activarOscuridad() {
        document.body.classList.add("luz-apagada");
        document.addEventListener("mousemove", e => {
            document.body.style.setProperty("--x", e.clientX + "px");
            document.body.style.setProperty("--y", e.clientY + "px");
        });
    }

    botonPowerup.addEventListener("click", revelarCartasTemporales);

    // Función principal
    function iniciarJuego() {
        detenerTodosLosSonidos();
        config = niveles[nivelActual];

        const total = config.filas * config.columnas;
        const parejas = total / 2;
        tablero.style.gridTemplateColumns = `repeat(${config.columnas}, 1fr)`;

        // Tomamos las primeras cartas
        let unicas = categoriaActual.slice(0, parejas);

        // Si el nivel permite Joker, sustituimos una
        if (config.joker) {
            unicas.pop();
            unicas.push({ clave: "joker", src: "assets/cartas/especiales/joker.png" });
        }

        // Duplicamos para parejas y quitamos la segunda del Joker
        let mazo = [...unicas, ...unicas];
        const idx = mazo.findIndex(c => c.clave === "joker");
        if (idx !== -1) mazo.splice(idx, 1);

        barajarArray(mazo);
        tablero.innerHTML = "";

        let primera = null, segunda = null, bloqueado = false, intentos = 0;
        actualizarContador(intentos);

        // Cronómetro y extras
        config.contrarreloj ? iniciarCronometroRegresivo() : iniciarCronometroNormal();
        config.powerups ? activarPowerups() : desactivarPowerups();
        if (config.oscuridad) activarOscuridad();
        if (esTutorial) mostrarTutorial();

        // Creamos y gestionamos eventos de cada carta
        mazo.forEach(data => {
            const carta = crearCarta(data);
            carta.addEventListener("click", () => {
                if (bloqueado || carta.classList.contains("volteada")) return;
                carta.classList.add("volteada");

                if (data.clave === "joker") {
                    castigoPorJoker(carta);
                    return;
                }

                if (!primera) {
                    if (esTutorial && tutorialPaso === 0) siguienteTutorial();
                    primera = carta;
                } else {
                    segunda = carta;
                    bloqueado = true;
                    intentos++;
                    actualizarContador(intentos);

                    setTimeout(() => {
                        if (primera.dataset.clave === segunda.dataset.clave) {
                            primera.classList.add("acertada");
                            segunda.classList.add("acertada");
                            sonidoAcierto.play();
                            if (esTutorial && tutorialPaso < 5) siguienteTutorial();
                        } else {
                            primera.classList.remove("volteada");
                            segunda.classList.remove("volteada");
                            sonidoFallo.play();
                            if (esTutorial && (tutorialPaso === 1 || tutorialPaso === 2)) siguienteTutorial();
                        }
                        primera = segunda = null;
                        bloqueado = false;

                        // Comprobamos si solo quedan no-Joker no-acertadas
                        const restantes = document.querySelectorAll(".card:not(.acertada):not([data-clave='joker'])");
                        if (restantes.length === 0) {
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
        // Permite cambiar nivel y reiniciar
        nivelActual = parseInt(selectorNivel.value);
        iniciarJuego();
    });

    // Arrancamos
    iniciarJuego();
});
