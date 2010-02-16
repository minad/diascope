SASS_FILES=$(wildcard ui/*/theme.sass)
CSS_FILES=$(SASS_FILES:sass=css)
COMMON_SASS_FILES=$(wildcard ui/common/*.sass)


all: $(CSS_FILES)

clean:
	rm -f $(CSS_FILES)

ui/%/theme.css: ui/%/theme.sass $(COMMON_SASS_FILES)
	sass -C -t compressed $< > $@
