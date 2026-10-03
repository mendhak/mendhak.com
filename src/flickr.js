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

async function getAllPhotos(callback) {
       try {
           const firstPage = await getPhotosPage(1);
           const totalPhotos = firstPage.photos.total;
           const totalPages = firstPage.photos.pages;

           console.log(`Total photos: ${totalPhotos}, Total pages: ${totalPages}`);

           allPhotos = allPhotos.concat(firstPage.photos.photo);

           if(callback) {
               callback(allPhotos.length, totalPhotos);
           }

           for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
               const nextPage = await getPhotosPage(pageNumber);
               allPhotos = allPhotos.concat(nextPage.photos.photo);

               if (callback) {
                   callback(allPhotos.length, totalPhotos);
               }
           }

           return allPhotos;  // Return the photos array

       } catch (error) {
           console.error('Error fetching all photos:', error);
           throw error;
       }
   }

function getPhotos(){
    return allPhotos;
}

// Load all pages progressively
// Return array of photo data