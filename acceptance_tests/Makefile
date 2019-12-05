# otus login data
EMAIL=empty
PASSWORD=empty
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

run:
	SHOW_BROWSER=false npm test -- --passWithNoTests --detectOpenHandles --verbose

show:
	SHOW_BROWSER=true npm test -- --passWithNoTests --detectOpenHandles --verbose

reinstall:
	sudo rm -rf node_modules
	sudo rm package-lock.json
	install_

set_login_data:
	EMAIL=$(EMAIL) PASSWORD=$(PASSWORD) npm start

install_:
	sudo npm set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
	sudo npm install --unsafe-perm=true