


import json








with open('facilities_coordinates.json', 'r') as f:
	coords_data = json.load(f)

new_coords_dat = [{'facility' : k, 'coords' : v} for k,v in coords_data.items()]




with open('facilities_coordinates_list.json', 'w+') as f:
	json.dump({'fac_coords_list' : new_coords_dat}, f, indent=4)














#
