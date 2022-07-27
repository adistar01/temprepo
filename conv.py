import pandas as pd
import sys
import random
import json
import os
err = False

def color(rssi):
    if rssi<=0 and rssi>-11:
        return "magenta"
    elif rssi<=-11 and rssi>-22:
        return "lightpink"
    elif rssi<=-22 and rssi>-33:
        return "white"
    elif rssi<=-33 and rssi>-44:
        return "yellow"
    elif rssi<=-44 and rssi>-55:
        return "lightgreen"
    elif rssi<=-55 and rssi>-66:
        return "magenta"
    elif rssi<=-66 and rssi>-77:
        return "lightblue"
    elif rssi<=-77 and rssi>-88:
        return "cyan"
    else:
        return "blue"
    

TEST_CONFIG_JSON = 'config.json' 
#TXT = './uploads/WSS.txt'
TXT = sys.argv[1]
# check if size of file is 0
if os.stat(TXT).st_size == 0:
    err('Empty file')
    exit(1)
df = pd.read_csv(TXT, sep="\t", header=None, names=["Number of times","SSID","RSSI","X","Y","Frequency","LinkSpeed","RxLinkSpeed","TxLinkSpeed","operating_band"]) 
df.drop(df.index[0:1], inplace=True) 
df.to_json('data.json', orient='records') 
v = df.shape[0] 
JSON_structure = { 
            "configuration": { 
                "graphs": ["signal_strength"], 
                "modes": ["base"], 
                "backends": ["iperf3", "base"], 
                "version": "0.2.4", 
                "target_interface":"if", 
                "target_ip": "ip", 
                "ssid":"TJ_5G", 
                "speedtest": -1, 
                "libre-speed-list": "", 
                "benchmark_iterations": 1, 
            }, 
            "results": {}, 
        } 
     
start_num = random.randint(50, 500) 
for i in range(0, v): 
    X = int(df.iloc[i]['X'])
    Y = int(df.iloc[i]['Y']) 
    ss = int(df.iloc[i]['RSSI']) 
    col = color(ss)
    JSON_structure["results"][start_num] = { 
                "position": {"x": X, "y": Y}, 
                "fill_color": col, 
                "selected": False, 
                "station": False, 
                "results": {"signal_strength": ss}, 
            } 
    start_num = start_num + 1 
with open(TEST_CONFIG_JSON, "w") as file: 
    json.dump(JSON_structure, file, indent=4) 
