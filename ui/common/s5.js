(function($) {
        var themeDuration = 500,
            fadeDuration = 500,
            incrDuration = 500,
            controlsDuration = 500,
            controlsTimeout = null,
            projectionMode = false,
            notesWindow = null,
            currentSlide = 1,
            currentStep = 0,
            slideCount = 0,
            incrementals = [],
            themes = null,
            currentTheme = null,
            currentHash = location.hash,
            path = null,
            transitions = false;

        function log(text) {
                if (window.console)
                        window.console.log(text);
        }

        function rescale() {
                var factor = 1, fontSize = 1, unit = 'em',
                    vScale = 48, hScale = 64, vSize, hSize, em;
                if (projectionMode) {
                        if (window.innerHeight) {
                                vSize = window.innerHeight;
                                hSize = window.innerWidth;
                        } else if (document.documentElement.clientHeight) {
                                vSize = document.documentElement.clientHeight;
                                hSize = document.documentElement.clientWidth;
                        } else if (document.body.clientHeight) {
                                vSize = document.body.clientHeight;
                                hSize = document.body.clientWidth;
                        } else {
                                vSize = 700;
                                hSize = 1024;
                        }
                        fontSize = Math.min(Math.round(vSize / vScale), Math.round(hSize / hScale));
                        unit     = 'px';

                        em = $('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&#160;</div>').appendTo('body'),
                        factor = fontSize / em.height();
                        em.remove();
                }
                $('body').css({fontSize: fontSize + unit});
                $('img.scale').each(function() {
                        var img = $(this), w = img.attr('width'), h = img.attr('height');
                        if (w && h)
                                img.css({width: Math.floor(w * factor) + 'px',
                                         height: Math.floor(h * factor) + 'px'});
                });
		return false;
        }

        function updateNotes() {
                if (notesWindow && !notesWindow.closed)
                        $('body', notesWindow.document).html(
                                '<div><h2>Notes</h2>' + ($('#slide' + currentSlide + ' .notes').html() || 'No notes') + '</div>');
        }

        function setSlide(slide, backward) {
                currentSlide = slide;
                currentStep = backward ? incrementals[currentSlide - 1].length : 0;
                $('#slideList').val(slide);
                $('#currentSlide').html('<span id="csHere">' + currentSlide +
                                        '</span><span id="csSep">/</span><span id="csTotal">' + slideCount + '</span>');
                updateNotes();
        }

        function jump(slide, backward, immediately) {
                if (!projectionMode || slide < 1 || slide > slideCount ||
                    slide == currentSlide)
                        return;

                incrementals[currentSlide - 1].removeClass('current');

                var i = incrementals[slide - 1];
                if (backward) {
                        i.eq(i.size() - 1).addClass('current');
                        i.css({visibility: 'visible', opacity: 1});
                } else {
                        i.css({visibility: 'hidden', opacity: 0});
                }

                if (transitions && !immediately) {
                        $('.slide').stop(true, true);
                        $('#slide' + currentSlide).fadeOut(fadeDuration, function() {
                               $('#slide' + slide).fadeIn(fadeDuration);
                        });
                } else {
                        $('#slide' + currentSlide).hide();
                        $('#slide' + slide).show();
                }
                setSlide(slide, backward);
        }

        function first() {
                jump(1);
                return false;
        }

        function last() {
                jump(slideCount);
                return false;
        }

        function next() {
                if (!projectionMode)
                        return;
                if (currentStep == incrementals[currentSlide - 1].size())
                        jump(currentSlide + 1);
                else {
                        var i = incrementals[currentSlide - 1];
                        i.eq(currentStep - 1).removeClass('current');
                        i = i.eq(currentStep++).addClass('current');
                        if (transitions)
                                i.css({visibility:'visible'}).stop(true).animate({opacity: 1}, incrDuration);
                        else
                                i.css({visibility:'visible', opacity: 1});
                }
                return false;
        }

        function previous() {
                if (!projectionMode)
                        return;
                if (currentStep == 0)
                        jump(currentSlide - 1, true);
                else {
                        var i = incrementals[currentSlide - 1];
                        i.eq(currentStep - 2).addClass('current');
                        if (transitions)
                                i.eq(--currentStep).stop(true).animate({opacity: 0}, incrDuration, function() {
                                        $(this).css({visibility:'hidden'}).removeClass('current');
                                });
                        else
                                i.eq(--currentStep).css({visibility:'hidden', opacity: 0}).removeClass('current');
                }
                return false;
        }

        function showControls() {
                if (controlsTimeout) {
                        clearTimeout(controlsTimeout);
                        controlsTimeout = null;
                }
                $('#controlsBar').css({visibility:'visible', opacity: 1});
        }

        function hideControls() {
                controlsTimeout = setTimeout(function() {
                        controlsTimeout = null;
                        $('#controlsBar').stop(true).animate({opacity: 0}, controlsDuration, function() { $(this).css({visibility:'hidden'}); });
                }, 3000);
        }

        function toggleControls() {
                var controls = $('#controlsBar');
                if (controls.css('visibility') == 'visible' && controls.css('opacity') == '1')
                        controls.css({visibility:'hidden', opacity: 0});
                else
                        controls.css({visibility:'visible', opacity: 1});
        }

        function keyup(key) {
                if (!key) {
                        key = event;
                        key.which = key.keyCode;
                }
                switch (key.which) {
                case 34: // page down
                        jump(currentSlide + 1);
                        break;
                case 32: // spacebar
                case 39: // rightkey
                case 40: // downkey
                        next();
                        break;
                case 13: // enter
                        next();
                        break;
                        break;
                case 33: // page up
                        jump(currentSlide - 1);
                        break;
                case 37: // leftkey
                case 38: // upkey
                        previous();
                        break;
                case 36: // home
                        first();
                        break;
                case 35: // end
                        last();
                        break;
                case 67: // c
                        toggleControls();
                        break;
                case 78:
                        toggleNotes();
                        break;
                }
                return false;
        }

        function setTheme(theme) {
                if (!theme || $.inArray(theme, themes) < 0)
                        theme = themes.length == 0 ? 'default' : themes[0];

                if (currentTheme == theme)
                        return;

                $('body').append('<div id="themeOverlay"/><div id="themeLoaded" style="display: none;"/>');
                $('body').css({ height: '100%' });
                $('head').append('<link rel="stylesheet" href="' + path + theme + '/theme.css" type="text/css" title="' +
                                 theme + '" media="screen"/>');
                $('#themeOverlay').css({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1000,
                        background: '#FFF url(' + path + 'common/loading.gif) no-repeat center'
                });

                function activate(theme) {
                        $('link[rel*=style][title]').each(function() {
                                if ($(this).attr('title') == currentTheme)
                                        $.get(path + currentTheme + '/unload.js', function(data) { eval(data); });
                                this.disabled = true;
                        });
                        currentTheme = null;
                        $('link[rel*=style][title=' + theme + ']').each(function() {
                                this.disabled = false;
                                $.get(path + theme + '/load.js', function(data) { eval(data); });
                                currentTheme = theme;
                         });
                }

                var oldTheme = currentTheme, tries = 0;
                activate(theme);

                function hideOverlay() {
                        var element = $('#themeLoaded');
                        if (element.size() == 0)
                                return;
                        if (element.css('width') == '42px' || tries >= 50) {
                                if (tries >= 50) {
                                        $('link[rel*=style][title=' + theme + ']').remove();
                                        if (oldTheme)
                                                activate(oldTheme);
                                }

                                projectionMode = element.css('font-family') == 'Projection';
                                if (projectionMode) {
                                        $('.slide').hide();
                                        $('.navigation, #currentSlide, #slide' + currentSlide).show();
                                } else {
                                        $('.slide').show();
                                        $('.navigation, #currentSlide').hide();
                                        incrementals[currentSlide - 1].stop(true).css({opacity: 1, visibility: 'visible'});
                                }
                                rescale();

                                $('#themeLoaded, #themeOverlay').fadeOut(themeDuration, function() {
                                        $(this).remove();
                                });
                        } else {
                                setTimeout(hideOverlay, 200);
                        }
                }
                hideOverlay();

                $('#themeOverlay').click(function() {
                        if (oldTheme)
                                activate(oldTheme);
                        $('#themeLoaded, #themeOverlay, link[rel*=style][title=' + theme + ']').remove();
                        return false;
                });
        }

        function initTheme() {
                themes = $('meta[name=themes]').attr('content');
                themes = themes ? themes.split(/\s+/) : [];
                currentTheme = null;

                var theme, match;
                if (match = location.search.match(/(\?|&)theme=([\w-_]+)/))
                        theme = match[2];
                if (!theme)
                        theme = $('link[rel*=style][title]:eq(0)').attr('title');
                setTheme(theme);
        }

        function initSlides() {
                if ($('#currentSlide').size() == 0)
                        $('.layout').append('<div id="currentSlide"/>');
                $('.slide').each(function(i) {
                         $(this).attr('id', 'slide' + (i + 1));
                         incrementals[i] = $(':not(ul, ol).incremental,' +
                                             'ul.incremental:not(.show-first) > li,' +
                                             'ol.incremental:not(.show-first) > li,' +
                                             'ul.incremental.show-first > li:not(:first-child),' +
                                             'ul.incremental.show-first > li:not(:first-child)', this);
                });
                $('a[href^=#slide]').each(function() {
                         var match;
                         if (match = this.href.match(/#slide(\d+)$/)) {
                             this.href = '#';
                             match = parseInt(match[1]);
                             $(this).click(function() {
                                 jump(match);
                                 return false;
                             });
                         }
                });

                slideCount = $('.slide').size();

		var match;
		if (match = location.hash.match(/^#(\d+)$/))
                        currentSlide = parseInt(match[1]);
                setSlide(currentSlide);
	}

	function checkHash() {
                if (currentHash != location.hash) {
                        var match;
                        currentHash = location.hash;
                        if (match = currentHash.match(/^#(\d+)$/))
                                jump(parseInt(match[1]), false, true);
                }
                setTimeout(checkHash, 100);
	}

        function initControls() {
                if ($('#controls').size() == 0)
                        $('.layout').append('<div id="controls"/>');
                $('#controls').html('<div id="controlsBar" style="visibility: hidden"><div id="controlsContainer">' +
                                    '<a class="navigation" id="navFirst" href="#">&#9646;&#9664;</a>' +
                                    '<a class="navigation" id="navPrevious" href="#">&#9664;</a>'     +
                                    '<a class="navigation" id="navNext" href="#">&#9654;</a>'         +
                                    '<a class="navigation" id="navLast" href="#">&#9654;&#9646;</a>'  +
                                    '<a class="navigation" id="navNotes" href="#">&#x274f;</a>'       +
                                    '<a class="navigation" id="navTransitions" href="#">&#' + (transitions ? '9639' : '9634') + ';</a>'  +
                                    '<select class="navigation" id="slideList"/><select id="themeList"/></div></div>')
                              .mouseenter(showControls).mouseleave(hideControls);
                $('#navPrevious').click(previous);
                $('#navNext').click(next);
                $('#navFirst').click(first);
                $('#navLast').click(last);
                $('#navNotes').click(toggleNotes);
                $('#navTransitions').click(toggleTransitions);
                $('#slideList').change(function() { jump(parseInt($('#slideList').val())); });
                $('#themeList').change(function() { setTheme($('#themeList').val()); });

                var list = $('#slideList').get(0), i;
                $('.slide').each(function(i) {
                        list.options[list.length] = new Option((i + 1) + ' : ' + $('h1,h2,h3,h4,h5,h6', this).first().text(), i + 1);
                });

                themes = themes.sort();
                list = $('#themeList').get(0);
                for (i in themes)
                        list.options[list.length] = new Option('Theme ' + themes[i], themes[i]);
        }

        function toggleTransitions() {
                transitions = !transitions;
                $('#navTransitions').html(transitions ? '&#9639;' : '&#9634;');
                return false;
        }

        function toggleNotes() {
                if (!notesWindow || notesWindow.closed) {
                        notesWindow = window.open(path + 'common/notes.html', 'Notes', 'width=300,height=400,left=100,top=200');
                        setTimeout(updateNotes, 500);
                } else {
                        notesWindow.close();
                        notesWindow = null;
                }
                return false;
        }

        function init() {
                path = $('script[src*=s5.js]').attr('src');
                path = path.substr(0, path.length - 'common/s5.js'.length);
                transitions = $('meta[name=transitions]').attr('content') == 'yes';
                fadeDuration = parseInt($('meta[name=fadeDuration]').attr('content') || fadeDuration);
                incrDuration = parseInt($('meta[name=incrDuration]').attr('content') || incrDuration);

                initSlides();
                initTheme();
                initControls();

                $(document).keyup(keyup).click(function(event) {
                       var n = event.target.nodeName.toLowerCase();
                       return event.button != 0 || n == 'a' || n == 'select' || n == 'button' || n == 'option' ? true : next();
                });
                $(window).resize(rescale);
                checkHash();
        }

        $(init);
})(jQuery);
