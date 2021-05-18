// JS script and data for river sections

// Global Variables
var USWaterlist = new Object();
var includeVisual = "timing";
var curDate = new Date();
var curYear = curDate.getFullYear();
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var jsonRivers;
var allRivers = [];
var markerCluster;

// sets the max info window width to 100 less than the screen width - keeps the info window inside the screen
var infoMaxWidth = window.innerWidth - 100; 

nDays = [];
fDays = [];
// create function that writes an array of file names for future days
function futureDays(){
    // var curDay = date.getDate();
    for (i=0; i < 10; i++){
        var fDate = new Date();
        fDate.setDate(curDate.getDate() + 1 + i)
        var day = fDate.getDate();
        var curWeekday = fDate.getDay();
        var curMonth = fDate.getMonth() + 1; // month starts at 0, so we have to add 1 to it
        // fDays is the file name to use for each future day
        fDays[i] = "ready_" + curMonth + "_" + day + "_" + curYear + ".csv";
        // nDays is the name of the days to display in HTML
        nDays[i] = weekdays[curWeekday] + ", " + months[fDate.getMonth()] + " " + day + ", " + curYear;
    }
}
futureDays();

// need to delay the write to file to make sure everything loads in HTML
setTimeout(renameDays, 3000);

function renameDays () {// sets up the future days in the select menu
    for (i=0; i < fDays.length; i++){
        id = "day" + i;
        idm = "day" + i + "m";
        document.getElementById(id).text = nDays[i];
        document.getElementById(idm).text = nDays[i];
    };
    console.log(document.getElementById('select-day').value);
}// document.getElementById("apple").text = "newTextForApple";}

// these info listeners are on each map marker
function addInfoListener(mark, markIndex, Sect) {
	mark[markIndex].infoWindow = new google.maps.InfoWindow({
    content: Sect.infoContent,
    maxWidth: infoMaxWidth
    });
	mark[markIndex].addListener('click', function () {
	// closes all of the open windows
		for (i=0; i < mark.length; i++) {
			mark[i].infoWindow.close();
		};
		// resets the info content
    		mark[markIndex].infoWindow.setContent(Sect.infoContent);
    		// opens the window
    		mark[markIndex].infoWindow.open(map, mark[markIndex]);
	});

}; // addInfoListener function

// loads the CO Water data and adds all of the data to the USWaterlist array
function LoadCOFile() {
	var strRawContents
	$.ajax({
		url: "COWaterlog.txt",
		success: function(data){
			strRawContents = data;
			var arrLines = strRawContents.split("\n");
			for (i = 0; i < arrLines.length; i++) {
        			var tempArr = arrLines[i].split("=");
        			USWaterlist[tempArr[0]] = tempArr[1];
        		};
        		// this function call is nested so that we can use that Ajax to update everything
        		pullUSWater();
		} // success	
	}); // ajax
}; // LoadCOFile function



// Pull water may have to be written to take an input.....just like the functions used to adjust for difficulty
// Pull USGS Function
function pullUSWater(j){
	var strRawContents
	var file = "/NOAA/" + fDays[j];
	$.ajax({
		url: file,
		success: function(data){
			strRawContents = data;
			var arrLines = strRawContents.split("\n");
			for (i = 0; i < arrLines.length; i++) {
        			var tempArr = arrLines[i].split("=");
        			USWaterlist[tempArr[0]] = Number(tempArr[1]);
        		};
        		// load JSON data - IF river data is empty; else just checkUSWater
        		if (allRivers.length < 1){
        		    loadJSON('http://rivermaps.co/rivers.json');
        		} else {
        		    checkUSWater();
        		} // if statement whether to load river data or not
		} // success
	}); // ajax
}; // pullUSWater function
		

