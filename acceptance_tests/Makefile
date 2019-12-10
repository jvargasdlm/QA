# OTUS login data
OTUS_EMAIL=empty
OTUS_PASSWORD=empty

# paths
DOWNLOADS_DIR_PATH = downloads
OUTPUT_DIR_PATH = output
SCREENSHOT_DIR_PATH = $(OUTPUT_DIR_PATH)/screenshots
TEST_RESULTS_DIR_PATH = $(OUTPUT_DIR_PATH)/test_results

init: install_ set_login_data
	tar xzf chrome.tar.gz
	mkdir -p $(DOWNLOADS_DIR_PATH)
	mkdir -p $(OUTPUT_DIR_PATH)
	mkdir -p $(SCREENSHOT_DIR_PATH)
	mkdir -p $(TEST_RESULTS_DIR_PATH)

reinstall:
	sudo rm -rf node_modules
	sudo rm package-lock.json
	install_

set_login_data:
	OTUS_EMAIL=$(EMAIL) OTUS_PASSWORD=$(PASSWORD) npm start

install_:
	sudo npm set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
	sudo npm install --unsafe-perm=true