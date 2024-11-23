// Percorso del file audio per l'allarme
var alarmSound = new Audio('allarme/67.mp3'); // Sostituisci con il percorso corretto al tuo file audio

// Funzione per calcolare la distanza tra due coordinate (formula dell'Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // Raggio della Terra in km
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = 
    0.5 - Math.cos(dLat)/2 + 
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    (1 - Math.cos(dLon))/2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

// Funzione per attivare l'allarme
function triggerAlarm() {
  if (document.getElementById('toggle-checkbox').checked) {
    // Aggiungi effetto visivo
    document.body.style.backgroundColor = 'red';

    // Suona l'allarme
    alarmSound.play();
  }
}

// Funzione per disattivare l'allarme
function resetAlarm() {
  // Resetta il colore di sfondo
  document.body.style.backgroundColor = '';
  
  // Ferma il suono dell'allarme
  alarmSound.pause();
  alarmSound.currentTime = 0; // Riavvolge il suono dell'allarme
}

// Funzione per ottenere la geolocalizzazione e controllare la vicinanza alla costa
async function checkProximityToCoast() {
  try {
    const position = await Geolocation.getCurrentPosition();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Usa una libreria o API per determinare se sei vicino alla costa
    const isNearCoast = checkIfNearCoast(latitude, longitude);

    const toggleContainer = document.querySelector('.toggle-container');
    if (isNearCoast) {
      toggleContainer.style.display = 'block'; // Mostra il bottone
      triggerAlarm(); // Attiva l'allarme visivo e sonoro
    } else {
      toggleContainer.style.display = 'block'; // Bottone sempre visibile, anche lontano dalla costa
      resetAlarm(); // Disattiva l'allarme visivo e sonoro
    }
  } catch (error) {
    console.error('Errore geolocalizzazione: ', error);
  }
}

// Funzione per verificare se la posizione è vicino alla costa (semplificato)
function checkIfNearCoast(latitude, longitude) {
  // Posizione di Venezia
  const coastLat = 45.4408;
  const coastLon = 12.3155;
  
  // Calcola la distanza tra la posizione dell'utente e Venezia
  const distance = calculateDistance(latitude, longitude, coastLat, coastLon);

  // Consideriamo vicino alla costa se la distanza è inferiore a 5 km
  return distance < 5;
}

// Gestire il cambiamento del toggle
const checkbox = document.getElementById('toggle-checkbox');
const toggleText = document.querySelector('.toggle-text');
const alertMessage = document.getElementById('depthStatus');

checkbox.addEventListener('change', function () {
  toggleText.textContent = checkbox.checked ? 'ON' : 'OFF';

  // Attiva o disattiva l'allerta per il fondale basso
  if (checkbox.checked) {
    alertMessage.textContent = "Attenzione: Fondale basso!";
    alertMessage.style.color = "red"; // Colore rosso per allerta
    playAlarmSound(); // Riproduce il suono
  } else {
    alertMessage.textContent = "Fondale sicuro.";
    alertMessage.style.color = "green"; // Colore verde per sicuro
    stopAlarmSound(); // Ferma il suono
  }
});

// Funzione per riprodurre l'allarme sonoro
function playAlarmSound() {
  alarmSound.play();
}

// Funzione per fermare l'allarme sonoro
function stopAlarmSound() {
  alarmSound.pause();
  alarmSound.currentTime = 0; // Riavvia il suono se viene fermato
}

// Verifica la posizione ogni volta che la pagina viene caricata
checkProximityToCoast();

// Funzione per calcolare la vicinanza alla costa e attivare l'allarme
setInterval(function() {
  if (checkbox.checked) {
    // Ottieni la posizione utente e verifica la distanza
    checkProximityToCoast();
  }
}, 5000); // Controlla ogni 5 secondi
