import pandas as pd
import json





xl = pd.ExcelFile('fac_coords.xlsx')
df = xl.parse('Sheet1')


with open('facilities_coordinates_list.json', 'r') as f:
    loc_coord_dict = json.load(f)

fac_coords_dict = {fc_dict['facility']:fc_dict['coords'] for fc_dict in loc_coord_dict['fac_coords_list']}


missing = 0
for name in df['NAME'].values:

    print(name)
    if name in fac_coords_dict.keys():
        orig_coords = fac_coords_dict[name]
        row = df[df['NAME']==name]
        print('lat diff = {:.2f}, long diff = {:.2f}'.format(orig_coords[0] - row['LAT'].values[0], orig_coords[1] - row['LONG'].values[0]))

    else:
        missing += 1


print('This many missing from original: ', missing)
