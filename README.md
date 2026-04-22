# Insterforum-Nutzerkarte
Nutzerkarte für das Insterforum

# 🚗 Insterforum Community-Karte

Diese interaktive Karte visualisiert die Standorte und Aktionsradien der Mitglieder des **Insterforums**. Sie hilft dabei, Gleichgesinnte in der Nähe zu finden und potenzielle Treffen oder gegenseitige Hilfe zu koordinieren.

## 🌟 Funktionen

- **Automatisches Geocoding:** Standorte werden aus einem Google Formular (Google Sheets) via Apps Script automatisch in Koordinaten umgewandelt.
- **Interaktive Karte:** Basiert auf [Leaflet.js](https://leafletjs.com/) und nutzt OpenStreetMap-Daten.
- **Radien:** Visualisierung der möglichen Orte für Usertreffen durch einstellbare Radien um den Heimatort.
- **Heatmap-Ansichten:** - **Nutzerdichte:** Wo befinden sich die meisten Mitglieder?
  - **Überschneidungen:** Wo überschneiden sich die Radien am stärksten?
- **Mobile Optimierung:** Speziell angepasstes Design für Smartphones (minimierbare Infobox, Touch-optimierte Steuerung).
- **Freigabe-System:** Ein Admin-Haken im Hintergrund-System entscheidet, welche Daten auf der Karte erscheinen.

## 🛠 Installation & Technik

Das Projekt benötigt kein eigenes Backend und kann direkt über **GitHub Pages** gehostet werden.

1. **Datenquelle:** Ein Google Sheet, das als CSV im Web veröffentlicht wird.
2. **Frontend:** HTML5, CSS3 (mit Media Queries für Mobile) und Vanilla JavaScript.
3. **Bibliotheken:** - Leaflet.js (Karte)
   - PapaParse (CSV-Verarbeitung)
   - Leaflet.heat (Heatmap)
   - OverlappingMarkerSpiderfier (für Marker am gleichen Ort)

## 📄 Lizenz

Dieses Projekt ist unter der **MIT-Lizenz** veröffentlicht. Das bedeutet:

- Du darfst den Code kopieren, verändern und für eigene (auch kommerzielle) Projekte nutzen.
- Der ursprüngliche Urhebervermerk und der Lizenztext müssen enthalten bleiben.
- Es wird keine Haftung übernommen.

Weitere Details findest du in der Datei [LICENSE](LICENSE).

---
*Erstellt für die Community von [insterforum.de](https://www.insterforum.de)*
