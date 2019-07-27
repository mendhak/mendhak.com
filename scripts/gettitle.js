
self.onmessage = function (oEvent) {  
	var oReq = new XMLHttpRequest();  
	oReq.open("GET", '/gettitlefromurl/' + oEvent.data.url, false);  // synchronous request
	oReq.send(null);  
	self.postMessage( new WorkerResponse(oEvent.data.slide, oReq.responseText));  
};  


function WorkerResponse(slide, title) {
    this.slide = slide;
    this.title = title;
}