// Checks Water for reach gauge
function checkUSWater(){
	// for loop through all sections to update data and put in info markers
	for (var riverIndex = 0; riverIndex < allRivers.length; riverIndex++){
		// loop through all of the gauges for a section
		for (var i = 0; i < allRivers[riverIndex].USGSsite.length; i++) {
			// check that this isn't a visual flow section
			if (allRivers[riverIndex].USGSsite[i] == "visual"){}
			else {
			   allRivers[riverIndex].flow[i] = USWaterlist[allRivers[riverIndex].USGSsite[i]];
			    } // else statement
			}; // loop through all of the gauges for a section
		// check whether this is a visual flow section
		if (allRivers[riverIndex].USGSsite[0] == "visual"){
		    allRivers[riverIndex].calcFlow();
		    allRivers[riverIndex].infoContent += "<p> Typically run: " + months[allRivers[riverIndex].timing[0].getMonth()] + " "+ allRivers[riverIndex].timing[0].getDate() + " to " + months[allRivers[riverIndex].timing[1].getMonth()] + " "+ allRivers[riverIndex].timing[1].getDate() + "</p>";
		// if statement to include a related flow
		if (allRivers[riverIndex].USGSsite[1]) {
			allRivers[riverIndex].infoContent += "<p> Related Flow: " + allRivers[riverIndex].curFlow + " cfs</p>";
			}; // if there is a gauge, then use it
		} // if statement checking if it's a visual flow section
		else {
			allRivers[riverIndex].calcFlow();
			allRivers[riverIndex].infoContent += "<p> Recommended Lower Limit: " + allRivers[riverIndex].lowLmt;
			allRivers[riverIndex].infoContent += " cfs</p>";
			allRivers[riverIndex].infoContent += "Current Flow: " + allRivers[riverIndex].curFlow + " cfs";
			// add the CFS to the rollover title
			allRivers[riverIndex].title += " " + allRivers[riverIndex].curFlow + " cfs";
   	    }; // else statement	
	}; // loop through rivers
	// need to loop through the markers to remove them from the map
	if (marker.length > 0) {
	    markerCluster.clearMarkers();
	    for (let i = 0; i < marker.length; i++) {
            marker[i].setMap(null);
        }
        // markerCluster.setMap(null);
	}
	
	if (currentMarkers.length > 0){
	    markerCluster.clearMarkers();
	    for (let i = 0; i < currentMarkers.length; i++) {
            currentMarkers[i].setMap(null);
	    }
	}
	
	// clear the marker variables
	currentMarkers = [];
	marker = [];
    var infoWindow = [];
    var markerIndex = 0;
	
    ////// Loop through river sections to create markers
	for (var riverIndex = 0; riverIndex < allRivers.length; riverIndex++){
	    createMarker(allRivers[riverIndex]);
	}; // loop to create river markers
	// may need to call something here to create the clusters
	markerCluster = new MarkerClusterer(map, marker, clusterOptions);
    markerCluster.setMaxZoom(10);
    console.log(marker.length)
};

function loadJSON(url, callback) {
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'json';
    request.send();
    request.onload = function() {
        jsonRivers = request.response;
        // parse the JSON into RiverSection objects here
        for (var riverIndex = 0; riverIndex < jsonRivers.length; riverIndex++) {
		    for (sectIndex = 0; sectIndex < jsonRivers[riverIndex].length; sectIndex++) {
		        // if section is visual inspection, use the child architype for visual sections
		        if (jsonRivers[riverIndex][sectIndex]["USGSsite"][0] == "visual") {
		            var newSect = new visualRiverSection(jsonRivers[riverIndex][sectIndex]["position"], jsonRivers[riverIndex][sectIndex]["title"], jsonRivers[riverIndex][sectIndex]["clabel"], jsonRivers[riverIndex][sectIndex]["rclass"], jsonRivers[riverIndex][sectIndex]["rcolor"], jsonRivers[riverIndex][sectIndex]["lowLmt"], jsonRivers[riverIndex][sectIndex]["upLmt"]);
		            newSect.timing = [new Date(jsonRivers[riverIndex][sectIndex]["timing"][0]), new Date(jsonRivers[riverIndex][sectIndex]["timing"][1])];
		            newSect.infoContent = jsonRivers[riverIndex][sectIndex]["infoContent"];
		            // statement loading the related gauge if there is one
		            if (jsonRivers[riverIndex][sectIndex]["USGSsite"][1]){
		                newSect.USGSsite[1] = jsonRivers[riverIndex][sectIndex]["USGSsite"][1]; // related flow to display
		            };
		            allRivers.push(newSect);
		            /// make this an elseif to see if that gauge used in that section is included in our list of gauges that we have in our prediction file. Load this list from the CSV of just gauges.
		            /// use this list to also add a link the the appropriate gauge page.
		        } else if (jsonRivers[riverIndex][sectIndex]["USGSsite"] in USWaterlist){
		            var newSect = new RiverSection(jsonRivers[riverIndex][sectIndex]["position"], jsonRivers[riverIndex][sectIndex]["title"], jsonRivers[riverIndex][sectIndex]["clabel"], jsonRivers[riverIndex][sectIndex]["rclass"], jsonRivers[riverIndex][sectIndex]["rcolor"], jsonRivers[riverIndex][sectIndex]["lowLmt"], jsonRivers[riverIndex][sectIndex]["upLmt"]);
		            newSect.USGSsite = jsonRivers[riverIndex][sectIndex]["USGSsite"];
		            
		            // add link to NOAA prediction site to the end of the infoContent section
		            
		            newSect.infoContent = jsonRivers[riverIndex][sectIndex]["infoContent"];
		            allRivers.push(newSect);
		        };
		        // access the individual section parameters
		    }; // for loop through sections
        }; // for loop through rivers
        checkUSWater();
    }; // request response
}; // loadJSON function

