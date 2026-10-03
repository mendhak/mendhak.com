// Fetch photos 

const FLICKR_USER_ID = '69135870@N00';  // From your API response
const FLICKR_API_KEY = 'a39dfdf51784c76fa3234f88bec38b0e';  // Replace with your actual key

let allPhotos = [];

function getPhotosPage(pageNumber) {
    return new Promise((resolve, reject) => {
        const url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${FLICKR_API_KEY}&user_id=${FLICKR_USER_ID}&has_geo=1&extras=geo&page=${pageNumber}&per_page=250&format=json&nojsoncallback=1`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const photos = data;
                resolve(photos);
            })
            .catch(error => {
                console.error('Error fetching photos page:', error);
                reject(error);
            });
    });
}



// Load all pages progressively
// Return array of photo data