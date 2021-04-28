// JS script and data for river sections

var USWaterlist = new Object();
var includeVisual = "timing";
var curDate = new Date();
var curYear = curDate.getFullYear();
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var markerCluster;

// I'm not sure why I set this width to 100 less than the window width
var infoMaxWidth = window.innerWidth - 100; 

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
};

// Pull USGS Function
function pullUSWater(){
	var strRawContents
	$.ajax({
		url: "USWaterlog.txt",
		success: function(data){
			strRawContents = data;
			var arrLines = strRawContents.split("\n");
			for (i = 0; i < arrLines.length; i++) {
        			var tempArr = arrLines[i].split("=");
        			USWaterlist[tempArr[0]] = tempArr[1];
        		};
        		// for loop through all rivers to update data and put in info markers
        		for (var riverIndex = 0; riverIndex < allRivers.length; riverIndex++){
        			// loop through all of the sections
        			for (sectIndex = 0; sectIndex < allRivers[riverIndex].length; sectIndex++) {
        			
        				// loop through all of the gauges for a section
        				for (var i = 0; i < allRivers[riverIndex][sectIndex].USGSsite.length; i++) {
        					// check that this isn't a visual flow section
        					if (allRivers[riverIndex][sectIndex].USGSsite[i] == "visual"){}
        					else {
        					allRivers[riverIndex][sectIndex].flow[i] = USWaterlist[allRivers[riverIndex][sectIndex].USGSsite[i]];
        					} // else statement
        					}; // loop through all of the gauges for a section
        				// check whether this is a visual flow section
        				if (allRivers[riverIndex][sectIndex].USGSsite[0] == "visual"){
        				allRivers[riverIndex][sectIndex].calcFlow();
        				allRivers[riverIndex][sectIndex].infoContent += "<p> Typically run: " + months[allRivers[riverIndex][sectIndex].timing[0].getMonth()] + " "+ allRivers[riverIndex][sectIndex].timing[0].getDate() + " to " + months[allRivers[riverIndex][sectIndex].timing[1].getMonth()] + " "+ allRivers[riverIndex][sectIndex].timing[1].getDate() + "</p>";
        				// if statement to include a related flow
        				if (allRivers[riverIndex][sectIndex].USGSsite[1]) {
        					allRivers[riverIndex][sectIndex].infoContent += "<p> Related Flow: " + allRivers[riverIndex][sectIndex].curFlow + " cfs</p>";
        					}; // 
        				} // if there is a gauge, then use it
        				else {
        				    allRivers[riverIndex][sectIndex].calcFlow();
   					    }; // else statement	
        			}; // loop through sections
        		}; // loop through rivers
		} // success
		
	}); // ajax
	// console.log(USWaterlist);
};

// these functions are used later to pull data from the XML file
function downloadUrl(url, callback) {
    var request = window.ActiveXObject ?
        new ActiveXObject('Microsoft.XMLHTTP') :
        new XMLHttpRequest;

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            request.onreadystatechange = doNothing;
            callback(request, request.status);
          }
        };

        request.open('GET', url, true);
        request.send(null);
 }; // downloadUrl
      
function doNothing() {};   


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





/////////////////////////////////// COLORADO  ///////////////////////////////

// EAGLE RIVER Sections
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.454739, lng: -106.328864}, "Red Cliff", 'IV-V', 5.33, 'red', 200, 1000);
newRiver[0].USGSsite = ["09063000"];
newRiver[1] = new RiverSection ({lat: 39.507626, lng: -106.378059}, "Gilman Gorge", 'IV-V', 5.33, 'red', 275, 2000);
newRiver[1].USGSsite = ["09064600"];
newRiver[1].infoContent += "<p>Mostly Class IV+ with two Class V rapids</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/390/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/198' target='_blank'> River Brains </a></p>" + "<p><a href='https://vimeo.com/131804398' target='_blank'> Vimeo </a></p>"
newRiver[2] = new RiverSection ({lat: 39.577311, lng: -106.412976}, "Minturn S-Turn", 'III', 3.33, 'blue', 250, 3000);
newRiver[2].USGSsite = ["09064600"];
newRiver[2].infoContent += "<p>Mostly Class III, perhaps even a couple III+</p>" + "<p>Largely overlooked for other nearby stretches, " + "this is fun section that is often used as a warmup to Dowd Chute. It does not move as fast as dowd.</p>"
newRiver[3] = new RiverSection ({lat: 39.607245, lng: -106.445120}, "Dowd Chute!", 'IV', 4.33, 'purple', 450, 5000);
newRiver[3].USGSsite = ["09067020"];
newRiver[3].infoContent += "<p>One Class IV that is fast-moving with some Class IV- runout</p>" + "<p>Varies greatly with water level</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4266/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/197' target='_blank'> River Brains </a></p>" + "<p><a href='https://vimeo.com/96853825' target='_blank'> Vimeo Kayak at Big Water</a></p>" + "<p><a href='https://youtu.be/NFzSfFKpKxs' target='_blank'> Youtube raft at Big Water</a></p>"
newRiver[4] = new RiverSection ({lat: 39.631752, lng: -106.523133}, "Middle Eagle", 'III(+)', 3.66, 'blue', 700, 8000);
newRiver[4].USGSsite = ["09067020"];
newRiver[4].infoContent += "<p>Mostly Class III with some III+</p>" + "<p>Edwards Mile at the end of the section approaches IV- at big water</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/391/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/56' target='_blank'> River Brains </a></p>"
newRiver[5] = new RiverSection ({lat: 39.654239, lng: -106.626647}, "Holy Roller", 'II(III)', 2.66, 'green', 800, 8000);
newRiver[5].USGSsite = ["09067020"];
newRiver[5].infoContent += "<p>Mostly Class II with a Class III at the beginning and end. This is another section of the Eagle that is often overlooked - except by fisherman.</p>" + "<p>An early take-out at the Hwy 131 bridge can avoid the bottom Class III (Trestle - the harder of the two).</p>" + "<p>The first rapid, Holy Roller, could be skipped but you have to go much further down (I-70 bridge or Post Office)</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2882/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/163' target='_blank'> River Brains </a></p>"
newRiver[6] = new RiverSection ({lat: 39.713087, lng: -106.697500}, "Lower Eagle", 'II(III)', 3.00, 'blue', 1000, 3500);
newRiver[6].USGSsite = ["09067020"];
newRiver[6].infoContent += "<p>Mostly Class II with some Class III's sprinkled throughout; Interstate, Dead Cow, and Rodeo are the well-known III's.</p>" + "<p>While American Whitewater and Riverbrains start this section in Edwards, most boaters start in Wolcott and go to Eagle Fairgrounds." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2882/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/163' target='_blank'> River Brains </a></p>" + "<p><a href='https://youtu.be/ZJWHkovWS1w?t=50s' target='_blank'> Youtube rafting</a></p>"
newRiver[7] = new RiverSection ({lat: 39.653169, lng: -106.836130}, "Gypsum", 'II(+)', 2.33, 'green', 1000, 8000);
newRiver[7].USGSsite = ["09070000"];
newRiver[7].infoContent += "<p>Mostly Class II with some Class II+ obstactles sprinkled throughout.</p>" + "<p>This section is often avoided, except by local fisherman.</p>"
newRiver[8] = new RiverSection({lat: 39.651732, lng: -106.985045}, "Duck Pond", 'II(III)', 2.33, 'green', 1000, 10000);
newRiver[8].USGSsite = ["09070000"];
newRiver[8].infoContent += "<p>This appears to be the easiest part of the Eagle River, and it is....except for one Class III hidden by the Stoneyard, just above the confluence with the Colorado. The run can be cut short to avoid this rapid.</p>" + "<p>With all the stagnant water of the duck ponds, the bugs down here are Class V.</p>"

// ARRAY OF ALL OF THE RIVERS
var allRivers = [newRiver];



// Loads water data
LoadCOFile();  // originally on line 1008

////// XML data from the file //////
// Change this depending on the name of your PHP or XML file
downloadUrl('http://rivermaps.co//mapmarkers2.xml', function(data) {
var newRiver = [];
   var XMLindex = 0;
   var xml = data.responseXML;
   var sections = xml.documentElement.getElementsByTagName('section');

   Array.prototype.forEach.call(sections, function(sectionElem) {
      var id = sectionElem.getAttribute('id');
      var name = sectionElem.getAttribute('name');
      var infoContentImp = sectionElem.getAttribute('infoContent');
      var rcolor = sectionElem.getAttribute('rcolor');
      var clabel = sectionElem.getAttribute('clabel');
      var point = {lat: parseFloat(sectionElem.getAttribute('lat')), lng: parseFloat(sectionElem.getAttribute('lng'))};
      var rclass = sectionElem.getAttribute('rclass');
      var lowerLimit = parseFloat(sectionElem.getAttribute('lowLmt'));
      var upperLimit = parseFloat(sectionElem.getAttribute('upLmt'));
      var sectType = sectionElem.getAttribute('type');
      // manually loops through the links and link names for the section - I have to figure out a better way
      var links = [];
      var linkNames = [];
      var i = 0;
      var loop = true;
      while (loop) {
      	var ref_links = 'links' + i;
      	var ref_link_names = 'linkNames' + i;
   

      if (sectionElem.getAttribute(ref_links) != null) {
      	links[i] = sectionElem.getAttribute(ref_links);
      	linkNames[i] = sectionElem.getAttribute(ref_link_names);
      	i++;
      	} else {
      	loop = false; }; // if statement
      }; // while loop

      
		
      // console.log(links);
      // console.log(linkNames);

      if (sectType == "measured") {
      	newRiver[XMLindex] = new RiverSection(point, name, clabel, rclass, rcolor, lowerLimit, upperLimit);
      	newRiver[XMLindex].USGSsite = [sectionElem.getAttribute('USGSsite')];
      	
      } else {
      	newRiver[XMLindex] = new visualRiverSection(point, name, clabel, rclass, rcolor, lowerLimit, upperLimit);
      	newRiver[XMLindex].timing = [new Date(sectionElem.getAttribute('timing_start') + curYear), new Date(sectionElem.getAttribute('timing_end')  + curYear)];
      	// console.log(name)
      	}; // adding the right kind of new section
      	newRiver[XMLindex].infoContent += infoContentImp;
      	for (var j = 0;  j < links.length ; j++) {
      		newRiver[XMLindex].infoContent += " <p><a href='" + links[j] + "' target='_blank'>"+ linkNames[j] + "</a></p>"
      	}; // for loop
      		
      XMLindex++;
      }); // loop for the sections
allRivers.push(newRiver);

// onload command to make sure this loads after the google maps API is ready
window.onload = function () {
 // createMarker Loop for all the rivers
for (var riverIndex = 0; riverIndex < allRivers.length; riverIndex++) {
	createMarker(allRivers[riverIndex]);
	}; // for loop to create all of the river markers

markerCluster = new MarkerClusterer(map, marker, clusterOptions);
markerCluster.setMaxZoom(10);

};
});





// Arkansas River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.043075, lng: -106.265905}, "Pine Creek", 'IV(V)', 4.66, 'purple', 200, 5000);
newRiver[0].USGSsite = ["07087050"];
newRiver[0].rockyLmt = 375;
newRiver[0].infoContent = "<h3>Pine Creek IV(V)</h3>" + "<p>Pine Creek is mostly III-IV rapids with one Class V rapid that features a giant, sticky hole after some fast moves. Every guidebook has an opinion about what levels are easier/harder for this rapid, but they are inconsistent. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/355/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/174' target='_blank'> River Brains </a></p>"
newRiver[1] = new RiverSection ({lat: 38.993318, lng: -106.219635}, "Numbers", 'IV', 4.33, 'purple', 300, 4000);
newRiver[1].USGSsite = ["07087050"];
newRiver[1].rockyLmt = 500;
newRiver[1].infoContent = "<h3>Numbers</h3>" + "<p>This is often talked about as THE Class IV run in the state for the continuous action around that difficulty level. The rapids are numbered 1-7. At lower levels, most of these rapids are Class III+, but from 1000 cfs upward, it's a solid Class IV. While most rafters use the paid put-in, some kayakers (self included) prefer the Stealth put-in a little further up Hwy 24 for one extra Class IV rapid (stealth rapid). Traditional put-in and take-out require a fee. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/356/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/32' target='_blank'> River Brains </a></p>"
newRiver[2] = new RiverSection ({lat: 38.923229, lng: -106.170216}, "Fractions / Milkrun", 'III(+)', 3.33, 'blue', 300, 5000);
newRiver[2].USGSsite = ["07087050"];
newRiver[2].rockyLmt = 500;
newRiver[2].infoContent = "<h3>Fractions / Milkrun III(+)</h3>" + "<p> This is often described as an easier version of the Numbers; the rapids have the same feel, but are much easier. There are a few notable rapids (Miracle Mile, Little Siedel's, House Rock, etc); most well-known is Frog Rock. Frog Rock is really a Class III- move with Class V (nasty undercut rock / seive) for missing that move. Traditional put-in (Railroad Bridge) does require a fee ($7 or pass). Most people traditionally end in town, but Johnson Village (at 285 bridge) allows you to paddle through the playpark and run the damn drop.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/357/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/111' target='_blank'> River Brains </a></p>"
newRiver[3] = new RiverSection ({lat: 38.813585, lng: -106.103834}, "Fisherman", 'II+', 2.66, 'green', 400, 5000);
newRiver[3].USGSsite = ["07091200"];
newRiver[3].rockyLmt = 600;
newRiver[3].infoContent = "<h3>Fisherman II(+)</h3>" + "<p> The section of river between 285 and Ruby Mountain is fairly flat, but if you want to SUP or just float for fishing, I image it could be fun. For most people 'pass' on this section, thus why you won't hear it mentioned by many guidebooks</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/357/' target='_blank'> American Whitewater (end of this section)</a></p>" + "<p><a href='http://www.riverbrain.com/run/show/111' target='_blank'> River Brains </a></p>"
newRiver[4] = new RiverSection ({lat: 38.751850, lng: -106.070554}, "Brown's Canyon", 'III(IV)', 3.66, 'blue', 300, 5000);
newRiver[4].USGSsite = ["07091200"];
newRiver[4].rockyLmt = 600;
newRiver[4].infoContent = "<h3>Brown's Canyon III(+)</h3>" + "<p> Brown's Canyon is one of the most iconic Class III runs in the state. It has sustained raftable flow through mid August and pulls away from civilization for much of the run. Siedel's and Zoom Flume can approach Class IV at some levels. Even for the advanced paddler, this is a fun and gorgeous place to paddle. I prefer an evening paddle here to avoid the commercial rafting traffic and I definitely recommend Ruby Mountain to skip some of the flatwater before the canyon.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/358/' target='_blank'> American Whitewater</a></p>" + "<p><a href='http://www.riverbrain.com/run/show/169' target='_blank'> River Brains </a></p>"
newRiver[5] = new RiverSection ({lat: 38.611639, lng: -106.063580}, "Salida Town", 'II-III', 2.66, 'green', 300, 5000);
newRiver[5].USGSsite = ["07091200"];
newRiver[5].infoContent = "<h3>Salida Town II-III</h3>" + "<p> Salida is surrounded by quality whitewater, but this town run features mainly play park waves.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4348/' target='_blank'> American Whitewater</a></p>" + "<p><a href='http://www.riverbrain.com/run/show/59' target='_blank'> River Brains </a></p>"
newRiver[6] = new RiverSection ({lat: 38.537528,  lng: -105.990305}, "Rincon", 'II-III', 2.66, 'green', 300, 5000);
newRiver[6].USGSsite = ["07094500"];
newRiver[6].infoContent = "<h3>Rincon II-III</h3>" + "<p> Easy access and raftable flow into mid-August.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4349/' target='_blank'> American Whitewater</a></p>"
newRiver[7] = new RiverSection ({lat: 38.393298,  lng: -105.624464}, "Pinnacle Rock", 'III', 3.33, 'blue', 300, 5000);
newRiver[7].USGSsite = ["07094500"];
newRiver[7].infoContent = "<h3>Pinnacle Rock III</h3>" + "<p> A little more challenging than the section above it (Rincon) and a little easier than what lies below (Royal Gorge), this is a popular Class III section that runs into mid-August.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/359' target='_blank'> American Whitewater</a></p>" + "<p><a href='http://www.riverbrain.com/run/show/409' target='_blank'> River Brains </a></p>"
newRiver[8] = new RiverSection ({lat: 38.486100, lng: -105.388176}, "Royal Gorge", 'III(IV)', 3.66, 'blue', 250, 7000);
newRiver[8].USGSsite = ["ARKWELCO", "07094500"];
newRiver[8].rockyLmt = 750;
newRiver[8].infoContent = "<h3>Royal Gorge III(IV)</h3>" + "<p> If you have heard anything about rivers in Colorado, you have probably heard about the Royal Gorge. It's extremely popular and busy in high summer season, but that's because it has so much to offer. Like the rest of the Ark, it maintains a good flow into mid-August, but I know kayakers that run it year-round. Mainly a Class III run, but Sunshine and Sledgehammer turn into Class IV rapids at higher water; the gorge has debris and sheer walls that make it more committing than your typically Class III run. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/360' target='_blank'> American Whitewater</a></p>" + "<p><a href='http://www.riverbrain.com/run/show/219' target='_blank'> River Brains </a></p>";
newRiver[9] = new RiverSection ({lat: 38.436516, lng: -105.242818}, "Canon City Play Park", 'III-', 3.00, 'blue', 250, 7000);
newRiver[9].USGSsite = ["07094500"];
newRiver[9].infoContent = "<h3>Canon City Play Park III-</h3>" + "<p> A couple of waves in town that are around Centennial Park.</p>" + "<p><a href='http://www.riverrestoration.org/canon-city-whitewater.html' target='_blank'> Whitewater Park</a></p>";
newRiver[10] = new RiverSection ({lat: 38.263578, lng: -104.620413}, "Pueblo Play Park", 'III-', 3.00, 'blue', 400, 7000);
newRiver[10].USGSsite = ["07099970"];
newRiver[10].infoContent = "<h3>Pueblo Play Park III-</h3>" + "<p> A couple of man-made wing-waves.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10639' target='_blank'> American Whitewater</a></p>";
allRivers.push(newRiver);

// Ten Mile Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.523109,  lng: -106.140043}, "Upper Ten Mile", 'V', 5.33, 'red', 600, 1000);
newRiver[0].USGSsite = ["09050100"];
newRiver[0].infoContent = "<p>We break this creek down into 2 section; River Brain breaks it down into 4 section; CRC into 3 section; American Whitewater has it as just one long stretch. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2826/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/361' target='_blank'> River Brain </a></p>";
newRiver[1] = new RiverSection ({lat: 39.537492, lng: -106.141722}, "Lower Ten Mile", 'III-IV', 4.33, 'purple', 600, 1000);
newRiver[1].USGSsite = ["09050100"];
newRiver[1].infoContent = "<p>We break this creek down into 2 section; River Brain breaks it down into 4 section; CRC into 3 section; American Whitewater has it as just one long stretch. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2826/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/360' target='_blank'> River Brain 1 </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/359' target='_blank'> River Brain 2</a></p>"
allRivers.push(newRiver);

// Blue River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.725413, lng: -106.127875}, "Upper Blue", 'III+', 3.66, 'blue', 200, 2000);
newRiver[0].USGSsite = ["09050700"];
newRiver[0].infoContent = "<h3>Upper Blue III(+)</h3>" + "<p>Not the uppermost reach of the Blue, but a part commonly run below Silverthorne and above Green Mountain Res. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/362/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/166' target='_blank'> River Brains </a></p>";
newRiver[1] = new RiverSection ({lat: 39.882976, lng: -106.336164}, "Green Mountain Canyon", 'II-III', 3.0, 'blue', 300, 2000);
newRiver[1].USGSsite = ["09057500"];
newRiver[1].rockyLmt = 500;
newRiver[1].infoContent = "<h3>Green Mountain Canyon II-III</h3>" + "<p> This is a gorgeous advanced beginnner sectionthat is a little weird to access. Because of the reserviors above, this runs early and late in the season (and sometimes better in fall than in the typical run-off season). </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/363/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/167' target='_blank'> River Brains </a></p>"
allRivers.push(newRiver);

// Snake River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.605082, lng: -105.915276}, "Snake River", 'III-IV', 4.33, 'purple', 200, 500);
newRiver[0].USGSsite = ["09047500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/6606/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Roaring Fork
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.479659, lng: -107.286565}, "Cemetery", 'II(III)', 2.66, 'green', 300, 10000);
newRiver[0].USGSsite = ["09085000"];
newRiver[0].infoContent = "<h3>Cemetery II(III)</h3>" + "<p> Good advanced beginner section with mainly Class II(+) wave trains with easy moves. There is one Class III rapid (Cemetery) that keeps this section interesting / not a true first-timer section. This section runs nice and late into the season.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/418/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/267' target='_blank'> River Brains </a></p>"
newRiver[1] = new RiverSection ({lat: 39.415260, lng: -107.223748}, "Pink to Black", 'II', 2.33, 'green', 600, 10000);
newRiver[1].USGSsite = ["09085000"];
newRiver[1].infoContent = "<h3>Pink to Black II</h3>" + "<p> The easiest section of the Roaring Fork; good beginner section with mainly Class II wave trains. </p>" +  "<p><a href='http://www.riverbrain.com/run/show/405' target='_blank'> River Brains </a></p>"
newRiver[2] = new RiverSection ({lat: 39.386291, lng: -107.086445}, "Catherine's Store", 'II(III)', 2.66, 'green', 600, 10000);
newRiver[2].USGSsite = ["09081000"];
newRiver[2].infoContent = "<h3>Catherine's Store II(III)</h3>" + "<p> Good beginner section with mainly Class II wave trains. However, there are a couple of diversion dams that may require Class III skills, depending on where you start this section. </p>" +  "<p><a href='http://www.riverbrain.com/run/show/97' target='_blank'> River Brains </a></p>"
newRiver[3] = new RiverSection ({lat: 39.331597,  lng: -106.983902}, "Lower Woody Creek Canyon", 'III(+)', 3.66, 'blue', 350, 5000);
newRiver[3].USGSsite = ["09081000", "09080400"];
newRiver[3].calcFlow = function () {
	this.curFlow = Number(this.flow[0]) - Number(this.flow[1]);
	};
newRiver[3].rockyLmt = 600;
newRiver[3].infoContent = "<h3>Lower Woody Creek Canyon (Toothache) III(+)</h3>" + "<p> The same general character continues from Upper Woody Creek, but the pace picks up a little and some of the rapids approach Class III+; at high-water, it's pushing a IV. Rafting companies in the area may refer to this section as 'The Upper Roaring Fork', but there is much more river above here. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1649/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/432' target='_blank'> River Brains </a></p>"
newRiver[4] = new RiverSection ({lat: 39.258553, lng: -106.882550}, "Upper Woody Creek Canyon", 'III', 3.33, 'blue', 350, 5000);
newRiver[4].USGSsite = ["09081000", "09080400"];
newRiver[4].calcFlow = function () {
	this.curFlow = Number(this.flow[0]) - Number(this.flow[1]);
	};
newRiver[4].rockyLmt = 600;
newRiver[4].infoContent = "<h3>Upper Woody Creek Canyon III</h3>" + "<p> This is a nice intermediate section of Class III rapids below Slaughterhouse. Rafting companies in the area may refer to this section as 'The Upper Roaring Fork', but there is much more river above here. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2138/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/431' target='_blank'> River Brains </a></p>"
newRiver[5] = new RiverSection ({lat: 39.211020, lng: -106.839517}, "Slaughterhouse", 'IV', 4.33, 'purple', 250, 3000);
newRiver[5].USGSsite = ["09076300"];
newRiver[5].rockyLmt = 500;
newRiver[5].infoContent = "<h3>Slaughterhouse IV</h3>" + "<p> Quality Class IV whitewater for most of the 4.5 miles, broken up by a 6ft waterfall near the start of the run. In comparison to the Numbers, Slaughter is more technical, more channeled, and more difficult. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/417/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/39' target='_blank'> River Brains </a></p>"
newRiver[6] = new RiverSection ({lat: 39.119473, lng: -106.722487}, "Upper Fork", 'V+', 5.66, 'black', 100, 1000);
newRiver[6].USGSsite = ["09073300"];
allRivers.push(newRiver);

// Castle Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.178128, lng: -106.840234}, "Castle Creek", 'IV+', 4.66, 'purple', 100, 1000);
newRiver[0].USGSsite = ["09075400"];
newRiver[0].infoContent +=  "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1666/' target='_blank'> American Whitewater </a></p>" + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks </a></p>";
allRivers.push(newRiver);

// Colorado River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.507178, lng: -109.660238}, "Cataract Canyon", 'II-IV', 4.00, 'purple', 2000, 100000);
newRiver[0].USGSsite = ["09180500", "09315000"];
newRiver[0].calcFlow = function () {
	if (this.flow[1] < 0 ) { 
		this.flow[1] = 0;}
	this.curFlow = Number(this.flow[0]) + Number(this.flow[1]);
	};
