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
  res.render('index', { title: 'Express' });
});



router.get('/img/:nsid/:num?/:size?/:popular?', function(req, res){

    var num = 1;
    var size = 's';
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
                sort: popular,
                extras: "url_"+size
            }, function(err, result){
                if(!err && result.photos && result.photos.photo.length > 0){
                    res.redirect(result.photos.photo[0]["url_"+size]);
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
        return username;
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

router.get('/nsid/:username', function(req, res){

    var username = req.params.username;
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
