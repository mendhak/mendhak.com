// Create popup on marker
// Handle mouseover/mouseout

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