newRiver[0].infoContent = "<h3>Cataract Canyon II-IV</h3>" + "<p>Big water experience in an isolated canyon. There is a larger amount of flat water on this section. Some describe it as a mini Grand Canyon, but during runnoff (May and June), it can have bigger flows than the Grand. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1842/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/2' target='_blank'> River Brains </a></p>"
newRiver[1] = new RiverSection ({lat: 38.811041, lng: -109.305748}, "Moab Daily", 'II(III)', 2.66, 'green', 1500, 40000);
newRiver[1].USGSsite = ["09180500"];
newRiver[1].infoContent = "<h3>Moab Daily II(III)</h3>" + "<p>The whole section below Dewey Bridge to the town of Moab provides for year-round flows that are raftable with multiple access points. I love doing this section on a SUP; the big water here covers up rocks really well.  I prefer going from Onion Creek to Rocky Rapid on shorter days</p>" + "<p><a href='https://www.blm.gov/download/file/fid/7917' target='_blank'> BLM Map </a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1841/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/14' target='_blank'> River Brains </a></p>"
newRiver[2] = new RiverSection ({lat: 39.086950, lng: -109.101435}, "Westwater", 'III(IV)', 3.66, 'blue', 2000, 40000);
newRiver[2].USGSsite = ["09180500"];
newRiver[2].infoContent = "<h3>Westwater III(IV)</h3>" + "<p>Westwater is a classic western rafting trip through a desert canyon. Temperatures can be extremely hot in the summer, so early and especially late season is popular. The water is fed by multiple dams upriver on the Colorado, so the section is raftable year-round (feels a little boney below 3,000cfs). ~5 miles of Rapids are bracketed by flatwater above and below. It's no Grand Canyon, but the permit process can be competitive on weekends and toward the end of the season.</p>" + "<p><a href='https://www.blm.gov/basic/programs-recreation-passes-and-permits-lotteries-utah-westwater-canyon-private' target='_blank'> BLM Permit Process</a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1840/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/1' target='_blank'> River Brains </a></p>"
newRiver[3] = new RiverSection ({lat: 39.172892,  lng: -108.810343}, "Ruby Horsethief", 'II(III-)', 2.33, 'green', 2500, 40000);
newRiver[3].USGSsite = ["09163500"];
newRiver[3].infoContent = "<h3>Ruby and Horsethief Canyons II(III-)</h3>" + "<p>This is canyon that shares a lot of the beauty of Westwater, with some higher canyon walls but far less rapids. The section is close enough to Grand Junction and saw enough traffic that a permit is now required for overnight trips. The take-out for this section is actually the put-in for Westwater.</p>" + "<p><a href='https://www.recreation.gov/permits/Ruby_Horsethief_Canyon_Permits/r/wildernessAreaDetails.do?page=detail&contractCode=NRSO&parkId=74466' target='_blank'> BLM Permit Process</a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/381/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/21' target='_blank'> River Brains </a></p>"
newRiver[4] = new RiverSection ({lat: 39.055194, lng: -108.460822}, "Grand Junction Town", 'I(II)', 2.00, 'green', 1000, 30000);
newRiver[4].USGSsite = ["09163500"];
newRiver[4].infoContent = "<h3>Grand Junction Town I(II)</h3>" + "<p>This 'town' section runs all the way from Palisade to Loma with many access points along the way. I know there is a significant wave at 29 Road Bridge, but not sure if there are any other rapids of note in this section.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10520/' target='_blank'> American Whitewater </a></p>"
newRiver[5] = new RiverSection ({lat: 39.195873, lng: -108.265178}, "Big Sur", 'III', 3.33, 'blue', 18000, 25000);
newRiver[5].USGSsite = ["09095500"];
newRiver[5].infoContent = "<h3>Big Sur III</h3>" + "<p>There was a time when Big Sur was THE playwave in Colorado. Now that playparks have sprung up in many more locations around the state, the aura around Big Sur has diminished, but it's still a quality surf if you can catch the big water releases on the CO. The wave wakes up at 20k cfs, but really gets going at 25k. Yeah, that means it runs during a small window in the spring.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4261/' target='_blank'> American Whitewater </a></p>"
newRiver[6] = new RiverSection ({lat: 39.542649, lng: -107.645669}, "Rifle", 'II', 2.33, 'green', 1500, 25000);
newRiver[6].USGSsite = ["09095500"];
newRiver[6].infoContent = "<h3>Rifle II</h3>" + "<p>The section of river is mild from New Castle to DeBeque and has access points.</p>" + "<p><a href='http://www.riverbrain.com/run/show/353' target='_blank'> RIver Brains </a></p>";
newRiver[7] = new RiverSection ({lat: 39.565375, lng: -107.417396}, "New Castle", 'II(+)', 2.66, 'green', 1500, 25000);
newRiver[7].USGSsite = ["09085100"];
newRiver[7].infoContent = "<h3>Tibbet's II(III-)</h3>" + "<p>The section is mainly Class II with some possible Class III- holes and bridges.</p>" + "<p><a href='http://www.riverbrain.com/run/show/293' target='_blank'> RIver Brains </a></p>";
newRiver[8] = new RiverSection ({lat: 39.551103, lng: -107.333657}, "Glenwood Town", 'II(III)', 2.66, 'green', 1500, 25000);
newRiver[8].USGSsite = ["09085100"];
newRiver[8].infoContent = "<h3>Glenwood Town II(III)</h3>" + "<p>This town section can be combine with other section (down from Grizzly Creek or Cemetery). The section is mostly Class II but has enough big-water feeling Class III's, including Glenwood's Whitewater Park</p>" + "<p><a href='http://www.riverbrain.com/run/show/287' target='_blank'> RIver Brains (full section) </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/200' target='_blank'> RIver Brains (whitewater park) </a></p>";
newRiver[9] = new RiverSection ({lat: 39.560028, lng: -107.249825}, "Grizzly Creek", 'II(+)', 2.66, 'green', 300, 25000);
newRiver[9].USGSsite = ["09070500"];
newRiver[9].infoContent = "<h3>Grizzly Creek II(+)</h3>" + "<p>This is a very popular and scenic section through Glenwood Canyon. Some rapids turn into Class III at high water. Winds on that final stretch before town can be tough some afternoons.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5428/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/284' target='_blank'> RIver Brains </a></p>";
newRiver[10] = new RiverSection ({lat: 39.569364, lng: -107.227700}, "Shoshone", 'III(+)', 3.66, 'blue', 500, 20000);
newRiver[10].USGSsite = ["09070500"];
newRiver[10].infoContent = "<h3>Shoshone III(+)</h3>" + "<p>Shoshone is an extremely popular rafting section, especially in the late summer (after mid August). It' s a nice dose of Class III action in a neat 1 mile package with easy highway access. Since the Shoshone Powerplant has super senior water rights, a minimum 700 cfs flows here year-round, meaning that hardcore boaters will be here when other options are long since dry. I would avoid prime raft company launch times (I think that's 9am to Noon) on crazy weekend (Labor Day), but it's really not that crowded otherwise. Bike path also makes it possible to run bike shuttle on this short section.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4260/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/199' target='_blank'> RIver Brains </a></p>";
newRiver[11] = new RiverSection ({lat: 39.581908, lng: -107.200932}, "Barrel Springs", 'V-', 5.00, 'red', 1600, 20000);
newRiver[11].USGSsite = ["09070500"];
newRiver[11].infoContent = "<h3>Barrel Springs V-</h3>" + "<p>Just above Shoshone lies a beastly section of whitewater that varies significantly with water level. I've heard so many opinions from solid boaters on the harder and easier levels to run this section. There are sharp rocks, beefy holes, and long swims. The river-side bike path makes scouting easy. To put-in, hike below Upper Death at Hanging Lake exit or hike up with Shoshone powerplant.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/380/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/301' target='_blank'> RIver Brains </a></p>";
newRiver[12] = new RiverSection ({lat: 39.613985, lng: -107.138694}, "Bair Ranch", 'II', 2.33, 'green', 1600, 20000);
newRiver[12].USGSsite = ["09070500"];
newRiver[12].infoContent = "<h3>Dotsero to Bair Ranch II</h3>" + "<p> This is an easy section that is commonly tubed or SUP'ed. </p>" + "<p><a href='https://www.eaglecounty.us/OpenSpace/Documents/Upper_Colorado_River_Guide/' target='_blank'> Upper Colorado River Guide </a></p>";
newRiver[13] = new RiverSection ({lat: 39.758300, lng: -107.011646}, "Lyon's Gulch", 'II', 2.33, 'green', 1200, 20000);
newRiver[13].USGSsite = ["09060799"];
newRiver[13].infoContent = "<h3>Lyon's Gulch II</h3>" + "<p>An easy Class II section with quick access from I-70 and multiple access point. It's no wonder this section has grown in popularity in recent years.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5430/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/263' target='_blank'> RIver Brains </a></p>" + "<p><a href='https://www.eaglecounty.us/OpenSpace/Documents/Upper_Colorado_River_Guide/' target='_blank'> Upper Colorado River Guide </a></p>";
newRiver[14] = new RiverSection ({lat: 39.873653, lng: -106.897209}, "Burns", 'II(III)', 2.6, 'green', 500, 20000);
newRiver[14].USGSsite = ["09060799"];
newRiver[14].infoContent = "<h3>Burns Canyon II(III)</h3>" + "<p> This section of whitewater sees a little less traffic and does contain a couple of Class III rapids. Rodeo rapid, just below the town of Burns is most notable.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5430/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/263' target='_blank'> RIver Brains </a></p>" + "<p><a href='https://www.eaglecounty.us/OpenSpace/Documents/Upper_Colorado_River_Guide/' target='_blank'> Upper Colorado River Guide </a></p>";
newRiver[15] = new RiverSection ({lat: 39.891198, lng: -106.703837}, "State Bridge", 'II(+)', 2.66, 'green', 500, 20000);
newRiver[15].USGSsite = ["09060799"];
newRiver[15].infoContent = "<h3>State Bridge II(+)</h3>" + "<p> This is one of the busier section of river around route 131 and State Bridge, but is quick to access and has enough interesting Class II rapids to make it fun and interesting without being challenging. The flatwater in this section is not all that flat and shallow spots are not that shallow. Runs most of the year with dam controlled flow.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5427/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/291' target='_blank'> RIver Brains (first part)</a></p>" + "<p><a href='http://www.riverbrain.com/run/show/292' target='_blank'> RIver Brains (second part)</a></p>" + "<p><a href='https://www.eaglecounty.us/OpenSpace/Documents/Upper_Colorado_River_Guide/' target='_blank'> Upper Colorado River Guide </a></p>";
newRiver[16] = new RiverSection ({lat: 39.951661, lng: -106.557324}, "Pumphouse / Yarmony", 'II(III)', 2.66, 'green', 900, 20000);
newRiver[16].USGSsite = ["09058000"];
newRiver[16].infoContent = "<h3>Pumphouse II(III)</h3>" + "<p> This is a very popular section between Pumphouse and Rancho del Rio. It's pretty, has good access, summer-long flow, and the river road is away from the river through this whole section. Two Class III rapids sit in this section: Eye of the Needle below Pumphouse and Yarmony; both are situated in canyons in this section. This 14 mile stretch can be broken up by using the Radium boat ramp that is approximately in the middle.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/379/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/19' target='_blank'> River Brains </a></p>" + "<p><a href='https://www.eaglecounty.us/OpenSpace/Documents/Upper_Colorado_River_Guide/' target='_blank'> Upper Colorado River Guide </a></p>";
newRiver[17] = new RiverSection ({lat: 40.042844, lng: -106.395681}, "Gore Canyon", 'V', 5.00, 'red', 375, 2000);
newRiver[17].USGSsite = ["09058000"];
newRiver[17].infoContent = "<h3>Gore Canyon V</h3>" + "<p> This is THE expert run late and early season in Colorado. The dams upstream provide for runnable water for most of the year (March to November) and the rapids provide for no shortage of challenge. Most of the rapids are IV+ with some Class V, but the swims in some of these rapids can be nasty and rescue in this canyon will take a long time.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/378/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/18' target='_blank'> River Brains </a></p>" + "<p><a href='https://www.eaglecounty.us/OpenSpace/Documents/Upper_Colorado_River_Guide/' target='_blank'> Upper Colorado River Guide </a></p>";
newRiver[18] = new RiverSection ({lat: 40.074013,  lng: -106.107581}, "Byers Canyon", 'IV', 4.33, 'purple', 400, 4000);
newRiver[18].USGSsite = ["09034250"];
allRivers.push(newRiver);

// Fraser Canyon
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.997637, lng: -105.840966}, "Fraser Canyon", 'III+', 3.66, 'blue', 400, 4000);
newRiver[0].USGSsite = ["09033300"];
newRiver[0].infoContent +=  "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/395/' target='_blank'> American Whitewater </a></p>" + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks </a></p>";
allRivers.push(newRiver);

// Yampa
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.449791, lng: -108.521122}, "Yampa Canyon (Dinosaur)", 'III', 3.33, 'blue', 700, 25000);
newRiver[0].USGSsite = ["09260050"];
newRiver[0].infoContent +=  "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/437/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/10' target='_blank'> River Brain </a></p>"; 
// Cross Mountain Gorge
newRiver[1] = new RiverSection ({lat: 40.488997, lng: -108.326866}, "Cross Mountain Gorge", 'IV(V)', 4.33, 'purple', 700, 18000);
newRiver[1].USGSsite = ["09251000"];
newRiver[1].infoContent += "<p>This is a scenic run away from population centers, but can still attract good attention. The character varies greatly with flow; on the lower end (close to 700cfs cut-off) it's more Class III with some Class IV- spice; on the higher end, it's apparently a legit V. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/436/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/349' target='_blank'> River Brain </a></p>";
// Little Yampa Canyon
newRiver[2] = new RiverSection ({lat: 40.480690, lng: -107.613850}, "Little Yampa Canyon", 'II(III)', 2.66, 'green', 1000, 10000);
newRiver[2].USGSsite = ["09247600"];
newRiver[2].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10523/' target='_blank'> American Whitewater </a></p>";
// Steamboat Town
newRiver[3] = new RiverSection ({lat: 40.469358, lng: -106.829465}, "Steamboat Town", 'III-', 3.00, 'blue', 200, 6000);
newRiver[3].USGSsite = ["09239500"];
newRiver[3].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/435/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/202' target='_blank'> RIver Brain </a></p>";
// maybe add the flat water between Steamboat and Craig?
allRivers.push(newRiver);

// Gunnison
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.753431, lng: -108.079018}, "Delta to Junction", 'II', 2.33, 'green', 800, 20000);
newRiver[0].USGSsite = ["09144250"];
newRiver[0].infoContent = "<h3>Delta Down (Escalante Canyon) II</h3>" + "<p>This is a very pretty stretch of river that has some rising canyon walls that remind me of the Moab Daily Section. The rapids are not very interesting, so enjoy the float and the side hikes. Runs late and early thanks to the dams above.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10564/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/268' target='_blank'> River Brains </a></p>";
// maybe break this down 
newRiver[1] = new RiverSection ({lat: 38.635434, lng: -107.855353}, "Gunny Gorge", 'III', 3.33, 'blue', 650, 10000);
newRiver[1].USGSsite = ["09128000"];
newRiver[1].infoContent = "<h3>Gunny Gorge III(IV-)</h3>" + "<p>This is a gorgeous run away from civilization and great adventure. You have to take a gnarly road into a 1.25 mile hike to the river. You can hire donkeys to carry your gear, but its not cheap. The rapids are mainly pool-drop Class III, but a couple of the more difficult ones approach Class IV. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/402/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/181' target='_blank'> River Brains </a></p>";
newRiver[2] = new RiverSection ({lat: 38.527945, lng: -107.649284}, "Black Canyon", 'V', 5.33, 'red', 600, 3000);
newRiver[2].USGSsite = ["09128000"];
newRiver[2].infoContent = "<h3>Black Canyon of the Gunnison V</h3>" + "<p>In a state full of roadside access, The Black Canyon is a great expedition away from that norm. This is at least a 2 day journey and requires some serious portaging aound some unrunnable stuff.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/401/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/384' target='_blank'> River Brains </a></p>";
newRiver[3] = new RiverSection ({lat: 38.664189, lng: -106.846218}, "Gunny Town", 'II(III)', 2.66, 'green', 700, 3000);
newRiver[3].USGSsite = ["09114500"];
newRiver[3].infoContent = "<h3>Gunny Town II(III)</h3>" + "<p>An easy run through town with some whitewater park features.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/400/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/37' target='_blank'> River Brains </a></p>";
allRivers.push(newRiver);

// Dolores // 
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.680789, lng: -108.980852}, "Gateway", 'II+(IV)', 3.00, 'blue', 1000, 4000);
newRiver[0].USGSsite = ["09180000"];

newRiver[1] = new RiverSection ({lat: 38.310032, lng: -108.886065}, "Paradox and Mesa Canyons", 'II(+)', 2.33, 'green', 800, 10000);
newRiver[1].USGSsite = ["09171100"];
newRiver[2] = new RiverSection ({lat: 38.030211, lng: -108.884927}, "Slickrock to Bedrock", 'II(III)', 2.33, 'green', 1000, 10000);
newRiver[2].USGSsite = ["09168730"];
newRiver[3] = new RiverSection ({lat: 37.793982, lng: -108.826788}, "Dove Creek to Slickrock", 'III(IV)', 3.33, 'blue', 500, 5000);
newRiver[3].USGSsite = ["09168730"];
newRiver[4] = new RiverSection ({lat: 37.656449, lng: -108.735875}, "Bradfield to Dove Creek", 'II(III)', 2.66, 'green', 800, 5000);
newRiver[4].USGSsite = ["09168730"];
newRiver[5] = new RiverSection ({lat: 37.697538, lng: -108.031071}, "Upper Dolores", 'III', 3.33, 'blue', 700, 5000);
newRiver[5].USGSsite = ["09165000"];
allRivers.push(newRiver);

// Crystal River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.318720, lng: -107.209698}, "Avalanche to BRB", 'III', 3.33, 'blue', 500, 5000);
newRiver[0].USGSsite = ["09081600"];
newRiver[1] = new RiverSection ({lat: 39.232068,  lng: -107.227308}, "Narrows", 'IV+', 4.66, 'red', 500, 2000);
newRiver[1].USGSsite = ["09081600"];
newRiver[2] = new RiverSection ({lat: 39.181541, lng: -107.240128}, "Meatgrinder", 'V+', 5.66, 'black', 500, 1200);
newRiver[2].USGSsite = ["09081600"];
newRiver[3] = new RiverSection ({lat: 39.085303, lng: -107.242471}, "Bogan Canyon", 'IV-', 4.00, 'purple', 500, 3000);
newRiver[3].USGSsite = ["09081600"];
newRiver[4] = new RiverSection ({lat: 39.069314, lng: -107.180769}, "Crystal Gorge", 'V+', 5.66, 'black', 150, 400);
newRiver[4].USGSsite = ["09081600"];
newRiver[4].infoContent = "<h3>Crystal Gorge V+</h3>" + "<p>Hairy, droppy, steep creeking that runs mid-summer (too high before then). Good luck.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1317/' target='_blank'> American Whitewater </a></p>"
newRiver[5] = new RiverSection ({lat: 39.059319, lng: -107.104082}, "Crystal Mill", 'III-IV(V)', 4.33, 'purple', 1000, 3000);
newRiver[5].USGSsite = ["09081600"];
allRivers.push(newRiver);

// Mineral Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.820214, lng: -107.719300}, "Mineral Creek Silverton", 'V', 5.33, 'red', 100, 300);
newRiver[0].USGSsite = ["09359010"];
newRiver[0].infoContent = "<h3>Mineral Creek Silverton V</h3>" + "<p>Many sections of this creek are runnable above Silverton. The access is mainly along the road, so you can scout.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/6569/' target='_blank'> American Whitewater </a></p>"
allRivers.push(newRiver);

// Lake Fork Gunnison
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.322851, lng: -107.225846}, "Red Bridge to Gateview", 'III(IV)', 3.66, 'blue', 500, 2500);
newRiver[0].USGSsite = ["09124500"];
newRiver[1] = new RiverSection ({lat: 38.246650, lng: -107.259368}, "The Gate to Red Bridge", 'II', 2.33, 'green', 500, 2500);
newRiver[1].USGSsite = ["09124500"];
newRiver[2] = new RiverSection ({lat: 38.126769, lng: -107.289370}, "The Gate to Red Bridge", 'II-III', 3.00, 'blue', 500, 2500);
newRiver[2].USGSsite = ["09124500"];
newRiver[3] = new RiverSection ({lat: 38.035287, lng: -107.309697}, "Lake City Town", 'III', 3.33, 'blue', 300, 2000);
newRiver[3].USGSsite = ["09124500"];
newRiver[3].infoContent = "<h3>Lake City Town III</h3>" + "<p>A 3.5 mile run through town with Class III rapids and waves.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/406/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Taylor River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.814946, lng: -106.611307}, "Taylor Canyon", 'III-IV', 4.00, 'Purple', 400, 3000);
newRiver[0].USGSsite = ["09110000"];
newRiver[0].infoContent = "<h3>Taylor Canyon III-IV</h3>" + "<p>With the Taylor Reservior feeding this section, it stays running most of the year.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/428/' target='_blank'> American Whitewater (both Taylor River Sections) </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/339' target='_blank'> River Brains </a></p>";
newRiver[1] = new RiverSection ({lat: 38.723223, lng: -106.773656}, "Lower Taylor River", 'II(III)', 3.00, 'blue', 400, 3000);
newRiver[1].USGSsite = ["09110000"];
newRiver[1].infoContent = "<h3>Lower Taylor River II(III)</h3>" + "<p>Runs most of the year</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/428/' target='_blank'> American Whitewater (both Taylor River Sections) </a></p>";
allRivers.push(newRiver);

// North Platte
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.979162, lng: -106.346821}, "Northgate Canyon", 'II-III', 3.33, 'blue', 400, 3000);
newRiver[0].USGSsite = ["06620000"];
newRiver[0].infoContent = "<h3>Northgate Canyon</h3>" + "<p>Wilderness run that is more popular for fishing than whitewater.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2464/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/38' target='_blank'> River Brains </a></p>"
allRivers.push(newRiver);

// North Fork of the Gunnison
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.939696, lng: -107.358488}, "North Fork Gunnison", 'III', 3.33, 'blue', 600, 10000);
newRiver[0].USGSsite = ["09132500"];
allRivers.push(newRiver);

// Clear Creek
var newRiver = [];
/* I don't know these sections and gauges well enough
var loveland = new RiverSection ({lat: 39.680788, lng: -105.894787}, "Loveland", 'IV(V+)', 4.66, 'purple', 160, 1000);
loveland.USGSsite = "06715000";
var silverPlume = new RiverSection ({lat: 39.680788, lng: -105.894787}, "Silver Plume", 'V+', 5.66, 'black', 100, 500);
loveland.USGSsite = "06715000";
*/
newRiver[0] = new RiverSection ({lat: 39.763006, lng: -105.637503}, "Dumont", 'III-IV', 4.00, 'purple', 250, 1500);
newRiver[0].USGSsite = ["06716500"];
newRiver[0].infoContent = "<h3>Dumont III-IV</h3>" + "<p>Excellent run that is urban - it parallels I-70 from Lawson into Idaho Springs. The benefit of being an urbn run is that the section contains multiple access points along.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2819/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/217' target='_blank'> River Brains </a></p>"
newRiver[1] = new RiverSection ({lat: 39.741569, lng: -105.514331}, "Kermit's", 'IV', 4.33, 'purple', 250, 1000);
newRiver[1].USGSsite = ["06716500"];
newRiver[1].infoContent = "<h3>Kermit's (Upper Clear Creek) IV</h3>" + "<p>For as close as this run is to major highways, it does not have the urban feel of other Clear Creek section. Most call this 'Upper Clear Creek', but that seems crazy to me, as their is a ton of Clear Creek above this that is run or could be run. It does have a few access points, and I have run it from Idaho Springs to Black Rock.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4257/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/213' target='_blank'> River Brains </a></p>"
newRiver[2] = new RiverSection ({lat: 39.738213, lng: -105.389296}, "Black Rock", 'V', 5.00, 'red', 450, 1000);
newRiver[2].USGSsite = ["06719505"];
newRiver[2].infoContent = "<h3>Black Rock IV-V (V+)</h3>" + "<p>The steepest and most technical section of Clear Creek that is commonly run. The run is mostly Class IV with two Class V's and one Class V+.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3361/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/230' target='_blank'> River Brains </a></p>"
newRiver[3] = new RiverSection ({lat: 39.743679, lng: -105.297414}, "Lower Clear Creek", 'IV', 4.33, 'purple', 350, 1000);
newRiver[3].USGSsite = ["06719505"];
newRiver[3].infoContent = "<h3>Lower Clear Creek IV</h3>" + "<p>This is the last bit of good gradient on Clear Creek before it reaches the front range and flattens out. The rocks on this section are sharp and definitely unkind to a swimmer or upside-down boater.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/376/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/211' target='_blank'> River Brains </a></p>"
newRiver[4] = new RiverSection ({lat: 39.754238, lng: -105.230308}, "Golden Whitewater Park", 'II+', 2.66, 'green', 100, 1500);
newRiver[4].USGSsite = ["06719505"];
newRiver[4].infoContent = "<h3>Golden Whitewater Park II+</h3>" + "<p>Play park in Golden. I don't know much about it so check-out what River Brains says.</p>" + "<p><a href='http://www.riverbrain.com/run/show/35' target='_blank'> River Brains </a></p>"
allRivers.push(newRiver);

// Piney River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.710205, lng: -106.421944}, "Piney River", 'V+', 5.66, 'black', 100, 1000);
newRiver[0].USGSsite = ["09059500"];
allRivers.push(newRiver);

