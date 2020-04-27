import os, shutil, re, time, random, json
from urllib import request
import traceback as tb

def get_facility_coords(location):

	time.sleep(1.0)

	BingMapsKey = 'Ahzv2Is8MvWPPI115GaG9bik5fjH5_EcDdC2ypoQ-URDHDif9fsjelJd2Kzlp8aw'

	print(f'fetching for location: {location}')
	location = location.replace('-', '').replace('  ', ' ').replace(' ', '%20')
	#print(location)


	url = f'http://dev.virtualearth.net/REST/v1/Locations?q={location}&key=Ahzv2Is8MvWPPI115GaG9bik5fjH5_EcDdC2ypoQ-URDHDif9fsjelJd2Kzlp8aw'
	# this works: http://dev.virtualearth.net/REST/v1/Locations?q=ELOY%20FEDERAL%20CONTRACT%20FACILITY&key=Ahzv2Is8MvWPPI115GaG9bik5fjH5_EcDdC2ypoQ-URDHDif9fsjelJd2Kzlp8aw

	try:

		data = request.urlopen(url).read()
		dat_json = json.loads(data)

		coords = dat_json['resourceSets'][0]['resources'][0]['point']['coordinates']
		print(f'found coords: {coords}\n')

		return {
			'success' : True,
			'coords' : coords,
		}

	except:

		print('\n\nSomething failed:')
		print(tb.format_exc())
		print('\n')

		return {
			'success' : False,
			'coords' : None,
		}



with open('facilities_data.json', 'r') as f:
	ice_data = json.load(f)


location_list = list(ice_data.keys())

#print(location_list)

loc_coord_dict = {}

for loc in location_list:

	ret_dict = get_facility_coords(loc)
	if ret_dict['success']:

		loc_coord_dict[loc] = ret_dict['coords']




for loc in loc_coord_dict.keys():
	ice_data[loc]['coordinates'] = loc_coord_dict[loc]


with open('facilities_coordinates.json', 'w+') as f:
	json.dump(loc_coord_dict, f, indent=4)




with open('facilities_data.json', 'w+') as f:
	json.dump(ice_data, f, indent=4)






#
