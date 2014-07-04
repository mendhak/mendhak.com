var apiKey = "a39dfdf51784c76fa3234f88bec38b0e";
var express = require('express');
var router = express.Router();
var flickr;
var Flickr = require("flickrapi"),
    flickrOptions = {
        api_key: apiKey //,
    };
Flickr.tokenOnly(flickrOptions, function(error, flickrapi) {
    flickr = flickrapi;
});



router.get('/', function(req, res) {
  res.render('index', { title: 'Express', domain: req.headers.host });
});


function getImageUrl(photo, size) {

    var sizePrefix = "_";

    if(size == 'x'){
        sizePrefix = '';
        size = '';
    }

    size = sizePrefix + size;

    return "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + size + ".jpg";

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
router.get('/img/:nsid/:num?/:size?/:popular?', function(req, res){

    var num = 1;

    var size = 'm';
    var popular = 'date-posted-desc';
    var username = req.params.nsid;

    if(req.params.num && !isNaN(req.params.num)){
        num = req.params.num;
    }

    if(req.params.size){
        size = req.params.size;
    }

    if(req.params.popular && req.params.popular=='p'){
        popular = 'interestingness-desc';
    }

    getUserNsid(username, req.cookies, function(nsid, err){
        if(nsid){
            res.cookie("nsid_"+username, nsid, { maxAge: 3600000, path: '/' });

            flickr.photos.search({
                user_id: nsid,
                per_page: 1,
                page: num,
                sort: popular
            }, function(err, result){
                if(!err && result.photos && result.photos.photo.length > 0){
                    var imgUrl = getImageUrl(result.photos.photo[0], size);
                    res.redirect(imgUrl);
                } else {
                    res.send("", 400);
                }
            });
        }
        else{
            res.setHeader("X-Error", err);
            res.send("", 400);
        }
    });
});

function getUserNsid(username, cookies, callback) {

    //If it contains @, it's already an NSID
    if(username.indexOf('@') > -1){
        callback(username, null);
        return;
    }

    //Check if a cookie already contains this value
    if(cookies["nsid_" + username] && cookies["nsid_" + username].length > 0){
        callback(cookies["nsid_" + username], null);
        return;
    }

    //Call the Flickr API
    flickr.urls.lookupUser( {url :"http://www.flickr.com/photos/" + username } , function(err, result){
        if(!err && result.user){
            callback(result.user.id, null);
        } else {
            console.log(err);
            callback(null, err);
        }
    });

}

router.get('/nsid/*', function(req, res){

    var username = req.params[0];

    if(username.indexOf('http://') > -1){
        var regexHttp = /photos\/([^/]+)\/?/;
        var match = regexHttp.exec(username);
        username = match[1];
//        var match = myRegexp.exec(myString);
//        alert(match[1]);  // abc
    }

    getUserNsid(username, req.cookies, function(nsid, err){
        if(nsid){
            res.cookie("nsid_"+username, nsid, { maxAge: 3600000, path: '/' });
            res.send(nsid);
        }
        else{
            res.setHeader("X-Error", err);
            res.send("", 400);
        }
    });
});




module.exports = router;
