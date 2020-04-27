import json, os
import pandas as pd


df = pd.read_csv('prison_boundaries_centroids_ICE (1).csv')

print(df.head())
print(df.columns.values)

print(len(df))

with open('facilities_data.json', 'r') as f:
	ice_data = json.load(f)







#
