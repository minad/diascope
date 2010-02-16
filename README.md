S5: A Simple Standards-Based Slide Show System
==============================================

S5 is a slide show format based entirely on XHTML, CSS, and JavaScript. With one file, you can run a complete slide show and have a printer-friendly version as well. The markup used for the slides is very simple, highly semantic, and completely accessible. Anyone with even a smidgen of familiarity with HTML or XHTML can look at the markup and figure out how to adapt it to their particular needs. Anyone familiar with CSS can create their own slide show theme. It's totally simple, and it's totally standards-driven.

The original S5 was developed by [Eric Meyer](http://meyerweb.com/eric/tools/s5/).

S5-suckless
===========

S5-suckless is a a mostly-S5-compatible implementation which sucks less. It
is inspired by [s5-reloaded](http://www.netzgesta.de/S5/).

It uses jQuery to handle the javascript peaks and pitfalls. The javascript is therefore
a lot cleaner and shorter than the original one and at least more maintainable.
CSS is handled by [SASS](http://sass-lang.com/). The structure of the html files is
nearly the same as for the original S5. But the organisation of the files has changed a lot.
There are a lot of shared files in ui/common and the themes consist of only the files "theme.sass", "load.js" and "unload.js".

It also supports live switching of the themes!

Features
========

* More hackable than original S5
* Sass is used for css and therefore there is shared css
* Theme switching
* Better interface
* Shared javascript
* Support for embedded SVG and MathML.
  This is not possible in original S5 because of the use of innerHTML.
  jQuery handles this in our case.
* And most of the original S5 features

License
=======

All the stuff is in the public domain, but
jquery is not (MIT license).

