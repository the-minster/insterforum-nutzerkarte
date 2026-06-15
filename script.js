const map = L.map('map').setView([51.1657, 10.4515], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Marker-Icon
const carIcon = L.icon({
    iconUrl: 'instericon.png',
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

// Eigenes Icon für Treffen definieren
const meetingIcon = L.icon({
    iconUrl: 'instertreffen.png', // Pfad zu deinem Icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Neue Layer-Gruppe erstellen
const meetingLayer = L.layerGroup();
meetingLayer.addTo(map);

// Globale Variable für die Layer-Steuerung, um sie dynamisch upzudaten
let layerControl = null;

// Zentrale Funktion zur Steuerung und Aktualisierung des Menüs mit Live-Zahlen
function updateLayerMenu() {
    if (layerControl) {
        map.removeControl(layerControl);
    }

    // Aktuelle Anzahl gültiger Marker im Speicher zählen
    const memberCount = markerLayer.getLayers().length;
    const meetingCount = meetingLayer.getLayers().length;

    const overlayMaps = {
        `Nutzer-Marker (${memberCount})`: markerLayer,
        "Umkreis-Radien": circleLayer,
        "Heatmap (Nutzerdichte)": heatLayerPoints,
        "Heatmap (akzeptable Strecke)": heatLayerOverlap,
        `Inster-Treffen (${meetingCount})`: meetingLayer
    };

    layerControl = L.control.layers(null, overlayMaps, {collapsed: false});
    layerControl.addTo(map);
}

function loadMeetings() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    Papa.parse('treffen.csv', {
        download: true,
        header: false,
        complete: function(results) {
            results.data.forEach(row => {
                const [name, forumUrl, lat, lon, dateStr] = row;

                if (lat && lon && name) {
                    let expiryDate = null;
                    let isExpired = false;

                    if (dateStr) {
                        const [year, month, day] = dateStr.split('-');
                        expiryDate = new Date(year, month - 1, day);
                        if (expiryDate < today) {
                            isExpired = true;
                        }
                    }

                    // Nur anzeigen, wenn Datum heute/Zukunft oder gar kein Datum gesetzt
                    if (!isExpired) {
                        const marker = L.marker([parseFloat(lat), parseFloat(lon)], {
                            icon: meetingIcon
                        });

                        // Datum formatieren
                        let formattedDate = "";
                        if (dateStr && expiryDate) {
                            formattedDate = expiryDate.toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });
                        }
                        
                        // Popup-Inhalt zentriert formatiert
                        let popupContent = `<div style="text-align: center;">`;
                        popupContent += `<strong>${name}</strong><br>`;
                        
                        if (forumUrl && forumUrl.startsWith('http')) {
                            popupContent += `<a href="${forumUrl}" target="_blank" rel="noopener" style="display:inline-block; margin: 5px 0; padding: 3px 8px; background:#007bff; color:white; text-decoration:none; border-radius:4px;">Quelle im Forum</a><br>`;
                        }
                        
                        if (formattedDate) {
                            popupContent += `<small style="color: #666;">Termin: ${formattedDate}</small>`;
                        }
                        popupContent += `</div>`;

                        marker.bindPopup(popupContent);
                        marker.addTo(meetingLayer);
                    }
                }
            });
            // Zähler aktualisieren nach dem Laden der Treffen
            updateLayerMenu();
        }
    });
}

loadMeetings();

const oms = new OverlappingMarkerSpiderfier(map);

Papa.parse(csvUrl, {
    download: true,
    header: true,
    complete: function(results) {
        const data = results.data;
        const heatPoints = [];
        const overlapPoints = [];

        data.forEach(row => {
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

                    const circle = L.circle([lat, lon], {
                        radius: radiusKm * 1000, // Umrechnung in Meter
                        stroke: false,        // <- Rand komplett ausschalten                        
                        color: 'lightblue',
                        fillColor: 'blue',
                        fillOpacity: 0.05,
                        weight: 1
                    });
                    circle.bindPopup(`Radius von ${name}: ${radiusKm} km`);
                    circleLayer.addLayer(circle);

                    heatPoints.push([lat, lon, 5]);
                    overlapPoints.push([lat, lon, radiusKm / 100]); 
                }
            }
        });

        heatLayerPoints.setLatLngs(heatPoints);
        heatLayerOverlap.setLatLngs(overlapPoints);
        
        // Zähler aktualisieren nach dem Laden der Mitglieder
        updateLayerMenu();
    }
});

// Standardmäßig Marker anzeigen
markerLayer.addTo(map);

const infoBox = L.control({ position: 'bottomleft' });

infoBox.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'map-info-box closed'); 
    div.id = 'infoBox';
    
    div.innerHTML = `
        <div id="info-toggle">✖</div>
        <div id="info-content">
            <h4>Foren-Karte zum Insterforum</h4>
            <p><a href="https://www.insterforum.de" target="_blank">www.insterforum.de</a></p>
            <p>Wenn Du Nutzer des Insterforums bist, trage dich ein, um deinen Standort mit der Community to teilen!</p>
            <p><b>Vergiß nicht, mir (@minster) eine PN (Nachricht) im Insterforum zu senden.</b></p>
            <p><a href="https://www.insterforum.de/thread/1316-erstellung-einer-forumsuserkarte-diskussion-teilnahme-freiwillig/?postID=40040#post40040" target="_blank">Nutzungshinweise</a></p>
            <p><a href="https://the-minster.github.io/insterforum-nutzerkarte/datenschutzerklaerung.html" target="_blank">Datenschutzerklärung</a></p>
            <a href="https://forms.gle/vucJNFTZ7fBqtBTB9" class="btn-link" target="_blank" style="display:inline-block; margin-top:10px; padding:8px; background:#0056b3; color:white; text-decoration:none; border-radius:4px;">Jetzt eintragen</a>

            <hr style="margin: 15px 0 10px 0; border: 0; border-top: 1px solid #eee;">
            <div class="info-footer" style="font-size: 11px; color: #666; line-height: 1.4;">
                <p>Lizenz: <a href="https://the-minster.github.io/insterforum-nutzerkarte/LICENSE.txt" target="_blank">MIT Open Source</a><br>
                Details: <a href="https://the-minster.github.io/insterforum-nutzerkarte/README.md" target="_blank">README.md</a></p>
            </div>
        </div>
        <div id="info-minimized-title">ℹ Info & Anmeldung</div>
    `;
    
    L.DomEvent.on(div, 'click', function (e) {
        div.classList.toggle('closed');
    });

    L.DomEvent.disableClickPropagation(div);
    return div;
};

infoBox.addTo(map);