// this will contain all the information of the river section
var RiverSection = function (pos,title,clabel,rclass,rcolor,lowLmt,upLmt) {
		this.position = pos;
		this.title = title;
		this.clabel = clabel;
		this.rclass = rclass;
		this.rcolor = rcolor;
		this.lowLmt = lowLmt;
		this.upLmt = upLmt;
		this.rockyLmt = 1.25*this.lowLmt;
		this.USGSsite = [0];
		this.curFlow = 0;
		this.runSect = 1;
		this.markerNum = 0;
		this.infoContent = "<h3>" + this.title + " " + this.clabel + "</h3>";
		this.flow = [0];
		// calculates the flow for the section; default is just flow[0]
		this.calcFlow = function (){
			this.curFlow = this.flow[0];
			}; 
		// function to see if the section is running
		this.runCur = function (){
			if (this.curFlow < this.lowLmt) {
				this.runSect = 0;
				marker[this.markerNum].setMap(null);
				} else if (this.curFlow > this.upLmt) {
				this.runSect = 2;
				marker[this.markerNum].setMap(null);
				} else {
				this.runSect = 1;
				}; // if statement
		}; // runCur function
		this.resetSect = function () {
			marker[this.markerNum].setMap(map);
			this.runSect = 1;		
		}; // resetSect function
		this.markerFlow = function () {
			if (this.curFlow < (0.75*this.lowLmt)) {
				this.markerColor('white');
			} else if (this.curFlow < this.lowLmt) {
				this.markerColor('brown');
			} else if (this.curFlow < this.rockyLmt){
				this.markerColor('yellow');
			} else if (this.curFlow < (0.75*this.upLmt)){
				this.markerColor('green');
			} else if (this.curFlow < this.upLmt){
				this.markerColor('blue');
			} else if (this.curFlow < (1.25*this.upLmt)){
				this.markerColor('purple');
			} else {
				this.markerColor('red');
			}; // if statement
		}; // colors the markers based on flow
		
		this.markerDifficulty = function () {
			marker[this.markerNum].setIcon({
				path: google.maps.SymbolPath.CIRCLE,
				scale: 18,
				fillColor: 'white',
				fillOpacity: 0.8,
				strokeWeight: 3,
				strokeColor: this.rcolor
			}); // creating the marker
		}; // markerDifficulty function
		
		this.markerColor = function (currentColor) {
			marker[this.markerNum].setIcon({
				path: google.maps.SymbolPath.CIRCLE,
				scale: 18,
				fillColor: 'white',
				fillOpacity: 0.8,
				strokeWeight: 3,
				strokeColor: currentColor
			});
		}; // markerFlow function		
};

