// Esperamos a que el documento esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {

    // Obtenemos el elemento HTML
    const tablero = document.getElementById("game-board");
    const spanContador = document.getElementById("contador");
    const botonReiniciar = document.getElementById("reiniciar-btn");

    let tiempo = 0;
    let intervaloTiempo;

    // Creamos una lista de letras que representarán las cartas únicas
    const cartasUnicas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']; // 8 tipos de carta

    // Función que genera y pinta las cartas en el tablero
    function iniciarJuego() {
        // Duplicamos el array para que haya 2 de cada una (parejas)
        const cartas = [...cartasUnicas, ...cartasUnicas]; // Esto es igual a ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

        // Barajamos las cartas para que el orden sea aleatorio
        barajarArray(cartas);

        // Estas dos variables nos ayudan a llevar el control del turno
        let primeraCarta = null;
        let segundaCarta = null;
        let bloqueado = false; // Evitamos que se pueda hacer click mientras se comparan cartas
        let intentos = 0;
        spanContador.textContent = intentos;

        // Obtenemos el elemento donde se mostrará el tiempo en pantalla
        const spanTiempo = document.getElementById("tiempo");

        // Establecemos el tiempo inicial (en segundos)
        // Aquí se ha puesto 5 para pruebas, pero puede ser 40, 60, etc.
        tiempo = 5;

        // Si había un cronómetro ya funcionando, lo detenemos antes de empezar uno nuevo
        clearInterval(intervaloTiempo);

        // Función que actualiza visualmente el cronómetro en pantalla
        // Convierte los segundos en formato mm:ss y lo muestra en el <span>
        const actualizarPantallaTiempo = () => {
            const minutos = String(Math.floor(tiempo / 60)).padStart(2, "0"); // Convierte los minutos a dos dígitos
            const segundos = String(tiempo % 60).padStart(2, "0");            // Convierte los segundos a dos dígitos
            spanTiempo.textContent = `${minutos}:${segundos}`;               // Ejemplo: 00:40
        };

        actualizarPantallaTiempo(); // Mostrar tiempo inicial

        // Iniciamos el cronómetro: cada 1000 ms (1 segundo), se ejecuta la función
        intervaloTiempo = setInterval(() => {
            //Reducimos el tiempo en 1 segundo
            tiempo--;

            // Si el tiempo llega a menos de 0, se ha terminado la cuenta atrás (Se pone menos que 0 para que el crono muestre el 00:00)
            if (tiempo < 0) {
                // Detenemos el cronómetro
                clearInterval(intervaloTiempo);

                // ALERTA QUE HAY QUE CAMBIAR
                alert("Tiempo acabado");
                // Reiniciamos automáticamente la partida
                iniciarJuego();
                return;
            }

            // Actualizamos la pantalla con el nuevo valor de tiempo
            actualizarPantallaTiempo();

        }, 1000); // Intervalo de 1 segundo (1000 milisegundos)


        // Limpiamos el tablero por si hay cartas anteriores
        tablero.innerHTML = "";

        // Creamos cada carta en el tablero
        cartas.forEach(letra => {
            // Creamos el div para cada carta
            const carta = document.createElement("div");
            carta.classList.add("card");

            // Guardamos la letra como un dato oculto para usarla al hacer click
            carta.dataset.letra = letra;

            // Creamos el contenido de la carta con dos caras
            carta.innerHTML = `
                <div class="cara cara-trasera"></div>
                <div class="cara cara-frontal">${letra}</div>
            `;

            // Añadimos un evento para cuando se haga click en la carta
            carta.addEventListener("click", () => {
                // Esto es una FUNCIÓN FLECHA, equivalente a: 
                // carta.addEventListener("click", function() { ... });

                // Si estamos esperando que termine una comparación, ignoramos los click
                if (bloqueado) return;

                // Si la carta ya esta girada, no hacemos caso a los click
                if (carta.classList.contains("volteada")) return;

                // Mostramos la letra y marcamos la carta como girada
                carta.classList.add("volteada");

                if (!primeraCarta) {
                    // Si no hay una carta ya girada, esta seria la primera
                    primeraCarta = carta;
                } else {
                    // Si ya hay una carta girada, asignamos la segunda
                    segundaCarta = carta;
                    // Bloqueamos los click minetras comparamos
                    bloqueado = true;

                    // Aumentamos los intentos cada vez que se gira la segunda carta
                    intentos++;
                    spanContador.textContent = intentos; // Actualizamos el contador con el nuevo número

                    // Añadimos temporizador para que el jugadora vea las cartas durante 1 segundo o 1000 ms
                    setTimeout(() => {
                        if (primeraCarta.dataset.letra === segundaCarta.dataset.letra) {
                            // Si el jugador acierta 2 cartas iguales, las dejamos giradas "visibles"
                            primeraCarta.classList.add("acertada");
                            segundaCarta.classList.add("acertada");

                            // Comprobamos si ya no quedan cartas con la clase ".acertada"
                            const cartasRestantes = document.querySelectorAll(".card:not(.acertada)");
                            // Si no hay cartas restantes, mostramos una alerta
                            if (cartasRestantes.length === 0) {
                                // Paramos el cronómetro al ganar
                                clearInterval(intervaloTiempo);

                                setTimeout(() => {
                                    // MODIFICAR ALERTA PARA EL FUTURO
                                    alert(`Enhorabuena pichita, lo has conseguido en ${intentos} intentos.`);
                                }, 300); // Esperamos un poco para que se vea el último giro
                            }

                        } else {
                            // Por consiguiente, si no son iguales pues las giramos otra vez
                            primeraCarta.classList.remove("volteada");
                            segundaCarta.classList.remove("volteada");
                        }
                        // Reseteamos variables para el siguiente turno
                        primeraCarta = null;
                        segundaCarta = null;
                        bloqueado = false;
                    }, 1000);
                }
            });

            // Añadimos la carta al tablero
            tablero.appendChild(carta);
        });
    }

    // Ejecutamos la función al iniciar el juego
    iniciarJuego();

    // Evento para reiniciar el juego al hacer click en el botón
    botonReiniciar.addEventListener("click", () => {
        iniciarJuego();
    });
});


// Función que baraja un array usando el algoritmo Fisher-Yates
function barajarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));  // Índice aleatorio entre 0 e i
        [array[i], array[j]] = [array[j], array[i]];    // Intercambiamos los elementos
    }
}
