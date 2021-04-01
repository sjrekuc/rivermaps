<?php
$myfile = fopen("public_html/USWaterlog.txt", "w") or die("Unable to open file!");

// possibly read the information from the current file and save in case the ajax fails




// create an array of USGS water guages that we want data from
$usGauges = array('09063000', '09064600');
$usGauges[2] = '09067020';
$usGauges[3] = '09070000';
$usGauges[4] = '09065100';
$usGauges[5] = '09064000';
$usGauges[6] = '09066325';
$usGauges[7] = '07087050';
$usGauges[8] = '07091200';
$usGauges[9] = '07094500'; // Arkansas at Parkdale
$usGauges[10] = '07099970';
$usGauges[11] = '09050100';
$usGauges[12] = '09050700';
$usGauges[13] = '09057500';
$usGauges[14] = '09047500';
$usGauges[15] = '09085000';
$usGauges[16] = '09081000';
$usGauges[17] = '09073300';
$usGauges[18] = '09075400';
$usGauges[19] = '09180500';
$usGauges[20] = '09163500';
$usGauges[21] = '09095500';
$usGauges[22] = '09085100';
$usGauges[23] = '09070500';
$usGauges[24] = '09058000';
$usGauges[25] = '09034250';
$usGauges[26] = '09033300';
$usGauges[27] = '09260050';
$usGauges[28] = '09251000';
$usGauges[29] = '09247600';
$usGauges[30] = '09239500';
$usGauges[31] = '09144250';  // GUNNISON RIVER AT DELTA, CO
$usGauges[32] = '09128000';
$usGauges[33] = '09114500';
$usGauges[34] = '09081600';
$usGauges[35] = '09359010';
$usGauges[36] = '09124500';
$usGauges[37] = '09110000';
$usGauges[38] = '06620000';
$usGauges[39] = '09132500';
$usGauges[40] = '06716500';
$usGauges[41] = '06719505';
$usGauges[42] = '09059500';
$usGauges[43] = '09234500';
$usGauges[44] = '09261000'; // Arkansas at Canon City
$usGauges[45] = '09315000';
$usGauges[46] = '09306290';
$usGauges[47] = '09172500';
$usGauges[48] = '09174600';
$usGauges[49] = '09177000';
$usGauges[50] = '09358000';
$usGauges[51] = '09359020';
$usGauges[52] = '09359500';
$usGauges[53] = '09361500';
$usGauges[54] = '09364500';
$usGauges[55] = '09349800';
$usGauges[56] = '09342500';
$usGauges[57] = '09379500';
$usGauges[58] = '08263500';
$usGauges[59] = '08276500';
$usGauges[60] = '08313000';
$usGauges[61] = '08286500';
$usGauges[62] = '09146020';
$usGauges[63] = '09146200';
$usGauges[64] = '09147500';
$usGauges[65] = '09112200';
$usGauges[66] = '09126000';
$usGauges[67] = '09238900';
$usGauges[68] = '06716100';
$usGauges[69] = '09080400';
$usGauges[70] = '09037500';
$usGauges[71] = '06751490';
$usGauges[72] = '09105000';
$usGauges[73] = '07126485';
$usGauges[74] = '06625000';
$usGauges[75] = '08291000';
$usGauges[76] = '08265000';
$usGauges[77] = '09405500';
$usGauges[78] = '09408150';
$usGauges[79] = '09413200';
$usGauges[80] = '09413500';
$usGauges[81] = '06721000';
$usGauges[82] = '06710247';
$usGauges[83] = '06700000';
$usGauges[84] = '09132095';
$usGauges[85] = '08279000';
$usGauges[86] = '09060799';
$usGauges[87] = '07211500';
$usGauges[88] = '09431500';
$usGauges[89] = '07216500'; // MORA RIVER NEAR GOLONDRINAS, NM
$usGauges[90] = '08379500';
$usGauges[91] = '08379500';
$usGauges[92] = '08324000';
$usGauges[93] = '08289000';
$usGauges[94] = '09430500';
$usGauges[95] = '10164500';
$usGauges[96] = '10011500'; // Bear River near UT-WY stateline
$usGauges[97] = '09217900';
$usGauges[98] = '10113500';
$usGauges[99] = '10131000';
$usGauges[100] = '09333500';
$usGauges[101] = '10133800';
$usGauges[102] = '09337500';
$usGauges[103] = '09330000';
$usGauges[104] = '10168000';
$usGauges[105] = '10109000';
$usGauges[106] = '09330500';
$usGauges[107] = '10137500';
$usGauges[108] = '10140100';
$usGauges[109] = '09314500';
$usGauges[110] = '10154200';
$usGauges[111] = '10155200';
$usGauges[112] = '10163000'; // Provo, UT
$usGauges[113] = '09180000'; // Dolores
$usGauges[114] = '09171100';
$usGauges[115] = '09168730';
$usGauges[116] = '09165000';
$usGauges[117] = '09279000'; // Rock Creek, UT
$usGauges[118] = '09328500'; // San Rafael [UT]
$usGauges[119] = '10224000'; // Sevier [UT]
$usGauges[120] = '10149000'; // Sixth Water Creek [UT]
$usGauges[121] = '10150500'; // Spanish Fork [UT]
$usGauges[122] = '09288180'; // Strawberry [UT]
$usGauges[123] = '09296800'; // Uinta [UT]
$usGauges[124] = '10128500'; // Weber [UT]
$usGauges[125] = '10130500'; // Weber [UT]
$usGauges[126] = '10132000'; // Weber [UT]
$usGauges[127] = '10136500'; // Weber [UT]
$usGauges[128] = '09292500'; // Yellowstone [UT]
$usGauges[129] = '09326500'; // Ferron Creek [UT]
$usGauges[130] = '10140700'; // Lower Ogden [UT]
$usGauges[131] = '09380000'; // Grand Canyon at Lee's Ferry [AZ]
$usGauges[132] = '09404200'; // Grand Canyon at Diamond Creek [AZ]
$usGauges[133] = '08284100'; // RIO CHAMA NEAR LA PUENTE [NM]
$usGauges[134] = '09421500'; // COLORADO RV BLW HOOVER DAM, [AZ-NV]
$usGauges[135] = '385106106571000'; // Slate River near Crested Butte [CO]
$usGauges[136] = '09152500'; // Gunnison at Grand Junction
$usGauges[137] = '09149500'; // UNCOMPAHGRE RIVER AT DELTA, CO
$usGauges[138] = '09242500'; // Elk River near Milner (confluence with Yampa)
$usGauges[139] = '06746110'; // JOE WRIGHT CREEK BELOW JOE WRIGHT RESERVOIR, CO
$usGauges[140] = '10016900'; // Bear River at Evanston, WY
$usGauges[141] = '06647500'; // Box Elder Creek
$usGauges[142] = '06224000'; // Bull Creek
$usGauges[143] = '06207500'; // Clarks Fork Yellowstone near MT-WY border
$usGauges[144] = '06620400'; // DOUGLAS CREEK ABOVE KEYSTONE, WY - NO LONGER OPERATING
$usGauges[145] = '09188500'; // GREEN RIVER AT WARREN BRIDGE, NEAR DANIEL, WY
$usGauges[146] = '13023000'; // GREYS RIVER AB RESERVOIR NR ALPINE WY
$usGauges[147] = '13014500'; // GROS VENTRE RIVER AT KELLY, WY
$usGauges[148] = '06660000'; // LARAMIE RIVER AT LARAMIE, WY
$usGauges[149] = '06632400'; // ROCK CREEK AB KING CANYON CANAL, NR ARLINGTON, WY
$usGauges[150] = '06630465'; // Medicine Bow R ab E Fk Med Bow nr Elk Mountain, WY
$usGauges[151] = '06233000'; // LITTLE POPO AGIE RIVER NEAR LANDER, WY
$usGauges[152] = '06623800'; // ENCAMPMENT RIVER AB HOG PARK CR, NR ENCAMPMENT, WY
$usGauges[153] = '06630000'; // N PLATTE RIV AB SEMINOE RESERVOIR, NR SINCLAIR, WY
$usGauges[154] = '06652000'; // NORTH PLATTE RIVER AT ORIN, WY
$usGauges[155] = '06309200'; // MIDDLE FORK POWDER RIVER NEAR BARNUM, WY
$usGauges[156] = '06311400'; // North Fork Powder River
$usGauges[157] = '06278500'; // SHELL CREEK NEAR SHELL, WY
$usGauges[158] = '06279940'; // NORTH FORK SHOSHONE RIVER AT WAPITI, WY
$usGauges[159] = '06280300'; // SOUTH FORK SHOSHONE RIVER NEAR VALLEY, WY
$usGauges[160] = '06282000'; // SHOSHONE RIVER BELOW BUFFALO BILL RESERVOIR, WY
$usGauges[161] = '13010065'; // SNAKE RIVER AB JACKSON LAKE AT FLAGG RANCH WY
$usGauges[162] = '13011000'; // SNAKE RIVER NR MORAN WY
$usGauges[163] = '13013650'; // SNAKE RIVER AT MOOSE, WY
$usGauges[164] = '13022500'; // SNAKE RIVER AB RESERVOIR NR ALPINE WY
$usGauges[165] = '06278300'; // SHELL CREEK ABOVE SHELL CREEK RESERVOIR, WY - for Tensleep Creek (Upper T)
$usGauges[165] = '06278300'; // SHELL CREEK ABOVE SHELL CREEK RESERVOIR, WY - for Tensleep Creek (Upper T)
$usGauges[166] = '06639000'; // Sweetwater Creek
$usGauges[167] = '06298000'; // Tongue River
$usGauges[168] = '06220800'; // WIND RIVER ABOVE RED CREEK, NEAR DUBOIS, WY
$usGauges[169] = '09426000'; // BILL WILLIAMS RIVER BELOW ALAMO DAM, AZ
$usGauges[170] = '09489500'; // BLACK RVR BLW PUMPING PLANT, NR POINT OF PINES, AZ
$usGauges[171] = '09444200'; // BLUE RIVER NEAR CLIFTON, AZ
$usGauges[172] = '09397500'; // CHEVELON FORK BELOW WILDCAT CANYON, NR WINSLOW, AZ
$usGauges[173] = '09499000'; // TONTO CREEK ABOVE GUN CREEK, NEAR ROOSEVELT, AZ
$usGauges[174] = '09507980'; // EAST VERDE RIVER NEAR CHILDS, AZ
$usGauges[175] = '09507480'; // FOSSIL CREEK NEAR STRAWBERRY, AZ
$usGauges[176] = '09402000'; // LITTLE COLORADO RIVER NEAR CAMERON, AZ
$usGauges[177] = '09384000'; // LITTLE COLORADO R ABV LYMAN LAKE NR ST. JOHNS, AZ
$usGauges[178] = '09504420'; // OAK CREEK NEAR SEDONA, AZ
$usGauges[179] = '09497980'; // CHERRY CREEK NEAR GLOBE, AZ
$usGauges[180] = '09497500'; // SALT RIVER NEAR CHRYSOTILE, AZ
$usGauges[181] = '09502000'; // SALT RIVER BLW STEWART MOUNTAIN DAM, AZ.
$usGauges[182] = '09510200'; // SALT RIVER BLW STEWART MOUNTAIN DAM, AZ.
$usGauges[183] = '08276300'; // RIO PUEBLO DE TAOS BELOW LOS CORDOVAS, NM
$usGauges[184] = '09504000'; // VERDE RIVER NEAR CLARKDALE, AZ
$usGauges[185] = '09506000'; // VERDE RIVER NEAR CAMP VERDE, AZ
$usGauges[186] = '09508500'; // VERDE RVR BLW TANGLE CREEK, ABV HORSESHOE DAM, AZ
$usGauges[187] = '09510000'; // VERDE RIVER BELOW BARTLETT DAM, AZ
$usGauges[188] = '09505200'; // Wet Beaver Creek
$usGauges[189] = '09492400'; // EAST FORK WHITE RIVER NEAR FORT APACHE, AZ.
$usGauges[190] = '06892350'; // KANSAS R AT DESOTO, KS
$usGauges[191] = '07169800'; // ELK FALLS, KS
$usGauges[192] = '06775900'; // Dismal River near Thedford, Nebr.
$usGauges[193] = '06461500'; // Niobrara River near Sparks, Nebr.
$usGauges[194] = '13161500'; // BRUNEAU RV AT ROWLAND, NV
$usGauges[195] = '10308200'; // E FK CARSON RV BLW MARKLEEVILLE CK NR MARKLEEVILLE
$usGauges[196] = '13162225'; // JARBIDGE RV BLW JARBIDGE, NV
$usGauges[197] = '13176400'; // EF OWYHEE RIVER AT CRUTCHER CROSSING, ID
$usGauges[198] = '13176400'; // TRUCKEE RV NR MOGUL, NV
$usGauges[199] = '10348000'; // TRUCKEE RV AT RENO, NV
$usGauges[200] = '10351700'; // TRUCKEE RV NR NIXON, NV
$usGauges[201] = '10092700'; // BEAR RIVER AT IDAHO-UTAH STATE LINE
$usGauges[202] = '13341570'; // POTLATCH RIVER BEL LITTLE POTLATCH CR NR SPALDING
$usGauges[203] = '12414500'; // ST JOE RIVER AT CALDER, ID
$usGauges[204] = '13055000'; // TETON RIVER NR ST ANTHONY ID
$usGauges[205] = '13066000'; // BLACKFOOT RIVER NR SHELLEY ID
$usGauges[206] = '13185000'; // BOISE RIVER NR TWIN SPRINGS ID
$usGauges[207] = '13190500'; // SF BOISE RIVER AT ANDERSON RANCH DAM ID
$usGauges[208] = '13206000'; // BOISE RIVER AT GLENWOOD BRIDGE NR BOISE ID
$usGauges[209] = '12304500'; // Yaak River near Troy MT
$usGauges[210] = '12321500'; // BOUNDARY CREEK NR PORTHILL ID
$usGauges[211] = '13168500'; // BRUNEAU RIVER NR HOT SPRING ID
$usGauges[212] = '13340600'; // NF CLEARWATER RIVER NR CANYON RANGER STATION ID
$usGauges[213] = '13338500'; // SF CLEARWATER RIVER AT STITES ID
$usGauges[214] = '13342500'; // CLEARWATER RIVER AT SPALDING ID
$usGauges[215] = '13042500'; // HENRYS FORK NR ISLAND PARK ID
$usGauges[216] = '13046000'; // HENRYS FORK NR ASHTON ID
$usGauges[217] = '13246000'; // NF PAYETTE RIVER NR BANKS ID
$usGauges[218] = '13235000'; // SOUTH FORK PAYETTE RIVER AT LOWMAN, ID
$usGauges[219] = '13236500'; // SOUTH FORK PAYETTE RIVER AT LOWMAN, ID
$usGauges[220] = '13247500'; // PAYETTE RIVER NR HORSESHOE BEND ID
$usGauges[221] = '13073000'; // PORTNEUF RIVER AT TOPAZ ID
$usGauges[222] = '12395000'; // PRIEST RIVER NR PRIEST RIVER ID
$usGauges[223] = '13309220'; // MF SALMON RIVER AT MF LODGE NR YELLOW PINE ID
$usGauges[224] = '13310700'; // SF SALMON RIVER NR KRASSEL RANGER STATION ID
$usGauges[225] = '13296500'; // SALMON RIVER BL YANKEE FORK NR CLAYTON ID
$usGauges[226] = '13302500'; // SALMON RIVER AT SALMON ID
$usGauges[227] = '13317000'; // SALMON RIVER AT WHITE BIRD ID
$usGauges[228] = '13336500'; // SELWAY RIVER NR LOWELL ID
$usGauges[229] = '13052200'; // TETON RIVER AB SOUTH LEIGH CREEK NR DRIGGS ID
$usGauges[230] = '12414500'; // ST JOE RIVER AT CALDER, ID
$usGauges[231] = '13032500'; // SNAKE RIVER NR IRWIN ID
$usGauges[232] = '13077000'; // SNAKE RIVER AT NEELEY ID
$usGauges[233] = '13087995'; // SNAKE RIVER GAGING STATION AT MILNER ID
$usGauges[234] = '13090500'; // SNAKE RIVER NR TWIN FALLS ID
$usGauges[235] = '13094000'; // SNAKE RIVER NR BUHL ID
$usGauges[236] = '13172500'; // SNAKE RIVER NR MURPHY ID
$usGauges[237] = '13290450'; // SNAKE RIVER AT HELLS CANYON DAM ID-OR STATE LINE
$usGauges[238] = '13317660'; // SNAKE RIVER BL MCDUFF RAPIDS AT CHINA GARDENS, ID
$usGauges[239] = '09076300'; // ROARING FORK RIVER BLW MAROON CREEK NR ASPEN, CO (Slaughterhouse)





// loop through each gauge in the array to pull the data using foreach
foreach ($usGauges as $site) {
	$url = "https://waterservices.usgs.gov/nwis/iv/?format=waterml&sites=" . $site . "&parameterCd=00060";
	$data = file_get_contents($url);
	if (!$data) {
 		$value = 0;
 		// possibly write back all the existing data on the file so we don't lose it, but for now I will make it zero
	} else {
		// Remove the namespace prefix for easier parsing
		$data = str_replace('ns1:','', $data);
		// Load the XML returned into an object for easy parsing
		$xml_tree = simplexml_load_string($data);
		// extracts the streamflow value in ft^3/second
		$value = number_format((float) $xml_tree->timeSeries->values->value);
		// removes commas from the number data
		$value = str_replace(',','', $value);
	}
	// print the data out to a text file $myfile
	$txt = $site . "=" . $value . "\n";; 
	fwrite($myfile, $txt);
	
}

// closes the file
fclose($myfile);
?>