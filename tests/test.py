import unittest
import urllib
import time
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.chrome.options import Options
from pyvirtualdisplay import Display


class LiftedMobileTest(unittest.TestCase):
    def setUp(self):
        self.display = Display(visible=0, size=(320, 568))
        self.display.start()

        chrome_options = Options()
        chrome_options.add_argument("--no-sandbox")
        self.driver = webdriver.Chrome(chrome_options=chrome_options)
        self.base_url = "http://192.168.222.1:8000/"
        self.driver.get(self.base_url)
        self.driver.implicitly_wait(2)
        username_input = self.driver.find_element_by_id("id_username")
        self.assertTrue(username_input is not None)
        self.login()


    def tearDown(self):
        self.driver.close()
        self.driver.quit()
        self.display.stop()


    def login(self):
        username_input = self.driver.find_element_by_id("id_username")
        password_input = self.driver.find_element_by_id("id_password")
        username_input.send_keys("demo")
        password_input.send_keys("botanical gravitate flashbulb thicken copper")
        self.driver.find_element_by_id("submit_btn").click()
        self.driver.implicitly_wait(2)


class LoginTest(LiftedMobileTest):
    def test_login(self):
        self.driver.get(self.base_url)
        try:
            sal_logo = self.driver.find_element_by_class_name("sal_logo")
            question = self.driver.find_element_by_class_name("question")
        except NoSuchElementException:
            self.fail("Could not find signs of a successful login.")


class SalLinksTest(LiftedMobileTest):
    def test_sal_link(self):
        self.driver.get(self.base_url)
        self.driver.implicitly_wait(2)

        logo_a_xpath = "//div[contains(@class,'sal_logo')]/a"
        logo_url = self.driver.find_element_by_xpath(logo_a_xpath)\
                .get_attribute("href")

        self.assertEqual(logo_url, "http://www.sal.org.sg/")


    def test_lifted_link(self):
        self.driver.get(self.base_url)
        lifted_partial_link_text = "Legal Industry Framework for Training and "\
                                   "Education"
        lifted_url = self.driver\
                .find_element_by_partial_link_text(lifted_partial_link_text)\
                .get_attribute("href")

        self.assertEqual(lifted_url, "http://www.sal.org.sg/Resources-Tools/"
                                     "Legal-Education/LIFTED/Overview")

    def test_sal_link_2(self):
        self.driver.get(self.base_url)
        sal_partial_link_text = "Singapore Academy of Law"
        sal_url = self.driver\
                .find_element_by_partial_link_text(sal_partial_link_text)\
                .get_attribute("href")

        self.assertEqual(sal_url, "http://www.sal.org.sg/")


class JobRoleScreenTest(LiftedMobileTest):
    def test_has_qn_title(self):
        self.driver.get(self.base_url)

        qn_title_xpath = "//div[contains(@class,'question')]/h1"
        try:
            qn_title_tag = self.driver.find_element_by_xpath(qn_title_xpath)
            self.assertTrue(qn_title_tag is not None)
        except NoSuchElementException:
            self.fail("Could not find question title tag")


    def test_has_3_questions(self):
        self.driver.get(self.base_url)
        answer_tags = self.driver.find_elements_by_class_name("answer")
        self.assertEqual(len(answer_tags), 3)


class WhatCompetencyScreenTest(LiftedMobileTest):
    def navigate_to_screen(self):
        self.driver.get(self.base_url)
        answer_tags = self.driver.find_elements_by_class_name("answer")
        answer_tags[0].click()

    def test_can_reach_from_base(self):
        self.navigate_to_screen()
        path = urllib.parse.urlparse(self.driver.current_url).path
        self.assertEqual(path, "/what")



if __name__ == "__main__":
    unittest.main()

    # driver.get_screenshot_as_file('/screenshots/main-page.png')

