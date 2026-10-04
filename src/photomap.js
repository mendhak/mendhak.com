// Initialize map
// Add tile layer
// Create marker cluster group
// Add cluster group to map

const map = L.map('map').setView([55, 0], 4);
map.attributionControl.setPrefix(false);



// OSM tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);


const markers = L.markerClusterGroup({ showCoverageOnHover: false });

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


        for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
            const nextPage = await getPhotosPage(pageNumber);
            addMarkersToMap(nextPage.photos.photo);

        }

        setTimeout(() => {
            zoomToRandomMarker();
        }, 800);


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

        const marker = createMarkerWithPopup(photo, lat, lng);
        markers.addLayer(marker);

    });
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

    const latlng = randomMarker.getLatLng();


    // https://github.com/Leaflet/Leaflet.markercluster/issues/954
    // Needed because there isn't a way to directly get to the cluster for a marker, the method only gives us visible cluster, not nested one. 
    const clusterBounds = randomMarker.__parent.getBounds();
    const zoomLevel = map.getBoundsZoom(clusterBounds);

    map.flyTo(latlng, zoomLevel);

    map.once('zoomend', () => {
        //zoom to show layer also takes care of expanding clusters. It doesn't do flyto, hence this weird combo...
        markers.zoomToShowLayer(randomMarker, function () { randomMarker.openPopup(); });
    });


    // Also works, but no flyTo. Keeping this just in case .__parent stops working in future. 
    // markers.zoomToShowLayer(randomMarker, function() { randomMarker.openPopup(); });

}


// Use the L leaflet markers
function createMarkerWithPopup(photo, lat, long) {
    const marker = L.marker([lat, long]);
    const imageUrl = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_w.jpg`;
    const popupContent = `
       <div class="popup-image-wrapper">
           <div class="image-container">
               <a href="https://flickr.com/photos/${photo.owner}/${photo.id}">
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
        marker.openPopup();
    });

    return marker;
}



if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPhotosAndMarkers);
} else {
    loadPhotosAndMarkers();
}
