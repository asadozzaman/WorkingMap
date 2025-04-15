// Initialize the map
// const map = L.map('map').setView([23.685, 90.356], 7); // You can change this to your country/region
const map = L.map('map').setView([-37.7870, 175.2793], 13); // Hamilton, NZ

// Load tile layer
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; OpenStreetMap contributors'
// }).addTo(map);


// L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=YOUR_MAPBOX_TOKEN', {
//   attribution: '© Mapbox © OpenStreetMap',
//   tileSize: 512,
//   zoomOffset: -1
// }).addTo(map);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri',
  maxZoom: 22 // Increase zoom level (try up to 22)

}).addTo(map);



// Feature group for drawn layers
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Enable drawing
const drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems
  },
  draw: {
    polygon: true,
    polyline: false,
    circle: false,
    rectangle: true,
    marker: false,
    circlemarker: false
  }
});
map.addControl(drawControl);

// Handle shape creation
map.on(L.Draw.Event.CREATED, function (e) {
  const layer = e.layer;
  drawnItems.addLayer(layer);

  const geojson = layer.toGeoJSON();
  const area = turf.area(geojson);
  const roundedArea = Math.round(area);

  layer.bindPopup(`Area: ${roundedArea} m²`).openPopup();

  document.getElementById("areaOutput").innerText = `Last marked area: ${roundedArea} m²`;
});



function searchLocation() {
    const location = document.getElementById('locationSearch').value;
    if (!location) return;
  
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
  
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          alert("Location not found!");
          return;
        }
  
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        map.setView([lat, lon], 15); // Zoom to location
      })
      .catch(err => {
        console.error(err);
        alert("Error searching location");
      });
  }
  


  //////////////////////


// Load previously saved shapes

fetch('/get-shapes/')
  .then(res => res.json())
  .then(data => {
    data.forEach(geojson => {
      const layer = L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
          const name = feature.properties?.name || "Unnamed";
          const area = feature.properties?.area || "N/A";
          layer.bindPopup(`${name} - ${area} m²`);
        }
      }).addTo(drawnItems);
    });
  });



map.on(L.Draw.Event.CREATED, function (e) {
  const layer = e.layer;
  drawnItems.addLayer(layer);

  const geojson = layer.toGeoJSON();
  const area = Math.round(turf.area(geojson));
  const name = prompt("Enter name for this parcel:", "New Area") || "Unnamed Parcel";

  geojson.properties = { name: name, area: area };
  layer.bindPopup(`${name} - ${area} m²`).openPopup();

  // Save to server
  fetch('/save-shape/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken
    },
    body: JSON.stringify({ geojson, name, area })
  });

  document.getElementById("areaOutput").innerText = `Last marked area: ${area} m²`;
});

