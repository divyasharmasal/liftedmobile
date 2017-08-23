import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from pyvirtualdisplay import Display

display = Display(visible=0, size=(800, 600))
display.start()

chrome_options = Options()
chrome_options.add_argument("--no-sandbox")
driver = webdriver.Chrome(chrome_options=chrome_options)

driver.get('http://52.221.77.72')
time.sleep(5)

driver.get_screenshot_as_file('/screenshots/main-page.png')

title = driver.title
print(title.encode('utf-8'))

# html=driver.page_source
# print(html)

# Release memory
driver.close()
driver.quit()
display.stop()
