311/911 incident data:
Formatted by scraper, all incidents are inserted in GeoJSON format to AWS NOSQL database.

Rainfall data:
Each sensor position and metadata is stored in AWS NOSQL database so lat/lon coordinates can search the incident database.
Each hour sensor ID and rainfall is stored in AWS RDS database for Machine Learning computations. 

Rainfall Probability Computations:
AWS RDS database stores probability as a probability out of 1 (confirmed flooding). A 911 report of water rescue defaults an area to confirmed flooding. Each hour flooding probability is decreased by 20%. If flooding probability is greater than 30%, the area is considered flooded and is marked as so on the map.