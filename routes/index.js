var apiKey = "a39dfdf51784c76fa3234f88bec38b0e";
var express = require('express');
var router = express.Router();
var flickr;
var Flickr = require("flickrapi"),
    flickrOptions = {
        api_key: apiKey //,
        //secret: "API key secret that you get from Flickr"
    };
Flickr.tokenOnly(flickrOptions, function(error, flickrapi) {
    flickr = flickrapi;

});



/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


router.get('/nsid/:username', function(req, res){
    var nsid = flickr.urls.lookupUser( {url :"http://www.flickr.com/photos/mendhak" } , function(err, result){
        res.send(result.user.id);
    });


});







module.exports = router;
