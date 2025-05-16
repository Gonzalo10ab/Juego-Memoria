// Esperamos a que el documento esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {

    // Obtenemos los elementos HTML
    const tablero = document.getElementById("game-board"); // Donde se colocan las cartas
    const spanContador = document.getElementById("contador"); // Contador de intentos
    const botonReiniciar = document.getElementById("reiniciar-btn"); // Botón para reiniciar
    const spanTiempo = document.getElementById("tiempo"); // Muestra el cronómetro
    const botonPowerup = document.getElementById("powerup-revelar"); // Botón para usar el powerup
    const botonVolverMenu = document.getElementById("btn-volver-menu"); // Botón volver al menu
    const spanJugador = document.getElementById("jugador-actual"); // Jugador actual (solo si hay 2 jugadores)
    const spanPuntosJ1 = document.getElementById("puntos-j1"); // Puntuación jugador 1
    const spanPuntosJ2 = document.getElementById("puntos-j2"); // Puntuación jugador 2

    // Instanciamos los sonidos
    const sonidoAcierto = new Audio("assets/sonidos/correct.mp3");
    const sonidoFallo = new Audio("assets/sonidos/error.mp3");
    const sonidoTicTac = new Audio("assets/sonidos/tic-tac.mp3");
    const sonidoClockAlarm = new Audio("assets/sonidos/clock-alarm.mp3");

    // Ajustamos el volumen de los sonidos 
    sonidoAcierto.volume = 0.5;
    sonidoFallo.volume = 0.15;
    sonidoTicTac.volume = 0.5;
    sonidoClockAlarm.volume = 0.5;

    // === VARIABLES GLOBALES ===
    let categoriaActual;
    let nivelActual;
    let config;
    let tiempo = 0;
    let intervaloTiempo; // Referencia al intervalo del cronómetro

    // === SISTEMA DE TUTORIAL GUIADO ===

    // Array de mensajes del tutorial
    const tutorialMensajes = [
        "¡Bienvenido al juego de memoria! Haz clic en una carta para girarla.",
        "Ahora, encuentra otra carta que sea igual.",
        "Si las cartas no coinciden, se girarán de nuevo.",
        "Si coinciden, se quedarán boca arriba.",
        "Completa todas las parejas para ganar.",
        "¡Bien hecho!"
    ];

    let indiceMensajeTutorial = 0; // Índice del mensaje actual

    // Muestra un mensaje del tutorial en pantalla
    function mostrarMensajeTutorial(mensaje) {
        const div = document.getElementById("tutorial-mensaje");
        div.textContent = mensaje;
        div.classList.remove("oculto");
    }

    // Avanza al siguiente mensaje
    function siguienteMensajeTutorial() {
        indiceMensajeTutorial++;
        if (indiceMensajeTutorial < tutorialMensajes.length) {
            mostrarMensajeTutorial(tutorialMensajes[indiceMensajeTutorial]);
        } else {
            document.getElementById("tutorial-mensaje").classList.add("oculto");
        }
    }


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
    function mostrarMensajeFinal(intentos, puntosJ1, puntosJ2) {
        setTimeout(() => {
            if (window.modoJuego === 2) {
                let mensaje;
                if (puntosJ1 > puntosJ2) {
                    mensaje = `¡Jugador 1 gana con ${puntosJ1} puntos!`;
                } else if (puntosJ2 > puntosJ1) {
                    mensaje = `¡Jugador 2 gana con ${puntosJ2} puntos!`;
                } else {
                    mensaje = `¡Empate! Ambos tienen ${puntosJ1} puntos.`;
                }
                mostrarMensajeBonito(mensaje);
            } else {
                mostrarMensajeBonito(`Enhorabuena pichita, lo has conseguido en ${intentos} intentos.`);
            }
        }, 300);
    }

    function mostrarMensajeBonito(texto, duracion = 3000) {
        const div = document.getElementById("mensaje-final");
        div.textContent = texto;
        div.classList.remove("oculto");
        div.classList.add("visible");

        setTimeout(() => {
            div.classList.remove("visible");
            setTimeout(() => {
                div.classList.add("oculto");
            }, 300); // esperamos a que desaparezca con animación
        }, duracion);
    }

    // Función que aplica el castigo del joker
    function castigoPorJoker(jokerCard) {
        jokerCard.classList.add("acertada");
        document.querySelectorAll(".card").forEach(c => {
            if (c !== jokerCard) {
                c.classList.remove("volteada");
                c.classList.remove("acertada");
            }
        });
    mostrarMensajeBonito("¡Has encontrado al Joker! Todas las cartas se han reiniciado.");
    }

    // Crea dinámicamente una carta con su estructura HTML
    function crearCarta(cartaData) {
        const carta = document.createElement("div");
        carta.classList.add("card");
        carta.dataset.clave = cartaData.clave; // Se guarda la clave como atributo personalizado
        if (cartaData.clave === "joker") carta.classList.add("joker");
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
            const j = Math.floor(Math.random() * (i + 1));  // Índice aleatorio entre 0 e i
            [array[i], array[j]] = [array[j], array[i]];    // Intercambiamos los elementos
        }
    }

    // Inicia el cronómetro para abajo (modo contrarreloj)
    function iniciarCronometroRegresivo() {
        tiempo = 1200; // Tiempo total en segundos
        clearInterval(intervaloTiempo); // Aseguramos que no haya un intervalo anterior activo
        actualizarPantallaTiempo();
    
        intervaloTiempo = setInterval(() => {
            tiempo--;
    
            // Cuando queden 10 segundos empieza el sonido
            if (tiempo === 10) {
                sonidoTicTac.play();
            }
    
            // Cuando el tiempo se acaba
            if (tiempo < 0) {
                clearInterval(intervaloTiempo); // Detenemos el cronómetro
    
                sonidoTicTac.pause();           // Paramos el sonido
                sonidoTicTac.currentTime = 0;   // Lo reiniciamos por si se vuelve a usar
    
                sonidoClockAlarm.play();        // Empieza el sonido de alarma
    
                // Esperamos 300ms antes de mostrar la alerta (NECESARIO SI QUEREMOS QUE EL SONIDO FUNCIONE)
                setTimeout(() => {
                    mostrarMensajeBonito("¡Tiempo agotado!"); // CAMBIAR POR UNA ALERTA CHULA
                    iniciarJuego();             // Reiniciamos el juego automáticamente
                }, 300);
    
                return;
            }
    
            actualizarPantallaTiempo();
        }, 1000); // Se ejecuta cada segundo
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
        // Detenemos y reiniciamos el sonido del tic-tac (urgencia)
        sonidoTicTac.pause();
        sonidoTicTac.currentTime = 0;
    
        // Detenemos y reiniciamos la alarma final
        sonidoClockAlarm.pause();
        sonidoClockAlarm.currentTime = 0;

        sonidoAcierto.pause();
        sonidoAcierto.currentTime = 0;

        sonidoFallo.pause();
        sonidoFallo.currentTime = 0;
    }

    // Activa el botón de power-up
    function activarPowerups() {
        botonPowerup.style.display = "inline-block";
        botonPowerup.disabled = false;
    }

    // Desactiva y oculta el botón de power-up
    function desactivarPowerups() {
        botonPowerup.style.display = "none";
        botonPowerup.disabled = true;
    }

    // Power-up que muestra temporalmente todas las cartas
    function revelarCartasTemporales() {
        const cartas = document.querySelectorAll(".card:not(.acertada)");
        cartas.forEach(carta => carta.classList.add("volteada"));
        botonPowerup.disabled = true;
        setTimeout(() => {
            cartas.forEach(carta => carta.classList.remove("volteada"));
        }, 2000);
    }

    // Efecto de oscuridad: activa modo linterna que sigue al ratón (VER POR QUÉ NO SE QUITA CUANDO SE CAMBIA DE NIVEL)
    function activarOscuridad() {
        // Añadimos una clase css al <body>
        document.body.classList.add("luz-apagada");

        // Escuchamos el evento "mousemove", que se activa cada vez que el usuario mueve el ratón.
        // Usamos una función flecha: (e) => { ... }
        document.addEventListener("mousemove", (e) => { // e representa el objeto del evento (con información como posición del ratón).
            // Cogemos la posición horizontal del ratón y le añadimos 'px' para usarlo en el css.
            const x = e.clientX + "px";
            // Cogemos la posición vertical del ratón en píxeles.
            const y = e.clientY + "px";

            // Actualizamos dos variables css (--x y --y) en el body.
            document.body.style.setProperty("--x", x);
            document.body.style.setProperty("--y", y);
        });
    }

    // Hace que las cartas joker vibren cada cierto tiempo aleatorio
    function activarVibracionJokers() {
        const jokers = document.querySelectorAll(".card.joker");

        jokers.forEach(joker => {
            const vibrar = () => {
                joker.classList.add("vibrando");

                setTimeout(() => {
                    joker.classList.remove("vibrando");
                }, 300); // Dura lo mismo que la animación en CSS

                const siguiente = Math.floor(Math.random() * 5000) + 8000; // 8-12 segundos
                setTimeout(vibrar, siguiente);
            };

            setTimeout(vibrar, Math.random() * 2000); // Pequeño retardo inicial aleatorio
        });
    }


    // Asignamos el evento al botón de power-up
    botonPowerup.addEventListener("click", revelarCartasTemporales);

    botonVolverMenu.addEventListener("click", () => {
        // Eliminamos una clase css al <body>
        document.body.classList.remove("luz-apagada");
        // Ocultamos el mensaje del tutorial (por si está activo)
        document.getElementById("tutorial-mensaje").classList.add("oculto");
        indiceMensajeTutorial = 0;

        // Ocultamos la sección de juego y volvemos al menú 1
        document.getElementById("juego").classList.add("oculto");
        document.getElementById("menu1").classList.remove("oculto");

        // Limpiamos el tablero
        document.getElementById("game-board").innerHTML = "";
        document.getElementById("turno-jugador").classList.add("oculto");

        // Detenemos sonidos y cronómetro
        clearInterval(intervaloTiempo);
        detenerTodosLosSonidos();
    });

    // ===============================
    // FUNCIÓN PRINCIPAL DEL JUEGO
    // ===============================

    function iniciarJuego() {
        // Detenemos todos los sonidos por si hay alguno activo
        detenerTodosLosSonidos();

        // Obtenemos la categoría y el nivel actual desde variables globales (definidas en menus.js). Si no existen, usamos valores por defecto.
        categoriaActual = window.categoriaActual || categorias.frutas;
        nivelActual = window.nivelActual || 1;

        // Si el nivel es el tutorial (por ejemplo, nivel 99), iniciamos los mensajes
        if (nivelActual === 1) {
            indiceMensajeTutorial = 0;
            mostrarMensajeTutorial(tutorialMensajes[indiceMensajeTutorial]);
        }

        // Obtenemos la configuración del nivel actual desde el objeto 'niveles'
        config = niveles[nivelActual];

        // Calculamos el número total de cartas según filas x columnas
        const totalCartas = config.filas * config.columnas;

        // Como el juego es por parejas, dividimos entre 2 para saber cuántas cartas únicas necesitamos
        const cantidadParejas = totalCartas / 2;

        // Ajustamos el diseño del tablero en base al número de columnas del nivel
        tablero.style.gridTemplateColumns = `repeat(${config.columnas}, minmax(0, 1fr))`;

        // Seleccionamos las cartas únicas según la categoría elegida (frutas, daw, davante, etc.) Solo tomamos las necesarias para el nivel actual
        let cartasUnicas = categoriaActual.slice(0, cantidadParejas);

        // Si el nivel tiene joker, sustituimos una carta por el joker
        if (config.joker && window.modoJuego !== 2) {
            cartasUnicas.pop();
            cartasUnicas.push({ clave: "joker", src: "assets/cartas/especiales/joker.png" });
        }

        // Duplicamos el array de cartas para que haya 2 de cada una (crear las parejas)
        const cartas = [...cartasUnicas, ...cartasUnicas];

        barajarArray(cartas); // Mezclamos las cartas

        // Limpiamos el tablero (por si había cartas anteriores)
        tablero.innerHTML = "";

        // === VARIABLES DE CONTROL PARA LA LÓGICA DEL JUEGO ===
        let primeraCarta = null;    // Almacena la primera carta seleccionada en un turno
        let segundaCarta = null;    // Almacena la segunda carta seleccionada
        let bloqueado = false;      // Evita que el jugador haga más clics mientras se comparan dos cartas
        let intentos = 0;           // Contador de intentos
        let jugadorActual = 1;
        let puntosJ1 = 0;
        let puntosJ2 = 0;

        const panelTurno = document.getElementById("turno-jugador");
        const marcadores = document.querySelectorAll(".marcador");

        if (window.modoJuego === 2) {
            marcadores.forEach(el => el.style.display = "inline");
            panelTurno.classList.remove("oculto");
        } else {
            marcadores.forEach(el => el.style.display = "none");
            panelTurno.classList.add("oculto");
        }
        
        actualizarContador(intentos);
        if (spanJugador) spanJugador.textContent = jugadorActual;
        if (spanPuntosJ1) spanPuntosJ1.textContent = puntosJ1;
        if (spanPuntosJ2) spanPuntosJ2.textContent = puntosJ2;

        // Si el nivel es contrarreloj, iniciamos el contrarreloj
        // Si hay 2 jugadores, nunca usamos contrarreloj
        if (window.modoJuego === 2) {
            iniciarCronometroNormal();
        } else {
            if (config.contrarreloj) iniciarCronometroRegresivo();
            else iniciarCronometroNormal();
        }

        // Si los powerups están habilitados en el nivel, activamos el botón correspondiente
        if (config.powerups && window.modoJuego !== 2) {
            activarPowerups(); // lo muestra
        } else {
            desactivarPowerups(); // lo oculta
        }

        // Activamos el efecto de oscuridad (linterna) si está habilitado para este nivel
        if (config.oscuridad) activarOscuridad();

        // Recorremos todas las cartas y generamos sus elementos HTML en el tablero
        cartas.forEach(cartaData => {
            const carta = crearCarta(cartaData);

            // Asignamos un evento al hacer clic en la carta
            // Equivale a: carta.addEventListener("click", function() { ... });
            carta.addEventListener("click", () => {

                // Si ya hay una comparación en curso o la carta ya está girada, ignoramos el clic
                if (bloqueado || carta.classList.contains("volteada")) return;

                // Giramos la carta añadiendo la clase css 'volteada'
                carta.classList.add("volteada");

                // Si es la carta joker, se activa el castigo y se corta el turno
                if (carta.dataset.clave === "joker") {
                    castigoPorJoker(carta);
                    return;
                }

                if (!primeraCarta) {
                    // Si no hay carta seleccionada aún, esta es la primera del turno
                    primeraCarta = carta;

                    // Tutorial paso 1 → "Haz clic en otra carta"
                    if (nivelActual === 1 && indiceMensajeTutorial === 0) {
                        siguienteMensajeTutorial();
                    }
                } else {
                    if (nivelActual === 1 && indiceMensajeTutorial === 1) {
                        siguienteMensajeTutorial(); // Paso 2
                    }
                    // Si ya hay una carta girada, esta es la segunda
                    segundaCarta = carta;
                    bloqueado = true; // Bloqueamos temporalmente nuevos clics
                    intentos++;       // Aumentamos el número de intentos
                    actualizarContador(intentos);

                    // Esperamos 1 segundo antes de comparar las cartas
                    setTimeout(() => {

                        // Comparamos si ambas cartas tienen el mismo valor
                        if (primeraCarta.dataset.clave === segundaCarta.dataset.clave) {
                            // Si coinciden, las marcamos como acertadas (se quedarán volteadas)
                            primeraCarta.classList.add("acertada");
                            segundaCarta.classList.add("acertada");
                            // Si el sonido está activado, reproducimos el efecto de acierto
                            if (window.sonidoActivo) sonidoAcierto.play();

                            // Tutorial paso 3 → "Si coinciden..."
                            if (nivelActual === 1 && indiceMensajeTutorial === 2) {
                                siguienteMensajeTutorial();
                            }

                            // Tutorial paso 4 → "Completa todas las parejas..."
                            else if (nivelActual === 1 && indiceMensajeTutorial === 3) {
                                siguienteMensajeTutorial();
                            }

                            if (window.modoJuego === 2) {
                                if (jugadorActual === 1) puntosJ1++;
                                else puntosJ2++;
                                spanPuntosJ1.textContent = puntosJ1;
                                spanPuntosJ2.textContent = puntosJ2;
                            }

                            const cartasRestantes = document.querySelectorAll(".card:not(.acertada):not([data-clave='joker'])");
                            if (cartasRestantes.length === 0) {
                                // Si todas han sido acertadas, detenemos el cronómetro y mostramos mensaje final
                                clearInterval(intervaloTiempo);
                                mostrarMensajeFinal(intentos, puntosJ1, puntosJ2);

                                // Tutorial paso 5 → "¡Bien hecho!"
                                if (nivelActual === 1 && indiceMensajeTutorial === 4) {
                                    siguienteMensajeTutorial();
                                }
                            }

                        } else {
                            // Si no coinciden, las giramos de nuevo (las ocultamos)
                            primeraCarta.classList.remove("volteada");
                            segundaCarta.classList.remove("volteada");
                            if (window.sonidoActivo) sonidoFallo.play();

                            if (window.modoJuego === 2) {
                                jugadorActual = jugadorActual === 1 ? 2 : 1;
                                spanJugador.textContent = jugadorActual;
                            }

                            // Tutorial paso 2 → "Si no coinciden..."
                            if (nivelActual === 1 && indiceMensajeTutorial === 2) {
                                siguienteMensajeTutorial();
                            }
                        }

                        // Reiniciamos las variables para el siguiente turno
                        primeraCarta = null;
                        segundaCarta = null;
                        bloqueado = false;

                    }, 1000); // Esperamos 1 segundo antes de mostrar el resultado al jugador
                }
            });

            // Añadimos la carta al tablero en el DOM
            tablero.appendChild(carta);
        });

        activarVibracionJokers();
    }

    // Evento que reinicia el juego al pulsar el botón
    botonReiniciar.addEventListener("click", iniciarJuego);

    // Hacemos que la función iniciarJuego este disponible globalmente
    window.iniciarJuego = iniciarJuego;
});
