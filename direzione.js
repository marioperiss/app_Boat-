const needle = document.getElementById("needle");
const directionText = document.getElementById("direction");

// Variabili per calcolare l'orientamento
let alpha = 0, beta = 0, gamma = 0;

// Calcola l'orientamento basato sull'accelerometro
function updateCompass() {
    // Usa beta e gamma per determinare l'angolo approssimato
    const angle = Math.atan2(beta, gamma) * (180 / Math.PI);

    // Ruota l'ago della bussola
    needle.style.transform = `rotate(${angle}deg)`;

    // Imposta una direzione approssimata basata sull'angolo
    let direction;
    if (angle >= -22.5 && angle < 22.5) {
        direction = "Nord";
    } else if (angle >= 22.5 && angle < 67.5) {
        direction = "Nord-Est";
    } else if (angle >= 67.5 && angle < 112.5) {
        direction = "Est";
    } else if (angle >= 112.5 && angle < 157.5) {
        direction = "Sud-Est";
    } else if (angle >= 157.5 || angle < -157.5) {
        direction = "Sud";
    } else if (angle >= -157.5 && angle < -112.5) {
        direction = "Sud-Ovest";
    } else if (angle >= -112.5 && angle < -67.5) {
        direction = "Ovest";
    } else if (angle >= -67.5 && angle < -22.5) {
        direction = "Nord-Ovest";
    }
    directionText.textContent = "Direzione: " + direction;
}

// Ascolta gli eventi dell'accelerometro
if (window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", (event) => {
        // Recupera beta e gamma
        beta = event.accelerationIncludingGravity.x;
        gamma = event.accelerationIncludingGravity.y;
        updateCompass();
    });
} else {
    directionText.textContent = "Accelerometro non supportato";
}
