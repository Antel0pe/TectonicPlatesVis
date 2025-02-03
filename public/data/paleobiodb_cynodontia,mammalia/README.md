```python
import requests
import json

url = lambda maxMa,minMa: f"https://paleobiodb.org/data1.2/occs/list.json?base_name=cynodontia,mammalia&max_ma={maxMa}&min_ma={minMa}&show=coords,class"
for i in range(10,-1, -10):
    upperTime = i
    lowerTime = i - 9
    if upperTime == 0:
        upperTime = 1
        lowerTime = 0
    print(f"Upper time: {upperTime}, Lower time: {lowerTime}")
    response = requests.get(url(upperTime, lowerTime))

    if response.status_code == 200:
        print("Request successful!")
        try:
            data = response.json()['records']
            with open(f'/content/data/{i}.json', 'w') as f:
                json.dump(data, f, indent=2)
        except json.JSONDecodeError:
            print("Error: Invalid JSON response")
            print(response.text)
    else:
        print(f"Request failed with status code: {response.status_code}")
        print(response.text) # check for error message

```
