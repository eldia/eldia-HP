// Polyfills for older browsers
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
        'use strict';

        if ( this === undefined || this === null ) {
            throw new TypeError( '"this" is null or not defined' );
        }

        var length = this.length >>> 0; // Hack to convert object.length to a UInt32

        fromIndex = +fromIndex || 0;

        if (Math.abs(fromIndex) === Infinity) {
            fromIndex = 0;
        }

        if (fromIndex < 0) {
            fromIndex += length;
            if (fromIndex < 0) {
                fromIndex = 0;
            }
        }

        for (;fromIndex < length; fromIndex++) {
            if (this[fromIndex] === searchElement) {
                return fromIndex;
            }
        }

        return -1;
    };
}

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    'use strict';
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind -' +
           'what is trying to be bound is not callable');
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        FNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof FNOP && oThis ?
                this : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    FNOP.prototype = this.prototype;
    fBound.prototype = new FNOP();

    return fBound;
  };
}



(function (win, doc) {
    'use strict';

    var dom = {
        byId: function (id) { return doc.getElementById(id); },
        byClass: (function () {
            if (typeof doc.getElementsByClassName === 'function') {
                return function (selector) { return doc.getElementsByClassName(selector); };
            } else if (typeof doc.querySelectorAll === 'function') {
                return function (selector) { return doc.querySelectorAll('.' + selector); };
            } else {
                return function (selector) {
                    var nodes = doc.getElementsByTagName('*');
                    var list = [];
                    for (var i = 0, len = nodes.length; i < len; i += 1) {
                        var classes = nodes[i].className.split(' ');
                        if (classes.indexOf(selector) > -1) {
                            list.push(nodes[i]);
                        }
                    }
                    return list;
                };
            }
        }())
    };




    function RSS(container) {
        this.id  = container.getAttribute('id');
        this.url = container.getAttribute('data-rss-url');
        this.num = container.getAttribute('data-rss-num');

        this.load(this.url, this.num, this.id);
    }

    RSS.prototype.load = function (url, num, id) {
        var cb      = 'parseRSS' + id + num,
            script  = doc.createElement('script'),
            head    = doc.getElementsByTagName('head')[0],
            googurl = 'https://ajax.googleapis.com/ajax/services/feed/load' +
                '?v=1.0&num=' + num + '&q=' + encodeURIComponent(url) +
                '&callback=' + cb + '&context=' + id;

        script.async = true;
        script.src   = googurl;
        head.appendChild(script);

        win[cb] = this.parse.bind(this);
    };

    RSS.prototype.parse = function (context, data) {
        var container = dom.byId(context);
        var list = doc.createElement('ul');

        for (var i = 0, len = data.feed.entries.length; i < len; i += 1) {
            list.appendChild(this.renderPost(data.feed.entries[i]));
        }

        container.innerHTML = '';
        container.appendChild(list);
    };

    RSS.prototype.getImage = function (content) {
        var div = doc.createElement('div');
        div.innerHTML = content;
        return div.getElementsByTagName('img')[0];
    };

    RSS.prototype.getText = function (content) {
        var div = doc.createElement('div');
        div.innerHTML = content;
        return div.textContent;
    };

    RSS.prototype.renderPost = function (entry) {
        var title   = entry.title,
            content = entry.content,
            link    = entry.link,
            text    = this.getText(content),
            image   = this.getImage(content),
            li      = doc.createElement('li');

        li.innerHTML = '<h1><a href="' + link + '">' + title + '</a></h1>' +
            '<img src="' + image.src + '"><p>' + text + '</p>';

        return li;
    };




    var elements = dom.byClass('post_results');

    for (var i = 0; i < elements.length; i += 1) {
        new RSS(elements[i]);
    }

}(window, document));