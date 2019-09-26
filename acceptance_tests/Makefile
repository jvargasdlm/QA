DOWNLOADS_DIR_PATH = downloads
OUTPUT_DIR_PATH = output
SCREENSHOT_DIR_PATH = $(OUTPUT_DIR_PATH)/screenshots
TEST_RESULTS_DIR_PATH = $(OUTPUT_DIR_PATH)/test_results

all: prepare run

run:
	npm test -- --passWithNoTests --detectOpenHandles --verbose

prepare: extract_chrome createDirs install_

reinstall:
	sudo rm -rf node_modules
	sudo rm package-lock.json
	install_

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


