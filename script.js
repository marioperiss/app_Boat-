// Inizializzazione della mappa
console.log("Inizializzazione della mappa");
var map = L.map('map').setView([45.5, 13.0], 5);  // Imposta la vista iniziale sulla regione dell'Alto Adriatico

// Aggiunta della mappa base con OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var currentMarker, currentLatLng;

// Funzione per aggiornare la posizione attuale
function updateCurrentPosition() {
  console.log("Aggiornamento della posizione attuale");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;

      currentLatLng = [lat, lon];
      console.log("Posizione attuale:", currentLatLng);

      if (currentMarker) {
        currentMarker.setLatLng(currentLatLng);
        map.setView(currentLatLng);
      } else {
        // Aggiungi il marker della posizione corrente con l'icona predefinita
        currentMarker = L.marker(currentLatLng).addTo(map);
        currentMarker.bindPopup("La tua posizione attuale");
        map.setView(currentLatLng, 8);
      }
    }, function(error) {
      console.error("Errore nella geolocalizzazione:", error);
      alert("Impossibile ottenere la tua posizione.");
    });
  } else {
    alert("Geolocalizzazione non supportata dal tuo browser.");
  }
}

// Inizializza la posizione corrente
updateCurrentPosition();

// Aggiorna la posizione corrente ogni 30 secondi
setInterval(updateCurrentPosition, 30000);

// Funzione per aggiornare lo stato della connessione
function updateConnectionStatus() {
  console.log("Aggiornamento dello stato della connessione");
  var statusElement = document.getElementById('connectionStatus');
  if (navigator.onLine) {
    statusElement.textContent = 'Connesso';
    statusElement.className = 'connection-status online';
  } else {
    statusElement.textContent = 'Disconnesso';
    statusElement.className = 'connection-status offline';
  }
}

// inizio funzioni bottoni di navigazione form a scomparsa 
document.getElementById('destinationSearchButton').addEventListener('click', function() {
  console.log("Apertura/Chiusura form destinazione");
  var formContainer = document.getElementById('destinationFormContainer');
  if (formContainer.style.display === 'none' || formContainer.style.display === '') {
    formContainer.style.display = 'block';
  } else {
    formContainer.style.display = 'none';
  }
});

// Ascolta i cambiamenti di stato della connessione
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

// Imposta lo stato iniziale della connessione
updateConnectionStatus();

