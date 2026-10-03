// Create popup on marker
// Handle mouseover/mouseout
// Fade in/out animations

const markerPopups = {};

// function createPopup(marker, photo) {
//     const popupId = `popup-${photo.id}`;

//     const popup = document.createElement('div');
//     popup.id = popupId;
//     popup.className = 'photo-popup';

//     const imageUrl = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`;
//     popup.innerHTML = `
//            <div class="popup-content">
//                <img src="${imageUrl}" alt="${photo.title}" class="popup-image">
//                <h3 class="popup-title">${photo.title}</h3>
//                <p class="popup-location">Lat: ${photo.latitude}, Lng: ${photo.longitude}</p>
//            </div>
//        `;

//     markerPopups[photo.id] = {
//         popup: popup,
//         marker: marker,
//         photo: photo
//     };

//     return popup;
// }

function showPopup(popup, marker, map) {

    const containerPoint = map.latLngToContainerPoint(marker.getLatLng());
    popup.style.left = (containerPoint.x + 20) + 'px';
       popup.style.top = (containerPoint.y - 100) + 'px';

    popup.style.opacity = '0';
    popup.style.transition = 'opacity 0.3s ease-in';
    document.body.appendChild(popup);
    popup.offsetHeight;
    popup.style.opacity = '1';
}

function hidePopup(popup) {
    popup.style.opacity = '0';
    setTimeout(() => {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }, 300);
}

// Use the L leaflet markers
function createMarkerWithPopup(photo, lat, long) {
    const marker = L.marker([lat, long]);
    const imageUrl = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`;
       const popupContent = `
           <div class="popup-content">
               <img src="${imageUrl}" alt="${photo.title}" style="width:100%; border-radius:4px;">
               <h3 style="margin:4px 0 0 0; font-size:14px; font-weight:600;">${photo.title}</h3>
               <p style="margin:0; font-size:12px; color:#666;">Lat: ${photo.latitude}, Lng: ${photo.longitude}</p>
           </div>
       `;

    marker.bindPopup(popupContent);
    // const popup = createPopup(marker, photo);
    // marker.popup = popup;
    // marker.on('mouseover', function () { showPopup(popup, marker, map); });
    // marker.on('mouseout', function () { hidePopup(popup); });
    return marker;
}

function getRandomPhotoFromCluster(photoCluster) {
    if (photoCluster.length === 0) {
        return null;
    }
    const idx = Math.floor(Math.random() * photoCluster.length);
    return photoCluster[idx];
}

function clearPopups() {
    const popups = document.querySelectorAll('.photo-popup');
    popups.forEach(p => { hidePopup(p); });
    markerPopups = {};
}