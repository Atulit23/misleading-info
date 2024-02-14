from selenium import webdriver
from bs4 import BeautifulSoup

url = "https://www.amazon.in/OnePlus-Wireless-Earbuds-Titanium-Playback/dp/B0BYJ6ZMTS/ref=sr_1_2"

driver = webdriver.Chrome()

driver.get(url)

driver.implicitly_wait(10)

page_source = driver.page_source

soup = BeautifulSoup(page_source, 'html.parser')

element_id = "productTitle"

target_element = soup.find(id=element_id)

if target_element:
    print(target_element.text)
else:
    print(f"Element with ID '{element_id}' not found on the page.")

driver.quit()