import csv
import requests
import os
import shutil
import pickle
# import mysql.connector

## import list of gauges and corresponding names in NOAA that we want to use
USGS_gauges = []
NOAA_gauges = []
with open('NOAA/USGS_NOAA.csv', 'r') as fi:
	lines = fi.readlines()
	for line in lines:
	    info = line.replace('\n', '').split(',')
	    USGS_gauges.append(info[0])
	    NOAA_gauges.append(info[1].replace('\r','').replace(' ', ''))


# USGS_gauges = ["09067020", "09057500"]
# NOAA_gauges = ["EALC2", "BGMC2"]
## start with Eagle at Avon and Blue below Green Mountain Res.


#### write for loop that loops through each NOAA gauge starting here
for NOAA in NOAA_gauges:
	raw_file = 'NOAA/' + NOAA + '.csv'
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
future_flow = {}
for NOAA in NOAA_gauges:
	raw_file = 'NOAA/' + NOAA + '.csv'
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
			# replaces the slash with a underscore in the date
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
			
			# let's save the flow to a dictionary of dictionaries
			# if the first key doesn't exist already, we have to create it
			if date_filename  not in future_flow:
			    future_flow[date_filename] = {}
			future_flow[date_filename][USGS_gauges[gauge_index]] = float(flow.replace('\n', ''))
			

	# steps to the next gauge in line
	gauge_index +=1

# load list of target gages that we modeled
with open('NOAA/target_models.csv', 'r') as f:
    reader = csv.reader(f)
    targets = list(reader)[0]

# iterate through that list of target gages
models = []
for t in targets:
    # initialize the dictionary
    d = {}
    # pull model file
    with open('NOAA/model_' + t + '_.csv', "rb") as f:
        reader = csv.reader(f)
        for row in reader:
            try:
                if row[0] == 'target':
                    d[row[0]] = row[1]
                else:
                    d[row[0]] = float(row[1])
            except:
                pass
        #d = dict((rows[0],rows[1]) for rows in reader)
    models.append(d)

# models is now a list of dictionary that contain the model values
print(len(models))
# hold the values of the models on this particular day - overwrite it on each new day


# list of things the model that are not features
not_feat = ['target', 'score', 'intercept', 'alpha']
# iterate through the first layer of the nested dictionary of future_flow GO BY DATES
for date in future_flow:
    modeled_future = {}
    # run each of the models for reach of the dates
    for m in models:
        t = m['target']
        # dis is the flow
        dis = m['intercept']
        for key in m:
            if key not in not_feat:
                dis += future_flow[date][key] * m[key]
        # resulting dis is the flow
        modeled_future[t] = dis
    # after all of the models have been applied, we can append this to the CSV for that date
    print(modeled_future)
    with open(date, 'a') as fo:
	    for n in modeled_future:
	        fo.write(n + "=" + str(round(modeled_future[n], 2)) + '\n')
    print(date)
# runs the models based on those values

# list of tuples (USGS, Flow) for the model results

# appends those gage predictions to that existing file (open file again with append)
# DONE!

# replace all of the old date files with the new ones - so that we don't have down time without this data available.
for file in file_names:
	shutil.copyfile(file, "public_html/NOAA/ready_" + file)
	


