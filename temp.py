import os
file = open('d.txt','w')
file.write(str(os.system('date')))
file.close()
print(os.system('date'))