// Green
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.908926, lng: -109.422150}, "Flaming Gorge", 'II', 2.33, 'green', 200, 10000);
newRiver[0].USGSsite = ["09234500"];
newRiver[0].infoContent = "<h3>Flaming Gorge II</h3>" + "<p>Mellow and scenic float on damn controlled water flow.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1852/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/113' target='_blank'> River Brains </a></p>";
// https://www.americanwhitewater.org/content/River/detail/id/1852/#main
newRiver[1] = new RiverSection ({lat: 40.723469, lng: -108.888371}, "Lodore Canyon", 'II-III', 3.33, 'blue', 300, 5000);
newRiver[1].USGSsite = ["09234500"];
newRiver[1].infoContent = "<h3>Lodore Canyon II-III</h3>" + "<p><a href='https://www.recreation.gov/permits/Dinosaur_National_Monument_Green_And_Yampa_Lottery/r/wildernessAreaDetails.do?page=detail' target='_blank'> Competitive Permit Process </a></p>" + "<p>This is a classic overnight rafting trip of the American West; it's a gorgeous canyon with friendly rapids. Good luck getting a permit.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/399/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/4' target='_blank'> River Brains </a></p>";
newRiver[2] = new RiverSection ({lat: 40.520300, lng: -108.989360}, "Whirlpool and Split Mountain Canyons", 'II-III', 3.33, 'blue', 300, 5000);
newRiver[2].USGSsite = ["09261000"];
newRiver[2].infoContent = "<h3>Whirlpool and Split Mountain Canyons II-III</h3>" + "<p>Often run in combination with Lodore Canyon (Green River) or Yampa Canyon</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1853/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/114' target='_blank'> River Brains </a></p>";
newRiver[3] = new RiverSection ({lat: 40.084475, lng: -109.677111}, "Desolation and Gray Canyons", 'II-III', 3.33, 'blue', 900, 50000);
newRiver[3].USGSsite = ["09315000"];
newRiver[3].infoContent = "<h3>Desolation and Gray Canyons II-III</h3>" + "<p>Long stretch of beautiful river without serious rapids.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1854/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/5' target='_blank'> River Brains </a></p>";
newRiver[4] = new RiverSection ({lat: 38.994512, lng: -110.143939}, "Labyrinth and Stillwater Canyons", 'I-II', 2.00, 'green', 1000, 50000);
newRiver[4].USGSsite = ["09315000"];
newRiver[4].infoContent = "<h3>Labrinth and Stillwater Canyons I-II</h3>" + "<p>Flat stretch of river before the confluence with the Colorado.</P>" + "<p><a href='http://www.riverbrain.com/run/show/109' target='_blank'> River Brains </a></p>";
allRivers.push(newRiver);

// White
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.092992, lng: -108.815923}, "Rangeley to Bonanza Bridge", 'II', 2.33, 'green', 250, 5000);
newRiver[0].USGSsite = ["09306290"];
newRiver[0].infoContent = "<h3>Rangeley to Bonanza Bridge II</h3>" + "<p>Long stretch of river that I don't know much about. There are more stretches of river above this that seem to be runnable, but I will have to research more before adding those sections.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/430/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/16' target='_blank'> River Brains </a></p>";
newRiver[1] = new RiverSection ({lat: 40.043918, lng: -107.496541}, "North Fork White River", 'III', 3.33, 'blue', 1000, 5000);
newRiver[1].USGSsite = ["09306290"];
newRiver[1].infoContent = "<h3>North Fork White River III</h3>" + "<p>This Class III section is above the confluence with the South Fork, but we are using the data from the combine flow, so it may not be accurate for this section.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/431' target='_blank'> American Whitewater </a></p>";
newRiver[2] = new RiverSection ({lat: 39.933909, lng: -107.562794}, "Lower South Fork White River", 'III-IV', 3.33, 'blue', 1500, 5000);
newRiver[2].USGSsite = ["09306290"];
newRiver[2].infoContent = "<h3>Lower South Fork White River III-IV</h3>" + "<p>This Class III-IV section is above the confluence with the North Fork, but we are using the data from the combine flow, so it may not be accurate for this section.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/432' target='_blank'> American Whitewater </a></p>";
newRiver[3] = new RiverSection ({lat: 39.843986, lng: -107.339735}, "Upper South Fork White River", 'V+', 5.66, 'black', 1500, 5000);
newRiver[3].USGSsite = ["09306290"];
newRiver[3].infoContent = "<h3>Upper South Fork White River V+</h3>" + "<p>This Class V+ section is above the confluence with the North Fork, but we are using the data from the combine flow, so it may not be accurate for this section. The shuttle for the supper section is long; see 'Colorado Rivers and Creeks' for details.</P>";
allRivers.push(newRiver);

// San Miguel
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.947171, lng: -107.919865}, "Sawpit", 'III', 3.33, 'blue', 250, 5000);
newRiver[0].USGSsite = ["09172500"];
// https://www.americanwhitewater.org/content/River/detail/id/3367/
newRiver[1] = new RiverSection ({lat: 37.967133, lng: -107.971078}, "San Miguel Canyon", 'III', 3.33, 'blue', 250, 3000);
newRiver[1].USGSsite = ["09172500"];
// https://www.americanwhitewater.org/content/River/detail/id/3342/#main
newRiver[2] = new RiverSection ({lat: 38.030802, lng: -108.110978}, "Specie to Beaver", 'II(+)', 2.66, 'green', 250, 3000);
newRiver[2].USGSsite = ["09172500"];
// https://www.americanwhitewater.org/content/River/detail/id/10678/#main
newRiver[3] = new RiverSection ({lat: 38.125860,  lng: -108.207950}, "Norwood Canyon", 'III', 3.33, 'blue', 250, 3000);
newRiver[3].USGSsite = ["09174600"];
// https://www.americanwhitewater.org/content/River/detail/id/422/#main
newRiver[4] = new RiverSection ({lat: 38.265923,  lng: -108.401956}, "Ledges", 'III', 3.33, 'blue', 250, 3000);
newRiver[4].USGSsite = ["09174600"];
// https://www.americanwhitewater.org/content/River/detail/id/422/#main
newRiver[5] = new RiverSection ({lat: 38.254710, lng: -108.613891}, "Uranvan Canyon", 'I-II', 2.00, 'green', 250, 3000);
newRiver[5].USGSsite = ["09177000"];
// https://www.americanwhitewater.org/content/River/detail/id/10895/
allRivers.push(newRiver);

// Animas
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.879649, lng: -107.565815 }, "Forks of the Animas", 'II', 2.33, 'green', 150, 2000);
newRiver[0].USGSsite = ["09358000"];
// https://www.americanwhitewater.org/content/River/detail/id/6559/
newRiver[1] = new RiverSection ({lat: 37.835283,  lng: -107.598798}, "Silverton Daily", 'III', 3.33, 'blue', 150, 2000);
newRiver[1].USGSsite = ["09359020"];
newRiver[1].infoContent = "<h3>Silverton Daily III</h3>" + "<p>The daily is just above town into Silverton.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/6560/' target='_blank'> American Whitewater </a></p>";
newRiver[2] = new RiverSection ({lat: 37.678604, lng: -107.665780}, "Upper Animas", 'IV-V', 4.66, 'purple', 300, 2000);
newRiver[2].USGSsite = ["09359020"];
newRiver[2].infoContent = "<h3>Upper Animas IV-V-</h3>" + "<p>Quality Class IV whitewater over a 24 mile stretch with some Class V- thrown in for good measure.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/346/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/355' target='_blank'> River Brains </a></p>";
newRiver[3] = new RiverSection ({lat: 37.525092, lng: -107.783351}, "Rockwood Box", 'IV-V', 5.00, 'red', 300, 2000);
newRiver[3].USGSsite = ["09359020"];
newRiver[3].infoContent = "<h3>Rockwood Box IV-V</h3>" + "<p>Rockwood Box is often paddled as a continuation of the Upper Animas that is more challenging. If you miss the take-out, you wind up in the much more challenging Baker's Box.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/347/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/150' target='_blank'> River Brains </a></p>";
newRiver[4] = new RiverSection ({lat: 37.490722, lng: -107.792575}, "Baker's Box (Lower Rockwood)", 'V+', 5.66, 'black', 400, 1400);
newRiver[4].USGSsite = ["09359500"];
newRiver[4].infoContent = "<h3>Baker's Box (Lower Rockwood) V+</h3>" + "<p>Baker's Box often referred to as the unrunnable gorge, but a trail below the portage has lead to more people running it. Please get local intel before running this section.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4530/' target='_blank'> American Whitewater </a></p>";
newRiver[5] = new RiverSection ({lat: 37.458574, lng: -107.799368}, "Baker's Bridge", 'II', 2.00, 'green', 500, 4000);
newRiver[5].USGSsite = ["09361500"];
newRiver[5].infoContent = "<h3>Baker's Bridge II</h3>" + "<p>Below the box and above town, the Animas tames out. This is a good float section.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/348/' target='_blank'> American Whitewater </a></p>";
newRiver[6] = new RiverSection ({lat: 37.385281, lng: -107.837268}, "Trimble Lane to 32nd Street Park", 'II', 2.00, 'green', 500, 4000);
newRiver[6].USGSsite = ["09361500"];
newRiver[6].infoContent = "<h3>Trimble Lane to 32nd Street Park II</h3>" + "<p>This is a popular sectiont to float above the town run, where there is some more action.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/349/' target='_blank'> American Whitewater </a></p>";
newRiver[7] = new RiverSection ({lat: 37.300027, lng: -107.869182}, "Durango Town", 'III', 3.00, 'blue', 500, 6000);
newRiver[7].USGSsite = ["09361500"];
newRiver[7].rockyLmt = 1000;
newRiver[7].infoContent = "<h3>Durango Town III</h3>" + "<p>The town run has some rapids and playwaves. Enjoy year-round.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/351/' target='_blank'> American Whitewater (good description)</a></p>" + "<p><a href='http://www.riverbrain.com/run/show/22' target='_blank'> River Brains </a></p>";
newRiver[8] = new RiverSection ({lat: 37.236099, lng: -107.868391}, "Purple Cliffs", 'II-III', 3.00, 'blue', 1000, 6000);
newRiver[8].USGSsite = ["09361500"];
newRiver[8].infoContent = "<h3>Purple Cliffs II-III</h3>" + "<p>You could keep running the Animas below Durango for most of the year.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/352/' target='_blank'> American Whitewater </a></p>";
newRiver[9] = new RiverSection ({lat: 36.932932, lng: -107.893917}, "Cedar Hills to Farmington", 'I-II', 2.33, 'green', 500, 6000);
newRiver[9].USGSsite = ["09364500"];
newRiver[9].infoContent = "<h3>Cedar Hills to Farmington II</h3>" + "<p>Floaty with late-season flows.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/352/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://southwestpaddler.com/docs/sanjuannm3.html' target='_blank'> Southwest Paddler </a></p>";
newRiver[10] = new RiverSection ({lat: 36.734811, lng: -108.172923}, "Farmington Whitewater Park", 'II+', 3.00, 'blue', 200, 6000);
newRiver[10].USGSsite = ["09364500"];
newRiver[10].infoContent = "<h3>Farmington Whitewater Park II+</h3>" + "<p>A couple of in-town waves</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3186' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Piedra
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.456942, lng: -107.198080}, "Piedra Upper Box", 'II(IV)', 4.00, 'purple', 550, 4000);
newRiver[0].USGSsite = ["09349800"];
//https://www.americanwhitewater.org/content/River/detail/id/409/
newRiver[1] = new RiverSection ({lat: 37.353419, lng: -107.323672}, "Piedra First Box", 'III-V', 4.66, 'purple', 400, 3500);
newRiver[1].USGSsite = ["09349800"];
// https://www.americanwhitewater.org/content/River/detail/id/410/
newRiver[2] = new RiverSection ({lat: 37.241938, lng: -107.342072}, "Lower Piedra", 'II-III', 3.00, 'blue', 400, 4000);
newRiver[2].USGSsite = ["09349800"];
// https://www.americanwhitewater.org/content/River/detail/id/411/
allRivers.push(newRiver);

// San Juan
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.269805, lng: -106.995685}, "Mesa Canyon", 'II-III', 2.66, 'green', 800, 3500);
newRiver[0].USGSsite = ["09342500"];
// https://www.americanwhitewater.org/content/River/detail/id/420/
newRiver[1] = new RiverSection ({lat: 36.805753, lng: -107.699250}, "Navajo Dam to Four Corners", 'II', 2.33, 'green', 500, 20000);
newRiver[1].USGSsite = ["09342500"];
newRiver[1].infoContent = "<h3>Navajo Dam to Four Corners II</h3>" + "<p>Long float trip that is dam-controlled and avaialble much of the year.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1233/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://southwestpaddler.com/docs/sanjuannm2.html' target='_blank'> Southwest Paddler </a></p>";
newRiver[2] = new RiverSection ({lat: 37.262101, lng: -109.611905}, "Upper San Juan", 'II', 2.33, 'green', 500, 8000);
newRiver[2].USGSsite = ["09379500"];
newRiver[2].infoContent = "<h3>Upper San Juan II</h3>" + "<p>Beautiful section to float that runs on damn control for much of the year. Permit Necessary </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1871/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/12' target='_blank'> River Brains </a></p>" + "<p><a href='https://www.recreation.gov/permits/San_Juan_River_Permit_Lottery_And_Reservations/r/wildernessAreaDetails.do?page=detail&contractCode=NRSO&parkId=75510' target='_blank'> Permit Process </a></p>";
newRiver[3] = new RiverSection ({lat: 37.146478, lng: -109.854820}, "Lower San Juan", 'II(III)', 2.66, 'green', 500, 8000);
newRiver[3].USGSsite = ["09379500"];
newRiver[3].infoContent = "<h3>Lower San Juan II(III)</h3>" + "<p>Beautiful section to float that runs on damn control for much of the year. A little more rapids than the section above. Permit Necessary </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3558' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/15' target='_blank'> River Brains </a></p>" + "<p><a href='https://www.recreation.gov/permits/San_Juan_River_Permit_Lottery_And_Reservations/r/wildernessAreaDetails.do?page=detail&contractCode=NRSO&parkId=75510' target='_blank'> Permit Process </a></p>";
allRivers.push(newRiver);


// Uncompahgre River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.019729, lng: -107.675381}, "Uncompahgre Gorge", 'IV-V(+)', 5.33, 'red', 200, 600);
newRiver[0].USGSsite = ["09146020"];
newRiver[0].infoContent = "<h3>Uncompahgre Gorge IV-V(+)</h3>" + "<p> A good stretch of action below the town of Ouray</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5769/' target='_blank'> American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 38.151996, lng: -107.752247}, "Town Run", 'II-III', 2.66, 'green', 500, 2500);
newRiver[1].USGSsite = ["09146200"];
// https://www.americanwhitewater.org/content/River/detail/id/5180/
newRiver[2] = new RiverSection ({lat: 38.287858, lng: -107.763330}, "Billy Creek ", 'II(III)', 2.33, 'green', 400, 2000);
newRiver[2].USGSsite = ["09147500"];
newRiver[2].infoContent = "<h3>Billy Creek II(III)</h3>" + "<p> Mellow stretch of river on the lower part of Uncompahgre.</p>" + "<p><a href='// https://www.americanwhitewater.org/content/River/detail/id/10679/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// East River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.952082, lng: -106.989236}, "Upper East", 'IV', 4.33, 'purple', 600, 3000);
newRiver[0].USGSsite = ["09112200"];
allRivers.push(newRiver);

// Cimarron
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.259793, lng: -107.545924}, "Big Cimarron", 'V+', 5.66, 'black', 500, 1200);
newRiver[0].USGSsite = ["09126000"];
// https://www.americanwhitewater.org/content/River/detail/id/3547/
newRiver[1] = new RiverSection ({lat: 38.437434, lng: -107.549622}, "Lower Cimarron", 'V', 5.33, 'red', 400, 2000);
newRiver[1].USGSsite = ["09126000"];
// https://www.americanwhitewater.org/content/River/detail/id/3445/
allRivers.push(newRiver);

// South Fork of the Crystal River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.047501, lng: -107.077000}, "Devil's Punchbowls", 'V+', 5.66, 'black', 250, 500);
newRiver[0].USGSsite = ["09081600"];
newRiver[0].infoContent = "<h3>Devil's Punchbowls V+</h3>" + "<p>Roadside gnar access in an area that has no shortage of gnar. Hang on and good luck!</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4234/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/411' target='_blank'> River Brains </a></p>";
allRivers.push(newRiver);

// Fish Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.481963, lng: -106.772117}, "Upper Fish Creek", 'V', 5.33, 'red', 250, 1000);
newRiver[0].USGSsite = ["09238900"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4776/' target='_blank'> American Whitewater </a></p>";
// page 264 CRC
newRiver[1] = new RiverSection ({lat: 40.474350, lng: -106.789679}, "Lower Fish Creek", 'IV-V', 4.66, 'red', 250, 1000);
newRiver[1].USGSsite = ["09238900"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4777/' target='_blank'> American Whitewater </a></p>";
// page 264 CRC
allRivers.push(newRiver);

// North Fork Fish Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.5045851, lng: -106.7409388}, "North Fork Fish Creek", 'V+', 5.66, 'red', 250, 1000);
newRiver[0].USGSsite = ["09238900"];
newRiver[0].infoContent += "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 265</a></p>";
allRivers.push(newRiver);

// Woods Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.765659, lng: -105.818841}, "Woods Creek", 'V', 5.33, 'red', 200, 400);
newRiver[0].USGSsite = ["06716100"];
// https://www.americanwhitewater.org/content/River/detail/id/4112/
allRivers.push(newRiver);

// Frying Pan
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.380145, lng: -106.969307}, "Lower Frying Pan", 'IV', 4.33, 'purple', 200, 1500);
newRiver[0].USGSsite = ["09080400"];
newRiver[0].rockyLmt = 450;
newRiver[0].infoContent = "<h3>Lower Frying Pan IV</h3>" + "<p>Below Ruedi Reservoir and above the confluence with the Roaring Fork, there is a section of the Frying Pan that many people run. This river is better known for the fishing and the river flows are much better for that as well, but this can be a solid run at good flows. Watch out for deadfall in the river. I'm not sure if the American WW has the right lower limit for this run (200cfs), but that's for you to investigate.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4234/' target='_blank'> American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 39.326335, lng: -106.655712}, "Upper Frying Pan", 'IV-V', 5.00, 'red', 300, 750);
newRiver[1].USGSsite = ["FRYTHOCO"];
newRiver[1].infoContent = "<h3>Upper Frying Pan IV-V</h3>" + "<p>A good, short run above Ruedi Reservoir that may struggle to get enough water because of the high diversions to the Arkansas River Basin. </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2740/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Williams Fork
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.899974, lng: -106.095202}, "Williams Fork", 'II-IV', 4.00, 'purple', 200, 1500);
newRiver[0].USGSsite = ["09037500"];
newRiver[0].infoContent = "<h3>Williams Fork II-IV</h3>" + "<p>See 'A Floaters Guide to Colorado' for more information on this section.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/433' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Vallecito Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.477269, lng: -107.544402}, "Vallecito Creek", 'V+', 5.66, 'black', 145, 650);
newRiver[0].USGSsite = ["09037500"];
newRiver[0].infoContent = "<h3>Vallecito Creek V+</h3>" + "<p>This steep 1-mile section of creek can be phenomenal for the boater that has the skill. The creek does require you to hike up 1 mile to do the run (earn your turns). 'Colorado Rivers and Creeks' and 'Whitewater of the Southern Rockies' give excellent details on this run.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3452' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// North Fork of the Cache la Poudre
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.786760, lng: -105.252696}, "Livermore Bridge", 'II-III', 3.00, 'blue', 200, 1000);
newRiver[0].USGSsite = ["06751490"];
newRiver[0].infoContent = "<h3>Livermore Bridge II-III</h3>" + "<p>Rarely has a lot of water and is often ignored for the main stem of the Poudre, the North Fork can be fun when it's running. </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2822' target='_blank'> American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 40.894649, lng: -105.565625}, "Upper North Fork of the Poudre", 'IV(+)', 4.33, 'purple', 200, 1000);
newRiver[1].USGSsite = ["06751490"];
newRiver[1].infoContent = "<h3>Upper North Fork of the Poudre IV(+)</h3>" + "<p>Has a lot of details to be worked out on logistics and avoiding tespassing charges. We recommend you ready up before heading out there (See American Whitewater and CRC book). Also, the flow we are using to determine if this is runnable is only good when when Halligan Reservoir is full.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2822' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Plateau Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.188550, lng: -108.082540}, "Plateau Creek", 'III-IV', 3.66, 'blue', 200, 1200);
newRiver[0].USGSsite = ["09105000"];
newRiver[0].rockyLmt = 300;
newRiver[0].infoContent = "<h3>Plateau Creek III-IV</h3>" + "<p>Early season run down from the Grand Mesa.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4264/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// North Fork of the Crystal
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.073469, lng: -107.087766}, "North Fork of the Crystal River", 'VI', 5.66, 'black', 400, 1200);
newRiver[0].USGSsite = ["09081600"];
newRiver[0].infoContent = "<h3>North Fork of the Crystal River VI</h3>" + "<p>Like much of the creeks in this basin, the North Fork is intense. May the Force be with you.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1615/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/410' target='_blank'> River Brains </a></p>" ;
allRivers.push(newRiver);

// Purgatoire River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.696613, lng: -103.528933}, "Purgatoire River", 'I-V', 4.00, 'purple', 200, 4000);
newRiver[0].USGSsite = ["07126485"];
newRiver[0].infoContent = "<h3>Purgatoire River I-V</h3>" + "<p>Not very well known and rarely paddled, we think this 100 mile stretch could be shortened a little, but most of the stretch is far from roads. Since the stretch is 100 miles, you see a lot of different rapids and flatwater.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/413/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Rio Santa Cruz
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 35.965386, lng: -105.904610}, "Rio Santa Cruz", 'IV+', 4.66, 'purple', 100, 300);
newRiver[0].USGSsite = ["08291000"];
newRiver[0].infoContent = "<h3>Rio Santa Cruz IV+</h3>" + "<p>Great 1-mile run with a mile of flatwater after.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2478/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Rio Pueblo
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 36.380194, lng: -105.662530}, "Rio Pueblo", 'V+', 5.66, 'black', 200, 1800);
newRiver[0].USGSsite = ["08291000"];
newRiver[0].infoContent = "<h3>Rio Pueblo V+</h3>" + "<p>Dropping off the plateau and down to the Rio Grande, this section is intense, particularly the last mile.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3598/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Red River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 36.683849, lng: -105.652053}, "Red River", 'IV+', 4.66, 'purple', 150, 1000);
newRiver[0].USGSsite = ["08265000"];
newRiver[0].infoContent = "<h3>Rio Pueblo IV+</h3>" + "<p>Great Class IV run for 3.5 miles and then a hike out or paddle another 8 miles on the Rio Grande.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3594/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// North Fork of the Virgin River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.378217, lng: -112.848226}, "Zion Narrows", 'III-IV', 4.00, 'purple', 150, 600);
newRiver[0].USGSsite = ["09405500"];
newRiver[0].infoContent = "<h3>Zion Narrows III-IV</h3>" + "<p>Committed run on through the classic hiking area. Need to get a permit, which is granted from Zion National Park when flows are between 150 and 600 cfs.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/6819' target='_blank'> American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 37.284774, lng: -112.947673}, "Zion National Park: Temple of Sinewava", 'II(+)', 2.66, 'green', 150, 600);
newRiver[1].USGSsite = ["09405500"];
newRiver[1].infoContent = "<h3>Zion National Park: Temple of Sinewava II(+)</h3>" + "<p>A great way to see Zion National Park and Zion Canyon. You need to get a permit from Zion National Park (when flows are over 150cfs) and you can run shuttle with the bus system. This first section in the upper part of the park is more a meandering </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1880/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://virginriver.info/guide/guidetemple.htm' target='_blank'> Virgin River Runners Coalition </a></p>";;
newRiver[2] = new RiverSection ({lat: 37.237635, lng: -112.963117}, "Zion National Park: Satan's Staircase", 'IV-V', 4.33, 'purple', 150, 600);
newRiver[2].USGSsite = ["09405500"];
newRiver[2].infoContent = "<h3>Zion National Park: Satan's Staircase IV-V</h3>" + "<p>A great way to see Zion National Park and Zion Canyon. You need to get a permit from Zion National Park (when flows are over 150cfs) and you can run shuttle with the bus system. At lower levels, this run is more III/IV but the tougher rapids approach Class V.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1880/' target='_blank'> American Whitewater (3 sections) </a></p>" + "<p><a href='http://virginriver.info/guide/guidestair.htm' target='_blank'> Virgin River Runners Coalition </a></p>";
newRiver[3] = new RiverSection ({lat: 37.201505, lng: -112.986386}, "Zion National Park: Watchman", 'III', 3.33, 'blue', 150, 600);
newRiver[3].USGSsite = ["09405500"];
newRiver[3].infoContent = "<h3>Zion National Park: Watchman III</h3>" + "<p>A great way to see Zion National Park and Zion Canyon. You need to get a permit from Zion National Park (when flows are over 150cfs) and you can run shuttle with the bus system. Below the tougher rapids, this mellows out to Class III down to the Visitors Center</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1880/' target='_blank'> American Whitewater (3 sections) </a></p>" + "<p><a href='http://virginriver.info/guide/guidewatch.htm' target='_blank'> Virgin River Runners Coalition </a></p>";
allRivers.push(newRiver);

// Anthracite Creek, Ruby Fork
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.862971, lng: -107.163762}, "Anthracite Creek, Ruby Fork", 'V+', 5.66, 'black', 600, 1000);
newRiver[0].USGSsite = ["09132095"];
newRiver[0].infoContent = "<h3>" + newRiver[0].title + " " + newRiver[0].clabel +"</h3>" + "<p>11-mile wilderness run that requires many portages around a lot of wood. </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3097' target='_blank'> American Whitewater </a></p>"
+ "<p><a href='http://www.coloradokayaking.com/main.php?pageid=Rivers&riverid=RubyAnthracite' target='_blank'> Colorado Kayaking </a></p>"
allRivers.push(newRiver);

// Rio Embudo
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 36.189617, lng: -105.766600}, "Rio Embudo", 'V(+)', 5.33, 'red', 100, 800);
newRiver[0].USGSsite = ["08279000"];
newRiver[0].infoContent = "<h3>" + newRiver[0].title + " " + newRiver[0].clabel +"</h3>" + "<p>11-mile wilderness run that requires many portages around a lot of wood. </P>" + "<p><a href='http://www.riverbrain.com/run/show/192' target='_blank'> River Brains </a></p>"
+ "<p><a href='http://southwestpaddler.com/docs/riograndenm15.html' target='_blank'> Southwest Paddler </a></p>"
+ "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3592' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Slate River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.9344762, lng: -107.0616508}, "Slate River", 'V', 5.33, 'red', 500, 2000);
newRiver[0].USGSsite = ["385106106571000"];
newRiver[0].infoContent = "<h3>" + newRiver[0].title + " " + newRiver[0].clabel +"</h3>" + "<p>11-mile wilderness run that requires many portages around a lot of wood. </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3377/' target='_blank'> American Whitewater </a></p>"
+ "<p><a href='http://www.riverbrain.com/run/show/391' target='_blank'> River Brain </a></p>";
allRivers.push(newRiver);

