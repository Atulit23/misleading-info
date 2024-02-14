from bs4 import BeautifulSoup
import requests

url = "https://www.amazon.in/OnePlus-Wireless-Earbuds-Titanium-Playback/dp/B0BYJ6ZMTS/ref=sr_1_2"
url_link = "https://en.wikipedia.org/wiki/List_of_states_and_territories_of_the_United_States"
result = requests.get(url).text

doc = BeautifulSoup(result, "html.parser")

# print(doc.prettify())

res = doc.find(id = "productTitle")
print(res)