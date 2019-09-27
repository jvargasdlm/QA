# otus login data
EMAIL=empty
PASSWORD=empty
# paths
DOWNLOADS_DIR_PATH = downloads
OUTPUT_DIR_PATH = output
SCREENSHOT_DIR_PATH = $(OUTPUT_DIR_PATH)/screenshots
TEST_RESULTS_DIR_PATH = $(OUTPUT_DIR_PATH)/test_results

# main rules

init:
	extract_chrome
	createDirs
	install_
	set_login_data

run:
	npm test -- --passWithNoTests --detectOpenHandles --verbose

show:
	SHOW_BROWSER=true npm test -- --passWithNoTests --detectOpenHandles --verbose

reinstall:
	sudo rm -rf node_modules
	sudo rm package-lock.json
	install_

# helper rules

set_login_data:
	EMAIL=$(EMAIL) PASSWORD=$(PASSWORD) npm start

extract_chrome:
	tar xzf chrome.tar.gz

createDirs:
	mkdir $(DOWNLOADS_DIR_PATH)
	mkdir $(OUTPUT_DIR_PATH)
	mkdir $(SCREENSHOT_DIR_PATH)
	mkdir $(TEST_RESULTS_DIR_PATH)

install_:
	sudo npm set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
	sudo npm install --unsafe-perm=true