// Joe Wright Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.6047881, lng: -105.8446668}, "Joe Wright Creek", 'V', 5.33, 'red', 160, 1000);
newRiver[0].USGSsite = ["06746110"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2859/' target='_blank'> American Whitewater </a></p>" + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 72</a></p>";
allRivers.push(newRiver);

/////////// CO WATER RUNS ////////////


// Cache la Poudre
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.692556, lng: -105.265239}, "Bridges", 'III(+)', 3.66, 'blue', 250, 3000);
newRiver[0].USGSsite = ["CLAFTCCO"];
newRiver[0].infoContent = "<h3>Bridges (Pineview Falls to Bridges) III(+)</h3>" + "<p>Roadside access to this two mile stretch of intermediate water.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3370/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/407' target='_blank'> River Brains </a></p>" + "<p><a href='http://www.poudrerockreport.com/' target='_blank'> Poudre Rock Report </a></p>";
newRiver[1] = new RiverSection ({lat: 40.687052, lng: -105.303474}, "Poudre Park", 'III-IV', 4.00, 'purple', 250, 3000);
newRiver[1].USGSsite = ["CLAFTCCO"];
newRiver[1].infoContent = "<h3>Poudre Park III-IV</h3>" + "<p>Roadside access; a little more challenging than the sections above and below it.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3369/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/55' target='_blank'> River Brains </a></p>" + "<p><a href='http://www.poudrerockreport.com/' target='_blank'> Poudre Rock Report </a></p>";
newRiver[2] = new RiverSection ({lat: 40.687854, lng: -105.364947}, "Lower Mishawaka", 'III(-/+)', 3.33, 'blue', 250, 3000);
newRiver[2].USGSsite = ["CLAFTCCO"];
newRiver[2].infoContent = "<h3>Lower Mishawaka III(-/+)</h3>" + "<p>Roadside access to this two mile stretch of intermediate water.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3368/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/55' target='_blank'> River Brains </a></p>" + "<p><a href='http://www.poudrerockreport.com/' target='_blank'> Poudre Rock Report </a></p>";
newRiver[3] = new RiverSection ({lat: 40.683243, lng: -105.408437}, "Upper Mishawaka", 'III-IV', 4.00, 'purple', 300, 3000);
newRiver[3].USGSsite = ["CLAFTCCO"];
newRiver[3].infoContent = "<h3>Upper Mishawaka III(-/+)</h3>" + "<p>Roadside access to this two mile stretch of intermediate water.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/371/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/55' target='_blank'> River Brains </a></p>" + "<p><a href='http://www.poudrerockreport.com/' target='_blank'> Poudre Rock Report </a></p>";
newRiver[4] = new RiverSection ({lat: 40.691501, lng: -105.432509}, "Upper Narrows", 'V(+)', 5.33, 'red', 150, 1300);
newRiver[4].USGSsite = ["CLAFTCCO"];
newRiver[4].infoContent = "<h3>Upper Narrows V(+)</h3>" + "<p>Roadside access to a short adrenaline rush of drops before the run-out of the Middle Narrows.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/370/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/234' target='_blank'> River Brains </a></p>" + "<p><a href='http://www.poudrerockreport.com/' target='_blank'> Poudre Rock Report </a></p>";
newRiver[5] = new RiverSection ({lat: 40.679477, lng: -105.432876}, "Middle Narrows", 'IV(+)', 4.66, 'purple', 150, 1300);
newRiver[5].USGSsite = ["CLAFTCCO"];
newRiver[5].infoContent = "<h3>Middle Narrows IV(+)</h3>" + "<p>Nice Class IV sandwiched between some beefy Class V. Know your take-out (at Kinney Bridge).</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/370/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/235' target='_blank'> River Brains </a></p>" + "<p><a href='http://www.poudrerockreport.com/' target='_blank'> Poudre Rock Report </a></p>";
newRiver[6] = new RiverSection ({lat: 40.677934, lng: -105.414293}, "Lower Narrows", 'V(+)', 5.33, 'red', 150, 1300);
newRiver[6].USGSsite = ["CLAFTCCO"];
newRiver[6].infoContent = "<h3>Lower Narrows V(+)</h3>" + "<p>Big Class V rapid that some will describe as classic.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/370/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/236' target='_blank'> River Brains </a></p>" + "<p><a href='http://www.poudrerockreport.com/' target='_blank'> Poudre Rock Report </a></p>";
newRiver[7] = new RiverSection ({lat: 40.634714, lng: -105.808175}, "Spencer Heights", 'V', 5.33, 'red', 300, 900);
newRiver[7].USGSsite = ["CLAFTCCO"];
newRiver[7].infoContent = "<h3>Spencer Heights V</h3>" + "<p>First mile is mostly Class IV, portage around Poudre Falls, and then more Class V.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/369/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/river/river/15' target='_blank'> River Brains </a></p>" + "<p><a href='http://www.poudrerockreport.com/' target='_blank'> Poudre Rock Report </a></p>";
newRiver[8] = new RiverSection ({lat: 40.509790, lng: -105.765101}, "Big South", 'V+', 5.66, 'black', 250, 950);
newRiver[8].USGSsite = ["LAPLODCO"];
newRiver[8].infoContent = "<h3>Big South V+</h3>" + "<p>12 miles that is often regarded as the finest expert run in Colorado. Access to the put-in can be challenging during prime run-off.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/365/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/237' target='_blank'> River Brains </a></p>" + "<p><a href='http://www.poudrerockreport.com/' target='_blank'> Poudre Rock Report </a></p>";
newRiver[9] = new RiverSection ({lat: 40.696026, lng: -105.692244}, "Upper Rustic", 'III', 3.33, 'blue', 650, 3000);
newRiver[9].USGSsite = ["CLAFTCCO"];
newRiver[9].infoContent = "<h3>Upper Rustic III</h3>" + "<p>Class III whitewater that has one rapid, The White Mile, that can get BIG in big water. Careful of the low bridge after the take-out.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/367/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/34' target='_blank'> River Brains </a></p>" + "<p><a href='http://www.poudrerockreport.com/' target='_blank'> Poudre Rock Report </a></p>";
newRiver[10] = new RiverSection ({lat: 40.700311, lng: -105.544240}, "Lower Rustic", 'III+', 3.66, 'blue', 650, 3000);
newRiver[10].USGSsite = ["CLAFTCCO"];
newRiver[10].infoContent = "<h3>Lower Rustic III+</h3>" + "<p>A little more challenging and more popular than the Upper.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/368' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/418' target='_blank'> River Brains </a></p>" + "<p><a href='http://www.poudrerockreport.com/' target='_blank'> Poudre Rock Report </a></p>";
newRiver[11] = new RiverSection ({lat: 40.660521, lng: -105.202264}, "Filter Plant", 'II', 2.66, 'green', 450, 3000);
newRiver[11].USGSsite = ["CLAFTCCO"];
newRiver[11].infoContent = "<h3>Filter Plant</h3>" + "<p>Beginner run close to civilization, this becomes more of a Class III at higher water.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/372/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/242' target='_blank'> River Brains </a></p>" + "<p><a href='http://www.poudrerockreport.com/' target='_blank'> Poudre Rock Report </a></p>";
allRivers.push(newRiver);

// Lake Creek of Arkansas
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.081915,  lng: -106.539537}, "Lake Creek Ark", 'V+', 5.66, 'black', 150, 1000);
newRiver[0].USGSsite = ["LAKATLCO"];
newRiver[0].infoContent = "<h3>Lake Creek Ark</h3>" + "<p>Challenging creek run in the Ark Basin that is fed by a diversion pipe from the Roaring Fork, so it runs longer than you would expect.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/404/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/171' target='_blank'> River Brains Part 1</a></p>" + "<p><a href='http://www.riverbrain.com/run/show/172' target='_blank'> River Brains Part 2</a></p>";
allRivers.push(newRiver);

// Upper Rio Grande
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.746736, lng: -107.103800}, "Upper Rio Grande", 'III', 3.33, 'blue', 250, 5000);
newRiver[0].USGSsite = ["RIOMILCO"];
newRiver[0].infoContent = "<h3>Upper Rio Grande</h3>" + "<p>There is not much whitewater on the Rio Grande in Colorado (see New Mexico for that), but this run is up in a wilderness area above the town of Creede. While it is below a reservior, desireable flows for this section are typical runoff season of May and June. It can be run at ELF until 200 cfs.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/415/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/42' target='_blank'> River Brains </a></p>";
newRiver[1] = new RiverSection ({lat: 37.675996, lng: -106.652644}, "Wagon Wheel Gap", 'II', 2.33, 'green', 600, 5000);
newRiver[1].USGSsite = ["RIOMILCO"];
newRiver[1].infoContent = "<h3>Wagon Wheel Gap II</h3>" + "<p>This is a little section of Class II water below Creede and above the San Luis Valley</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/416' target='_blank'> American Whitewater </a></p>";
newRiver[2] = new RiverSection ({lat: 37.481010, lng: -105.879186}, "Alamosa", 'II', 2.33, 'green', 1000, 10000);
newRiver[2].USGSsite = ["RIOMILCO"];
newRiver[2].infoContent = "<h3>Alamosa I-II</h3>" + "<p>The Rio Grande manderers through the San Luis Valley and may have some flotable / tubable sections near Alamosa.</p>";
allRivers.push(newRiver);

// Conejos
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.301258, lng: -106.480280}, "Pinnacle Gorge", 'III(IV)', 3.66, 'blue', 200, 1500);
newRiver[0].USGSsite = ["CONPLACO"];
newRiver[0].infoContent = "<h3>Pinnacle Gorge III(IV)</h3>" + "<p>Very scenic run in a remote part of the state. It is mostly Class III except for one Class IV drop toward the end.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/382/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// South Platte
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.080717, lng: -104.822222}, "Brighton City Park to Fort Lupton", 'II+', 2.66, 'green', 200, 10000);
newRiver[0].USGSsite = ["06721000"];
newRiver[0].infoContent = "<h3>Brighton City Park to Fort Lupton II+</h3>" + "<p>This is a very urban run with an industrial feel, but it's pretty close to civilization and a good beginner run.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3206' target='_blank'> American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 39.760179, lng: -105.003578}, "Confluence Park", 'III', 3.33, 'blue', 100, 10000);
newRiver[1].USGSsite = ["PLADENCO"];
newRiver[1].infoContent = "<h3>Confluence Park III</h3>" + "<p>Mile Long whitewater park with numerous features. Water has feels other than pure and this run is about as urban as it gets, but it runs year-round, has easy access, and is mostly bordered by a park.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/425' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/229' target='_blank'> River Brains </a></p>";
newRiver[2] = new RiverSection ({lat: 39.632100, lng: -105.015411}, "Union Chutes", 'III', 3.33, 'blue', 100, 10000);
newRiver[2].USGSsite = ["06710247"];
newRiver[2].infoContent = "<h3>Union Chutes III</h3>" + "<p>Another playpark upriver from Confluence Park in Englewood, CO. The Park at Union Avenue is a good place to start. A little less industrial than Confluence Park, but not quite as long.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4263/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/229' target='_blank'> River Brains </a></p>";
newRiver[3] = new RiverSection ({lat: 39.408036, lng: -105.171680}, "Waterton Canyon", 'III-IV', 3.66, 'blue', 300, 3000);
newRiver[3].USGSsite = ["PLASPLCO"];
newRiver[3].infoContent = "<h3>Waterton Canyon III-IV</h3>" + "<p>Mile long canyon that requires a hike out up an old dirt road.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/423/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/193' target='_blank'> River Brains </a></p>";
newRiver[4] = new RiverSection ({lat: 39.256209, lng: -105.226834}, "Deckers", 'II-III', 3.00, 'blue', 200, 3000);
newRiver[4].USGSsite = ["PLACHECO"];
newRiver[4].infoContent = "<h3>Deckers II-III</h3>" + "<p>Three miles of beginner whitewater that is damn released. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/424/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/220' target='_blank'> River Brains </a></p>";
newRiver[5] = new RiverSection ({lat: 39.208397, lng: -105.271496}, "Cheeseman Reservoir to Deckers", 'IV-', 4.00, 'purple', 200, 3000);
newRiver[5].USGSsite = ["PLACHECO"];
newRiver[5].infoContent = "<h3>Cheeseman Reservoir to Deckers (Lower Cheeseman Canyon) III-IV</h3>" + "<p>Three to five miles of intermediate whitewater that is damn released. May involve a couple of portages. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4262' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/279' target='_blank'> River Brains </a></p>";
newRiver[6] = new RiverSection ({lat: 39.014361, lng: -105.362398}, "Cheeseman Canyon", 'V(VI)', 5.66, 'black', 275, 700);
newRiver[6].USGSsite = ["06700000"];
newRiver[6].infoContent = "<h3>Cheeseman / Wildcat Canyon V(VI)</h3>" + "<p>Technical run that requires a few portages. There have been accesss issues with homeowners putting barbed wire and other obstructions in the river. I recommend reading up on the access before launching and being as respectful of the landowners as possible.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2835/' target='_blank'> American Whitewater </a></p>";
newRiver[7] = new RiverSection ({lat: 38.906305, lng: -105.467829}, "Eleven Mile Canyon", 'IV(V+)', 4.33, 'purple', 150, 1000);
newRiver[7].USGSsite = ["PLAGEOCO"];
newRiver[7].infoContent = "<h3>Eleven Mile Canyon IV(V+)</h3>" + "<p>This is mostly a Class IV- run with a Class V at the start and a Class V+ at the end. Simply putting in and taking out approapriately can make this a nice, intermediate paddle.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3787' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/347' target='_blank'> River Brains </a></p>";
allRivers.push(newRiver);

// North Fork of the South Platte River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.404647, lng: -105.470515}, "Bailey", 'V', 5.33, 'red', 200, 1000);
newRiver[0].USGSsite = ["PLABAICO"];
newRiver[0].infoContent = "<h3>Bailey V</h3>" + "<p>This is an excellent run that is fed by diversion from the Roberts Tunnel (Lake Dillon), so the flow are at the pleasure of the Denver Water Board...sort of. This does mean you can run Bailey late in the summer if water is going through the tunnel. This run has a race down it every August (water permitting) since 2017, known as Bailey Fest. There are a lot of difficult rapids in here that change drastically with water level. Go with a veteran and be prepared to portage and scout.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/427/' target='_blank'> American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 39.410145, lng: -105.254705}, "Foxton", 'III-IV-', 4.00, 'purple', 250, 10000);
newRiver[1].USGSsite = ["PLABAICO"];
newRiver[1].infoContent = "<h3>Foxton III-IV-</h3>" + "<p>This is a good intermediate run that much like Bailey, gets its water from the Roberts tunnel, so the flows won't necessarily make sense. Watch out for low bridge below 96RD (South Foxton Rd). </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/427/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Boulder Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.026655, lng: -105.225613}, "Boulder Town Run", 'II-III', 3.00, 'blue', 150, 800);
newRiver[0].USGSsite = ["BOCOROCO"];
newRiver[0].infoContent = "<h3>Boulder Town Run II-III</h3>" + "<p>Urban whitewater through town. There are multiple access points in town and a lot of people in and aroudn this run. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2881/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/33' target='_blank'> River Brains </a></p>";
newRiver[1] = new RiverSection ({lat: 40.013887, lng: -105.297929}, "Lower Boulder Canyon Run", 'IV(+)', 4.00, 'purple', 150, 1000);
newRiver[1].USGSsite = ["BOCOROCO"];
newRiver[1].infoContent = "<h3>Lower Boulder Canyon Run IV</h3>" + "<p>Just upstream from town and ending at the edge of town, this is a good run. Two thirds of the way down this run is Elephant Buttress Rapid (IV+); it is recommended that you scout. Since Boulder Creek is damn released, there is often flow in this at some times that might not coincide with runoff.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/364/' target='_blank'> American Whitewater (both lower and middle) </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/162' target='_blank'> River Brains </a></p>";
newRiver[2] = new RiverSection ({lat: 40.005917, lng: -105.339417}, "Middle Boulder Canyon", 'IV-V', 4.66, 'red', 150, 1000);
newRiver[2].USGSsite = ["BOCOROCO"];
newRiver[2].infoContent = "<h3>Middle Boulder Canyon IV-V</h3>" + "<p>A little more challenging than the run just below it. Since Boulder Creek is damn released, there is often flow in this at some times that might not coincide with runoff.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/364/' target='_blank'> American Whitewater (both lower and middle) </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/161' target='_blank'> River Brains </a></p>";
newRiver[3] = new RiverSection ({lat: 40.001840, lng: -105.413768}, "Upper Boulder Canyon Run", 'IV-V(+)', 5.00, 'red', 150, 1000);
newRiver[3].USGSsite = ["BOCOROCO"];
newRiver[3].infoContent = "<h3>Upper Boulder Canyon Run IV-V(+)</h3>" + "<p>Since Boulder Creek is damn released, there is often flow in this at some times that might not coincide with runoff.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4223/' target='_blank'> American Whitewater (both lower and middle) </a></p>";
newRiver[4] = new RiverSection ({lat: 39.9700361, lng: -105.6133428}, "Boulder Creek Source", 'V', 5.33, 'red', 150, 450);
newRiver[4].USGSsite = ["BOCMIDCO"];
newRiver[4].infoContent += "<p>Snowmelt fed part of Boulder Creek.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3360/' target='_blank'> American Whitewater </a></p>" + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 244</a></p>";
allRivers.push(newRiver);

// Clear Creek of the Arkansas
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.983876, lng: -106.440326}, "Clear Creek of the Arkansas", 'V-', 5.00, 'red', 150, 1000);
newRiver[0].USGSsite = ["CCACCRCO"];
newRiver[0].infoContent = "<h3>Clear Creek of the Arkansas V-</h3>" + "<p>Beautiful and less threatening than its neighboring Lake Creek.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3110/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Kannah Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.961568, lng: -108.228851}, "Upper Kannah Creek", 'V', 5.00, 'red', 30, 1000);
newRiver[0].USGSsite = ["KANJUNCO"];
newRiver[0].infoContent = "<h3>Upper Kannah Creek V</h3>" + "<p>Running off of the west side of Grand Mesa, this upper part of the creek is short but intense. The season for this run is often early (May and early June).</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3096' target='_blank'> American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 38.933713, lng: -108.397058}, "Lower Kannah Creek", 'III', 3.33, 'blue', 30, 1000);
newRiver[1].USGSsite = ["KANJUNCO"];
newRiver[1].infoContent = "<h3>Lower Kannah Creek V</h3>" + "<p>Running off of the west side of Grand Mesa, this lower part of the creek is a different character than the upper section (much easier). The season for this run is often early (May and early June). </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3376/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// South Fork of the Rio Grande
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.554811, lng: -106.776979}, "South Fork of the Rio Grande", 'V', 5.00, 'red', 300, 1500);
newRiver[0].USGSsite = ["RIOSFKCO"];
newRiver[0].infoContent = "<h3>South Fork of the Rio Grande V</h3>" + "<p>Roadside run with a lot of action.</p>" + "<p><a href='http://www.riverbrain.com/run/show/345' target='_blank'> River Brains </a></p>";
allRivers.push(newRiver);

// East Fork of the San Juan
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.388390, lng: -106.847187}, "East Fork of the San Juan", 'III(V-)', 3.66, 'blue', 150, 500);
newRiver[0].USGSsite = ["visual", "EASAPACO"];
newRiver[0].timing = [new Date("01 May " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent = "<h3>East Fork of the San Juan III(V-)</h3>" + "<p>Class III run with one Class V rapid to portage (or run). Portage eddy is not easy, but you can opt for lower put-in.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/419/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/344' target='_blank'> River Brains </a></p>";
allRivers.push (newRiver);

// Big Thompson
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.431968, lng: -105.331310}, "Big Tommy / Idylwilde Section", 'IV(+)', 4.66, 'purple', 250, 900);
newRiver[0].USGSsite = ["BTBLESCO"];
newRiver[0].infoContent = "<h3>Big Tommy /Idylwilde Section IV(+)</h3>" + "<p>Class IV run with the crux at the start. Be aware of a couple necessary portages in the run. Dam controlled, so may be available late in the year at scrapey levels. It maybe Class III(+) moves at lower levels, but the rapids are continuous and the riverbed is mank.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/361/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/256' target='_blank'> River Brains </a></p>";
newRiver[1] = new RiverSection ({lat: 40.426401, lng: -105.349067}, "Big Tommy Gnar Section", 'V(+)', 5.33, 'red', 200, 700);
newRiver[1].USGSsite = ["BTBLESCO"];
newRiver[1].infoContent = "<h3>Big Tommy Gnar Section V(+)</h3>" + "<p>About 1 mile above Drake, the river turn Class V(+). Hope you can get a good look from the road before running this.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4385' target='_blank'> American Whitewater (longer stretch from Estes to Drake) </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/152' target='_blank'> River Brains (just the last mile) </a></p>";
newRiver[2] = new RiverSection ({lat: 40.414937, lng: -105.363300}, "Big Tommy Main Section", 'IV(+)', 5.33, 'purple', 300, 700);
newRiver[2].USGSsite = ["BTBLESCO"];
newRiver[2].infoContent = "<h3>Big Tommy Gnar Section IV(+)</h3>" + "<p>There is Class IV section for 3 miles below the gnar section through Drake and take out at the Idylwilde Dam.  You can get a good look from the road before running this.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4385' target='_blank'> American Whitewater (longer stretch from dam to Drake) </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/152' target='_blank'> River Brains (just the last mile) </a></p>";
allRivers.push (newRiver);

/// South Boulder Creek ///
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.933366, lng: -105.273769}, "Eldorado Canyon", 'V+', 5.66, 'black', 150, 900);
newRiver[0].USGSsite = ["BOCBGRCO"];
newRiver[0].infoContent = "<h3>Eldorado Canyon V+</h3>" + "<p>A gnarly Class V+ canyon right before the creek flattens out. Very close to Boulder and can often run early and late in the season; often too big around peak.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3453/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/241' target='_blank'> River Brains </a></p>";
newRiver[1] = new RiverSection ({lat: 39.939008, lng: -105.349387}, "Lower South Boulder Creek", 'IV(V)', 4.66, 'purple', 200, 900);
newRiver[1].USGSsite = ["BOCBGRCO"];
newRiver[1].infoContent = "<h3>Lower South Boulder Creek IV(V)</h3>" + "<p>If you can portage a few big drops, this is a good Class IV run close to the front range.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2883' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/214' target='_blank'> River Brains </a></p>";
newRiver[2] = new RiverSection ({lat: 39.931610, lng: -105.424415}, "Upper South Boulder Creek", 'V(VI)', 5.66, 'black', 200, 900);
newRiver[2].USGSsite = ["BOCPINCO"];
newRiver[2].infoContent = "<h3>Upper South Boulder Creek V(VI)</h3>" + "<p>Creek run that is still close to the front range; flow is dependent on diversions from the Moffat Tunnel.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3125/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/215' target='_blank'> River Brains </a></p>";
newRiver[3] = new RiverSection ({lat: 39.916169, lng: -105.519756}, "Alto Alto SBC", 'IV', 4.33, 'purple', 250, 900);
newRiver[3].USGSsite = ["BOCPINCO"];
newRiver[3].infoContent = "<h3>Alto Alto SBC IV</h3>" + "<p>Good creeking that does not involve Class V action or portages.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4238/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/216' target='_blank'> River Brains </a></p>";
allRivers.push (newRiver);

// Willow Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.769670, lng: -106.919062}, "Willow Creek", 'IV(V)', 4.66, 'purple', 200, 900);
newRiver[0].USGSsite = ["WILBSLCO"];
newRiver[0].infoContent = "<h3>Willow Creek IV(V)</h3>" + "<p>Mostly Class IV and dam controlled.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10524/' target='_blank'> American Whitewater </a></p>";
allRivers.push (newRiver);

// Rock Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.056790, lng: -106.652570}, "Rock Creek", 'V+', 5.66, 'black', 150, 400);
newRiver[0].USGSsite = ["RCKTARCO"];
newRiver[0].infoContent = "<h3>Rock Creek V+</h3>" + "<p>Boney, brush-filled, and runs early in the season with a low-elevation snow-pack. See Colorado Rivers and Creeks for a more in=depth description.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2901/' target='_blank'> American Whitewater </a></p>";
allRivers.push (newRiver);

// Bear Creek (South Platte)
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.656534, lng: -105.288485}, "Bear Creek", 'V-', 5.33, 'red', 120, 650);
newRiver[0].USGSsite = ["BCRMORCO"];
newRiver[0].infoContent = "<h3>Bear Creek V-</h3>" + "<p>Just up the road from Morrison, there is some Class V fun to be had. Season is May, July, and big rains.</p>" + "<p><a href='hhttps://www.americanwhitewater.org/content/River/detail/id/2823/' target='_blank'> American Whitewater </a></p>";
allRivers.push (newRiver);

