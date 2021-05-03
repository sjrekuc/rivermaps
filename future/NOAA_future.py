import csv
import requests
import os
import shutil
# import mysql.connector

## import list of gauges and corresponding names in NOAA that we want to use
USGS_gauges = []
NOAA_gauges = []
with open('USGS_NOAA.csv', 'r') as fi:
	lines = fi.readlines()
	for line in lines:
		info = line.replace('\n', '').split(',')
		USGS_gauges.append(info[0])
		NOAA_gauges.append(info[1])

## I'm thinking list of tuples; each tuple is USGS number and NOAA name for that gauge
# USGS_gauges = ["09067020", "09057500"]
# NOAA_gauges = ["EALC2", "BGMC2"]
## start with Eagle at Avon and Blue below Green Mountain Res.


#### write for loop that loops through each gauge starting here
for NOAA in NOAA_gauges:
	raw_file = NOAA + '.csv'
	# get daily snow data from USDA
	url='https://www.cbrfc.noaa.gov/product/hydrofcst/RVFCSV/' + NOAA + '.fflw24.csv'
	response = requests.get(url)
	# read the CSV file first save before working with it more
	with open(raw_file, 'wb') as f:
	    for chunk in response:
	        f.write(chunk)

## iterate through each gauge file
gauge_index = 0
file_names = set()
for NOAA in NOAA_gauges:
	raw_file = NOAA + '.csv'
	fi = open(raw_file, 'r')
	lines = fi.readlines()
	# counter for lines in the file
	i = 1
	for line in lines:
		i += 1
		# header is consistently the first 7 lines - may have to write this to begin after reading "date"
		if i > 8:
			# splits the line
			info = line.split(',')
			# pulls the date
			date = info[0]
			# pulls the CFS
			flow = info[2]
			# replaces the sl
			date_filename = date.replace('/', '_') + '.csv'
			# creates line to be written
			new_line = USGS_gauges[gauge_index] + "=" + flow

			if gauge_index == 0:
				# writes that one line to a new file if this is the first gauge
				with open(date_filename, 'w') as fo:
					fo.write(new_line)
			else:
				# writes that one line to the correct file name
				with open(date_filename, 'a') as fo:
					fo.write(new_line)
			# add file name to the set of file names
			file_names.add(date_filename)

	# steps to the next gauge in line
	gauge_index +=1

# replace all of the old date files with the new ones - so that we don't have down time without this data available.
for file in file_names:
	shutil.copyfile(file, "ready_" + file)

