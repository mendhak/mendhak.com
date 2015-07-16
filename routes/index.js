var apiKey = "a39dfdf51784c76fa3234f88bec38b0e";
var express = require('express');
var request = require("request");

var Memcached = require('memcached');
Memcached.config.timeout = 2000;
Memcached.config.retry = 2000;
Memcached.config.retries = 2;
var memcached = new Memcached("127.0.0.1:11211");

var router = express.Router();

var flickr;
var Flickr = require("flickrapi"),
    flickrOptions = {
        api_key: apiKey //,
    };
Flickr.tokenOnly(flickrOptions, function (error, flickrapi) {
    flickr = flickrapi;
});

// Signature generator page
router.get('/', function (req, res) {
    res.render('index', { title: 'Express', domain: req.headers.host });
});

router.get('/full/?*?', function(req, res){

    var imageId = req.params[0];

    if(!imageId){
        res.send("",400);
        return;
    }

    if(imageId.indexOf('http://')> -1 || imageId.indexOf('https://')> -1){
        var regexHttp = /photos\/([^/]+)\/([^/]+)\/?/;
        var match = regexHttp.exec(imageId);
        imageId = match[2];
    }

    if(imageId.indexOf('/') > -1){
        imageId = imageId.replace('/','');
    }

    flickr.photos.getSizes({
        photo_id: imageId
    }, function(err, results){
        if(!err){
            var photoUrl;
            results.sizes.size.forEach(function(element, index, array){
                if(element.label != 'Original'){
                    photoUrl = element.source;
                }
            });

            res.render('fullscreen',
                {
                    'photoUrl': photoUrl,
                    'returnUrl': "http://www.flickr.com/photo.gne?id=" + imageId
                }
            );
        } else
        {
            res.send("",400);
        }

    });



});

// /signatures page now moved to front page
router.get('/signatures', function (req, res) {
    res.redirect('/');
});

//GET /img/mendhak/1/s/
router.get('/img/:nsid/:num?/:size?/:popular?', function (req, res) {


    var sendResponse = function (err, flickrSearchResults) {

        if (!err && flickrSearchResults.photos && flickrSearchResults.photos.photo.length > 0) {

            memcached.set(cacheKey, flickrSearchResults, 600, function (err)
            {
                if(err){
                    console.log(err);
                }

            });

            //Image found, get URL
            var imgUrl = getImageUrl(flickrSearchResults.photos.photo[0], size);
            res.setHeader("Title", flickrSearchResults.photos.photo[0].title);
            //Send redirect
            res.redirect(imgUrl);
        } else {
            //Image not found or error.  Bad request
            res.setHeader("X-Error", err);
            res.send("", 400);
        }
    };

    var performSearch = function (nsid, err) {
        if (nsid) {
            //Set cookie for next time
            res.cookie("nsid_" + username, nsid, { maxAge: 3600000, path: '/' });

            //Search for photo
            flickr.photos.search({
                user_id: nsid,
                per_page: 1,
                page: num,
                sort: popular,
                extras: "url_sq,url_s,url_q,url_t,url_m,url_n,url_z,url_l,url_c,url_b,url_h,url_k,url_o"
            }, sendResponse);
        }
        else {
            res.setHeader("X-Error", err);
            res.send("", 400);
        }
    };

    //Set defaults
    var num = 1;
    var size = 'm';
    var popular = 'date-posted-desc';
    var username = req.params.nsid;



    if (req.params.num && !isNaN(req.params.num)) {
        num = req.params.num;
    }

    if (req.params.size) {
        size = req.params.size;
    }

    if (req.params.popular && req.params.popular == 'p') {
        popular = 'interestingness-desc';
    }

    var cacheKey = "img" + req.params.nsid + req.params.num + req.params.size + req.params.popular;
    memcached.get(cacheKey, function (err, data){
        if(!data || err){
            //Get NSID
            getUserNsid(username, req.cookies, performSearch);
        } else {
            sendResponse(null, data);
        }
    });

});

