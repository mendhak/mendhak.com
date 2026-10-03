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

const locationmap = new Map();  // Track markers by location
map.addLayer(markers);


async function loadPhotosAndMarkers() {
    try {
        // 1. Get first page immediately for initial zoom
        const firstPage = await getFirstPage();
        const totalPhotos = firstPage.photos.total;
        const totalPages = firstPage.photos.pages;
        const firstPagePhotos = firstPage.photos.photo;

        console.log(`Total photos: ${totalPhotos}, Total pages: ${totalPages}`);

        // 2. Add first page markers
        addMarkersToMap(firstPagePhotos);
        console.log(`Added ${firstPagePhotos.length} initial markers.`);

        // 3. Zoom to random cluster from first page (quick feedback)
        setTimeout(() => {
            zoomToRandomCluster();
        }, 500);

        // 4. Continue loading remaining pages in background
        for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
            const nextPage = await getPhotosPage(pageNumber);
            addMarkersToMap(nextPage.photos.photo);

        }

        console.log(`Added all markers. Total markers: ${markers.getLayers().length}`);

    } catch (error) {
        console.error('Error loading photos:', error);
    }
}

function addMarkersToMap(photos) {
    photos.forEach(photo => {
        // Skip invalid coordinates
        if (!photo.latitude || !photo.longitude) return;

        const lat = parseFloat(photo.latitude);
        const lng = parseFloat(photo.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const key = `${lat},${lng}`;

        // Add to location map
        if (!locationmap.has(key)) {
            locationmap.set(key, []);
        }
        locationmap.get(key).push(photo);

        // Create marker with random photo from cluster
        const randomPhoto = getRandomPhotoFromCluster(locationmap.get(key));
        const marker = createMarkerWithPopup(randomPhoto, lat, lng);
        markers.addLayer(marker);
    });
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