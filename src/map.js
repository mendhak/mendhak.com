// Initialize map

// Initialize map - centered on world view, zoom level 2
const map = L.map('map').setView([20, 0], 2);
map.attributionControl.setPrefix(false);


// OSM tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

// Create marker cluster group
const markers = L.markerClusterGroup();

// Add cluster group to map
map.addLayer(markers);

async function loadPhotosAndMarkers() {
    try {
        await getAllPhotos(function (loaded, total) {
            console.log(`${loaded} of ${total} photos`);
        });

        const photos = await getPhotos();
        console.log(`Adding ${photos.length} photos to map`);

        const locationmap = new Map();
        photos.forEach(photo => {
            if (!photo.latitude || !photo.longitude) {
                return;
            }

            const lat = parseFloat(photo.latitude);
            const lng = parseFloat(photo.longitude);


            if (isNaN(lat) || isNaN(lng)) {
                return;
            }

            const key = `${photo.latitude},${photo.longitude}`;
            if (!locationmap.has(key)) {
                locationmap.set(key, []);
            }
            locationmap.get(key).push(photo);
        });

        locationmap.forEach((photoCluster, key) => {
            const randomPhoto = getRandomPhotoFromCluster(photoCluster);
            const [lat, lng] = key.split(',').map(Number);

            const marker = createMarkerWithPopup(randomPhoto, lat, lng);
            markers.addLayer(marker);
        });

        console.log(`Added ${locationmap.size} markers to map.`);

        setTimeout(() => {
            zoomToRandomCluster();
        }, 1000);

    }
    catch (error) {
        console.error('Error loading photos:', error);
    }
}

function zoomToRandomCluster() {
    const allLayers = markers.getLayers();
    if (allLayers.length === 0) {
        console.log('No markers to zoom to.');
        return;
    }

    // Pick random marker
    const randomIndex = Math.floor(Math.random() * allLayers.length);
    const randomMarker = allLayers[randomIndex];

    // Get marker's lat/lng
    const latlng = randomMarker.getLatLng();

    // Zoom to that location (zoom 9 for good detail)
    map.flyTo(latlng, 9, {
        duration: 2, // 2 second animation
        easeLinearity: 0.25
    });

    console.log(`Zoomed to random cluster at [${latlng.lat}, ${latlng.lng}]`);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPhotosAndMarkers);
} else {
    loadPhotosAndMarkers();
}

// Add tile layer
// Create marker cluster group
// Add cluster group to map