//  creates a child of RiverSection that is based on the visual flow so that I don't have to re-write this everytime
function visualRiverSection (pos,title,clabel,rclass,rcolor,lowLmt,upLmt) {
	RiverSection.call (this,pos,title,clabel,rclass,rcolor,lowLmt,upLmt);
	this.USGSsite = ["visual"];
	this.timing = [new Date("01 Jan " + curYear), new Date("31 Dec " + curYear)];
	this.calcFlow = function (){
	    // if there is a related flow, use it
	    if (this.flow[1]){
			    this.curFlow = this.flow[1];
			    };
	    };
	this.runCur = function () {
	if (includeVisual == "exclude") { 
		this.runSect = 0;
	} else if (includeVisual == "include") {
		this.runSect = 1;
	} else {
		/// check timing here;
		if (curDate < this.timing[0]) {
			// too early
			this.runSect = 0;
		} else if (curDate > this.timing[1]) {
			// too late
			this.runSect = 0;
		} else {
			// just right
			this.runSect = 1;
		};
	}; // if statement
	}; // runCur function
}; // defining visualRiverSection prototype

// inheritting all of the methods of RiverSection
visualRiverSection.prototype = Object.create(RiverSection.prototype);

///////////////////////////// River data that was hard-coded in JS was here ////////////////////////////


// initializes the clustering
var markerCluster = new Object();

// options object for the cluster
var clusterOptions = {
  'gridSize': 35,
  'averageCenter': true,
  'maxZoom': 9,
  'minimumClusterSize': 3,
  'imagePath': 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
};

// initializes the markers
var marker = [];
// initializes the infoWindow
var infoWindow = [];
// and the marker index
var markerIndex = 0;

// scale of icons on map
var iconScale = 18;
// stroke weight of icons on map
var iconStroke = 3;
// opacity of the icons
var iconOpacity = 0.65;

//pullUSWater(0);

/// New createMarker function: take in a river section and puts that 1 marker on the map; feeds the river array with the corresponding marker index
function createMarker(river){
	marker[markerIndex] = new google.maps.Marker({
  	position: river.position,
  	map: map,
   	label: river.clabel,
    	title: river.title,
    	icon: {
      	path: google.maps.SymbolPath.CIRCLE,
      	scale: iconScale,
      	strokeColor: river.rcolor,
      	strokeWeight: iconStroke,
      	fillColor: 'white',
      	fillOpacity: iconOpacity
        } // label details
	}); // marker function
// adds the info windows for each marker
// function for creating the listener on the marker for the info window
addInfoListener(marker, markerIndex, river);

river.markerNum = markerIndex;
markerIndex++; // steps marker index to avoid overwriting
} // createMarker function

// create the map variable before the map initializing (making it global)
var map;
// initializes the map
function initMap() {
	// zoom of map
	var mapZoom = 7;
	// center
	var mapCenter = {lat: 38.859391, lng: -107.169172};

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: mapZoom,
    center: mapCenter
  });

}; //initMap function

var currentMarkers = [];

// this function checks the flow of each section versus the recommended flow
function checkFlow(riverSect){
	// change if statement 
	if (riverSect.runSect == 1) {
		riverSect.calcFlow();
		riverSect.runCur();
	}; // if statement to see if it is possibly running before the flow check
	// for visual sections, we should run this check anyway
	if (riverSect.USGSsite[0] == "visual") {
		riverSect.calcFlow();
		riverSect.runCur();
	}; // check for visual sections
	// does this mess with the filter for difficulty? It does not appear to on 3/2/18
	
	// update the array of markers based on what's running
	if (riverSect.runSect == 1) {
		currentMarkers.push(marker[riverSect.markerNum]);
	}
}; // checkFlow

/* updateFlow is the master function that loops through all rivers and all sections for everything in the allRivers array. As the function loops through, it checks that the flow of each section is within the runnable flow levels for that section */
function updateFlowMbl() {
	currentMarkers = [];
	includeVisual = document.getElementById("visual-flow-mbl").value;
	//console.log(includeVisual);
	
	// loop through all rivers
	for (var riverIndex = 0; riverIndex < allRivers.length; riverIndex++) {
		checkFlow(allRivers[riverIndex]);
	}; // loop through rivers
	// check difficulty
	updateDiffMbl();
	// loop through markers to make sure they are on the current map
	markerCluster.clearMarkers();
	markerCluster = new MarkerClusterer(map, currentMarkers, clusterOptions);
	
}; // UpdateFlowMbl

