import pandas as pd
import sys
import random
import json
class conv:
    def __init__(self, TXT):
        self.TXT = TXT
        self.TEST_CONFIG_JSON = 'config.json'
    def run(self):
        df = pd.read_csv(self.TXT, sep="\t", header=None, names=["Number of times","SSID","RSSI","Frequency","LinkSpeed","RxLinkSpeed","TxLinkSpeed","operating_band"])
        df.drop(df.index[0:2], inplace=True)
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
            X = random.randint(150, 850)
            Y = random.randint(50, 450)
            ss = int(df.iloc[i]['RSSI'])
            JSON_structure["results"][start_num] = {
                        "position": {"x": X, "y": Y},
                        "fill_color": "lightblue",
                        "selected": False,
                        "station": False,
                        "results": {"signal_strength": (-1)*(ss)},
                    }
            start_num = start_num + 1
        
        with open(self.TEST_CONFIG_JSON, "w") as file:
            json.dump(JSON_structure, file, indent=4)


if __name__ =="main":
    creste = conv(sys.argv[1]).run()