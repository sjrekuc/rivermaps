import requests
import csv
import json

# API Key from CO Division of Water Resources
apiKey = "&apiKey=qf6%2BUXIOXp4%2BJyTpjOGmFayiG8NsZD69"
# Colorado Division of Water Resources URL
url = 'https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrystation/?format=json&abbrev='

# filename
fo = 'COWaterlog.txt'

# dictionary of CO Water Gauges
water = {
	'PLASPLCO': 0, # SOUTH PLATTE RIVER AT SOUTH PLATTE, CO 
	'PLAGEOCO': 0, # SOUTH PLATTE RIVER NEAR LAKE GEORGE, CO.
	'CLAFTCCO': 0, # CACHE LA POUDRE AT CANYON MOUTH NEAR FORT COLLINS
	'LAPLODCO': 0, # LA POUDRE PASS CREEK BELOW LONG DRAW RESERVOIR
	'LAKATLCO': 0, # LAKE CREEK ABOVE TWIN LAKES RESERVOIR, CO.
	'RIOMILCO': 0, # RIO GRANDE AT THIRTY MILE BRIDGE NEAR CREEDE
	'CONPLACO': 0, # CONEJOS RIVER BELOW PLATORO RESERVOIR, CO.
	'PLADENCO': 0, # SOUTH PLATTE RIVER AT DENVER
	'PLACHECO': 0, # SOUTH PLATTE RIVER BELOW CHEESMAN RESERVOIR
	'PLABAICO': 0, #  NORTH FORK SOUTH PLATTE RIVER AT BAILEY
	'BOCOROCO': 0, # BOULDER CREEK NEAR ORODELL, CO.
	'CCACCRCO': 0, # CLEAR CREEK ABOVE CLEAR CREEK RESERVOIR, CO.
	'KANJUNCO': 0, # KANNAH CREEK AT JUNIATA ENLARGED DIVERSION
	'RIOSFKCO': 0, # SOUTH FORK RIO GRANDE AT SOUTH FORK 
	'BOCBGRCO': 0, # SOUTH BOULDER CREEK BELOW GROSS RESERVOIR
	'BOCPINCO': 0, # SOUTH BOULDER CREEK ABOVE GROSS RESERVOIR AT PINECLIFFE
	'BTBLESCO': 0, # BIG THOMPSON RIVER BELOW LAKE ESTES
	'WILBSLCO': 0, # Willow Creek
	'NSVBBRCO': 0, # NORTH SAINT VRAIN CREEK BELOW BUTTONROCK (RALPH PRICE) RESERVOIR
	'SVCLYOCO': 0, # SAINT VRAIN CREEK AT LYONS, CO
	'SSVWARCO': 0, # SOUTH SAINT VRAIN NEAR WARD
	'RCKTARCO': 0, # ROCK CREEK ABOVE CONFLUENCE WITH TARRYALL CREEK
	'BCRMORCO': 0, # BEAR CREEK AT MORRISON
	'FRYTHOCO': 0, # Frying Pan above Ruedi Res
	'ARKWELCO': 0, # Arkansas above Wellsville
	'BOCMIDCO': 0, # MIDDLE BOULDER CREEK AT NEDERLAND (BOCMIDCO)
	'GRABDWCO0': 0 # Grape Creek Below DeWeese Reservoir
}

# pulling the water data from Colorado Division of Water Resources
for g in water.keys():
	# pull water info
	r = requests.get(url+g+apiKey)
	if r.status_code == 200:
		# needed to convert response to string using decode and then convert to JSON object
		js = json.loads(r.content.decode('utf-8'))
		# parse to correct value in JSON; put that in correct key in water data
		water[g] = js["ResultList"][0]["measValue"]

	else: 
		print(r.status_code)

# write that data to the appropriate file in the correct format
with open(fo, mode='w', newline='') as csv:
	# fieldnames = water.keys()
	# writer = csv.DictWriter(csv_combo, fieldnames=fieldnames)
	# writer = csv.writer(csv_combo)
	for k, j in water.items():
		csv.write(k + '=' + str(j) + '\n')