// for the full website version
function updateFlow() {
currentMarkers = [];
includeVisual = document.getElementById("visual-flow").value;
//console.log(includeVisual);

// loop through all rivers
	for (var riverIndex = 0; riverIndex < allRivers.length; riverIndex++) {
		checkFlow(allRivers[riverIndex]);
	}; // loop through rivers
	// check difficulty
	updateDiff();
	// loop through markers to make sure they are on the current map
	markerCluster.clearMarkers();
	markerCluster = new MarkerClusterer(map, currentMarkers, clusterOptions);
}; // updateFlow function

/* old function that looped through all of the sections in a river to reset them. We don't need need this anymore without the data nested
// function that loops through and resets all of the markers and runSect for all the sections of a river
function resetRiver(river){
	for (var sectIndex = 0; sectIndex < river.length; sectIndex++) {
		river[sectIndex].resetSect();
	}; // loop through all of the river sections

}; // resetRiver function
*/




// May want to make the river function reset the sliders as well

// this resets all of the markers back on the map without reloading the page
function resetMarkers() {
document.getElementById("lowerLimit").value = 1.96;
document.getElementById("displayLowLmt").textContent = 'II-';
document.getElementById("displayLowLmt").style.color = "green";
document.getElementById("upperLimit").value = 6.06;
document.getElementById("displayUpLmt").textContent = 'VI';
document.getElementById("displayUpLmt").style.color = "black";
document.getElementById("lowerLimitMbl").value = 1.96;
document.getElementById("displayLowLmtMbl").textContent = 'II-';
document.getElementById("upperLimitMbl").value = 6.06;
document.getElementById("displayUpLmtMbl").textContent = 'VI';

// loop through the rivers to reset them
	for (var riverIndex = 0; riverIndex < allRivers.length; riverIndex++) {
		allRivers[riverIndex].resetSect();
		}; // for loop through all of the rivers
	markerCluster.clearMarkers();
	markerCluster = new MarkerClusterer(map, marker, clusterOptions);
			
}; // resetMarkers function



// Now the part to check the river difficulty

// this function checks the difficulty of each section
function checkDiff(riverSect) {
	// if statement checks that river section is within difficulty range
	if (riverSect.rclass > userUpLmt) {
		marker[riverSect.markerNum].setMap(null);
		// riverSect.runSect = 0;
	} else if (riverSect.rclass < userLowLmt) {
		marker[riverSect.markerNum].setMap(null);
		// riverSect.runSect = 0;
	} else if (riverSect.runSect == 1){
		// if the section is shown as running and the marker is hidden, show again
		marker[riverSect.markerNum].setMap(map);
		currentMarkers.push(marker[riverSect.markerNum]);
	}; // if statement
}; // checkDiff function

// this function looks through sections of the river
function checkRiverDiff(river) {
	// loop through sections
	for (var sectIndex = 0; sectIndex < river.length; sectIndex++) {
		checkDiff(river[sectIndex]);
	}; // for loop through sections
}; // checkRiverDiff; checking difficulty of rivers


/* updateDiff is the master function that loops through all rivers and all sections for everything in the allRivers array; this function checks if the river is within the bounds of difficulty (Class I - VI) that the user specifies */
cLabels = ['II-', 'II', 'II+', 'III-', 'III', 'III+', 'IV-', 'IV', 'IV+', 'V-', 'V', 'V+', 'VI'];


function updateDiff() {
currentMarkers = [];
// pulling from the sliders
	userUpLmt = document.getElementById("upperLimit").value;
	userLowLmt = document.getElementById("lowerLimit").value;
	// lower limit
	var viewLowLmt = document.getElementById("displayLowLmt");
	viewLowLmt.textContent = cLabels[Math.round((userLowLmt-2)*3)];
	if (userLowLmt < 2.75) {
		var lowerColor = "green";
	} else if (userLowLmt < 3.75) { 
		var lowerColor = "blue";
	} else if (userLowLmt < 4.75) { 
		var lowerColor = "purple";
	} else if (userLowLmt < 5.5) { 
		var lowerColor = "red";
	} else { var lowerColor = "black";}
	viewLowLmt.style.color = lowerColor;
	// upper limit
	var viewUpLmt = document.getElementById("displayUpLmt");
	viewUpLmt.textContent = cLabels[Math.round((userUpLmt-2)*3)];
	if (userUpLmt < 2.75) {
		var upColor = "green";
	} else if (userUpLmt < 3.75) { 
		var upColor = "blue";
	} else if (userUpLmt < 4.75) { 
		var upColor = "purple";
	} else if (userUpLmt < 5.5) { 
		var upColor = "red";
	} else { var upColor = "black";}
	viewUpLmt.style.color = upColor;
	for (var riverIndex = 0; riverIndex < allRivers.length; riverIndex++) {
		checkDiff(allRivers[riverIndex]);
	}; // loop through sections
	//console.log(userUpLmt);
	//console.log(userLowLmt);
	// resets the cluster
	markerCluster.clearMarkers();
	markerCluster = new MarkerClusterer(map, currentMarkers, clusterOptions);
	
}; // updateDiff function


