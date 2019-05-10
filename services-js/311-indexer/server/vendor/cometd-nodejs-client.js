// vendored 11/28/18 by Fin Hopkins from https://github.com/cometd/cometd-nodejs-client
// under the terms of the Apache license.
//
// Modified to add the "makeAgent" function that allows for an HTTP proxy.

module.exports = {
  adapt: function(makeAgent) {
    var url = require('url');
    var httpc = require('http');
    var https = require('https');

    global.window = {};

    window.setTimeout = setTimeout;
    window.clearTimeout = clearTimeout;

    window.console = console;
    window.console.debug = window.console.log;

    // Fields shared by all XMLHttpRequest instances.
    var _agentc = new httpc.Agent({
      keepAlive: true,
    });
    var _agents = new https.Agent({
      keepAlive: true,
    });
    var _globalCookies = {};

    function _secure(uri) {
      return /^https/i.test(uri.protocol);
    }

    // Bare minimum XMLHttpRequest implementation that works with CometD.
    window.XMLHttpRequest = function() {
      var _localCookies = {};
      var _config;
      var _request;

      function _storeCookie(cookieStore, value) {
        var host = _config.hostname;
        var jar = cookieStore[host];
        if (jar === undefined) {
          cookieStore[host] = jar = {};
        }
        var cookies = value.split(';');
        for (var i = 0; i < cookies.length; ++i) {
          var cookie = cookies[i].trim();
          var equal = cookie.indexOf('=');
          if (equal > 0) {
            jar[cookie.substring(0, equal)] = cookie;
          }
        }
      }

      function _concatCookies(cookieStore) {
        var cookies = '';
        var jar = cookieStore[_config.hostname];
        if (jar) {
          for (var name in jar) {
            if (jar.hasOwnProperty(name)) {
              if (cookies) {
                cookies += '; ';
              }
              cookies += jar[name];
            }
          }
        }
        return cookies;
      }

      this.status = 0;
      this.statusText = '';
      this.readyState = window.XMLHttpRequest.UNSENT;
      this.responseText = '';

      this.open = function(method, uri) {
        _config = url.parse(uri);
        _config.method = method;
        _config.agent = makeAgent
          ? makeAgent(_secure(_config))
          : _secure(_config)
          ? _agents
          : _agentc;
        _config.headers = {};
        this.readyState = window.XMLHttpRequest.OPENED;
      };

      this.setRequestHeader = function(name, value) {
        if (/^cookie$/i.test(name)) {
          _storeCookie(_localCookies, value);
        } else {
          _config.headers[name] = value;
        }
      };

      this.send = function(data) {
        var globalCookies = this.context && this.context.cookieStore;
        if (!globalCookies) {
          globalCookies = _globalCookies;
        }
        var cookies1 = _concatCookies(globalCookies);
        var cookies2 = _concatCookies(_localCookies);
        var delim = cookies1 && cookies2 ? '; ' : '';
        var cookies = cookies1 + delim + cookies2;
        if (cookies) {
          _config.headers['Cookie'] = cookies;
        }

        var self = this;
        var http = _secure(_config) ? https : httpc;
        _request = http.request(_config, function(response) {
          var success = false;
          self.status = response.statusCode;
          self.statusText = response.statusMessage;
          self.readyState = window.XMLHttpRequest.HEADERS_RECEIVED;
          var headers = response.headers;
          for (var name in headers) {
            if (headers.hasOwnProperty(name)) {
              if (/^set-cookie$/i.test(name)) {
                var header = headers[name];
                for (var i = 0; i < header.length; ++i) {
                  var whole = header[i];
                  var parts = whole.split(';');
                  var cookie = parts[0];
                  _storeCookie(globalCookies, cookie);
                }
              }
            }
          }
          response.on('data', function(chunk) {
            self.readyState = window.XMLHttpRequest.LOADING;
            self.responseText += chunk;
          });
          response.on('end', function() {
            success = true;
            self.readyState = window.XMLHttpRequest.DONE;
            if (self.onload) {
              self.onload();
            }
          });
          response.on('close', function() {
            if (!success) {
              self.readyState = window.XMLHttpRequest.DONE;
              if (self.onerror) {
                self.onerror();
              }
            }
          });
        });
        ['abort', 'aborted', 'error'].forEach(function(event) {
          _request.on(event, function(x) {
            self.readyState = window.XMLHttpRequest.DONE;
            if (x) {
              var error = x.message;
              if (error) {
                self.statusText = error;
              }
            }
            if (self.onerror) {
              self.onerror(x);
            }
          });
        });
        if (data) {
          _request.write(data);
        }
        _request.end();
      };

      this.abort = function() {
        if (_request) {
          _request.abort();
        }
      };

      this._config = function() {
        return _config;
      };
    };
    window.XMLHttpRequest.UNSENT = 0;
    window.XMLHttpRequest.OPENED = 1;
    window.XMLHttpRequest.HEADERS_RECEIVED = 2;
    window.XMLHttpRequest.LOADING = 3;
    window.XMLHttpRequest.DONE = 4;
  },
};
