var i = 0;
var myslides = [];

function goTo(url)
{
	window.open(url);
}

jQuery(function($){
	for (i = 1; i <= 100; i++)
	{
		myslides.push(
			{image : '/img/69135870@N00/' + i + '/k',
			title : '', 
			thumb : '/img/69135870@N00/' + i + '/q',
                        url : '/url/69135870@N00/' + i });
	}


	$.supersized({
	
		slide_interval:5000,// Length between transitions
		transition:1, 
	// 0-None, 1-Fade, 2-Slide Top, 3-Slide Right, 4-Slide Bottom, 5-Slide Left, 6-Carousel Right, 7-Carousel Left
		transition_speed:1000,// Speed of transition
		slide_links:false,// Individual links for each slide (Options: false, 'number', 'name', 'blank')
		slides:myslides,
		random:1,
		thumb_links:0, 
		thumbnail_navigation:0
	});	

	i = 0;
	setTimeout(setAllTitles, 0);

	$(function(){
		$(".tooltip").tipTip({defaultPosition:'left'});
		});

});


function WorkerMessage(slide, url) {
    this.slide = slide;
    this.url = url;
}


function setAllTitles()
{

	if (i < api.options.slides.length)
	{


		var oReq = new XMLHttpRequest();  
		oReq.open("GET", '/gettitlefromurl/' + api.options.slides[i].url, true);
		oReq.onreadystatechange = function (oEvent) {  
		  if (oReq.readyState === 4) {  
		    if (oReq.status === 200) {  
			api.options.slides[i].title = oReq.responseText;
			i++;
			setTimeout(setAllTitles,4000);
		    }  
		  }  
		};  
		oReq.send(null);

/*			​
		//This works but causes Chrome to crash with the 'aw snap' screen.
		var worker = new Worker("js/gettitle.js");
		worker.onmessage = function(event) {
			api.options.slides[event.data.slide].title = event.data.title;
		}

		worker.postMessage( new WorkerMessage(i,api.options.slides[i].url));

		i++;

*/
		
	}

}
