<?php
// Purpose: extracts water data from Colorado Division of Water Resources
// apiKey=qf6%2BUXIOXp4%2BJyTpjOGmFayiG8NsZD69

$apiKey = "&apiKey=qf6%2BUXIOXp4%2BJyTpjOGmFayiG8NsZD69";


$myfile = fopen("public_html/COWaterlog.txt", "w") or die("Unable to open file!");

// possibly read the information from the current file and save in case the ajax fails

// create an array of CO water guages that we want data from
$usGauges = array('PLASPLCO', 'PLAGEOCO'); // 	SOUTH PLATTE RIVER AT SOUTH PLATTE & SOUTH PLATTE RIVER NEAR LAKE GEORGE, CO. 
$usGauges[2] = 'CLAFTCCO'; // 	CACHE LA POUDRE AT CANYON MOUTH NEAR FORT COLLINS 
$usGauges[3] = 'LAPLODCO'; // 	LA POUDRE PASS CREEK BELOW LONG DRAW RESERVOIR
$usGauges[4] = 'LAKATLCO'; // 	LAKE CREEK ABOVE TWIN LAKES RESERVOIR, CO.
$usGauges[5] = 'RIOMILCO'; // RIO GRANDE AT THIRTY MILE BRIDGE NEAR CREEDE
$usGauges[6] = 'CONPLACO'; // CONEJOS RIVER BELOW PLATORO RESERVOIR, CO.
$usGauges[7] = 'PLADENCO'; // SOUTH PLATTE RIVER AT DENVER
$usGauges[8] = 'PLACHECO'; // SOUTH PLATTE RIVER BELOW CHEESMAN RESERVOIR
$usGauges[9] = 'PLABAICO'; //  NORTH FORK SOUTH PLATTE RIVER AT BAILEY
$usGauges[10] = 'BOCOROCO'; // BOULDER CREEK NEAR ORODELL, CO.
$usGauges[11] = 'CCACCRCO'; // 	CLEAR CREEK ABOVE CLEAR CREEK RESERVOIR, CO.
$usGauges[12] = 'KANJUNCO'; // KANNAH CREEK AT JUNIATA ENLARGED DIVERSION
$usGauges[13] = 'RIOSFKCO'; // 	SOUTH FORK RIO GRANDE AT SOUTH FORK 
$usGauges[14] = 'BOCBGRCO'; // SOUTH BOULDER CREEK BELOW GROSS RESERVOIR
$usGauges[15] = 'BOCPINCO'; // SOUTH BOULDER CREEK ABOVE GROSS RESERVOIR AT PINECLIFFE 
$usGauges[16] = 'BTBLESCO'; // BIG THOMPSON RIVER BELOW LAKE ESTES
$usGauges[17] = 'WILBSLCO'; // Willow Creek
$usGauges[18] = 'NSVBBRCO'; // NORTH SAINT VRAIN CREEK BELOW BUTTONROCK (RALPH PRICE) RESERVOIR
$usGauges[19] = 'SVCLYOCO'; // SAINT VRAIN CREEK AT LYONS, CO
$usGauges[20] = 'SSVWARCO'; // SOUTH SAINT VRAIN NEAR WARD
$usGauges[21] = 'RCKTARCO'; // ROCK CREEK ABOVE CONFLUENCE WITH TARRYALL CREEK
$usGauges[22] = 'BCRMORCO'; // BEAR CREEK AT MORRISON 
$usGauges[23] = 'FRYTHOCO'; // Frying Pan above Ruedi Res
$usGauges[24] = 'ARKWELCO'; // Arkansas above Wellsville
$usGauges[25] = 'BOCMIDCO'; // MIDDLE BOULDER CREEK AT NEDERLAND (BOCMIDCO)

//$usGauges[26] = 'BRKRESCO'; // NORTH SAINT VRAIN CREEK ABOVE BUTTONROCK (RALPH PRICE) RESERVOIR - does not work any more

for ($i = 0; $i < count($usGauges); $i++){
    $site = $usGauges[$i];
    // old URL https://dnrweb.state.co.us/DWR/DwrApiService/api/v2/telemetrystations/telemetrystation/?format=xml&abbrev=
    $url = "https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrystation/?format=xml&abbrev=" . $site . $apiKey;
    $data = file_get_contents($url);

    // checks that we actually get data	
    if (!$data){
        $result = $site . "=0" . "\n";
    } else {
    
        $xml_tree = simplexml_load_string($data);
        $measurements = $xml_tree->ResultList->TelemetryStation->measValue;
        $measurements = round($measurements);
        $result = $site . "=" . $measurements . "\n";
        
    }
    fwrite($myfile, $result);
}
	
fclose($myfile);

/*
// code that kind of worked, so it's moved out of the way

	// instantiate cURL
	// $curl = curl_init([ string $url = NULL ] ) : resource;
	// creates URL for the particular Gauge
	// sets options for cURL
	//$curl = curl_init($url);
	//curl_setopt($curl, CURLOPT_URL, "https://dnrweb.state.co.us/DWR/DwrApiService/api/v2/telemetrystations/telemetrystation/?abbrev=PLASPLCO");
	//curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	//curl_setopt($curl, CURLOPT_USERAGENT, 'Codular Sample cURL Request');
	// this link works $url = "https://dnrweb.state.co.us/DWR/DwrApiService/api/v2/telemetrystations/telemetrystation/?format=xml&abbrev=PLASPLCO&apiKey=qf6%2BUXIOXp4%2BJyTpjOGmFayiG8NsZD69"
	//fwrite($myfile, $site);
    //fwrite($myfile, "=");
    //fwrite($myfile, $measurements);
    // test to see if we can parse with JSON
    // $json_data = json_decode($data);
    // this statement may not work on an array: https://stackoverflow.com/questions/41972084/php-json-encode-not-working







// loop through each gauge in the array to pull the data using foreach
foreach ($usGauges as $site) {
	// instantiate cURL
	$curl = curl_init([ string $url = NULL ] ) : resource;
	// creates URL for the particular Gauge
	$url = "https://dnrweb.state.co.us/DWR/DwrApiService/api/v2/telemetrystations/telemetrystation/?abbrev=" . $site;
	// sets options for cURL
	curl_setopt($curl, CURLOPT_URL, $url);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($curl, CURLOPT_USERAGENT, 'Codular Sample cURL Request');
	
	$data = curl_exec($curl);
	if (!$data) {
 		$value = 0;
 		// possibly write back all the existing data on the file so we don't lose it, but for now I will make it zero
	} else {
		echo $data;
		// Remove the namespace prefix for easier parsing
		// $data = str_replace('ns1:','', $data);
		// Load the XML returned into an object for easy parsing
		// $xml_tree = simplexml_load_string($data);
		// extracts the streamflow value in ft^3/second
		// $value = number_format((float) $xml_tree->timeSeries->values->value);
		// removes commas from the number data
		// $value = str_replace(',','', $value);
	}
	// print the data out to a text file $myfile
	//$txt = $site . "=" . $value . "\n";; 
	//fwrite($myfile, $txt);
	
}

// closes the file
//fclose($myfile);
*/
?>