// North St. Vrain
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.227493, lng: -105.348798}, "Middle North St. Vrain", 'V-', 5.00, 'red', 250, 900);
newRiver[0].USGSsite = ["NSVBBRCO"];
newRiver[0].infoContent = "<h3>Middle North St. Vrain V-</h3>" + "<p>Just up the road from Lyons, this is a popular dam-controlleed, after-work run.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4050/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/232' target='_blank'> River Brains </a></p>";
newRiver[1] = new RiverSection ({lat: 40.218570, lng: -105.528135}, "Upper North St. Vrain / NSV", 'V+', 5.66, 'black', 250, 900);
newRiver[1].USGSsite = ["visual", "BRKRESCO"];
newRiver[1].timing = [new Date("15 May " + curYear), new Date("31 July " + curYear)];
newRiver[1].infoContent = "<h3>Upper North St. Vrain (NSV) V+</h3>" + "<p>Nice, challenging, wilderness run on the Front Range. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4049/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/231' target='_blank'> River Brains </a></p>";
newRiver[2] = new RiverSection ({lat: 40.236718, lng: -105.321343}, "Lower North St. Vrain / Shelley's Cottages", 'III', 3.33, 'blue', 150, 700);
newRiver[2].USGSsite = ["NSVBBRCO"];
newRiver[2].infoContent = "<h3>Lower North St. Vrain / Shelley's Cottages / Lower NSV III</h3>" + "<p>Creek boating close to the Front Range that is significantly easier than the sections above it. Watch for low (impassable) bridges at low water.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2884/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/233' target='_blank'> River Brains </a></p>";
newRiver[3] = new RiverSection ({lat: 40.220849, lng: -105.263557}, "Lower North St. Vrain / Apple Valley", 'III-', 3.00, 'blue', 150, 700);
newRiver[3].USGSsite = ["NSVBBRCO"];
newRiver[3].infoContent = "<h3>Lower North St. Vrain / Apple Valley III-</h3>" + "<p>NSV gets mellows out more before ending in Lyons.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2884/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/387' target='_blank'> River Brains </a></p>";
allRivers.push (newRiver);

// South St. Vrain
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.178051, lng: -105.342848}, "South St. Vrain", 'V(+)', 5.00, 'red', 150, 600);
newRiver[0].USGSsite = ["SSVWARCO"];
newRiver[0].infoContent = "<h3>South St. Vrain V(+)</h3>" + "<p>This run was changed by the 2013 flood. Most boaters now just run from 1in5 rapid down.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4008' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/153' target='_blank'> River Brains </a></p>";
allRivers.push (newRiver);

///////// Colorado Visual Flow Sections /////////////////

// Hermosa Creek (animas)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 37.486520, lng: -107.886887}, "Hermosa Creek", 'IV(+)', 4.33, 'purple', 500, 1000);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Recommended flow is 500-1000 cfs where the creek meets the Animas." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/403/' target='_blank'> American Whitewater </a></p>";
allRivers.push (newRiver);

