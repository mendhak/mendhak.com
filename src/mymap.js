// Initialize map

const map = L.map('map').setView([55, 0], 4);
map.attributionControl.setPrefix(false);



// OSM tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);


const markers = L.markerClusterGroup({ showCoverageOnHover: false });

const locationMap = new Map();  // Track markers by location
map.addLayer(markers);


async function loadPhotosAndMarkers() {
    try {

        const firstPage = await getPhotosPage(1);
        const totalPhotos = firstPage.photos.total;
        const totalPages = firstPage.photos.pages;
        const firstPagePhotos = firstPage.photos.photo;

        console.log(`Total photos: ${totalPhotos}, Total pages: ${totalPages}`);

        addMarkersToMap(firstPagePhotos);
        console.log(`Added ${firstPagePhotos.length} initial markers.`);

        // setTimeout(() => {
        //     showAutoPopups(map);
        // });


        for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
            const nextPage = await getPhotosPage(pageNumber);
            addMarkersToMap(nextPage.photos.photo);

        }

        setTimeout(() => {
            zoomToRandomCluster();
        }, 800);


        console.log(`Added all markers. Total markers: ${markers.getLayers().length}`);

    } catch (error) {
        console.error('Error loading photos:', error);
    }
}

// function showAutoPopups(map) {
//        const allLayers = markers.getLayers();
//        console.log(`Showing popups for ${allLayers.length} markers...`);

//        let count = 0;
//        allLayers.forEach(marker => {
//            if (count >= 5) return;  

//            if (marker.popup) {
//                showPopup(marker.popup, marker, map);
//                count++;
//            }
//        });
//    }

function addMarkersToMap(photos) {
    photos.forEach(photo => {
        // Skip invalid coordinates
        if (!photo.latitude || !photo.longitude) return;

        const lat = parseFloat(photo.latitude);
        const lng = parseFloat(photo.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const key = `${photo.id}`;

        if (!locationMap.has(key)) {
            locationMap.set(key, []);
        }
        locationMap.get(key).push(photo);

        const marker = createMarkerWithPopup(photo, lat, lng);
        markers.addLayer(marker);
        // Map marker with random photo from cluster
        // const randomPhoto = getRandomPhotoFromCluster(locationMap.get(key));
        // const marker = createMarkerWithPopup(randomPhoto, lat, lng);
        // markers.addLayer(marker);
    });
}

function zoomToRandomCluster() {
    const allLayers = markers.getLayers();
    if (allLayers.length === 0) {
        console.log('No markers to zoom to.');
        return;
    }

    // Pick a random marker and fly to it
    const randomIndex = Math.floor(Math.random() * allLayers.length);
    const randomMarker = allLayers[randomIndex];

    const latlng = randomMarker.getLatLng();


    // https://github.com/Leaflet/Leaflet.markercluster/issues/954
    const clusterBounds = randomMarker.__parent.getBounds();
    const zoomLevel = map.getBoundsZoom(clusterBounds);

    map.flyTo(latlng, zoomLevel);

    map.once('zoomend', () => {
        //zoom to show layer also takes care of expanding clusters. It doesn't do flyto, hence this combo...
        markers.zoomToShowLayer(randomMarker, function () { randomMarker.openPopup(); });
    });


    // Also works, but no flyTo. 
    // markers.zoomToShowLayer(randomMarker, function() { randomMarker.openPopup(); });

}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPhotosAndMarkers);
} else {
    loadPhotosAndMarkers();
}

// Add tile layer
// Create marker cluster group
// Add cluster group to map