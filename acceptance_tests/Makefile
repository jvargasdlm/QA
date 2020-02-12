# paths
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

install_:
	sudo npm set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
	sudo npm install --unsafe-perm=true
