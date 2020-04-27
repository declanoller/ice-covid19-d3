import json, os
import pandas as pd

xl = pd.ExcelFile('Tables_1.xlsx')

print('Sheet names: ', xl.sheet_names)  # see all sheet names


R0_vals = ['3', '7', '14.8']
day_vals = [30, 60, 90]

df_list = []

for R0 in R0_vals:
    for d in day_vals:

        sheet_name = f'R0={R0}, {d} days'
        print(sheet_name)

        df = xl.parse(sheet_name, skiprows=1)
        df['R0'] = R0.replace('.', 'pt')
        df['days'] = d

        df_list.append(df)


# Combine dataframes from all sheets
df_combined = pd.concat(df_list)

# Rename to nicer names, not uppercase
rename_dict = {
                'TOTAL ICU BEDS' : 'Total ICU beds (10 miles)',
                'AVAILABLE ICU BEDS' : 'Available ICU beds (10 miles)',
                'TOTAL ICU BEDS.1' : 'Total ICU beds (50 miles)',
                'AVAILABLE ICU BEDS.1' : 'Available ICU beds (50 miles)',
                'STATE' : 'State',
                'FACILITY' : 'Facility',
                'REMAINING HOSPITAL CAPACITY (%)' : 'Remaining hospital capacity',
                }

df_combined = df_combined.rename(columns=rename_dict)
df_combined['Demand for ICU beds exceeding local hospital capacity'] = df_combined['ICU Admissions'] - df_combined['Available ICU beds (10 miles)']

print('\nNew column names: \n')
print(df_combined.columns.values)

unique_facilities = df_combined['Facility'].unique()

# Columns that vary across days/R0 values, and ones that don't
vary_cols = [
            'Cumulative Infections',
            'Hospitalizations',
            'ICU Admissions',
            'Demand for ICU beds exceeding local hospital capacity',
]
const_cols = [
            'State',
            'Facility',
            'FY20 ADP',
            'Remaining hospital capacity',
            'Total ICU beds (10 miles)',
            'Available ICU beds (10 miles)',
            'Total ICU beds (50 miles)',
            'Available ICU beds (50 miles)',
]


# Dict that will hold the final data
facilities_json = {}


print(df_combined['R0'].unique())

R0_str_val_to_df_val = {
    '3' : '3',
    '7' : '7',
    '14.8' : '14pt8',
}

# Sort by alphabetical order
unique_facilities = sorted(unique_facilities)

# Get coordinates from file
xl_coords = pd.ExcelFile('fac_coords.xlsx')
df_coords = xl_coords.parse('Sheet1')


# Loop through all facilities, add to main data file
for fac in unique_facilities:

    fac_df = df_combined[df_combined['Facility']==fac]
    coords_row = df_coords[df_coords['NAME']==fac]


    vc_dict = {
        'name' : fac,
        'coordinates' : [coords_row['LAT'].values[0], coords_row['LONG'].values[0]]
    }
    for vc in vary_cols:
        r0_list = []
        for r0 in R0_vals:

            vc_df = fac_df[fac_df['R0']==R0_str_val_to_df_val[r0]]

            day_vals = vc_df['days'].values.tolist()
            vc_day_vals = vc_df[vc].values.tolist()
            days_vc_list = [{'time':r, 'value':v} for r,v in zip(day_vals, vc_day_vals)]
            r0_dict = {'name' : 'R0_{}'.format(R0_str_val_to_df_val[r0]), 'values' : days_vc_list}
            r0_list.append(r0_dict)


        vc_dict[vc] = r0_list

    facilities_json[fac] = vc_dict




with open('facilities_data.json', 'w+') as f:
    json.dump(facilities_json, f, indent=4)











#