// Mobile version of updateDiff
function updateDiffMbl() {
currentMarkers = [];
// pulling from the sliders
	userUpLmt = document.getElementById("upperLimitMbl").value;
	userLowLmt = document.getElementById("lowerLimitMbl").value;
	// lower limit
	var viewLowLmt = document.getElementById("displayLowLmtMbl");
	viewLowLmt.textContent = cLabels[Math.round((userLowLmt-2)*3)];
	if (userLowLmt < 2.75) {
		var lowerColor = "green";
	} else if (userLowLmt < 3.75) { 
		var lowerColor = "blue";
	} else if (userLowLmt < 4.75) { 
		var lowerColor = "purple";
	} else if (userLowLmt < 5.5) { 
		var lowerColor = "red";
	} else { var lowerColor = "black";}
	viewLowLmt.style.color = lowerColor;
	// upper limit
	var viewUpLmt = document.getElementById("displayUpLmtMbl");
	viewUpLmt.textContent = cLabels[Math.round((userUpLmt-2)*3)];
	if (userUpLmt < 2.75) {
		var upColor = "green";
	} else if (userUpLmt < 3.75) { 
		var upColor = "blue";
	} else if (userUpLmt < 4.75) { 
		var upColor = "purple";
	} else if (userUpLmt < 5.5) { 
		var upColor = "red";
	} else { var upColor = "black";}
	viewUpLmt.style.color = upColor;
	for (var riverIndex = 0; riverIndex < allRivers.length; riverIndex++) {
		checkDiff(allRivers[riverIndex]);
	}; // loop through sections
	//console.log(userUpLmt);
	//console.log(userLowLmt);
	// resets the cluster
	markerCluster.clearMarkers();
	markerCluster = new MarkerClusterer(map, currentMarkers, clusterOptions);
	
}; // updateDiffMbl function

// colorRiverFlow will take the river and then loop through all of the river sections
function colorRiverFlow (river) {
	// loop through the sections
	for (var sectIndex = 0; sectIndex < river.length; sectIndex++) {
		river[sectIndex].markerFlow();
	}; // loop through all of the river sections
}; // colorRiverFlow function

/* colorFlow is the master function that loops through all rivers and all section for allRivers array; this function changes the color of the icon based on the flow of the river.
*/
function colorFlow() {
	// loop through all of the sections
	for (var riverIndex = 0; riverIndex < allRivers.length; riverIndex++) {
		colorRiverFlow(allRivers[riverIndex]);
	}; // loop through rivers
	alert("White is not running; Brown is near the possibility of running; Yellow is getting rocky; Green is good to go; Blue is getting high; Purple is just above the upper recommended; red is raging well above the recommended");
}; // colorFlow function

// colorRiverFlow will take the river and then loop through all of the river sections
function colorRiverDiff (river) {
	// loop through the sections
	for (var sectIndex = 0; sectIndex < river.length; sectIndex++) {
		river[sectIndex].markerDifficulty();
	}; // loop through all of the river sections
}; // colorRiverDiff function


/* colorDiff is the master function that loops through all rivers and all section for allRivers array; this function changes the color of the icon based on the difficulty of the river section.
*/
function colorDiff() {
	// loop through all of the sections
	for (var riverIndex = 0; riverIndex < allRivers.length; riverIndex++) {
		colorRiverDiff(allRivers[riverIndex]);
	}; // loop through rivers
}; // colorDiff function