// South Mineral Creek (animas)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 37.784833, lng: -107.801962}, "South Mineral Creek", 'V+', 5.66, 'black', 1500, 2900);
newRiver[0].timing = [new Date("01 June " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Best when Lime Creek is running (Animas is ~2200cfs)." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3413/' target='_blank'> American Whitewater </a></p>" + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> See Colorado Rivers and Creeks p. 206 for best details </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/164' target='_blank'> River Brain </a></p>";
newRiver[0].USGSsite[1] = "09361500";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
allRivers.push (newRiver);
// Possibly use Mineral Creek at Silverton 100-300 range USGS 09359010

// Canyon Creek (animas)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 37.516128, lng: -107.745316}, "Canyon Creek", 'V+', 5.66, 'black', 1500, 2900);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("31 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible; should not be run at peak runoff" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3328/' target='_blank'> American Whitewater </a></p>" + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 207</a></p>";
allRivers.push (newRiver);

// Lime Creek (Animas)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 37.720844, lng: -107.748671}, "Lime Creek", 'V+', 5.66, 'black', 1500, 2900);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("31 July " + curYear)];
newRiver[0].USGSsite[1] = "09361500";
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible; July is possible, but more likely May and June. Best when Animas is ~2200cfs." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3414/' target='_blank'> American Whitewater First Gorge</a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4235/' target='_blank'> American Whitewater Second Gorge</a></p>" + "<p><a href='http://www.riverbrain.com/run/show/378' target='_blank'> River Brain First Gorge</a></p>" + "<p><a href='http://www.riverbrain.com/run/show/379' target='_blank'> River Brain Second Gorge</a></p>" + "<p><a href='http://www.riverbrain.com/run/show/380' target='_blank'> River Brain Third Gorge</a></p>" + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 204-5</a></p>";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

// Elk Creek (of Animas)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 37.720625, lng: -107.628221}, "Elk Creek ", 'III-IV', 4.00, 'purple', 300, 1200);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible; July is possible, but more likely May and June." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/6341' target='_blank'> American Whitewater </a></p>";
allRivers.push (newRiver);

// Yule Creek (Crystal)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 39.010851, lng: -107.145086}, "Upper Yule Creek", 'V', 5.33, 'red', 100, 300);
newRiver[0].timing = [new Date("15 May " + curYear), new Date("15 August " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section maybe possible, but this creek has not been run often enough to accurately judge that window." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4105/' target='_blank'> American Whitewater </a></p>";
newRiver[1] = new visualRiverSection ({lat: 39.049682, lng: -107.174506}, "Lower Yule Creek", 'V+', 5.66, 'black', 100, 300);
newRiver[1].timing = [new Date("15 May " + curYear), new Date("15 August " + curYear)];
newRiver[1].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section maybe possible, but this creek has not been run often enough to accurately judge that window." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4384' target='_blank'> American Whitewater </a></p>" + "<p><a href='https://www.amazon.com/Whitewater-Southern-Rockies-Stafford-McCutchen/dp/0979264405' target='_blank'> See Whitewater of The Southern Rockies for more details.</a></p>";
allRivers.push (newRiver);

// Wolf Creek (San Juan)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 37.457648, lng: -106.883010}, "Wolf Creek", 'V', 5.33, 'red', 300, 1200);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("31 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible; July is possible, but more likely May and June. You will probably do more hucking than paddling in this section." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3633/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/426' target='_blank'> River Brain </a></p>" + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 214</a></p>";
allRivers.push (newRiver);

// OBJ
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 38.906838, lng: -107.050415}, "Oh-Be-Joyful", 'V', 5.33, 'red', 300, 1200);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("31 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible; July is possible in big years, but more likely May and June. You may be able to estimate this run off of the Slate River (runnable 500-2000cfs according to some boaters), but since it is not directly related, we consider it a visual section." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3375/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/247' target='_blank'> River Brain </a></p>" + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 162</a></p>";
newRiver[0].USGSsite[1] = "385106106571000";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

// Daisy Creek
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 38.961059, lng: -107.088739}, "Daisy Creek", 'V-', 5.00, 'red', 300, 1200);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("31 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible; July is possible in big years, but more likely May and June. You may be able to estimate this run off of the Slate River (runnable 500-2500cfs according to some boaters), but since it is not directly related, we consider it a visual section." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3378/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/392' target='_blank'> River Brain </a></p>" + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 165</a></p>";
newRiver[0].USGSsite[1] = "385106106571000";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

// Escalante Creek (gunny)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 38.6363511, lng: -108.3991558}, "Escalante Creek", 'V(+)', 5.33, 'red', 800, 1000);
newRiver[0].timing = [new Date("10 April " + curYear), new Date("31 May " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. You may be able to estimate this run off of a calculation (Gunny at Grand Junction minus Gunny at Delta minus Uncompahgre at Delta); we calculated this flow below. It should be between 800-1000 ideally." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3410' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/392' target='_blank'> River Brain </a></p>" + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 140</a></p>";
newRiver[0].USGSsite[1] = "09152500"; // Gunnison at Grand Junction
newRiver[0].USGSsite[2] = "09144250"; // GUNNISON RIVER AT DELTA, CO
newRiver[0].USGSsite[3] = "09149500"; // UNCOMPAHGRE RIVER AT DELTA, CO
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1] - this.flow[2] - this.flow[3];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

// Mad Creek (Elk River - Steamboat Area)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 40.5853902, lng: -106.8778278}, "Mad Creek", 'V', 5.33, 'red', 300, 1200);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible."  + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 266</a></p>";
allRivers.push (newRiver);

// Buzzard Creek
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 39.2721751, lng: -107.8602838}, "Buzzard Creek", 'IV', 4.33, 'purple', 500, 1200);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("31 May " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4265/' target='_blank'> American Whitewater</a></p>"  + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 81</a></p>";
allRivers.push (newRiver);

// Cebolla Creek 
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 38.2909792, lng: -107.1234218}, "Cebolla Creek", 'III', 3.33, 'blue', 500, 1200);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("31 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/375' target='_blank'> American Whitewater</a></p>"  + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 158</a></p>";
allRivers.push (newRiver);

// South Fork of the Poudre (Cache la Poudre)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 40.6235981, lng: -105.5328838}, "South Fork of the Poudre", 'IV(+)', 4.33, 'purple', 500, 1200);
newRiver[0].timing = [new Date("20 May " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible; best just bfore or during Poudre peak. American Whitewater and CRC differ on the difficulty rating." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/374' target='_blank'> American Whitewater</a></p>"  + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 61</a></p>";
// maybe add a related flow for the Poudre
allRivers.push (newRiver);

// Sweetwater Creek (near Burns)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 39.7552701, lng: -107.1102548}, "Sweetwater Creek", 'IV-', 4.00, 'purple', 500, 1200);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2547/' target='_blank'> American Whitewater</a></p>"  + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 90</a></p>";
// maybe do a subtraction of CO at Dotsero and CO at Catamount
allRivers.push (newRiver);

// Henson Creek (Lake Fork Gunny)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 38.0202842, lng: -107.4096908}, "Henson Creek", 'V-', 5.00, 'red', 500, 1200);
newRiver[0].timing = [new Date("15 May " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. Possilby running in May and July; likely running in June." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3548/' target='_blank'> American Whitewater</a></p>"  + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 157</a></p>";
// maybe do a subtraction of CO at Dotsero and CO at State Bridge 
allRivers.push (newRiver);

// Grape Creek (Ark) Maybe do a subtraction of Ark at Canon versus Ark at Parkdale
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 38.3233202, lng: -105.3557148}, "Grape Creek", 'V-', 5.00, 'red', 300, 1200);
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible; Look for peak or take a run down the Royal Gorge to estimate the flow. We calculate a difference between Ark in Canon City and Ark in Parkdale, but we are not sure how this correlates." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2524/' target='_blank'> American Whitewater </a></p>" + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 36</a></p>";
newRiver[0].USGSsite[1] = "07096000";
newRiver[0].USGSsite[2] = "07094500";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1] - this.flow[2];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

// Elk River (Yampa)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 40.7701721, lng: -106.7833488}, "Box Canyon on Upper Elk River", 'V(+)', 5.33, 'red', 700, 3000);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible; May and June are more likely than July. The flow we show is WAY downstream (at confluence of Elk and Yampa); the old gauge in Clark, CO hasn't worked since 2003. On that old gauge, this section was apparently runnable 700-3000cfs; I have no idea how this stacks up to the new measurement further downstream." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1480/' target='_blank'> American Whitewater </a></p>" + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 269</a></p>";
newRiver[0].USGSsite[1] = "09242500";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
newRiver[1] = new visualRiverSection ({lat: 40.7480271, lng: -106.8522208}, "Lower Elk River", 'III', 3.33, 'blue', 700, 3000);
newRiver[1].timing = [new Date("01 May " + curYear), new Date("31 July " + curYear)];
newRiver[1].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible; May and June are more likely than July. The flow we show is WAY downstream (at confluence of Elk and Yampa); the old gauge in Clark, CO hasn't worked since 2003. I have no idea how this stacks up to the new measurement further downstream." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/392/' target='_blank'> American Whitewater </a></p>" + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 268</a></p>";
newRiver[1].USGSsite[1] = "09242500";
newRiver[1].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
newRiver[2] = new visualRiverSection ({lat: 40.5865011, lng: -106.9105068}, "Lower Elk River", 'II', 2.33, 'green', 500, 3000);
newRiver[2].timing = [new Date("01 May " + curYear), new Date("31 July " + curYear)];
newRiver[2].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible; May and June are more likely than July. The flow we show is downstream (at confluence of Elk and Yampa); the old gauge in Clark, CO hasn't worked since 2003. I have no idea how this stacks up to the new measurement further downstream." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/393/' target='_blank'> American Whitewater </a></p>";
newRiver[2].USGSsite[1] = "09242500";
newRiver[2].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

// Left Hand Creek
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 40.1043451, lng: -105.3469218}, "Left Hand Creek", 'IV+', 4.66, 'purple', 500, 1200);
newRiver[0].timing = [new Date("01 April " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4268/' target='_blank'> American Whitewater</a></p>"  + "<p><a href='https://www.amazon.com/Colorado-Rivers-Creeks-Gordon-Banks/dp/0964539950' target='_blank'> Colorado Rivers and Creeks p. 244</a></p>";
// maybe do a subtraction with Boulder Creek
allRivers.push (newRiver);

// North Boulder Creek
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 40.0035781, lng: -105.4397438}, "North Boulder Creek", 'V+', 5.66, 'black', 500, 1200);
newRiver[0].timing = [new Date("01 April " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4224/' target='_blank'> American Whitewater</a></p>";
// maybe do a subtraction with Boulder Creek
allRivers.push (newRiver);

// Cinnamon Gorge
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 37.936529, lng: -107.460697}, "Cinnamon Gorge", 'V+', 5.66, 'black', 1000, 0);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("31 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. Rarely run. The related flow is way downstream (at Gateview)." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4555/' target='_blank'> American Whitewater </a></p>";
newRiver[0].USGSsite[1] = "09124500";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

/* visual runs:
Willow Creek (Upper)
Alkali Creek (Jardia Creek)
*/


////////////////// New Mexico //////////////////////

/* visual runs:
Rio Brazos Box [NM]
Toltec Gorge (Rio Grande)
Rio Brazos
*/

// Rio Grande
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.078759, lng: -105.757538}, "Ute Mountain", 'II-III', 3.00, 'blue', 500, 3000);
newRiver[0].USGSsite = ["08263500"];
// https://www.americanwhitewater.org/content/River/detail/id/1222
// http://southwestpaddler.com/docs/riograndenm2.html
newRiver[1] = new RiverSection ({lat: 36.863493, lng: -105.705257}, "Razors", 'III-IV+', 4.33, 'purple', 500, 3000);
newRiver[1].USGSsite = ["08263500"];
// https://www.americanwhitewater.org/content/River/detail/id/1223/
// http://southwestpaddler.com/docs/riograndenm3.html
newRiver[2] = new RiverSection ({lat: 36.741850, lng: -105.681836}, "Upper Taos Box", 'V', 5.33, 'red', 300, 3000);
newRiver[2].USGSsite = ["08263500"];
// https://www.americanwhitewater.org/content/River/detail/id/1224/
// http://southwestpaddler.com/docs/riograndenm4.html
newRiver[3] = new RiverSection ({lat: 36.655466, lng: -105.691031}, "La Junta", 'II-III', 3.00, 'blue', 300, 3000);
newRiver[3].USGSsite = ["08263500"];
// https://www.americanwhitewater.org/content/River/detail/id/1226/
// http://southwestpaddler.com/docs/riograndenm5.html
newRiver[4] = new RiverSection ({lat: 36.535243, lng: -105.708294}, "Lower Taos Box", 'IV', 4.33, 'purple', 600, 5000);
newRiver[4].USGSsite = ["08276500"];
// https://www.americanwhitewater.org/content/River/detail/id/1227/
// http://southwestpaddler.com/docs/riograndenm6.html
newRiver[5] = new RiverSection ({lat: 36.336198, lng: -105.733324}, "Pilar (Orilla Verde)", 'III', 3.33, 'blue', 250, 5000);
newRiver[5].USGSsite = ["08276500"];
newRiver[5].infoContent = "<h3>Pilar (Orilla Verde) III</h3>" + "<p>Sometimes Racecourse is considered part of Pilar and sometimes a separate run. It is a popular run with a long season and relatively easy access. </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1228' target='_blank'> American Whitewater </a></p>"+ "<p><a href='http://southwestpaddler.com/docs/riograndenm7.html' target='_blank'> Southwest Paddler </a></p>";
newRiver[6] = new RiverSection ({lat: 36.261853, lng: -105.803619}, "Racecourse", 'III', 3.33, 'blue', 300, 6000);
newRiver[6].USGSsite = ["08276500"];
newRiver[6].infoContent = "<h3>Racecourse III</h3>" + "<p>Sometimes Racecourse is considered part of Pilar and sometimes a separate run. It is a popular run with a long season and relatively easy access. </P>" + "<p><a href='http://southwestpaddler.com/docs/riograndenm8.html' target='_blank'> Southwest Paddler </a></p>";
newRiver[7] = new RiverSection ({lat: 35.874943, lng: -106.140974}, "Otowi", 'III', 3.33, 'blue', 300, 6000);
newRiver[7].USGSsite = ["08313000"];
newRiver[7].infoContent = "<h3>Otowi III</h3>" + "<p>Dam control keeps this section running much of the year. A little remote and beautiful. </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1225' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Rio Charma (since it's running late in year)
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 36.375205, lng: -106.682136}, "Charma Canyon", 'II-III', 3.33, 'blue', 200, 6000);
newRiver[0].USGSsite = ["08286500"];
newRiver[0].infoContent = "<h3>Charma Canyon II-III</h3>" + "<p>Dam control keeps this section running late into the summer; look for flows to be released on some weekends. This is the shorter run that does not require a permit and is a not wilderness run. The section above this is more wilderness.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1225' target='_blank'> American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 36.584112, lng: -106.730152}, "Charma Wilderness Area", 'II(III)', 2.66, 'green', 200, 6000);
newRiver[1].USGSsite = ["08286500"];
newRiver[1].infoContent = "<h3>Charma Wilderness Area II(III)</h3>" + "<p>Dam control keeps this section running late into the summer; look for flows to be released on some weekends. A permit is necessary for this 22 mile section of Wild and Scenic river.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3165/' target='_blank'> American Whitewater (whole section - including non-permit) </a></p>";
newRiver[2] = new RiverSection ({lat: 36.738244, lng: -106.577394}, "Chama to Los Ojos (Town run)", 'I-II', 2.00, 'green', 200, 6000);
newRiver[2].USGSsite = ["08284100"];
newRiver[2].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1218/' target='_blank'> American Whitewater </a></p>";
newRiver[3] = new RiverSection ({lat: 36.659962, lng: -106.691878}, "Los Ojos to El Vado Lake", 'I-III', 3.00, 'green', 400, 4000);
newRiver[3].USGSsite = ["08284100"];
newRiver[3].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1219/#main' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Canadian River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 36.857022, lng: -104.473922}, "Canadian River: Raton to Taylor Springs", 'I-II', 2.00, 'green', 300, 3000);
newRiver[0].USGSsite = ["07211500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1205/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://southwestpaddler.com/docs/canadiannm2.html' target='_blank'> Southwest Paddler </a></p>";
newRiver[1] = new RiverSection ({lat: 36.329543, lng: -104.498094}, "Canadian River: Taylor Springs to Conchas Reservoir", 'III-IV', 4.33, 'purple', 250, 3000);
newRiver[1].USGSsite = ["07211500"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1206/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://southwestpaddler.com/docs/canadiannm3.html' target='_blank'> Southwest Paddler </a></p>";
allRivers.push (newRiver);

// Gila River in New Mexico
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 32.723208, lng: -108.677611}, "Gila River: Forest Road 809 to Redrock (Middle Box)", 'II-III+', 3.33, 'blue', 200, 2500);
newRiver[0].USGSsite = ["09431500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1209/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://southwestpaddler.com/docs/gilanm3.html' target='_blank'>Southwest Paddler </a></p>";
newRiver[1] = new RiverSection ({lat: 33.202341, lng: -108.214192}, "Gila River: Visitor to Mogollan Creek (Wilderness Run)", 'II-III', 3.33, 'blue', 200, 1200);
newRiver[1].USGSsite = ["09430500"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1209/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://southwestpaddler.com/docs/gilanm2.html' target='_blank'>Southwest Paddler </a></p>";
allRivers.push (newRiver);

// Jemez River in New Mexico
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 35.828776, lng: -106.646349}, "Jemez River: Battleship Rock to Soda Dam", 'III-IV', 4.33, 'purple', 200, 2500);
newRiver[0].USGSsite = ["09431500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1210/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Mora River in New Mexico
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 35.813111, lng: -104.862271}, "Mora River: Battleship Rock to Soda Dam", 'III-IV', 4.33, 'purple', 100, 2000);
newRiver[0].USGSsite = ["07216500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1212/' target='_blank'>American Whitewater </a></p>"
+ "<p><a href='http://southwestpaddler.com/docs/canadiannm6.html' target='_blank'>Southwest Paddler </a></p>";
allRivers.push (newRiver);

// Pecos River in New Mexico
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 35.264953, lng: -105.333982}, "Pecos River: Villanueva State Park to Tecolotito", 'II-III', 3.66, 'blue', 800, 3500);
newRiver[0].USGSsite = ["08379500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10689/' target='_blank'>American Whitewater </a></p>"
+ "<p><a href='http://southwestpaddler.com/docs/pecosnm4.html' target='_blank'>Southwest Paddler </a></p>";
allRivers.push (newRiver);

// Rio Guadalupe in New Mexico
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 35.818647, lng: -106.787851}, "Rio Guadalupe: Bridge to Gilman Tunnels", 'IV-V', 4.66, 'red', 400, 900);
newRiver[0].USGSsite = ["08324000"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10689/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Rio Ojo Caliente [NM]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 36.382381, lng: -106.038394}, "Rio Ojo Caliente: La Madera to confluence with Rio Chama", 'I-II', 2.00, 'green', 400, 900);
newRiver[0].USGSsite = ["08289000"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1214' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

/* New Mexico Rivers
https://www.americanwhitewater.org/content/River/state-summary/state/NM
http://southwestpaddler.com/indexNM.html
San Francisco [NM]
Pecos has more sections to add from Santa Rosa Lake down
Look for Visual Flow Sections
*/


//////// Utah /////////////////////////////////////
// American fork
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.444182, lng: -111.706871}, "Lower American Fork", 'IV-V', 4.66, 'purple', 50, 230);
newRiver[0].USGSsite = ["10164500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10835/' target='_blank'>American Whitewater </a></p>" +
"<p><a href='http://www.riverbrain.com/river/river/44?shed=American+Fork' target='_blank'>River Brain (multiple sections) </a></p>";
allRivers.push (newRiver);

// Bear River [UT] and east fork
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.965486, lng: -110.853526}, "Bear River: MP 51.5 to Chalk Creek Bridge", 'IV', 4.33, 'purple', 500, 2500);
newRiver[0].USGSsite = ["10011500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1831/' target='_blank'>American Whitewater (Multiple Sections) </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/92' target='_blank'>River Brain  </a></p>";
newRiver[1] = new RiverSection ({lat: 40.870279, lng: -110.834623}, "Bear River, East Fork: Stillwater to MP 51.5", 'III+', 3.66, 'blue', 900, 2500);
newRiver[1].USGSsite = ["10011500"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1831/' target='_blank'>American Whitewater (Multiple Sections) </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/91' target='_blank'>River Brain  </a></p>";
allRivers.push (newRiver);

// Blacks Fork, E. Fork [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.876745, lng: -110.541509}, "Black Fork, East Fork: ", 'II(+)', 2.66, 'green', 300, 3000);
newRiver[0].USGSsite = ["09217900"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1834/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/136' target='_blank'>River Brain  </a></p>";
allRivers.push (newRiver);

// Blacks Fork, W. Fork [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.928239, lng: -110.620663}, "Black Fork, West Fork: ", 'II(+)', 2.66, 'green', 300, 5000);
newRiver[0].USGSsite = ["09217900"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1835/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/137' target='_blank'>River Brain  </a></p>";
allRivers.push (newRiver);

// Blacksmith Fork [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 41.599424, lng: -111.568590}, "Blacksmith Fork: Hardware Ranch to Hyrum City Power Plant", 'I-III', 3.33, 'blue', 150, 1500);
newRiver[0].USGSsite = ["10113500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1836/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Chalk Creek [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.952298, lng: -111.202911}, "Chalk Creek: Upton to Coalville", 'I-II', 2.00, 'green', 100, 1000);
newRiver[0].USGSsite = ["10131000"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1837' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Dirty Devil [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.402827, lng: -110.691607}, "Dirty Devil", 'I-II', 2.00, 'green', 100, 1000);
newRiver[0].USGSsite = ["09333500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10280/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);
// add river brain links

// East Canyon Creek [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.807636, lng: -111.597411}, "East Canyon Creek", 'I-II', 2.00, 'green', 50, 600);
newRiver[0].USGSsite = ["10133800"];
newRiver[0].infoContent += "<p>A windy mountain creek through a beautiful open canyon. Class I with several occasional class II beaver dam drops.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1847/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Escalante [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.775996, lng: -111.417661}, "Escalante River", 'I-III', 3.33, 'blue', 100, 500);
newRiver[0].USGSsite = ["09337500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1848/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/123' target='_blank'>River Brain </a></p>";
allRivers.push (newRiver);

// Fremont [UT] A small, technical, deep, and beautiful canyon in Capitol Reef National Park.
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.268735, lng: -111.379640}, "Fremont Canyon", 'III-V+', 5.33, 'black', 130, 220);
newRiver[0].USGSsite = ["09330000"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1850/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/177' target='_blank'>River Brain </a></p>";
newRiver[1] = new RiverSection ({lat: 38.288373, lng: -111.163010}, "Fremont River: Capitol Reef Campground to Waterfall", 'II-III', 3.33, 'blue', 220, 800);
newRiver[1].USGSsite = ["09330000"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10593/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Little Cottonwood Creek [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.571215, lng: -111.772498}, "Little Cottonwood Creek: Temple Quarry to La Caille", 'IV-V', 5.33, 'red', 130, 400);
newRiver[0].USGSsite = ["10168000"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10907/' target='_blank'>American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 40.665039, lng: -111.901814}, "Little Cottonwood Creek: Creek Road to I-15", 'I-III', 3.33, 'blue', 130, 500);
newRiver[1].USGSsite = ["10168000"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1859/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Logan River [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 41.840001, lng: -111.587859}, "Logan River: Ricks Springs to Wood Camp", 'III-IV', 4.33, 'purple', 330, 1500);
newRiver[0].USGSsite = ["10109000"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1860/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/126' target='_blank'>River Brain </a></p>";
newRiver[1] = new RiverSection ({lat: 41.796893, lng: -111.645049}, "Logan River: Wood Camp to 3rd dam", 'III(+)', 3.33, 'blue', 200, 1600);
newRiver[1].USGSsite = ["10109000"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10574/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/128' target='_blank'>River Brain </a></p>";
newRiver[2] = new RiverSection ({lat: 41.754330, lng: -111.716413}, "Logan River: 3rd dam to 2nd dam", 'II-III', 3.00, 'blue', 350, 1000);
newRiver[2].USGSsite = ["10109000"];
newRiver[2].infoContent += "<p><a href='http://www.riverbrain.com/run/show/127' target='_blank'>River Brain </a></p>";
newRiver[3] = new RiverSection ({lat: 41.745123, lng: -111.749406}, "Logan River: 2nd dam to 1st dam", 'IV-V-', 5.00, 'red', 500, 1000);
newRiver[3].USGSsite = ["10109000"];
newRiver[3].infoContent += "<p><a href='http://www.riverbrain.com/run/show/130' target='_blank'>River Brain </a></p>";
newRiver[4] = new RiverSection ({lat: 41.734353, lng: -111.811568}, "Logan River: Town Run", 'II-III', 3.00, 'blue', 300, 1000);
newRiver[4].USGSsite = ["10109000"];
newRiver[4].infoContent += "<p><a href='http://www.riverbrain.com/run/show/128' target='_blank'>River Brain </a></p>";
allRivers.push (newRiver);

// Muddy Creek [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.813282, lng: -111.209888}, "Muddy Creek: I-70 to Tomsich Butte", 'I-III-', 3.00, 'blue', 200, 700);
newRiver[0].USGSsite = ["09330500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1861/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/154' target='_blank'>River Brain </a></p>" + "<p><a href='http://southwestpaddler.com/docs/muddyut.html' target='_blank'>Southwest Paddler</a></p>";
newRiver[1] = new RiverSection ({lat: 38.671199, lng: -110.994280}, "Muddy Creek: Wood Camp to 3rd dam", 'I-II+', 2.66, 'green', 200, 1600);
newRiver[1].USGSsite = ["09330500"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1861/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/155' target='_blank'>River Brain </a></p>" + "<p><a href='http://southwestpaddler.com/docs/muddyut.html' target='_blank'>Southwest Paddler</a></p>";
allRivers.push (newRiver);

// Ogden, South Fork [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 41.295562, lng: -111.602324}, "South Fork Ogden River", 'I-III+', 3.66, 'blue', 100, 500);
newRiver[0].USGSsite = ["10137500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1862/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Ogden River [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 41.254000, lng: -111.843901}, "Ogden River: Pineview", 'III+', 3.66, 'blue', 200, 800);
newRiver[0].USGSsite = ["10140100"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1862/' target='_blank'>American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 41.240977, lng: -111.902534}, "Ogden Narrows", 'III-IV', 4.33, 'purple', 130, 1600);
newRiver[1].USGSsite = ["10140100"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1863/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/282' target='_blank'>River Brain </a></p>";
newRiver[2] = new RiverSection ({lat: 41.236603, lng: -111.942305}, "Rainbow Gardens", 'III(+)', 3.66, 'blue', 130, 1600);
newRiver[2].USGSsite = ["10140100"];
newRiver[2].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10900/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/129' target='_blank'>River Brain </a></p>";
newRiver[3] = new RiverSection ({lat: 41.237393, lng: -112.008990}, "Lower Ogden River", 'II-III', 3.33, 'blue', 150, 1500);
newRiver[3].USGSsite = ["10140700"];
newRiver[3].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10903/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/191' target='_blank'>River Brain </a></p>";
allRivers.push (newRiver);

// Price River [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.522347, lng: -110.687131}, "Price River: Wellington to Woodside", 'II(+)', 2.66, 'green', 200, 700);
newRiver[0].USGSsite = ["09314500"];
newRiver[0].infoContent += "<p><a href='http://www.riverbrain.com/run/show/121' target='_blank'>River Brain </a></p>";
newRiver[1] = new RiverSection ({lat: 39.264294, lng: -110.334200}, "Price River: Woodside to Confluence", 'II-III', 3.33, 'blue', 200, 700);
newRiver[1].USGSsite = ["09314500"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1866' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/122' target='_blank'>River Brain </a></p>";
allRivers.push (newRiver);

// Provo River [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.658091, lng: -110.946147}, "Upper Provo Falls", 'V(+)', 5.66, 'black', 600, 3000);
newRiver[0].USGSsite = ["10154200"];
newRiver[0].infoContent += "<p><a href='http://www.riverbrain.com/run/show/132' target='_blank'>River Brain </a></p>";
newRiver[1] = new RiverSection ({lat: 40.596452, lng: -110.973760}, "Provo River: Slate Gorge", 'IV(+)', 4.66, 'purple', 600, 2800);
newRiver[1].USGSsite = ["10154200"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4544/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/133' target='_blank'>River Brain (Upper)</a></p>" + "<p><a href='http://www.riverbrain.com/run/show/134' target='_blank'>River Brain (Lower)</a></p>";
newRiver[2] = new RiverSection ({lat: 40.594162, lng: -111.083789}, "Provo River: Soapstone to Pine Valley", 'II-IV', 4.00, 'blue', 300, 3000);
newRiver[2].USGSsite = ["10154200"];
newRiver[2].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1868' target='_blank'>American Whitewater</a></p>";
newRiver[3] = new RiverSection ({lat: 40.554580, lng: -111.164080}, "Provo River: Woodland", 'II-III', 3.00, 'blue', 300, 3000);
newRiver[3].USGSsite = ["10154200"];
newRiver[3].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10743' target='_blank'>American Whitewater</a></p>";
newRiver[4] = new RiverSection ({lat: 40.602649, lng: -111.344020}, "Provo River: 1000 East Bridge to Jordanelle", 'I-II', 2.00, 'green', 300, 3000);
newRiver[4].USGSsite = ["10154200"];
newRiver[4].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10743' target='_blank'>American Whitewater</a></p>";
newRiver[5] = new RiverSection ({lat: 40.507664, lng: -111.449940}, "Middle Provo", 'II+', 2.66, 'green', 400, 2000);
newRiver[5].USGSsite = ["10155200"];
newRiver[5].infoContent += "More known for fishing, the accesss can be an issue." + "<p><a href='http://www.riverbrain.com/run/show/265' target='_blank'>River Brain (Upper)</a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10741/' target='_blank'>American Whitewater</a></p>" + "<p><a href='http://southwestpaddler.com/docs/provo2.html' target='_blank'>Southwest Paddler</a></p>";
newRiver[6] = new RiverSection ({lat: 40.240010, lng: -111.712152}, "Provo Town", 'II+', 2.00, 'green', 300, 3000);
newRiver[6].USGSsite = ["10163000"];
newRiver[6].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10740' target='_blank'>American Whitewater</a></p>";
allRivers.push (newRiver);

// Rock Creek [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.531931, lng: -110.622927}, "Rock Creek", 'III-IV+', 4.33, 'purple', 300, 3000);
newRiver[0].USGSsite = ["09279000"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1869' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// San Rafael [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.116395, lng: -110.854449}, "San Rafael River: Little Grand Canyon", 'I-II', 2.33, 'green', 200, 1800);
newRiver[0].USGSsite = ["09328500"];
newRiver[0].infoContent += "<p><a href='http://www.riverbrain.com/run/show/61' target='_blank'>River Brain </a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1872/' target='_blank'>American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 39.011092, lng: -110.570922}, "San Rafael River: Black Boxes", 'III-IV+', 4.66, 'purple', 200, 700);
newRiver[1].USGSsite = ["09328500"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1873/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/178' target='_blank'>River Brain </a></p>";
allRivers.push (newRiver);

// Sevier [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.536956, lng: -112.276707}, "Sevier River: Leamington Canyon", 'II(III)', 2.66, 'green', 200, 2500);
newRiver[0].USGSsite = ["10224000"];
newRiver[0].infoContent += "<p><a href='http://www.riverbrain.com/run/show/179' target='_blank'>River Brain </a></p>";
allRivers.push (newRiver);

// Sixth Water Creek [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.161106, lng: -111.250817}, "Sixth Water Creek: Unborn Soul", 'Iv-V', 5.00, 'purple', 35, 200);
newRiver[0].USGSsite = ["10149000"];
newRiver[0].infoContent += "<p>Conflicting difficulty rating from River Brain and AW.</p>" +"<p><a href='http://www.riverbrain.com/run/show/61' target='_blank'>River Brain </a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4564/' target='_blank'>American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 40.084438, lng: -111.355064}, "Lower Sixth Water Creek", 'IV', 4.33, 'purple', 45, 300);
newRiver[1].USGSsite = ["10149000"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1873/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Spanish Fork [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.041683, lng: -111.544151}, "Spanish Fork", 'II-III', 3.00, 'blue', 200, 1000);
newRiver[0].USGSsite = ["10150500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1876' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/63' target='_blank'>River Brain </a></p>";
allRivers.push (newRiver);

// Strawberry [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.130333, lng: -110.704526}, "Strawberry River", 'I-IV+', 4.33, 'purple', 200, 2000);
newRiver[0].USGSsite = ["09288180"];
newRiver[0].infoContent += "<p><a href='http://www.riverbrain.com/run/show/81' target='_blank'>River Brain </a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1877' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Uinta [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.531284, lng: -110.059485}, "Uinta River", 'II(+)', 2.66, 'green', 300, 1500);
newRiver[0].USGSsite = ["09296800"];
newRiver[0].infoContent += "<p><a href='http://www.riverbrain.com/run/show/82' target='_blank'>River Brain </a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1878/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Virgin River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 37.176654, lng: -113.008479}, "Virgin Valley", 'II(+)', 2.66, 'green', 400, 3000);
newRiver[0].USGSsite = ["09405500"];
newRiver[0].infoContent +=  "<p>Below Zion National Park, the Virgin River mellows out to a Class II meander through the valley. There maybe some obstacles, thus the Class II+. We recommend using the river park in Springdale for the put-in and take-out at Sheep Bridge Park.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3594/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://virginriver.info/guide/guidevirvalley.htm' target='_blank'> Virgin River Runners Coalition </a></p>";
newRiver[1] = new RiverSection ({lat: 37.198343, lng: -113.173689}, "Timpoweap Canyon", 'V(+)', 5.66, 'black', 400, 800);
newRiver[1].USGSsite = ["09408150"];
newRiver[1].infoContent = "<h3>Timpoweap Canyon V+</h3>" + "<p>The most difficult section of water on the Virgin, this canyon is constant, dangerous, and full of must-make moves. Obviously, watch-out and scout for debris; be aware of additional flow that could be released from the dam at any time; bring your A-game. </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1879/' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://virginriver.info/guide/guidetimp.htm' target='_blank'> Virgin River Runners Coalition </a></p>";
newRiver[2] = new RiverSection ({lat: 37.197384, lng: -113.285100}, "Hurricane Canyon", 'III', 3.33, 'blue', 400, 10000);
newRiver[2].USGSsite = ["09408150"];
newRiver[2].infoContent = "<h3>Hurricane Canyon III</h3>" + "<p>Much milder than the canyon above, this run is a good Class III and a nice alternative if that upper canyon is running too big. </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4517' target='_blank'> American Whitewater </a></p>" + "<p><a href='http://virginriver.info/guide/guidehurricane.htm' target='_blank'> Virgin River Runners Coalition </a></p>";
newRiver[3] = new RiverSection ({lat: 37.161603, lng: -113.396216}, "Washington Fields", 'II', 2.33, 'green', 400, 800);
newRiver[3].USGSsite = ["09408150"];
newRiver[3].infoContent = "<h3>Washington Fields II</h3>" + "<p>A Meandering Class II run through an agricultural area. Mandatory Portage at Washington Canal Diversion.</P>" + "<p><a href='http://virginriver.info/guide/guidewashington.htm' target='_blank'> Virgin River Runners Coalition </a></p>";
newRiver[4] = new RiverSection ({lat: 37.051966, lng: -113.601042}, "Bloomington Gorge", 'II', 2.33, 'green', 400, 800);
newRiver[4].USGSsite = ["09413200"];
newRiver[4].infoContent = "<h3>Bloomington Gorge II</h3>" + "<p>A Meandering Class II run through a Gorge. Have to take out at I-15 (not legal) or figure out something else for shuttle. </P>" + "<p><a href='http://virginriver.info/guide/guidebloom.htm' target='_blank'> Virgin River Runners Coalition </a></p>";
newRiver[5] = new RiverSection ({lat: 36.970663, lng: -113.729768}, "Upper Virgin Gorge", 'III', 3.33, 'blue', 250, 5000);
newRiver[5].USGSsite = ["09413500"];
newRiver[5].infoContent = "<h3>Upper Virgin Gorge III</h3>" + "<p>A great Class III run is available just into Arizona, but access can be weird: you either have to paddle in from St. George or illegally stop in a dangerous spot on the highway. </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4518/' target='_blank'> American Whitewater </a></p>"+ "<p><a href='http://virginriver.info/guide/guideupgorge.htm' target='_blank'> Virgin River Runners Coalition </a></p>";
newRiver[6] = new RiverSection ({lat: 36.920711, lng: -113.878805}, "Lower Virgin Gorge", 'IV', 4.33, 'purple', 400, 5000);
newRiver[6].USGSsite = ["09413500"];
newRiver[6].infoContent = "<h3>Lower Virgin Gorge IV</h3>" + "<p>The Virgin Gorge picks up after the rest stop and is a consistent Class IV the most of the way.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4519/' target='_blank'> American Whitewater </a></p>"+ "<p><a href='http://virginriver.info/guide/guidelowgorge.htm' target='_blank'> Virgin River Runners Coalition </a></p>";
allRivers.push(newRiver);

// Weber [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.785902, lng: -111.163708}, "Weber River: Aspen Acres to North New Lane", 'II(III)', 3.00, 'blue', 400, 1200);
newRiver[0].USGSsite = ["10128500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1882' target='_blank'>American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 40.792674, lng: -111.404817}, "Weber River: Rockport Lake to Echo Reservoir", 'I-II', 2.00, 'green', 200, 2000);
newRiver[1].USGSsite = ["10130500"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4565/' target='_blank'>American Whitewater </a></p>";
newRiver[2] = new RiverSection ({lat: 40.969273, lng: -111.436637}, "Weber River: Echo Reservoir to Henefer", 'I-II', 2.00, 'green', 200, 3000);
newRiver[2].USGSsite = ["10132000"];
newRiver[2].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4566/' target='_blank'>American Whitewater </a></p>";
newRiver[3] = new RiverSection ({lat: 41.042063, lng: -111.518209}, "Weber River: Hennifer to Taggarts", 'II(III)', 3.00, 'blue', 200, 2000);
newRiver[3].USGSsite = ["10132000"];
newRiver[3].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4567/' target='_blank'>American Whitewater </a></p>" + "<p><a href='http://www.riverbrain.com/run/show/11' target='_blank'>River Brain </a></p>";
newRiver[4] = new RiverSection ({lat: 41.058006, lng: -111.591376}, "Weber River: Taggarts to Morgan", 'II', 2.00, 'green', 300, 3000);
newRiver[4].USGSsite = ["10136500"];
newRiver[4].infoContent += "<p><a href='http://www.riverbrain.com/run/show/77' target='_blank'>River Brain </a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4568/' target='_blank'>American Whitewater (it's only the first 3rd of this run)</a></p>";
newRiver[5] = new RiverSection ({lat: 41.038625, lng: -111.658803}, "Weber River: Morgan Waterfall", 'III+', 3.66, 'blue', 350, 1150);
newRiver[5].USGSsite = ["10136500"];
newRiver[5].infoContent += "<p><a href='http://www.riverbrain.com/run/show/71' target='_blank'>River Brain </a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4568' target='_blank'>American Whitewater (it's only the 2nd third of this run)</a></p>";
newRiver[6] = new RiverSection ({lat: 41.062549, lng: -111.728317}, "Weber River: Morgan to Gateway", 'II(+)', 2.66, 'green', 350, 1150);
newRiver[6].USGSsite = ["10136500"];
newRiver[6].infoContent += "<p><a href='http://www.riverbrain.com/run/show/75' target='_blank'>River Brain (only 2nd half of this section)</a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4568' target='_blank'>American Whitewater (it's only the last third of this run)</a></p>";
newRiver[7] = new RiverSection ({lat: 41.138215, lng: -111.833323}, "Weber River: Scrambled Egg", 'III-IV', 4.33, 'purple', 250, 3000);
newRiver[7].USGSsite = ["10136500"];
newRiver[7].infoContent += "<p><a href='http://www.riverbrain.com/run/show/78' target='_blank'>River Brain </a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1881/' target='_blank'>American Whitewater</a></p>";
newRiver[8] = new RiverSection ({lat: 41.135439, lng: -111.899625}, "Weber River: Mouth of Weber Canyon to Riverdale", 'III', 3.33, 'blue', 500, 5000);
newRiver[8].USGSsite = ["10136500"];
newRiver[8].infoContent += "<p><a href='http://www.riverbrain.com/run/show/73' target='_blank'>River Brain </a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4569/' target='_blank'>American Whitewater</a></p>";
newRiver[9] = new RiverSection ({lat: 41.185233, lng: -111.991999}, "Weber River: Riverdale Wave", 'III-', 3.00, 'blue', 500, 5000);
newRiver[9].USGSsite = ["10136500"];
newRiver[9].infoContent += "<p> High water of 2011 may have washed out this wave and it may need as much as 1400cfs to really get going.</p>" + "<p><a href='http://www.riverbrain.com/run/show/79' target='_blank'>River Brain </a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4573/' target='_blank'>American Whitewater</a></p>";

allRivers.push (newRiver);

// Yellowstone [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 40.600303, lng: -110.348714}, "Yellowstone River, UT", 'II(+)', 2.66, 'green', 200, 2500);
newRiver[0].USGSsite = ["09292500"];
newRiver[0].infoContent += "<p><a href='hhttp://www.riverbrain.com/run/show/68' target='_blank'>River Brain </a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1884/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Ferron Creek [UT]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.119473, lng: -111.251950}, "Ferron Creek, UT", 'III-IV', 4.33, 'purple', 250, 2500);
newRiver[0].USGSsite = ["09326500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1849' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

/* Utah Rivers
American Fork - break down into more sections
check river brain for more potential sections
look for visual flow sections

*/

//////////////////////////// AriZona  /////////////////////////////////////////////////

// Colorado River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 36.774909, lng: -111.655272}, "Grand Canyon", 'I-IV', 4.33, 'purple', 4000, 48000);
newRiver[0].USGSsite = ["09380000"];
newRiver[0].infoContent += "<p>The Grand. It's an adventure. It's also really difficult to win the lottery.</p>" +"<p><a href='https://www.nps.gov/grca/planyourvisit/weightedlottery.htm' target='_blank'>Permit Lottery  </a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/114/' target='_blank'>American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 35.766043, lng: -113.373204}, "Diamond Down", 'I-IV', 4.33, 'purple', 4000, 48000);
newRiver[1].USGSsite = ["09404200"];
newRiver[1].infoContent += "Yes, this is still part of the Grand but it's worth mentioning separately because the permit process is MUCH easier for this section of the Grand." +"<p><a href='https://www.nps.gov/grca/planyourvisit/overview-diamond-ck.htm' target='_blank'>Permit Lottery  </a></p>" +  "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/114/' target='_blank'>American Whitewater </a></p>";
newRiver[2] = new RiverSection ({lat: 36.010951, lng: -114.743137}, "Black Canyon", 'I', 2.00, 'green', 4000, 48000);
newRiver[2].USGSsite = ["09404200"];
newRiver[2].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3190/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Bill Williams [AZ]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 34.2306742, lng: -113.6154998}, "Bill Williams", 'II-III', 3.33, 'blue', 200, 5000);
newRiver[0].USGSsite = ["09426000"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/109/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Black, E. Fork [AZ]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 33.7134442, lng: -110.2217978}, "East Fork Black River", 'IV-V', 5.00, 'red', 200, 5000);
newRiver[0].USGSsite = ["09489500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/110/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Blue [AZ]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 33.4975582, lng: -109.2226428}, "Blue River, AZ", 'II+', 2.66, 'green', 150, 10000);
newRiver[0].USGSsite = ["09444200"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/112/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Chevelon Creek [AZ]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 34.5122762, lng: -110.8339418}, "Chevelon Creek", 'IV+', 4.66, 'purple', 200, 10000);
newRiver[0].USGSsite = ["09397500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/113/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Christopher Creek, Arizona, US
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 34.3076831, lng: -111.0628518}, "Christopher Creek Box Canyon", 'V(+)', 5.66, 'black', 100, 1000);
newRiver[0].USGSsite = ["09499000"];
newRiver[0].infoContent += "<p>Uses the flow from Tonto Creek to determine if runnable; you take out after the confluence of Tonto and Christopher Creeks.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5523' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Eagle Creek [AZ]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 34.3076831, lng: -111.0628518}, "Christopher Creek Box Canyon", 'V(+)', 5.66, 'black', 100, 1000);
newRiver[0].USGSsite = ["09499000"];
newRiver[0].infoContent += "<p>Uses the flow from Tonto Creek to determine if runnable; you take out after the confluence of Tonto and Christopher Creeks.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5523' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// East Verde [AZ]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 34.2869282, lng: -111.3934248}, "East Verde River", 'III-V', 5.33, 'red', 200, 20000);
newRiver[0].USGSsite = ["09507980"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/116/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Ellison Creek [AZ]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 34.3474592, lng: -111.2814348}, "Ellison Creek", 'V', 5.33, 'red', 200, 20000);
newRiver[0].USGSsite = ["09507980"];
newRiver[0].infoContent += "Uses the flow from East Verde to determine if its runnable.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5528/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Fossil Creek [AZ]
var newRiver = [];
// Upper Fossil Creek
newRiver[0] = new RiverSection ({lat: 34.4256252, lng: -111.5815558}, "Upper Fossil Creek", 'II-III(V)', 3.33, 'blue', 45, 500);
newRiver[0].USGSsite = ["09507480"];
newRiver[0].infoContent += "Committing run that can drag on. The (V) rating is for the option waterfall at the put-in.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5528/' target='_blank'>American Whitewater </a></p>";
// Lower Fossil Creek
newRiver[1] = new RiverSection ({lat: 34.3954452, lng: -111.6391048}, "Fossil Creek Classic Section ", 'III+(IV)', 3.66, 'blue', 200, 20000);
newRiver[1].USGSsite = ["09507480"];
newRiver[1].infoContent += "Loved to Death.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5061' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Havasu Creek - 01. Falls to Colorado River
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 36.2550622, lng: -112.7066368}, "Havasu Creek", 'III(V+)', 3.33, 'blue', 500, 1200);
newRiver[0].timing = [new Date("01 April " + curYear), new Date("30 August" + curYear)];
newRiver[0].infoContent += "Gorgeous run in the Grand Canyon area; need a permit to run it." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4513' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Little Colorado [AZ] - these are out of order but will do for now
var newRiver = [];
// 01. Below Grand Falls to above Black Falls
newRiver[0] = new RiverSection ({lat: 35.4295791, lng: -111.2107608}, "Little Colorado: Grand Falls to Black Falls", 'II-III', 3.33, 'blue', 45, 500);
newRiver[0].USGSsite = ["09402000"];
newRiver[0].infoContent += "Below Grand Falls to above Black Falls.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/119/' target='_blank'>American Whitewater </a></p>";
// Upper Little Colorado
newRiver[1] = new RiverSection ({lat: 34.2866552, lng: -109.3607338}, "Upper Little Colorado", 'IV-V(+) ', 5.33, 'red', 120, 2500);
newRiver[1].USGSsite = ["09384000"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/6804' target='_blank'>American Whitewater </a></p>";
// Cameron to confluence
newRiver[2] = new RiverSection ({lat: 35.8758892, lng: -111.4155608}, "Little Colorado: Cameron to confluence", 'I-IV', 4.00, 'purple', 200, 10000);
newRiver[2].USGSsite = ["09402000"];
newRiver[2].infoContent += "<p> Take out strategy maybe complicated.</p>" + "<p><a href='http://navajonationparks.org/' target='_blank'>Permit required from Navajo Nation </a></p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/120/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Oak Creek [AZ]
var newRiver = [];
// Oak Creek: Slide Rock Section
newRiver[0] = new visualRiverSection ({lat: 35.0237222, lng: -111.7451658}, "Oak Creek: Slide Rock Section", 'V', 5.33, 'red', 45, 500);
newRiver[0].timing = [new Date("01 March " + curYear), new Date("30 August" + curYear)];
newRiver[0].USGSsite[1] = "09504420";
newRiver[0].infoContent += "Mostly runs during runoff season or monsoon season. Related flow is further downstream; look for it above 300 at least.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/11014' target='_blank'>American Whitewater </a></p>";
// Oak Creek Indian Gardens
newRiver[1] = new visualRiverSection ({lat: 34.9105152, lng: -111.7368098}, "Oak Creek Indian Gardens", 'IV', 4.33, 'purple', 300, 700);
newRiver[1].timing = [new Date("01 March " + curYear), new Date("30 August" + curYear)];
newRiver[1].USGSsite[1] = "09504420";
newRiver[1].infoContent += "<p>Classic section. Related flow is further downstream; look for it above 300 at least.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/11013/' target='_blank'>American Whitewater </a></p>";
// Sedona to Red Rock Crossing
newRiver[2] = new RiverSection ({lat: 34.8255872, lng: -111.8175798}, "Sedona to Red Rock Crossing", 'III(+)', 3.66, 'green', 300, 700);
newRiver[2].USGSsite = ["09504420"];
newRiver[2].infoContent += "<p> Take out strategy maybe complicated.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/121/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Salome Creek [AZ] Extreme, steep, canyoneering creek with no escapes
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 33.7980912, lng: -111.1027818}, "Salome Creek: The Jug", 'V+', 5.66, 'black', 45, 500);
newRiver[0].timing = [new Date("01 March " + curYear), new Date("30 August" + curYear)];
newRiver[0].USGSsite[1] = "09497980";
newRiver[0].infoContent += "Very technical and consequential run without any exit; recommended to canyoneer when dry. Related flow is from Cherry Creek; look for it 7-100 cfs.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5521/' target='_blank'>American Whitewater </a></p>";

///// Salt [AZ]
var newRiver = [];
// Day Run: US 60 to Mescal Rapid
newRiver[0] = new RiverSection ({lat: 33.7976792, lng: -110.5122788}, "Salt River: Day Run", 'III(IV)', 3.66, 'blue', 300, 10000);
newRiver[0].USGSsite = ["09497500"];
newRiver[0].infoContent += "<p>Illegal to run above this; permit required for this run.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3657/' target='_blank'>American Whitewater </a></p>";
// Salt Canyon: US 60 to Hwy 288 above Roosevelt Reservoir
newRiver[1] = new RiverSection ({lat: 33.6238772, lng: -110.9367758}, "Salt Canyon", 'II-IV', 4.00, 'purple', 800, 10000);
newRiver[1].USGSsite = ["09497500"];
newRiver[1].infoContent += "<p>Permit required from March 1st to May 15th for this overnight (60 mile) trip. Need over 1200 cfs for a loaded raft.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/123/' target='_blank'>American Whitewater </a></p>";
// Gleason Flats 19 mi. to Horseshoe Bend
newRiver[2] = new RiverSection ({lat: 33.6821412, lng: -110.7507808}, "Salt River: Gleason Flats to Horseshoe Bend", 'II-IV', 4.00, 'purple', 800, 10000);
newRiver[2].USGSsite = ["09497500"];
newRiver[2].infoContent += "<p>If you want to break down the Salt Canyon into a smaller run with a long shuttle, you can do this 19 mile version. Need over 1200 cfs for a loaded raft.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/122' target='_blank'>American Whitewater </a></p>";
// Stewart Mountain Dam to Granite Reef Dam
newRiver[3] = new RiverSection ({lat: 33.5550222, lng: -111.5516668}, "Salt River: Stewart Mountain Dam to Granite Reef Dam", 'II-', 2.00, 'green', 400, 10000);
newRiver[3].USGSsite = ["09502000"];
newRiver[3].infoContent += "<p>If you want to break down the Salt Canyon into a smaller run with a long shuttle, you can do this 19 mile version. Need over 1200 cfs for a loaded raft.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/122' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Sycamore Creek [AZ] A beautiful stream from SW of Flagstaff to W of Sedona, typically running from late spring through early summer.
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 35.1242552, lng: -112.0062098}, "Sycamore Creek", 'II-IV', 4.00, 'purple', 200, 10000);
newRiver[0].USGSsite = ["09510200"];
newRiver[0].infoContent += "<p>Short season for this creek; depends on snow in the Prescott Forest.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4540/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Tonto Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 34.0063592, lng: -111.3056398}, "Tonto Creek", 'IV(V)', 4.66, 'purple', 200, 10000);
newRiver[0].USGSsite = ["09499000"];
newRiver[0].infoContent += "<p>American Whitewater: easonal stream where major rain events are necessary to raise it to boatable levels. Those with the skills to safely enjoy this creek will get to enjoy a very remote area of Tonto National Forest.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/126/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

///// Verde River
var newRiver = [];
// 02. Clarkdale Town Run (TAPCO to Tuzigoot)
newRiver[0] = new RiverSection ({lat: 34.7669911, lng: -112.0492958}, "Verde River: Clarkdale Town Run", 'II', 2.33, 'green', 65, 1000);
newRiver[0].USGSsite = ["09504000"];
newRiver[0].infoContent +=  "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/126/' target='_blank'>American Whitewater </a></p>";
// 03. Clarkdale to Camp Verde
newRiver[1] = new RiverSection ({lat: 34.6803801, lng: -111.9647098}, "Verde River: Clarkdale to Camp Verde", 'II-', 2.00, 'green', 200, 1000);
newRiver[1].USGSsite = ["09506000"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/128/' target='_blank'>American Whitewater </a></p>";
// Verde - 04. Camp Verde to Beasley Flat
newRiver[2] = new RiverSection ({lat: 34.5049741, lng: -111.8447188}, "Verde River: Camp Verde to Beasley Flat", 'II', 2.33, 'green', 300, 5000);
newRiver[2].USGSsite = ["09506000"];
newRiver[2].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/129/' target='_blank'>American Whitewater </a></p>";
// 05. Beasley Flat to Gap Creek
newRiver[3] = new RiverSection ({lat: 34.4454312, lng: -111.7977268}, "Verde Daily: Beasley Flat to Gap Creek", 'II-IV', 4.00, 'purple', 600, 30000);
newRiver[3].USGSsite = ["09506000"];
newRiver[3].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/130' target='_blank'>American Whitewater </a></p>";
// 06. Childs to Horseshoe Reservoir (Wilderness Run)
newRiver[4] = new RiverSection ({lat: 34.1012931, lng: -111.7241278}, "Verde River: Wilderness Run", 'I-III+', 3.66, 'blue', 300, 30000);
newRiver[4].USGSsite = ["09506000"];
newRiver[4].infoContent += "<p>Rapids can be up to Class III+ in difficulty and the wilderness aspect of this run warrant the rating.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/131/' target='_blank'>American Whitewater </a></p>";
// 08. Bartlett Reservoir to confluence with Salt River
newRiver[5] = new RiverSection ({lat: 33.8042272, lng: -111.6640888}, "Verde River: Bartlett Reservoir to confluence with Salt River", 'I-II+', 2.66, 'green', 300, 30000);
newRiver[5].USGSsite = ["09510000"];
newRiver[5].infoContent += "<p>Rapids can be up to Class III+ in difficulty and the wilderness aspect of this run warrant the rating.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/133' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Wet Beaver Creek [AZ] Wet Beaver Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 34.6786061, lng: -111.7021438}, "Wet Beaver Creek", 'II-III+', 3.66, 'blue', 100, 5000);
newRiver[0].USGSsite = ["09505200"];
newRiver[0].infoContent += "<p>Described as similar to Oak Creek, but without the traffic.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/135' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// White River, East Fork [AZ]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 33.8372352, lng: -109.8051998}, "White River, East Fork", 'III+', 3.66, 'blue', 100, 5000);
newRiver[0].USGSsite = ["09492400"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/135' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);


/* AZ Rivers
Excluded:
Black, E. Fork [AZ] 01. Diamond Rock 6.0 mi to Buffalo Xing, 12 mi to Wildcat Po...
Gila does not have much info.....
Gila - 03. Virden (NM) 30 miles to US Route 666, 23 miiles to Bonita Creek
Gila - 04. Kelvin to Ashurst-Hayden Dam
// Paria River [AZ]
Salt - 01. Fort Apache to US 60 - a VERY illegal run
San Francisco [AZ] - need  more info

Verde - 01. Perkinsville to Clarkdale - not sure if this is the right rating as a CLass I; I think it's more difficult than that
Verde - 07. Horseshoe Reservoir to Bartlett Reservoir


*/



/*
Navajo [NM]
Pecos [NM] 01. Cowles to Pecos
Pecos [NM] 02. Pecos to Villanueva
Rio Brazos [NM]
Rio Chama [NM] 01. Lobo Lodge to Chama River Park
Rio Pueblo de Taos [NM] 02. Rio Lucio to Rio Grande Confluence
Rio Santa Cruz [NM]
Rio de los Pinos [NM] Toltec Gorge (Rio Grande)
Rio de los Pinos [NM] 02. Atencio Canyon to Los Pinos
San Antonio [NM] 01. Lagunitas to Los Pinos
Trampas Creek (Rio de las Trampas) [NM] An Embudo trib, this only runs when the Embudo is way high. Some manky drops and a couple stellar ones.
Big Cottonwood Creek [UT] A steep fast creek with almost no eddies, and significant rock issues. 
Cottonwood Creek [UT]
Ferron Creek, lower [UT] Another nice desert creek
Huntington Creek, Left Fork [UT] Formerly a Utah classic, there are now a half dozen or more portages, some a few hundred yards long,  that make the run a questionable choice for many. 
Huntington Creek [UT] Exciting run at higher water, with a great deal of wood.
Price - upper sections [UT]
Price - upper sections
Provo River - Deer Creek to Vivian Park
Prover River = Bridal Viel Falls - use Utah's gauges: http://data.cuwcd.com/data/streamflows/index.htm
Salina Creek [UT]
Sevier River [UT] - most sections
*/


//////// Wyoming ////////////////////////////////////////////////

// Bear [WY] 01. Sulphur Campground to Chalk Creek,WY
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 42.1406121, lng: -110.9856408}, "Bear River: Sulphur Campground to Chalk Creek, WY", 'I-IV', 4.33, 'purple', 500, 2500);
newRiver[0].USGSsite = ["10011500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1831/' target='_blank'>American Whitewater </a></p>";
// Bear River: Evanston whitewater park
newRiver[1] = new RiverSection ({lat: 41.2632471, lng: -110.9460728}, "Bear River: Evanston whitewater park", 'II', 2.33, 'green', 300, 1800);
newRiver[1].USGSsite = ["10016900"];
newRiver[1].infoContent += "<p> Ideal 500-1000 cfs. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5275' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Bitch Creek [WY] Headwaters to state line
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 43.9843422, lng: -110.9892888}, "Bitch Creek", 'II-', 2.00, 'green', 500, 1200);
newRiver[0].timing = [new Date("01 April " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2494' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Blacks Fork [WY] Meek's Cabin Res to WY 410
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 41.1838402, lng: -110.4853768}, "Blacks Fork", 'I-III', 3.00, 'blue', 500, 1200);
newRiver[0].timing = [new Date("01 April " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5679/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Bluegrass Creek [WY] Tunnel outlet to Highway 34
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 41.8710801, lng: -105.2234838}, "Bluegrass Creek", 'I-V', 4.66, 'purple', 500, 1200);
newRiver[0].timing = [new Date("01 August " + curYear), new Date("15 October " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. This section has 3 big Class V rapids, an intermediate Class III-IV section, and lots of swift-moving Class II." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3550/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Box Elder Creek [WY] Box Elder Canyon
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 42.7235561, lng: -105.8044338}, "Box Elder Canyon", 'IV', 4.33, 'purple', 80, 900);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. This section used to have a gauge on it, but that hasn't operated since June 2016; if that gauge ever comes back on, it's included in the related flow and is runnable between 80 and 900 cfs." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5258/' target='_blank'> American Whitewater</a></p>";
newRiver[0].USGSsite[1] = "06647500";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

// Buffalo Fork, South Fork [WY] Hike-In
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 43.8451081, lng: -110.1732588}, "Buffalo Fork, South Fork", 'III-IV', 4.33, 'purple', 500, 1200);
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. Hike-in run." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/11011/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Buffalo Fork [WY] Upper (Hike-In)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 43.8547241, lng: -110.2744528}, "Buffalo Fork (upper)", 'II-III', 3.33, 'blue', 500, 1200);
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. Hike-in run; the lower part of this river is not open to watercraft per the Grand Teton National." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/11012/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Bull Lake Creek [WY] North Fork to Bull Lake
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 43.0927411, lng: -109.4102558}, "Bull Lake Creek", 'IV-V+', 5.33, 'black', 300, 3000);
newRiver[0].USGSsite = ["06224000"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2488/' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Clarks Fork Yellowstone [WY] 1. Styx and Stones
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 44.9783691, lng: -109.8433788}, "Clarks Fork Yellowstone: Styx and Stones", 'V+', 5.66, 'black', 394, 4603);
newRiver[0].USGSsite = ["06207500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2488/' target='_blank'>American Whitewater </a></p>";
// Clarks Fork Yellowstone [WY] 2. Upper - there has to be some measurement for this section
newRiver[1] = new visualRiverSection ({lat: 44.9095721, lng: -109.7026938}, "Upper Clarks Fork Yellowstone", 'III-V', 5.33, 'red', 500, 1200);
newRiver[1].timing = [new Date("01 April " + curYear), new Date("30 June " + curYear)];
newRiver[1].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2471' target='_blank'> American Whitewater</a></p>";
// I think there has to be a gauge for this
// Clarks Fork Yellowstone [WY] 3. Honeymoon
newRiver[2] = new visualRiverSection ({lat: 44.8548611, lng: -109.6015688}, "Clarks Fork Yellowstone: Honeymoon", 'IV-V+', 5.33, 'black', 500, 1200);
newRiver[2].timing = [new Date("01 April " + curYear), new Date("30 June " + curYear)];
newRiver[2].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3997' target='_blank'> American Whitewater</a></p>";
// Clarks Fork Yellowstone [WY] 4. The Box
newRiver[3] = new RiverSection ({lat: 44.7892941, lng: -109.4065988}, "Clarks Fork Yellowstone: The Box", 'V+', 5.66, 'black', 500, 1200);
newRiver[3].USGSsite = ["06207500"];
newRiver[3].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3999/' target='_blank'> American Whitewater</a></p>";
// Clarks Fork Yellowstone [WY] 5. Lower
newRiver[4] = new RiverSection ({lat: 44.8422541, lng: -109.3258868}, "Clarks Fork Yellowstone: Lower", 'III-V', 5.00, 'red', 300, 5000);
newRiver[4].USGSsite = ["06207500"];
newRiver[4].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3999/' target='_blank'> American Whitewater</a></p>";
// check some of the visual sections on this river to see if there is something we can do  about 
allRivers.push (newRiver);

//////// Add related flow to these sections

// Clear Creek [WY] 1- confluence of Nth. & Mid. Forks to Moiser Gulch Picnic ar...
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 44.3167251, lng: -106.8970948}, "Upper Clear Creek", 'IV-V ', 5.33, 'red', 500, 1200);
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3976/' target='_blank'> American Whitewater</a></p>";
// Clear Creek [WY] 2- Moiser Picnic to Old Hydro Station
newRiver[1] = new visualRiverSection ({lat: 44.3288481, lng: -106.8182238}, "Middle Clear Creek", 'IV-IV ', 4.33, 'purple', 500, 1200);
newRiver[1].timing = [new Date("15 April " + curYear), new Date("15 July " + curYear)];
newRiver[1].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4000' target='_blank'> American Whitewater</a></p>";
// Clear Creek [WY] 3- from 2 miles above to 1/2 mile below Buffalo
newRiver[2] = new visualRiverSection ({lat: 44.3527811, lng: -106.6975808}, "Lower Clear Creek", 'II-III ', 3.33, 'blue', 500, 1200);
newRiver[2].timing = [new Date("15 April " + curYear), new Date("15 July " + curYear)];
newRiver[2].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2491/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Crandall Creek [WY] Trailhead to Clarks Fork Yellowstone R.
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 44.8313461, lng: -109.7042498}, "Crandall Creek", 'III-V', 5.33, 'red', 700, 5000);
newRiver[0].USGSsite = ["06207500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2481' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Crystal Creek [WY] Falls to Crystal Creek Rd.
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 43.5504851, lng: -110.4130938}, "Crystal Creek", 'V', 5.33, 'red', 500, 1200);
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. Hike-in run." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5709/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);


// Deer Creek [WY]
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 42.5204651, lng: -106.0793018}, "Deer Creek: Upper Canyon", 'III-V', 5.33, 'red', 150, 900);
newRiver[0].timing = [new Date("10 April " + curYear), new Date("31 May " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. This section does not have a gauge but the AW page used the Box Elder gauge, but that hasn't operated since June 2016; if that gauge ever comes back on, it's included in the related flow and is runnable above 150 cfs." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2485' target='_blank'> American Whitewater</a></p>";
newRiver[0].USGSsite[1] = "06647500";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
newRiver[1] = new visualRiverSection ({lat: 42.7343521, lng: -106.0273208}, "Deer Creek: Lower Canyon", 'IV-V+', 5.66, 'black', 150, 900);
newRiver[1].timing = [new Date("10 April " + curYear), new Date("31 May " + curYear)];
newRiver[1].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. This section does not have a gauge but the AW page used the Box Elder gauge, but that hasn't operated since June 2016; if that gauge ever comes back on, it's included in the related flow and is runnable above 150 cfs." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2486/' target='_blank'> American Whitewater</a></p>";
newRiver[1].USGSsite[1] = "06647500";
newRiver[1].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

// Douglas Creek [WY] Rob Roy Reservoir to Bobbie Thomson Campground below Keysto...
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 41.1966211, lng: -106.2738878}, "Douglas Creek: Rob Roy Reservoir", 'III-V', 5.33, 'red', 150, 900);
newRiver[0].timing = [new Date("10 April " + curYear), new Date("31 May " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. This section had a gauge, but it's not working now; if that gauge ever comes back on, it's included in the related flow. This flow is dependent on the release from the reservior." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5218' target='_blank'> American Whitewater</a></p>";
newRiver[0].USGSsite[1] = "06620400";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

// Encampment [WY] State Line to Encampment (canyon)
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 41.086117, lng: -106.796145}, "Encampment River (Canyon)", 'IV+', 4.33, 'purple', 300, 1200);
newRiver[0].USGSsite = ["06625000"];
newRiver[0].infoContent = "<h3>Encampment River IV+</h3>" + "<p>Remote River that offers some great boating.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2460/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Granite Creek [WY] Wooden Bridge to mouth
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 43.3351891, lng: -110.4471838}, "Granite Creek", 'III', 3.33, 'blue', 500, 1200);
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. " + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2477' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Green [WY] Green River Lakes to Tepee Creek
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 43.3141371, lng: -109.8648538}, "Greeen River: Lakes to Tepee Creek", 'II-III', 3.33, 'blue', 400, 5200);
newRiver[0].USGSsite = ["09188500"];
newRiver[0].infoContent += "<p>We know there is a lot of Green River in Wyoming, but this is the only section listed on AW. We hope to add more. </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2476' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Greybull [WY] Venus Creek to Forest Service boundary
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 44.1106482, lng: -109.3608488}, "Greybull River", 'I-III', 3.33, 'blue', 500, 1200);
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. " + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2480' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Greys [WY] 1) Murphy Creek Bridge to Little Greys River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 43.0626191, lng: -110.8412018}, "Upper Greys River", 'III-IV', 4.00, 'purple', 800, 2800);
newRiver[0].USGSsite = ["13023000"];
newRiver[0].infoContent += "<p>Nice.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/6277/' target='_blank'> American Whitewater </a></p>";
newRiver[1] = new RiverSection ({lat: 43.1440431, lng: -110.9866518}, "Lower Greys River", 'IV', 4.33, 'purple', 300, 2999);
newRiver[1].USGSsite = ["13023000"];
newRiver[1].infoContent += "<p>Still Nice.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2475/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Gros Ventre [WY] Lower Slide Lake to Kelly
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 43.6267391, lng: -110.6138728}, "Gros Ventre River", 'II-IV', 4.00, 'purple', 500, 4000);
newRiver[0].USGSsite = ["13014500"];
newRiver[0].infoContent += "<p>Make sure you take out before entering The National Park. River running in the park is prohibitted.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2474' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Hoback [WY] Bondurant to Snake River (Hoback Canyon)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 43.2328081, lng: -110.4467378}, "Hoback Canyon", 'I-III', 3.33, 'blue', 500, 1200);
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. There was a gauge on this river once upon a time (USGS: 13019500)" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2482/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Laramie [WY] 1- Jelm Public Access to Woods Landing (Jelm Canyon)
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 41.0612181, lng: -106.0201788}, "Laramie River: Jelm Canyon", 'II(+)', 2.66, 'green', 500, 1200);
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. The gauge displayed is further downstream." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2482/' target='_blank'> American Whitewater</a></p>";
newRiver[0].USGSsite[1] = "06660000";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
// Laramie [WY] 2- Laramie town run
newRiver[1] = new visualRiverSection ({lat: 41.3000202, lng: -105.6172088}, "Laramie River: Town Run", 'II(+)', 2.66, 'green', 500, 1200);
newRiver[1].timing = [new Date("15 April " + curYear), new Date("15 July " + curYear)];
newRiver[1].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. The gauge displayed is fright in town, but we have no idea about the levels that are best for running this section (yet)." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5211' target='_blank'> American Whitewater</a></p>";
newRiver[1].USGSsite[1] = "06660000";
newRiver[1].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
// Laramie [WY] 3- Thunder River Rd. (Wheatland #2) to Tunnel Rd.
newRiver[2] = new RiverSection ({lat: 41.9117442, lng: -105.6251268}, "Laramie Canyon", 'I-IV', 4.00, 'purple', 300, 4000);
newRiver[2].USGSsite = ["06660000"];
newRiver[2].infoContent += "<p>There is not a direct USGS gauge on this section; there are a couple above and below; there is one NOAA gauge on this section, but we have not determined the best means to pull this data. We display the USGS upstream. </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2463/' target='_blank'>" + "<p><a href='https://hads.ncep.noaa.gov/cgi-bin/hads/interactiveDisplays/displayMetaData.pl?table=dcp&nwsli=LRTW4' target='_blank'>NOAA Gauge </a></p>" + "<p><a href='https://waterdata.usgs.gov/nwis/uv?site_no=06670500' target='_blank'>USGS Gauge further downstream (Fort Laramie) </a></p>";
// Laramie [WY] 3- Thunder River Rd. (Wheatland #2) to Tunnel Rd.
newRiver[3] = new RiverSection ({lat: 42.0447791, lng: -105.1609008}, "Lower Laramie Canyon", 'IV-V', 4.66, 'purple', 300, 4000);
newRiver[3].USGSsite = ["06660000"];
newRiver[3].infoContent += "<p>There is not a direct USGS gauge on this section; there are a couple above and below; there is one NOAA gauge on this section, but we have not determined the best means to pull this data. We display the USGS upstream. </P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2463/' target='_blank'>" + "<p><a href='https://hads.ncep.noaa.gov/cgi-bin/hads/interactiveDisplays/displayMetaData.pl?table=dcp&nwsli=LRTW4' target='_blank'>NOAA Gauge </a></p>" + "<p><a href='https://waterdata.usgs.gov/nwis/uv?site_no=06670500' target='_blank'>USGS Gauge further downstream (Fort Laramie) </a></p>";
allRivers.push (newRiver);

