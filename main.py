import os
import sys
import subprocess

#TEST_CONFIG_JSON = "config.json"
#TEST_IMAGE = "testP1.png"

class MakeHeatMap:
    def __init__(self,TEST_IMAGE, TEST_CONFIG_JSON):
        self.img = TEST_IMAGE
        self.json = TEST_CONFIG_JSON

    def run(self):
        v = True
        #pid = os.system(
        #    "whm plot --map ./images/" + self.img + " --config " + self.json
        #    )
        os.system(
            "whm plot --map ./images/" + self.img + " --config " + self.json
            )
        #if pid==0:
        #   return
        #subprocess.call("whm plot --map ./images/" + self.img + " --config " + self.json, shell=True)


if __name__ == "__main__":
    hm = MakeHeatMap(sys.argv[1],sys.argv[2]).run()