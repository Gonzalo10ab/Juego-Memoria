const tutorialMensajes = [
    "¡Bienvenido al juego de memoria!",
    "Haz clic en una carta para girarla.",
    "Ahora, encuentra otra carta igual.",
    "Completa todas las parejas para ganar.",
    "¡Suerte!"
];

let tutorialPaso = 0;

// Función que muestra el mensaje actual
function mostrarTutorial() {
    const tutorialDiv = document.getElementById("tutorial-mensaje");
    if (tutorialPaso < tutorialMensajes.length) {
        tutorialDiv.textContent = tutorialMensajes[tutorialPaso];
    } else {
        tutorialDiv.style.display = "none"; // Cuando termine el tutorial
    }
}

// Función para pasar al siguiente paso
function siguienteTutorial() {
    tutorialPaso++;
    mostrarTutorial();
}

// Mostrar el primer mensaje automáticamente
document.addEventListener("DOMContentLoaded", mostrarTutorial);