////// Seee about pulling data from NOAA //////

// Libby Creek [WY] FS 351 to Hwy 130
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 41.3190461, lng: -106.1666588}, "Libby Creek", 'I-III', 3.00, 'blue', 500, 4000);
newRiver[0].USGSsite = ["06632400"];
newRiver[0].infoContent += "<p>The gauge on the AW page looks unrelated, but we'll go with it for now.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5208' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Medicine Bow River [WY]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 41.5259352, lng: -106.4005478}, "Medicine Bow River", 'IV', 4.00, 'purple', 500, 2000);
newRiver[0].USGSsite = ["06630465"];
newRiver[0].infoContent += "<p>The gauge on the AW page looks unrelated, so we are using a gauge on this actual river instead; the flows may not correlate so well.</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5209' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// Middle Crow Creek [WY]
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 41.1743391, lng: -105.2327298}, "Middle Crow Creek", 'III(IV)', 3.66, 'blue', 500, 1200);
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Not much info on this section." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5624' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Middle Fork Little Laramie [WY]
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 41.2734121, lng: -106.0883548}, "Middle Fork Little Laramie", 'IV(V+)', 4.66, 'purple', 500, 1200);
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Not much info on this section. AW uses Rock Creek to determine if this section is running. That is in direct, so we call it a visual section and post Rock Creek as a related flow. Should be runnable betweeen 500 and 2000 cfs." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5257/' target='_blank'> American Whitewater</a></p>";
newRiver[0].USGSsite[1] = "06632400";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

// Middle Popo Agie [WY] Sinks Cavern
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 42.7662751, lng: -108.7979368}, "Middle Popo Agie: Sinks Cavern", 'IV-V', 5.00, 'red', 500, 2000);
newRiver[0].USGSsite = ["06233000"];
newRiver[0].infoContent += "<p>Looks like fun...</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2484/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);

// North Fork Encampment [WY]
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 41.1411861, lng: -106.9434568}, "North Fork Encampment", 'II-V+', 5.33, 'red', 500, 2000);
newRiver[0].USGSsite = ["06623800"];
newRiver[0].infoContent += "<p>Looks like fun...</P>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5294/' target='_blank'> American Whitewater </a></p>";
allRivers.push(newRiver);


