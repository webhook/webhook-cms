/*
 * shortcode.js 1.1.0
 * by @nicinabox
 * License: MIT
 * Issues: https://github.com/nicinabox/shortcode.js/issues
 */

/* jshint strict: false, unused: false */

var Shortcode = function(el, tags) {
  if (!el) { return; }

  this.el      = el;
  this.tags    = tags;
  this.matches = [];
  this.regex   = '\\[{name}(.*?)?\\](?:([\\s\\S]*?)(\\[\/{name}\\]))?';

  if (this.el.jquery) {
    this.el = this.el[0];
  }

  this.matchTags();
  this.convertMatchesToNodes();
  this.replaceNodes();
};

Shortcode.prototype.matchTags = function() {
  var html = this.el.outerHTML, instances,
      match, re, contents, regex, tag, options;

  for (var key in this.tags) {
    if (!this.tags.hasOwnProperty(key)) { return; }

    re        = this.template(this.regex, { name: key });
    instances = html.match(new RegExp(re, 'g')) || [];

    for (var i = 0, len = instances.length; i < len; i++) {
      match = instances[i].match(new RegExp(re));
      contents = match[3] ? '' : undefined;
      tag      = match[0];
      regex    = this.escapeTagRegExp(tag);
      options  = this.parseOptions(match[1]);

      if (match[2]) {
        contents = match[2].trim();
        tag      = tag.replace(contents, '');
        regex    = regex.replace(contents, '([\\s\\S]*?)');
      }

      this.matches.push({
        name: key,
        tag: tag,
        regex: regex,
        options: options,
        contents: contents
      });
    }
  }
};

Shortcode.prototype.convertMatchesToNodes = function() {
  var html = this.el.innerHTML, excludes, re, replacer;

  replacer = function(match, p1, p2, p3, p4, offset, string) {
    if (p1) {
      return match;
    } else {
      var node = document.createElement('span');
      node.setAttribute('data-sc-tag', this.tag);
      node.className = 'sc-node sc-node-' + this.name;
      return node.outerHTML;
    }
  };

  for (var i = 0, len = this.matches.length; i < len; i++) {
    excludes = '((data-sc-tag=")|(<pre.*)|(<code.*))?';
    re       = new RegExp(excludes + this.matches[i].regex, 'g');
    html     = html.replace(re, replacer.bind(this.matches[i]));
  }

  this.el.innerHTML = html;
};

Shortcode.prototype.replaceNodes = function() {
  var self = this, html, match, result, done, node, fn, replacer,
      nodes = this.el.querySelectorAll('.sc-node');

  replacer = function(result) {
    if (result.jquery) { result = result[0]; }

    result = self.parseCallbackResult(result);
    node.parentNode.replaceChild(result, node);
  };

  for (var i = 0, len = this.matches.length; i < len; i++) {
    match = this.matches[i];
    node  = this.el.querySelector('.sc-node-' + match.name);

    if (node && node.dataset.scTag === match.tag) {
      fn     = this.tags[match.name].bind(match);
      done   = replacer.bind(match);
      result = fn(done);

      if (result !== undefined) {
        done(result);
      }
    }
  }
};

Shortcode.prototype.parseCallbackResult = function(result) {
  var container, fragment, children;

  switch(typeof result) {
    case 'function':
      result = document.createTextNode(result());
      break;

    case 'string':
      container = document.createElement('div');
      fragment  = document.createDocumentFragment();
      container.innerHTML = result;
      children = container.children;

      if (children.length) {
        for (var i = 0, len = children.length; i < len; i++) {
          fragment.appendChild(children[i].cloneNode(true));
        }
        result = fragment;
      } else {
        result = document.createTextNode(result);
      }
      break;

    case 'object':
      if (!result.nodeType) {
        result = JSON.stringify(result);
        result = document.createTextNode(result);
      }
      break;

    case 'default':
      break;
  }

  return result;
};

Shortcode.prototype.parseOptions = function(stringOptions) {
  var options = {}, set;
  if (!stringOptions) { return; }

  set = stringOptions
          .replace(/(\w+=)/g, '\n$1')
          .split('\n');
  set.shift();

  for (var i = 0; i < set.length; i++) {
    var kv = set[i].split('=');
    options[kv[0]] = kv[1].replace(/\'|\"/g, '').trim();
  }

  return options;
};

Shortcode.prototype.escapeTagRegExp = function(regex) {
  return regex.replace(/[\[\]\/]/g, '\\$&');
};

Shortcode.prototype.template = function(s, d) {
  for (var p in d) {
    s = s.replace(new RegExp('{' + p + '}','g'), d[p]);
  }
  return s;
};

// Polyfill .trim()
String.prototype.trim = String.prototype.trim || function () {
  return this.replace(/^\s+|\s+$/g, '');
};

// jQuery plugin wrapper
if (window.jQuery) {
  var pluginName = 'shortcode';
  $.fn[pluginName] = function (tags) {
    this.each(function() {
      if (!$.data(this, pluginName)) {
        $.data(this, pluginName, new Shortcode(this, tags));
      }
    });
    return this;
  };
}