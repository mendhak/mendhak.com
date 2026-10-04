
const fs = require('fs');
const path = require('path');

const FLICKR_USER_ID = process.env.FLICKR_USER_ID || '69135870@N00';
const FLICKR_API_KEY = process.env.FLICKR_API_KEY;

if (!FLICKR_API_KEY) {
    console.error('Error: FLICKR_API_KEY environment variable is required');
    process.exit(1);
}

const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'photos.json');

function getPhotosPage(pageNumber) {
    const url =
        `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${FLICKR_API_KEY}&user_id=${FLICKR_USER_ID}&has_geo=1&extras=geo&page=${pageNumber}&per_page=250&format=json&nojsoncallback=1`;

    return fetch(url)
        .then(res => res.json())
        .then(data => data);
}

async function getAllPhotos() {
    const firstPage = await getPhotosPage(1);
    const totalPages = firstPage.photos.pages;

    console.log(`Total images to fetch: ${firstPage.photos.total}`);
    console.log(`Total pages to fetch: ${totalPages}`);

    const allPhotos = [...firstPage.photos.photo];

    for (let page = 2; page <= totalPages; page++) {
        const nextPage = await getPhotosPage(page);
        allPhotos.push(...nextPage.photos.photo);
    }

    return allPhotos;
}

async function generateJSON() {
    const allPhotos = await getAllPhotos();

    const compactedPhotos = allPhotos.map(photo => ({
        id: photo.id,
        title: photo.title,
        lat: photo.latitude,
        lon: photo.longitude,
        farm: photo.farm,
        server: photo.server,
        secret: photo.secret,
    }));

    const output = {
        generatedAt: new Date().toISOString(),
        totalPhotos: compactedPhotos.length,
        owner: FLICKR_USER_ID,
        photos: compactedPhotos
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`✓ Generated ${OUTPUT_FILE}`);
}

generateJSON();