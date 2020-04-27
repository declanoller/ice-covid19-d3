

import json

with open('facilities_data.json', 'r') as f:
	ice_data = json.load(f)

with open('facilities_coordinates.json', 'r') as f:
	loc_coord_dict = json.load(f)



for loc in loc_coord_dict.keys():
	ice_data[loc]['coordinates'] = loc_coord_dict[loc]



with open('facilities_coordinates.json', 'w+') as f:
	json.dump(loc_coord_dict, f, indent=4)

with open('facilities_data.json', 'w+') as f:
	json.dump(ice_data, f, indent=4)