// North Fork Little Laramie [WY]
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 41.3379301, lng: -106.1729248}, "North Fork Little Laramie", 'IV', 4.33, 'purple', 150, 900);
newRiver[0].timing = [new Date("10 April " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. This section had a gauge, but it's not working now; instead we use Rock Creek as a related flow (like AW site; should be runnable between 200 and 2000 cfs on Rock Creek." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5215' target='_blank'> American Whitewater</a></p>";
newRiver[0].USGSsite[1] = "06632400";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

// North French Creek [WY] Along Hwy 130
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 41.3198021, lng: -106.4240228}, "North French Creek", 'III', 3.33, 'blue', 150, 900);
newRiver[0].timing = [new Date("20 April " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is an estimate of when this section is possible. Early in the season, you may have access issues because of snow. This section had a gauge, but it's not working now; instead we use Rock Creek as a related flow (like AW site; should be runnable between 400 and 2000 cfs on Rock Creek. It seems like every run in The Medicine Bow Area uses Rock Creek as a reference." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5215' target='_blank'> American Whitewater</a></p>";
newRiver[0].USGSsite[1] = "06632400";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

// North Mullens Creek [WY] Along FS 500
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 41.2304921, lng: -106.4039388}, "North Mullens Creek", 'III', 3.33, 'blue', 150, 900);
newRiver[0].timing = [new Date("20 April " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow; sounds really woody. Range of dates is an estimate of when this section maybe possible. Early in the season, you may have access issues because of snow. We use Rock Creek as a related flow (like AW site); should be runnable between 400 and 2000 cfs on Rock Creek. It seems like every run in The Medicine Bow Area uses Rock Creek as a reference." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5215' target='_blank'> American Whitewater</a></p>";
newRiver[0].USGSsite[1] = "06632400";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

// North Platte [WY] 01. State line to French Creek (Lower Northgate Canyon)
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 41.1607971, lng: -106.4854548}, "Lower Northgate Canyon", 'I-III', 3.33, 'blue', 400, 3000);
newRiver[0].USGSsite = ["06620000"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2464/' target='_blank'>American Whitewater </a></p>";

/// North Platte [WY] 2- Kortes dam though the Miracle Mile
newRiver[1] = new visualRiverSection ({lat: 42.1788261, lng: -106.8843708}, "North Platte Rier Miracle Mile", 'II(III)', 2.66, 'green', 150, 900);
newRiver[1].timing = [new Date("20 April " + curYear), new Date("30 June " + curYear)];
newRiver[1].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is an estimate of when this section maybe possible - likely all year with a small flow of ~75 cfs from the dam. This run sits between two reserviors, so there should be some measurement of the flow, but we haven't found it. Related Flow is well above two reserviors." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5391/' target='_blank'> American Whitewater</a></p>";
newRiver[1].USGSsite[1] = "06630000";
newRiver[1].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function

// North Platte [WY] 3- Pathfinder Dam to Alcova Reservoir
newRiver[2] = new visualRiverSection ({lat: 42.5155401, lng: -106.7839808}, "Fremont Canyon", 'III-V', 4.66, 'purple', 75, 900);
newRiver[2].timing = [new Date("01 March " + curYear), new Date("31 October " + curYear)];
newRiver[2].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is an estimate of when this section maybe possible - likely all year with a small flow of ~75 cfs from the dam (the low side of runnable). This run sits between two reserviors, so there should be some measurement of the flow, but we haven't found it. Related Flow is well above two reserviors." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2465' target='_blank'> American Whitewater</a></p>";
newRiver[2].USGSsite[1] = "06630000";
newRiver[2].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function

// North Platte [WY] In town whitewater park -- a half mile of river with four play spots. 4- Casper Whitewater Park
newRiver[3] = new RiverSection ({lat: 42.8463191, lng: -106.3512118}, "Casper Whitewater Park", 'II(III)', 3.33, 'blue', 200, 3000);
newRiver[3].USGSsite = ["06652000"];
newRiver[3].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4356' target='_blank'>American Whitewater </a></p>";
allRivers.push (newRiver);

// Paintrock Creek [WY] North Fork to the Valley floor
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 44.2660231, lng: -107.5628678}, "Paintrock Creek ", 'V+', 5.66, 'black', 150, 900);
newRiver[0].timing = [new Date("20 May " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is an estimate of when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3973' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Powder, Middle Fork [WY] Forest Service Road bridge near county line to Hwy 190
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 43.5766747, lng: -107.1448323}, "Middle Fork Powder River", 'II-V', 4.00, 'purple', 75, 900);
newRiver[0].timing = [new Date("01 May " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that has a gauge that is further downstream; you will have to estimate the flow. Range of dates is an estimate of when this section maybe possible. We are including the flow from the gauge but not sure of the range where the river would be runnable." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2479' target='_blank'> American Whitewater</a></p>";
newRiver[0].USGSsite[1] = "06309200";
newRiver[0].calcFlow = function (){
	this.curFlow = this.flow[1];
	}; // redefining calcFlow Function
allRivers.push (newRiver);

// Powder, North Fork [WY] Hazelton Rd to Mayoworth Rd
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 44.0187031, lng: -107.0604068}, "North Fork Powder River", 'III-V', 4.66, 'purple', 150, 1000);
newRiver[0].USGSsite = ["06311400"];
newRiver[0].infoContent += "We are not sure of the flows that are best for this section, but use the values on AW." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2498/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Rock Creek [WY] Rock Creek Rock Creek Trail to Trailhead
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 41.5106873, lng: -106.2314538}, "Rock Creek", 'II-V', 4.66, 'purple', 300, 2000);
newRiver[0].USGSsite = ["06632400"];
newRiver[0].infoContent += "Not the easiest to access." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5217/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Sand Creek [WY] An easy-going meander through campgrounds with small ledges and (at higher water) roller-coaster waves. Campground Section (2 miles)
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 44.5161701, lng: -104.1068328}, "Sand Creek", 'II+', 2.66, 'green', 25, 300);
newRiver[0].USGSsite = ["06429905"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10654/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Shell Creek [WY] Cabin Creek to Forest Service boundary
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 44.5712251, lng: -107.5615178}, "Shell Creek", 'II-V', 4.66, 'purple', 200, 1000);
newRiver[0].USGSsite = ["06278500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2490' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Shoshone, North Fork [WY] Pahaska Tepee to Buffalo Bill Reservoir
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 44.5005291, lng: -109.9671378}, "North Fork Shoshone", 'I-III', 3.00, 'blue', 300, 7000);
newRiver[0].USGSsite = ["06279940"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2470/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Shoshone, South Fork [WY] East Fork Creek to Trailhead
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 43.9876401, lng: -109.7055258}, "South Fork Shoshone", 'II-IV', 4.00, 'purple', 300, 5000);
newRiver[0].USGSsite = ["06280300"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2487/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Shoshone [WY] Buffalo Bill Dam to Hwy 120 bridge
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 44.5343781, lng: -109.0724918}, "Shoshone River", 'II-V', 5.00, 'red', 200, 7000);
newRiver[0].USGSsite = ["06282000"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2469/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

///// SNAKE RIVER ////
// Snake [WY] 1- Yellowstone Natl Park Entrance to Flagg Ranch
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 44.1362331, lng: -110.6745438}, "Upper Snake River", 'II-III', 3.00, 'blue', 200, 10000);
newRiver[0].USGSsite = ["13010065"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2469/' target='_blank'> American Whitewater</a></p>";

// Snake [WY] 2 - Jackson Lake to Moose (Teton National Park)
newRiver[1] = new RiverSection ({lat: 43.8580811, lng: -110.5981058}, "Snake River: Teton National Park", 'II', 2.33, 'green', 300, 10000);
newRiver[1].USGSsite = ["13011000"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/6367/' target='_blank'> American Whitewater</a></p>";

// Snake [WY] 3 - Moose to Wilson Bridge
newRiver[2] = new RiverSection ({lat: 43.6547701, lng: -110.7239118}, "Snake River: Moose to Wilson", 'II', 2.33, 'green', 800, 15000);
newRiver[2].USGSsite = ["13013650"];
newRiver[2].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/6368/' target='_blank'> American Whitewater</a></p>";

// Snake [WY] 4 - Wilson Bridge to South Park Bridge
newRiver[3] = new RiverSection ({lat: 43.5004711, lng: -110.8498688}, "Snake River: Wilson to South Park", 'II-', 2.00, 'green', 800, 15000);
newRiver[3].USGSsite = ["13013650"];
newRiver[3].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/6369/' target='_blank'> American Whitewater</a></p>";

// Snake [WY] 5 - South Park Bridge to Astoria Bridge
newRiver[4] = new RiverSection ({lat: 43.3833881, lng: -110.7512918}, "Snake River: South Park to Astoria ", 'I-III', 3.00, 'blue', 800, 15000);
newRiver[4].USGSsite = ["13013650"];
newRiver[4].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2473/' target='_blank'> American Whitewater</a></p>";

// Snake [WY] 6 - Astoria Bridge to West Table
newRiver[5] = new RiverSection ({lat: 43.3012251, lng: -110.7854738}, "Snake River: Astoria to West Table", 'I-III', 3.00, 'blue', 1000, 37000);
newRiver[5].USGSsite = ["13022500"];
newRiver[5].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/6370/' target='_blank'> American Whitewater</a></p>";

// Snake [WY]  7 - West Table to Sheep Gulch (Alpine Canyon)
newRiver[6] = new RiverSection ({lat: 43.2046412, lng: -110.8298058}, "Snake River: Alpine Canyon", 'III', 3.33, 'blue', 1000, 37000);
newRiver[6].USGSsite = ["13022500"];
newRiver[6].infoContent += "One of the classics of the West enjoyed by thousands of paddlers with some great play spots and several outfitters running commercial raft trips. With large spring runoff (10-15k cfs), rapids become more Class IV in nature." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2472/' target='_blank'> American Whitewater</a></p>";

// Snake [WY] Well worth it if the Palisades reservoir is low enough.  8 - Sheep Gulch to Palisades Reservoir
newRiver[7] = new RiverSection ({lat: 43.1712071, lng: -111.0211008}, "Snake River: Sheep Gulch to Palisades Reservoir", 'II-III+', 3.66, 'blue', 1000, 37000);
newRiver[7].USGSsite = ["13022500"];
newRiver[7].infoContent += "One of the classics of the West enjoyed by thousands of paddlers with some great play spots and several outfitters running commercial raft trips. With large spring runoff (10-15k cfs), this section becomes more intense than Alpine Canyon" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2472/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// South Brush Creek [WY] FS 200 to Hwy 130
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 41.3386851, lng: -106.4901878}, "South Brush Creek ", 'III+', 3.66, 'blue', 150, 900);
newRiver[0].timing = [new Date("20 May " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is an estimate of when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5238/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// South French Creek [WY] Hwy 130 to French Creek Campground
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 41.2508211, lng: -106.4559418}, "South French Creek", 'III-V', 5.00, 'red', 150, 900);
newRiver[0].timing = [new Date("20 May " + curYear), new Date("30 June " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is an estimate of when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5238/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Sweetwater [WY] 1- Granite Creek to Sec. 34, T29N, R97W
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 42.4496001, lng: -108.4166578}, "Upper Sweetwater River", 'II-IV', 4.00, 'purple', 500, 1000);
newRiver[0].USGSsite = ["06639000"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2492/' target='_blank'> American Whitewater</a></p>";

// Sweetwater [WY] 2- Rattle Snake Pass to Devils Gate
newRiver[1] = new RiverSection ({lat: 42.5168851, lng: -107.7695378}, "Lower Sweetwater River", 'III', 3.33, 'blue', 70, 10000);
newRiver[1].USGSsite = ["06639000"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/6367/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Tensleep Creek [WY] Highway 16 to Bottom of Switchbacks
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 44.1097621, lng: -107.2742278}, "Upper T", 'V+', 5.66, 'black', 250, 1000);
newRiver[0].USGSsite = ["06278300"];
newRiver[0].infoContent += "<p>We use flow from another creek to determine if this is running, so the 250 we show is not from Tensleep Creek itself." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3961/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

/// Tongue River
// Tongue [WY] 1- Sheep Creek to Tongue Canyon trailhead
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 44.8296251, lng: -107.3837908}, "Tongue Canyon", 'IV-V+', 5.33, 'black', 400, 1000);
newRiver[0].USGSsite = ["06298000"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2466/' target='_blank'> American Whitewater</a></p>";

// Tongue [WY] 2- Tongue Canyon trailhead to Dayton
newRiver[1] = new RiverSection ({lat: 44.8785921, lng: -107.2709908}, "Lower Tongue", 'III+(IV)', 3.66, 'blue', 400, 2500);
newRiver[1].USGSsite = ["06298000"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/3977/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Wind River
// Wind [WY] 3 miles to 7 miles below Dubois (Fish Canyon)
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 43.5069801, lng: -109.5647298}, "Fish Canyon", 'III', 3.33, 'blue', 200, 5000);
newRiver[0].USGSsite = ["06220800"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2467' target='_blank'> American Whitewater</a></p>";

// Wind [WY] Boysen Dam to canyon mouth (Wind River Canyon)
newRiver[1] = new RiverSection ({lat: 43.4178931, lng: -108.1863538}, "Wind River Canyon", 'I-III', 5.33, 'blue', 200, 5000);
newRiver[1].USGSsite = ["06220800"];
newRiver[1].infoContent += "<p>Need a tribal permit from the Shoshone.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/2468/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

/* All WY runs
Boulder Creek [WY] Boulder Basin Rd to WY352 - this sounds like hearsay
Ditch Creek [WY] N.+S.Br.conf to US26 - this is definitely hearsay
Green River - I know there are more sections here
Pole Creek [WY] Half Moon Lake to just off of Fayette Pole Creek Rd. - sounds like heresay
Teton Creek [WY] Treasure Mtn.Camp/Treasure Lake to ID-33 - is heresay https://www.americanwhitewater.org/content/River/detail/id/2497/
Wind, East Fork [WY] Wilderness boundary to Wiggins Fork - no info https://www.americanwhitewater.org/content/River/detail/id/2489/

Prohibitted:
Buffalo Fork [WY] Lower - prohibitted
Lewis River [WY] Canyon
Pacific Creek [WY] Lower
Snake River [WY] Headwaters to Heart River
Snake River [WY] Heart River to Lewis River
Yellowstone [WY] Beautiful river cutting through the heart of Yellowstone but not open to paddling.
1) Yellowstone Falls to Tower Junction (Grand Canyon) https://www.americanwhitewater.org/content/River/detail/id/10378/
Yellowstone [WY] The classic Yellowstone class V run in a beautiful canyon but not open to paddling.
2) Tower Junction to Gardiner, MT (Black Canyon) https://www.americanwhitewater.org/content/River/detail/id/2483/
*/

//////////////////////////////////  MONTANA ////////////////////////////////

// Hellroaring Creek [WY] Headwaters to Yellowstone National Park - actually in Montana
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 45.0360031, lng: -110.4473448}, "Hellroaring Creek Headwaters", 'IV-V', 5.33, 'red', 500, 1200);
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 July " + curYear)];
newRiver[0].infoContent += "Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible." + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/10406/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

/////////////////////////// Kansas ////////////////////
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 37.3739291, lng: -96.1932078}, "Elk Falls", 'III', 3.33, 'blue', 200, 1200);
newRiver[0].USGSsite = ["07169800"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4077' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Kansas River
var newRiver = [];
// Kansas River play park near Lawrence
newRiver[0] = new visualRiverSection ({lat: 38.9746832, lng: -95.2461318}, "Kansas River play park near Lawrence", 'II-III', 2.66, 'green', 200, 5000);
newRiver[0].USGSsite = ["06892350"];
newRiver[0].infoContent += "<p>Play wave / hole below Bowerstock Dam forms at low water; can be dangerous at high water.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4193' target='_blank'> American Whitewater</a></p>";
// Kansas River Playspot Below I-435 Bridge
newRiver[1] = new visualRiverSection ({lat: 39.0460441, lng: -94.8074508}, "Kansas River Playspot Below I-435 Bridge", 'II-III', 2.66, 'green', 2000, 8000);
newRiver[1].USGSsite = ["06892350"];
newRiver[1].infoContent += "<p>Play wave / hole near Johnson County Water Plant.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4195/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

/*
Left out: Pool Creek, Butcher Falls

*/ 

////// Nebraska //////
// Berry Falls Huck
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 42.9015992, lng: -100.3714048}, "Berry Falls", 'III+', 3.66, 'blue', 500, 1200);
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 September " + curYear)];
newRiver[0].infoContent += "<p>Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. Park and huck.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4079' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Dismal River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 41.8521871, lng: -101.0458248}, "Dismal River", 'II(IV)', 2.66, 'green', 200, 3000);
newRiver[0].USGSsite = ["06775900"];
newRiver[0].infoContent += "<p>Can be broken down into smaller sections; one waterfall, Dismal Falls.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5058/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Niobrara River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 42.8323751, lng: -100.5355188}, "Niobrara River", 'I-II', 2.33, 'green', 200, 3000);
newRiver[0].USGSsite = ["06461500"];
newRiver[0].infoContent += "<p>Can be broken down into smaller sections.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5729' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Snake River Falls
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 42.6757601, lng: -100.8637408}, "Snake River Falls", 'IV', 4.33, 'purple', 200, 3000);
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 September " + curYear)];
newRiver[0].infoContent += "<p>Section that does not have a gauge; you will have to estimate the flow. Range of dates is when this section is possible. Park and huck.</p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4080' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Nevada
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 41.9462241, lng: -115.4267658}, "West Fork Bruneau River", 'IV-V', 4.66, 'purple', 200, 3000);
newRiver[0].USGSsite = ["13161500"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/5729' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// Carson River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.1414218, lng: -119.7148238}, "Carson River", 'II(III)', 2.66, 'green', 500, 3000);
newRiver[0].USGSsite = ["10311000"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4145/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// East Fork Carson River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 38.687632, lng: -119.755343}, "East Fork Carson River", 'II+(III)', 2.66, 'green', 500, 3000);
newRiver[0].USGSsite = ["10308200"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/162/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver);

// West Fork Jarbidge River
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 41.875102, lng: -115.429983}, "West Fork Jarbidge River", 'III-IV', 3.66, 'blue', 200, 3000);
newRiver[0].USGSsite = ["13162225"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4142/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver); 

// South Fork Owyhee River
var newRiver = [];
newRiver[0] = new visualRiverSection ({lat: 41.8055761, lng: -116.4846278}, "South Fork Owyhee River", 'II-III+', 3.66, 'blue', 200, 3000);
newRiver[0].USGSsite[1] = ["13176400"];
newRiver[0].timing = [new Date("15 April " + curYear), new Date("15 September " + curYear)];
newRiver[0].infoContent += "<p> East Fork is the related flow that we show. This is not a gauge on the South Fork. </p>" + "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4141/' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver); 

// Truckee River
// 3. Verdi to Mayberry Park
var newRiver = [];
newRiver[0] = new RiverSection ({lat: 39.5240992, lng: -119.9896098}, "Truckee River: Verdi to Mayberry Park", 'I-III', 3.00, 'blue', 200, 3000);
newRiver[0].USGSsite = ["10347460"];
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4136/' target='_blank'> American Whitewater</a></p>";

// 4. Downtown Reno
newRiver[1] = new RiverSection ({lat: 39.505413, lng: -119.902213}, "Truckee River: Downtown Reno", 'I-III', 3.00, 'blue', 200, 3000);
newRiver[1].USGSsite = ["10348000"];
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4137/' target='_blank'> American Whitewater</a></p>";

// 4.5. Truckee River Whitewater Park at Wingfield (Reno)
newRiver[2] = new RiverSection ({lat: 39.524184, lng: -119.816806}, "Truckee River: Reno Whitewater Park at Wingfield", 'II-III', 3.00, 'blue', 200, 3000);
newRiver[2].USGSsite = ["10348000"];
newRiver[2].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4135/' target='_blank'> American Whitewater</a></p>";

// 5. East Reno/Sparks (Vista Blvd) to Pyramid Lake
newRiver[3] = new RiverSection ({lat: 39.641087, lng: -119.290514}, "Truckee River: Sparks to Pyramid Lake", 'II(III)', 2.66, 'green', 200, 5000);
newRiver[3].USGSsite = ["10351700"];
newRiver[3].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/1234' target='_blank'> American Whitewater</a></p>";
allRivers.push (newRiver); 

/* Left Out:
East Fork Jarbridge River - not enough info on this section
Little Owyhee, Idaho, US/Nevada, US - not enough info
Owyhee River https://www.americanwhitewater.org/content/River/detail/id/4143/

*/


////// Idaho Rivers that require math ////
var newRiver = [];
// Payette, S. Fork, Idaho, 2 - Deadwood River to Danskin Station (The Canyon)
newRiver[0] = new RiverSection ({lat: 44.079502, lng: -115.658416}, "South Fork Payette: The Canyon", 'III(IV)', 3.66, 'blue', 330, 5000);
newRiver[0].USGSsite = ["13235000", "13236500"];
newRiver[0].calcFlow = function () {
	this.curFlow = Number(this.flow[0]) + Number(this.flow[1]);
	};
newRiver[0].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/594/' target='_blank'> American Whitewater</a></p>";

// Payette, S. Fork, Idaho, 3. Swirly Canyon (Danskin Station to Alder Creek Bridge)
newRiver[1] = new RiverSection ({lat: 44.044030, lng: -115.856964}, "South Fork Payette: Swirly Canyon", 'II-III', 3.00, 'blue', 330, 6000);
newRiver[1].USGSsite = ["13235000", "13236500"];
newRiver[1].calcFlow = function () {
	this.curFlow = Number(this.flow[0]) + Number(this.flow[1]);
	};
newRiver[1].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4121/' target='_blank'> American Whitewater</a></p>";

// Payette, S. Fork, Idaho, 4 - The Staircase Run (Deer Creek Ramp to Banks)
newRiver[2] = new RiverSection ({lat: 44.091740, lng: -116.032155}, "South Fork Payette: The Staircase Run", 'IV', 4.33, 'purple', 410, 10500);
newRiver[2].USGSsite = ["13247500", "13246000"];
newRiver[2].calcFlow = function () {
	this.curFlow = Number(this.flow[0]) - Number(this.flow[1]);
	};
newRiver[2].infoContent += "<p><a href='https://www.americanwhitewater.org/content/River/detail/id/4121/' target='_blank'> American Whitewater</a></p>";


allRivers.push (newRiver); 






// add from XML file


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

/* Marker function takes in a river array that is contains an array of River Section Objects. The function puts those markers on the map and then feeds the river array with the corresponding marker for later use (deletion) 
*/
function createMarker(river){
	// loop to create markers
	for (var sectIndex = 0; sectIndex < river.length; sectIndex++) {
	marker[markerIndex] = new google.maps.Marker({
  	position: river[sectIndex].position,
  	map: map,
   	label: river[sectIndex].clabel,
    	title: river[sectIndex].title,
    	icon: {
      	path: google.maps.SymbolPath.CIRCLE,
      	scale: iconScale,
      	strokeColor: river[sectIndex].rcolor,
      	strokeWeight: iconStroke,
      	fillColor: 'white',
      	fillOpacity: iconOpacity
}}); // marker function
// adds the info windows for each marker
// function for creating the listener on the marker for the info window
addInfoListener(marker, markerIndex, river[sectIndex]);


river[sectIndex].markerNum = markerIndex;
markerIndex++; // steps marker index to avoid overwriting
}; // for loop for markers
} // createMarker function


// create the map variable before the map initializing
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

// LOOP FOR CREATING MARKERS


}; //initMap function

// function to pull in data from XML 

  
/*
          // Change this depending on the name of your PHP or XML file
          downloadUrl('http://rivermaps.co//mapmarkers2.xml', function(data) {
            var xml = data.responseXML;
            var rivers = xml.documentElement.getElementsByTagName('river');
            Array.prototype.forEach.call(rivers, function(riverElem) {
              var id = riverElem.getAttribute('id');
              var name = riverElem.getAttribute('name');
              var infoContent = riverElem.getAttribute('infoContent');
              var rcolor = riverElem.getAttribute('rcolor');
              var clabel = riverElem.getAttribute('clabel');
              var point = new google.maps.LatLng(
                  parseFloat(riverElem.getAttribute('lat')),
                  parseFloat(riverElem.getAttribute('lng')));
              var infowincontent = document.createElement('div');
              var strong = document.createElement('strong');
              strong.textContent = name
              infowincontent.appendChild(strong);
              infowincontent.appendChild(document.createElement('br'));

              var text = document.createElement('text');
              text.textContent = infoContent;
              infowincontent.appendChild(text);
              
// instead of adding these markers to the map, they need to be added to the AllRivers matrix 
              var marker = new google.maps.Marker({
                map: map,
                position: point,
                label: clabel,
                icon: {
      			path: google.maps.SymbolPath.CIRCLE,
      			scale: 18,
      			strokeColor: rcolor,
      			strokeWeight: iconStroke,
      			fillColor: 'white',
      			fillOpacity: iconOpacity
      			}
              });
              marker.addListener('click', function() {
                infoWindow.setContent(infowincontent);
                infoWindow.open(map, marker);
              });
            });
          });
*/



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

// function that checks all the sections of a particular river
function checkRiver(river){
	// loop through sections
	for (var sectIndex = 0; sectIndex < river.length; sectIndex++) {
		checkFlow(river[sectIndex]);
	}; // for loop through sections
}; // checkRiver function

/* updateFlow is the master function that loops through all rivers and all sections for everything in the allRivers array. As the function loops through, it checks that the flow of each section is within the runnable flow levels for that section */
function updateFlowMbl() {
	currentMarkers = [];
	includeVisual = document.getElementById("visual-flow-mbl").value;
	// console.log(includeVisual);
	
	// loop through all rivers
	for (var riverIndex = 0; riverIndex < allRivers.length; riverIndex++) {
		checkRiver(allRivers[riverIndex]);
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
// console.log(includeVisual);

// loop through all rivers
	for (var riverIndex = 0; riverIndex < allRivers.length; riverIndex++) {
		checkRiver(allRivers[riverIndex]);
	}; // loop through rivers
	// check difficulty
	updateDiff();
	// loop through markers to make sure they are on the current map
	markerCluster.clearMarkers();
	markerCluster = new MarkerClusterer(map, currentMarkers, clusterOptions);
}; // updateFlow function


// function that loops through and resets all of the markers and runSect for all the sections of a river
function resetRiver(river){
	for (var sectIndex = 0; sectIndex < river.length; sectIndex++) {
		river[sectIndex].resetSect();
	}; // loop through all of the river sections

}; // resetRiver function

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
		resetRiver(allRivers[riverIndex]);
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
		checkRiverDiff(allRivers[riverIndex]);
	}; // loop through rivers
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
		checkRiverDiff(allRivers[riverIndex]);
	}; // loop through rivers
	// console.log(userUpLmt);
	// console.log(userLowLmt);
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


/// extracts the river data and converts to JSON; saves to file.
function convertToJSON() {
  var firstname = document.getElementById('firstname').value;
  var lastname = document.getElementById('lastname').value;
  var email = document.getElementById('email').value;

  var jsonObject = {
    "FirstName": firstname,
    "LastName": lastname,
    "email": email
  }

  document.getElementById('output').value = JSON.stringify(jsonObject)
}

function saveToFile() {
  //convertToJSON();
  var jsonObjectAsString = JSON.stringify(allRivers);

  var blob = new Blob([jsonObjectAsString], {
    //type: 'application/json'
    type: 'octet/stream'
  });
  console.log(blob);

  var anchor = document.createElement('a')
  anchor.download = "user.json";
  anchor.href = window.URL.createObjectURL(blob);
  anchor.innerHTML = "download"
  anchor.click();

  console.log(anchor);

  document.getElementById('output').append(anchor)

}

// need to delay the write to file to make sure everything loads
setTimeout(saveToFile, 5000);

