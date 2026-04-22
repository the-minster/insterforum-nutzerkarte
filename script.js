const map = L.map('map').setView([51.1657, 10.4515], 6); // Zentriert auf Deutschland

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Marker-Icon
const carIcon = L.icon({
    iconUrl: 'instericon.png', // Pfad zu deinem Auto-Bild
    iconSize: [32, 32], 
    iconAnchor: [16, 32], 
    popupAnchor: [0, -32] 
});

// Layer-Gruppen für die Steuerung
const markerLayer = L.layerGroup();
const circleLayer = L.layerGroup();
const heatLayerPoints = L.heatLayer([], {radius: 40, blur: 5});

const heatLayerOverlap = L.heatLayer([], {
    radius: 50,           // Größerer Radius für mehr Fläche
    blur: 35,             // Weicheres Ineinanderfließen
    minOpacity: 0.2,      // Auch einzelne Punkte sind leicht sichtbar
    gradient: {
        0.2: 'white',     // Ganz schwache Bereiche
        0.4: 'yellow',    // Mittlere Dichte
        0.6: 'orange',    // Hohe Dichte
        1.0: 'darkred'    // Maximale Überschneidung
    }
});

const oms = new OverlappingMarkerSpiderfier(map);

// CSV laden
Papa.parse(csvUrl, {
    download: true,
    header: true,
    complete: function(results) {
        const data = results.data;
        const heatPoints = [];
        const overlapPoints = [];

        data.forEach(row => {
            // PRÜFUNG: Nur verarbeiten, wenn in der Spalte "Freigabe" TRUE oder WAHR steht
            const isApproved = row.Freigabe;
            if (isApproved === "TRUE" || isApproved === "WAHR" || isApproved === true) {

                const lat = parseFloat(row.Latitude); 
                const lon = parseFloat(row.Longitude); 
                const name = row.Name;
                const radiusKm = parseFloat(row.Radius) || 0;

                if (!isNaN(lat) && !isNaN(lon)) {
                    // 1. Marker (für Heimatort)
                    const marker = L.marker([lat, lon], { icon: carIcon });
                    marker.bindPopup(`<b>${name}</b><br>${radiusKm} km`);
                    markerLayer.addLayer(marker);
                    oms.addMarker(marker);

                    // 2. Umkreis-Layer
                    const circle = L.circle([lat, lon], {
                        radius: radiusKm * 1000, // Umrechnung in Meter
                        color: 'lightblue',
                        fillColor: 'blue',
                        fillOpacity: 0.01,
                        weight: 1
                    });
                    circle.bindPopup(`Radius von ${name}: ${radiusKm} km`);
                    circleLayer.addLayer(circle);

                    // 3. Daten für Heatmaps
                    heatPoints.push([lat, lon, 5]);
                    overlapPoints.push([lat, lon, radiusKm / 100]); 
                }
            } // Ende der Freigabe-Prüfung
        });

        // WICHTIG: Die Heatmap-Layer erst HIER (innerhalb von complete) befüllen
        heatLayerPoints.setLatLngs(heatPoints);
        heatLayerOverlap.setLatLngs(overlapPoints);
    }
});

// Menü zur Auswahl der Kartenansichten
const overlayMaps = {
    "Nutzer-Marker": markerLayer,
    "Umkreis-Radien": circleLayer,
    "Heatmap (Nutzerdichte)": heatLayerPoints,
    "Heatmap (akzeptable Strecke)": heatLayerOverlap
};

L.control.layers(null, overlayMaps, {collapsed: false}).addTo(map);

// Standardmäßig Marker anzeigen
markerLayer.addTo(map);

const infoBox = L.control({ position: 'bottomleft' }); // Position nach unten links verschoben

infoBox.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'map-info-box closed'); // Startet geschlossen oder offen
    div.id = 'infoBox';
    
    // HTML Inhalt mit einem Toggle-Button
    div.innerHTML = `
        <div id="info-toggle">✖</div>
        <div id="info-content">
            <h4>Foren-Karte zum Insterforum</h4>
            <p><a href="https://www.insterforum.de" target="_blank">www.insterforum.de</a></p>
            <p>Wenn Du Nutzer des Insterforums bist, trage dich ein, um deinen Standort mit der Community zu teilen!</p>
            <p><a href="https://www.insterforum.de/thread/1316-erstellung-einer-forumsuserkarte-diskussion-teilnahme-freiwillig/?postID=37921#post37921" target="_blank">Nutzungshinweise</a></p>
            <a href="https://the-minster.github.io/" class="btn-link" target="_blank" style="display:inline-block; margin-top:10px; padding:8px; background:#0056b3; color:white; text-decoration:none; border-radius:4px;"><s>Jetzt</s>Später eintragen</a>
        </div>
        <div id="info-minimized-title">ℹ Info & Anmeldung</div>
    `;
    
    // Klick-Event zum Minimieren/Maximieren
    L.DomEvent.on(div, 'click', function (e) {
        div.classList.toggle('closed');
    });

    L.DomEvent.disableClickPropagation(div);
    return div;
};

infoBox.addTo(map);