router.get('/url/:nsid/:num?/:popular?', function (req, res) {
    //Set defaults
    var userNsid;
    var num = 1;
    var size = 'm';
    var popular = 'date-posted-desc';
    var username = req.params.nsid;

    if (req.params.num && !isNaN(req.params.num)) {
        num = req.params.num;
    }

    if (req.params.popular && req.params.popular == 'p') {
        popular = 'interestingness-desc';
    }

    var sendResponse = function (err, flickrSearchResults) {

        if (!err && flickrSearchResults.photos && flickrSearchResults.photos.photo.length > 0) {
            //Image found, get URL
            var imgUrl = "http://www.flickr.com/photos/" + userNsid + "/" + flickrSearchResults.photos.photo[0].id;
            res.setHeader("Title", flickrSearchResults.photos.photo[0].title);
            //Send redirect
            res.redirect(imgUrl);
        } else {
            //Image not found or error.  Bad request
            res.setHeader("X-Error", err);
            res.send("", 400);
        }
    };

    var performSearch = function (nsid, err) {
        if (nsid) {
            userNsid = nsid;
            //Set cookie for next time
            res.cookie("nsid_" + username, userNsid, { maxAge: 3600000, path: '/' });

            //Search for photo
            flickr.photos.search({
                user_id: userNsid,
                per_page: 1,
                page: num,
                sort: popular
            }, sendResponse);
        }
        else {
            res.setHeader("X-Error", err);
            res.send("", 400);
        }
    };

    //Get NSID
    getUserNsid(username, req.cookies, performSearch);

});

//GET /nsid/username
router.get('/nsid/*', function (req, res) {

    var username = req.params[0];

    //Extract from URL
    if (username.indexOf('http://') > -1) {
        var regexHttp = /photos\/([^/]+)\/?/;
        var match = regexHttp.exec(username);
        username = match[1];
    }

    var sendResponse = function (nsid, err) {
        if (nsid) {
            res.cookie("nsid_" + username, nsid, { maxAge: 3600000, path: '/' });
            res.send(nsid);
        }
        else {
            res.setHeader("X-Error", err);
            res.send("", 400);
        }
    };

    getUserNsid(username, req.cookies, sendResponse);
});

router.get('/gettitlefromurl/*', function (req, res) {
    var url = req.params[0];

    var sendResponse = function (error, response, body) {
        if (!error) {
            res.send(response.headers.title);
        } else {
            res.send("", 400);
        }
    };

    request({ url: url, method: "HEAD", followRedirect: false }, sendResponse);
});



function getImageUrl(photo, size) {

    if (photo["url_"+size] == null) {
        size = 'l';
    }

    //return "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + size + ".jpg";
    return photo["url_"+size];

//    if size == 'small' or size == '240':
//    size = 'm'
//    if size == 'small320' or size == '320':
//    size = 'n'
//    elif size == 'square' or size == '75':
//    size = 's'
//    elif size == 'largesquare' or size == '150':
//    size = 'q'
//    elif size == 'thumb' or size == 'thumbnail' or size == 'tiny' or size == '100':
//    size = 't'
//    elif size == 'medium640' or size == '640':
//    size = 'z'
//    elif size == 'medium800' or size == '800':
//    size = 'c'
//    elif size == 'large' or size == 'big' or size == '1024':
//    size = 'b'
//    elif size == '' or size == 'medium' or size == 'med' or size == 'x' or size == '500':
//    sizePrefix =  ''
//    size = ''
//
//    size = sizePrefix + size
//
//    return "http://farm{0}.static.flickr.com/{1}/{2}_{3}{4}.jpg".format(selectedPhoto.farm, selectedPhoto.server, selectedPhoto.id, selectedPhoto.secret, size)

}

function getUserNsid(username, cookies, callback) {

    //If it contains @, it's already an NSID
    if (username.indexOf('@') > -1) {
        callback(username, null);
        return;
    }

    //Check if a cookie already contains this value
    if (cookies["nsid_" + username] && cookies["nsid_" + username].length > 0) {
        callback(cookies["nsid_" + username], null);
        return;
    }

    //Check memcached
    var cacheKey = "nsid_" + username;
    memcached.get(cacheKey, function (err, data){
        if(!data || err){
            //Call the Flickr API
            flickr.urls.lookupUser({url: "http://www.flickr.com/photos/" + username }, function (err, result) {
                if (!err && result.user) {
                    memcached.set(cacheKey,result.user.id, 600, function(err){
                        if(err){
                            console.log(err);
                        }
                    });
                    callback(result.user.id, null);
                } else {
                    console.log(err);
                    callback(null, err);
                }
            });
        } else {
            callback(data,null);
        }
    });


}


module.exports = router;
