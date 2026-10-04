import photos from "./data/photos.json" with { type: "json" };
const owner = photos.owner;
// Initialize map
// Add tile layer
// Create marker cluster group
// Add cluster group to map

const map = L.map('map').setView([55, 0], 4);
map.attributionControl.setPrefix(false);
map.removeControl(map.zoomControl);



// OSM tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);


const markers = L.markerClusterGroup({ showCoverageOnHover: false });

map.addLayer(markers);


async function loadPhotosAndMarkers() {
    try {

        const photosArray = photos.photos;
        console.log(`Total photos in JSON: ${photos.totalPhotos}`);

        addMarkersToMap(photosArray);

        const photoId = window.location.hash.substring(1);

        setTimeout(() => {
            if (photoId) {
                zoomToPhotoById(photoId);
            } else {
                zoomToRandomMarker();
                startAutoZoomTour();
            }
        }, 800);

        console.log(`Added all markers. Total markers: ${markers.getLayers().length}`);

    } catch (error) {
        console.error('Error loading photos:', error);
    }
}



function addMarkersToMap(photos) {
    photos.forEach(photo => {
        // Skip invalid coordinates
        if (!photo.lat || !photo.lon) return;

        const lat = parseFloat(photo.lat);
        const long = parseFloat(photo.lon);
        if (isNaN(lat) || isNaN(long)) return;

        const marker = createMarkerWithPopup(photo, lat, long);
        markers.addLayer(marker);

    });
}

function zoomToPhotoById(photoId) {
    const allLayers = markers.getLayers();
    const targetMarker = allLayers.find(m => m.options.photoId === photoId);
    if (targetMarker) {

        // https://github.com/Leaflet/Leaflet.markercluster/issues/954
        // Needed because there isn't a way to directly get to the cluster for a marker, the method only gives us visible cluster, not nested one. 
        const clusterBounds = targetMarker.__parent.getBounds();
        const zoomLevel = map.getBoundsZoom(clusterBounds);
        const latLong = targetMarker.getLatLng();
        map.flyTo(latLong, zoomLevel);
        map.once('zoomend', () => {
            markers.zoomToShowLayer(targetMarker, function () { targetMarker.openPopup(); });
        });

        // This also works, but no flyTo. Keeping this just in case .__parent stops working in future. 
        // markers.zoomToShowLayer(randomMarker, function() { randomMarker.openPopup(); });
    }
}

function zoomToRandomMarker() {
    const allLayers = markers.getLayers();
    if (allLayers.length === 0) {
        console.log('No markers to zoom to.');
        return;
    }

    // Pick a random marker and fly to it
    const randomIndex = Math.floor(Math.random() * allLayers.length);
    const randomMarker = allLayers[randomIndex];

    zoomToPhotoById(randomMarker.options.photoId);

}

// Use the L leaflet markers
function createMarkerWithPopup(photo, lat, long) {
    const marker = L.marker([lat, long], { photoId: photo.id });
    const imageUrl = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_w.jpg`;
    const popupContent = `
       <div class="popup-image-wrapper">
           <div class="image-container">
               <a href="https://flickr.com/photos/${owner}/${photo.id}">
                   <img src="${imageUrl}" alt="${photo.title}">
               </a>
           </div>
           <div class="popup-title-overlay">${photo.title}</div>
       </div>
   `;

    marker.bindPopup(popupContent, {
        className: 'flickr-popup'
    });

    marker.on('mouseover', function () {
        history.replaceState(null, null, `#${photo.id}`);
        this.openPopup();
    });

    marker.on('click', function () {
        history.replaceState(null, null, `#${photo.id}`);
        this.openPopup();
        onUserInteraction();
    });

    return marker;
}

let autoZoomInterval;

function onUserInteraction() {
    clearInterval(autoZoomInterval);
    autoZoomInterval = null;
    console.log("User interaction detected, stopping auto zoom tour.");
}

function startAutoZoomTour() {
    if (autoZoomInterval) {
        clearInterval(autoZoomInterval);
        autoZoomInterval = null;
    }

    if (window.location.hash.length > 0) {
        console.log("Auto zoom tour paused due to URL hash.");
    }

    autoZoomInterval = setInterval(function () {
        zoomToRandomMarker();
    }, 30000);

}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPhotosAndMarkers);
} else {
    loadPhotosAndMarkers();
}

// If there's user interaction, stop the tour.
map.on('click dragend', onUserInteraction);

// If a #9999999 photo ID is in the URL hash, triggers zoom to that photo. 
// Doesn't trigger if URL is changed via pushState/replaceState, phew. 
window.addEventListener('hashchange', function () {
    onUserInteraction();
    const photoId = window.location.hash.substring(1);
    if (photoId) {
        zoomToPhotoById(photoId);
    }
});

// Cleanup
window.addEventListener('beforeunload', () => {
    clearInterval(autoZoomInterval);
    autoZoomInterval = null;
});