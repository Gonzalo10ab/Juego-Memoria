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
    let nivelActual =  parseInt(localStorage.getItem("nivelElegido")) || 1; // Nivel por defecto
    let config = niveles[nivelActual]; // Configuración inicial del nivel

    let tiempo = 0; // Tiempo transcurrido o restante
    let intervaloTiempo; // Referencia al intervalo del cronómetro


    //  ===MENSAJES PARA EL TUTORIAL EN ORDEN
    const tutorialMensajes = [
        "¡Bienvenido al juego de memoria!, Haz clic en una carta para girarla",
        "Ahora, encuentra otra carta que sea igual.",
        "Si las cartas no coinciden, se girarán de nuevo.",
        "Si coinciden, se quedarán boca arriba.",
        "Completa todas las parejas para ganar.",
        "¡Bien hecho!"
    ];
    let tutorialPaso = 0;       // Empezamos en el primer mensaje


    //reinciar la pagina cuando se cambia de tematica
   
    const categoriaGuardada = localStorage.getItem("categoriaElegida");
     // Recuperar categoría guardada desde el menú
    if (categoriaGuardada) {
        categoriaActual = categorias[categoriaGuardada];
    } else {
        categoriaActual = categorias.frutas; // por defecto
    }

    if (categoriaGuardada) {
        selectorCategoria.value = categoriaGuardada; 
        categoriaActual = categorias[categoriaGuardada];
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
        // Esperamos un poco antes de mostrarlo para que el último giro se vea
        setTimeout(() => {
            alert(`Enhorabuena pichita, lo has conseguido en ${intentos} intentos.`); // CAMBIAR POR UNA ALERTA CHULA
        }, 300);
    }

    // Crea dinámicamente una carta con su estructura HTML
    function crearCarta(cartaData) {
        const carta = document.createElement("div");
        carta.classList.add("card");
        carta.dataset.clave = cartaData.clave; // Se guarda la clave como atributo personalizado
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
        tiempo = 20; // Tiempo total en segundos
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
                    alert("¡Tiempo agotado!");  // CAMBIAR POR UNA ALERTA CHULA
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

    // Función de prueba para el efecto joker (CAMBIAR POR LA BUENA)
    function activarJoker() {
        console.log("Joker activado");
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


    // Asignamos el evento al botón de power-up
    botonPowerup.addEventListener("click", revelarCartasTemporales);

    //FUNCIÓN DEL TUTORIAL
    function mostrarTutorial() {
        const tutorialDiv = document.getElementById("tutorial-mensaje");
        if (tutorialPaso < tutorialMensajes.length) {
            tutorialDiv.textContent = tutorialMensajes[tutorialPaso];
        } else {
            tutorialDiv.style.display = "none"; // Cuando termine el tutorial
        }
    }

    function siguienteTutorial() {
        tutorialPaso++;
        mostrarTutorial();
    }



    // ===============================
    // FUNCIÓN PRINCIPAL DEL JUEGO
    // ===============================
    

    function iniciarJuego() {
        // Detenemos todos los sonidos por si hay alguno activo
        detenerTodosLosSonidos();

        // Obtenemos la configuración del nivel actual desde el objeto 'niveles'
        config = niveles[nivelActual];

        // Calculamos el número total de cartas según filas x columnas
        const totalCartas = config.filas * config.columnas;

        // Como el juego es por parejas, dividimos entre 2 para saber cuántas cartas únicas necesitamos
        const cantidadParejas = totalCartas / 2;

        // Ajustamos el diseño del tablero en base al número de columnas del nivel
        tablero.style.gridTemplateColumns = `repeat(${config.columnas}, 1fr)`;

        // Seleccionamos las cartas únicas según la categoría elegida (frutas, números, etc.) Solo tomamos las necesarias para el nivel actual
        let cartasUnicas = categoriaActual.slice(0, cantidadParejas);

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
        
       
        // Mostramos el contador de intentos inicial (0)
        actualizarContador(intentos);

        // Si el nivel es contrarreloj, iniciamos el contrarreloj
        // Si no, iniciamos un cronometro
        if (config.contrarreloj) iniciarCronometroRegresivo();
        else iniciarCronometroNormal();

        // Si los powerups están habilitados en el nivel, activamos el botón correspondiente
        if (config.powerups) activarPowerups();
        else desactivarPowerups();

        // Activamos el efecto del Joker si está habilitado para este nivel
        if (config.joker) activarJoker();

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

                if (!primeraCarta) {
                    // Si no hay carta seleccionada aún, esta es la primera del turno
                    if (tutorialPaso === 0) { 
                        siguienteTutorial(); // Avanzar tutorial SOLO cuando aciertes
                    }
                    primeraCarta = carta;
                } else {
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
                            sonidoAcierto.play();
                            if (tutorialPaso < 5) { 
                                siguienteTutorial(); // Avanzar tutorial cuanndo aciertes
                            }

                            // Comprobamos si ya no quedan más cartas por acertar
                            const cartasRestantes = document.querySelectorAll(".card:not(.acertada)");
                            if (cartasRestantes.length === 0) {
                                // Si todas han sido acertadas, detenemos el cronómetro y mostramos mensaje final
                                clearInterval(intervaloTiempo);
                                mostrarMensajeFinal(intentos);
                            }

                        } else {
                            // Si no coinciden, las giramos de nuevo (las ocultamos)
                            primeraCarta.classList.remove("volteada");
                            segundaCarta.classList.remove("volteada");
                            sonidoFallo.play();
                            if (tutorialPaso === 1||tutorialPaso=== 2 ) { 
                                siguienteTutorial(); // Avanzar tutorial cuando no aciertes
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
    }

    // Evento que reinicia el juego al pulsar el botón
    botonReiniciar.addEventListener("click", () => {
        //ponemos que la posicion de tutorial paso sea 0 para empezarla de 0 y luego la mostramos
        tutorialPaso=0;
        mostrarTutorial();
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