// crea la rotta
document.getElementById('saveRouteButton').addEventListener('click', function() {
  console.log("Salvataggio rotta");
  var destination = document.getElementById('destination').value;

  // Usa un servizio di geocoding per ottenere le coordinate della destinazione
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`)
    .then(response => response.json())
    .then(data => {
      console.log("Dati geocoding ricevuti:", data);
      if (data.length > 0) {
        var destLatLng = [data[0].lat, data[0].lon];
        console.log("Coordinate destinazione:", destLatLng);
        
        // Aggiungi un marker per la destinazione con i dettagli nel popup
        var distance = calculateDistance(currentLatLng, destLatLng);
        var eta = calculateETA(distance);
        
        // Ottenere velocità del vento da OpenWeatherMap API
        getWindSpeed(destLatLng[0], destLatLng[1], function(windSpeed) {
          var destinationMarker = L.marker(destLatLng).addTo(map).bindPopup(`
            <b>Destinazione:</b> ${destination}<br>
            <b>Distanza:</b> ${distance.toFixed(2)} miglia nautiche<br>
            <b>Tempo stimato di arrivo:</b> ${eta}<br>
            <b>Velocità del vento:</b> ${windSpeed} nodi
          `).openPopup();

          // Traccia una rotta dalla posizione corrente alla destinazione
          var route = L.polyline([currentLatLng, destLatLng], { color: 'blue' }).addTo(map);

          // Aggiorna i dettagli nel modal
          document.getElementById('modalDestination').textContent = destination;
          document.getElementById('modalDistance').textContent = distance.toFixed(2);
          document.getElementById('modalEta').textContent = eta;
          document.getElementById('modalWind').textContent = windSpeed;

          // Mostra il modal dei dettagli
          document.getElementById('infoModal').style.display = 'block';

          // Chiudi il form di ricerca destinazione
          document.getElementById('destinationFormContainer').style.display = 'none';
        });
      } else {
        alert("Destinazione non trovata");
      }
    });
});

// Funzione per calcolare la distanza tra due coordinate
function calculateDistance(start, end) {
  console.log("Calcolo della distanza");
  var startLat = start[0];
  var startLng = start[1];
  var endLat = end[0];
  var endLng = end[1];
  
  // Haversine formula per calcolare la distanza in miglia nautiche
  var R = 3440.06479; // Raggio della Terra in miglia nautiche
  var dLat = (endLat - startLat) * Math.PI / 180;
  var dLng = (endLng - startLng) * Math.PI / 180;
  var a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(startLat * Math.PI / 180) * Math.cos(endLat * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance = R * c;
  console.log("Distanza calcolata:", distance);
  return distance;
}

// Funzione per calcolare l'ETA
function calculateETA(distance) {
  console.log("Calcolo dell'ETA");
  var averageSpeed = 10; // Velocità media in nodi
  var etaHours = distance / averageSpeed;
  var eta = new Date();
  eta.setHours(eta.getHours() + etaHours);
  var etaString = eta.toISOString().substr(11, 8); // Formato HH:MM:SS
  console.log("ETA calcolata:", etaString);
  return etaString;
}

// Funzione per ottenere la velocità del vento
function getWindSpeed(lat, lon, callback) {
  console.log("Richiesta velocità del vento per coordinate:", lat, lon);
  var apiKey = 'a97c62974e20b69a50665b07ab155f39';
  var url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.wind && data.wind.speed) {
        var windSpeedKmph = data.wind.speed;
        var windSpeedKnots = windSpeedKmph * 0.539957; // Converti km/h in nodi
        console.log("Velocità del vento:", windSpeedKnots);
        callback(windSpeedKnots.toFixed(2));
      } else {
        console.error('Dati del vento non disponibili:', data);
        callback('Non disponibile');
      }
    })
    .catch(error => {
      console.error('Errore nel recupero della velocità del vento:', error);
      callback('Non disponibile');
    });
}

// Gestione della chiusura del modal
document.getElementById('closeModal').addEventListener('click', function() {
  console.log("Chiusura modale dettagli destinazione");
  document.getElementById('infoModal').style.display = 'none';
});

// funzione per lat e lon 
document.addEventListener("DOMContentLoaded", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      document.getElementById("latitude").textContent = position.coords.latitude;
      document.getElementById("longitude").textContent = position.coords.longitude;
    });
  } else {
    alert("Geolocalizzazione non supportata dal tuo browser.");
  }
});

// fine funzione lat e log 
 // funzione bussola piu velocita barca piu giroscopio
 document.addEventListener("DOMContentLoaded", () => {
  // Bussola
  function updateCompass(heading) {
    document.getElementById("compassHeading").textContent = heading.toFixed(2);
    document.getElementById("needle").style.transform = `rotate(${heading}deg)`;
    document.getElementById("compassDirection").textContent = getDirection(heading);
  }

  function getDirection(heading) {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  }

  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (event) => {
      if (event.webkitCompassHeading) {
        updateCompass(event.webkitCompassHeading);
      } else if (event.alpha) {
        updateCompass(event.alpha);
      }
    });
  } else {
    alert("Il tuo dispositivo non supporta la bussola.");
  }

  // Velocità
  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition((position) => {
      const speed = position.coords.speed; // Velocità in metri al secondo
      const speedInKnots = (speed * 1.94384).toFixed(2);
      document.getElementById("boatSpeed").textContent = speedInKnots;
    }, (error) => {
      alert("Impossibile ottenere la posizione.");
    });
  } else {
    alert("Geolocalizzazione non supportata dal tuo browser.");
  }
});

 // fine 
// Funzione per mostrare le previsioni del tempo
document.getElementById('weatherButton').addEventListener('click', function() {
  console.log("Apertura modale previsioni del tempo");
  var weatherModal = document.getElementById('weatherModal');
  weatherModal.style.display = 'block';
});

document.getElementById('closeWeatherModal').addEventListener('click', function() {
  console.log("Chiusura modale previsioni del tempo");
  var weatherModal = document.getElementById('weatherModal');
  weatherModal.style.display = 'none';
});
