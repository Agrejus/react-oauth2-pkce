function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var crypto = require('crypto');
var jwtDecode = _interopDefault(require('jwt-decode'));

var AuthContext = React__default.createContext(undefined);
var useAuth = function useAuth() {
  var context = React.useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }

  return context;
};
function withAuth(ComponentToWrap) {
  var WrappedComponent = function WrappedComponent(props) {
    var authProps = useAuth();
    return React__default.createElement(ComponentToWrap, Object.assign({}, authProps, props));
  };

  WrappedComponent.displayName = 'withAuth_' + (ComponentToWrap.displayName || ComponentToWrap.name);
  return WrappedComponent;
}

var AuthProvider = function AuthProvider(props) {
  var authService = props.authService,
      children = props.children;
  return React__default.createElement(AuthContext.Provider, {
    value: {
      authService: authService
    }
  }, children);
};

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o) {
  var i = 0;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) return function () {
      if (i >= o.length) return {
        done: true
      };
      return {
        done: false,
        value: o[i++]
      };
    };
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  i = o[Symbol.iterator]();
  return i.next.bind(i);
}

var base64URLEncode = function base64URLEncode(str) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};
var sha256 = function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
};
var createPKCECodes = function createPKCECodes() {
  var codeVerifier = base64URLEncode(crypto.randomBytes(64));
  var codeChallenge = base64URLEncode(sha256(Buffer.from(codeVerifier)));
  var createdAt = new Date();
  var codePair = {
    codeVerifier: codeVerifier,
    codeChallenge: codeChallenge,
    createdAt: createdAt
  };
  return codePair;
};

var toSnakeCase = function toSnakeCase(str) {
  return str.split(/(?=[A-Z])/).join('_').toLowerCase();
};
var toUrlEncoded = function toUrlEncoded(obj) {
  return Object.keys(obj).map(function (k) {
    return encodeURIComponent(toSnakeCase(k)) + '=' + encodeURIComponent(obj[k]);
  }).join('&');
};

var AuthService = /*#__PURE__*/function () {
  function AuthService(props) {
    this.props = props;
    this.tryInvokeRedirectCallback();
  }

  var _proto = AuthService.prototype;

  _proto.tryInvokeRedirectCallback = function tryInvokeRedirectCallback() {
    var postAuthRedirect = window.localStorage.getItem('postAuthRedirect');

    if (this.props.onRedirectCallback && postAuthRedirect && this.isAuthenticated() === true) {
      var state = window.localStorage.getItem('postAuthState');
      window.localStorage.removeItem('postAuthState');
      window.localStorage.removeItem('postAuthRedirect');
      this.props.onRedirectCallback(state);
    }
  };

  _proto.getUser = function getUser() {
    var t = this.getAuthTokens();
    if (null === t) return {};
    var decoded = jwtDecode(t.id_token);
    return decoded;
  };

  _proto.getCodeFromLocation = function getCodeFromLocation(location) {
    return this.getValueFromLocation(location, 'code');
  };

  _proto.getValueFromLocation = function getValueFromLocation(location, name) {
    var split = location.toString().split('?');

    if (split.length < 2) {
      return null;
    }

    var pairs = split[1].split('&');

    for (var _iterator = _createForOfIteratorHelperLoose(pairs), _step; !(_step = _iterator()).done;) {
      var pair = _step.value;

      var _pair$split = pair.split('='),
          key = _pair$split[0],
          value = _pair$split[1];

      if (key === name) {
        return decodeURIComponent(value || '');
      }
    }

    return null;
  };

  _proto.removeCodeFromLocation = function removeCodeFromLocation() {
    var _window$location$href = window.location.href.split('?'),
        base = _window$location$href[0],
        search = _window$location$href[1];

    if (!search) {
      return;
    }

    var newSearch = search.split('&').map(function (param) {
      return param.split('=');
    }).filter(function (_ref) {
      var key = _ref[0];
      return key !== 'code';
    }).map(function (keyAndVal) {
      return keyAndVal.join('=');
    }).join('&');
    window.history.replaceState(window.history.state, 'null', base + (newSearch.length ? "?" + newSearch : ''));
  };

  _proto.getItem = function getItem(key) {
    return window.localStorage.getItem(key);
  };

  _proto.removeItem = function removeItem(key) {
    window.localStorage.removeItem(key);
  };

  _proto.getPkce = function getPkce() {
    var pkce = window.localStorage.getItem('pkce');

    if (null === pkce) {
      throw new Error('PKCE pair not found in local storage');
    } else {
      return JSON.parse(pkce);
    }
  };

  _proto.setAuthTokens = function setAuthTokens(auth) {
    var _this$props$refreshSl = this.props.refreshSlack,
        refreshSlack = _this$props$refreshSl === void 0 ? 5 : _this$props$refreshSl;
    var now = new Date().getTime();
    auth.expires_at = now + (auth.expires_in + refreshSlack) * 1000;
    window.localStorage.setItem('auth', JSON.stringify(auth));
  };

  _proto.getAuthTokens = function getAuthTokens() {
    return JSON.parse(window.localStorage.getItem('auth') || '{}');
  };

  _proto.isPending = function isPending() {
    return window.localStorage.getItem('pkce') !== null && window.localStorage.getItem('auth') === null;
  };

  _proto.isAuthenticated = function isAuthenticated() {
    return window.localStorage.getItem('auth') !== null;
  };

  _proto.logout = function logout(shouldEndSession) {
    if (shouldEndSession === void 0) {
      shouldEndSession = false;
    }

    try {
      var _this2 = this;

      _this2.removeItem('pkce');

      _this2.removeItem('auth');

      if (shouldEndSession) {
        var _this2$props = _this2.props,
            clientId = _this2$props.clientId,
            provider = _this2$props.provider,
            logoutEndpoint = _this2$props.logoutEndpoint,
            redirectUri = _this2$props.redirectUri;
        var query = {
          client_id: clientId,
          post_logout_redirect_uri: redirectUri
        };
        var url = (logoutEndpoint || provider + "/logout") + "?" + toUrlEncoded(query);
        window.location.replace(url);
        return Promise.resolve(true);
      } else {
        window.location.reload();
        return Promise.resolve(true);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.login = function login(options) {
    try {
      var _this4 = this;

      _this4.authorize(options);

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.authorize = function authorize(options) {
    var url = this.buildAuthorizeUrl(options);
    window.location.replace(url);
    return true;
  };

  _proto.buildAuthorizeUrl = function buildAuthorizeUrl(options) {
    var _this$props = this.props,
        clientId = _this$props.clientId,
        provider = _this$props.provider,
        authorizeEndpoint = _this$props.authorizeEndpoint,
        redirectUri = _this$props.redirectUri,
        scopes = _this$props.scopes,
        audience = _this$props.audience;
    var pkce = createPKCECodes();
    window.localStorage.setItem('pkce', JSON.stringify(pkce));
    window.localStorage.setItem('preAuthUri', location.href);
    window.localStorage.removeItem('auth');
    var codeChallenge = pkce.codeChallenge;

    var query = _extends(_extends({
      clientId: clientId,
      scope: scopes.join(' '),
      responseType: 'code',
      redirectUri: redirectUri
    }, audience && {
      audience: audience
    }), {}, {
      codeChallenge: codeChallenge,
      codeChallengeMethod: 'S256'
    }, options && _extends({}, options));

    return (authorizeEndpoint || provider + "/authorize") + "?" + toUrlEncoded(query);
  };

  _proto.fetchToken = function fetchToken(code, isRefresh) {
    if (isRefresh === void 0) {
      isRefresh = false;
    }

    try {
      var _this6 = this;

      var _this6$props = _this6.props,
          clientId = _this6$props.clientId,
          clientSecret = _this6$props.clientSecret,
          contentType = _this6$props.contentType,
          provider = _this6$props.provider,
          tokenEndpoint = _this6$props.tokenEndpoint,
          redirectUri = _this6$props.redirectUri,
          _this6$props$autoRefr = _this6$props.autoRefresh,
          autoRefresh = _this6$props$autoRefr === void 0 ? true : _this6$props$autoRefr;
      var grantType = 'authorization_code';

      var payload = _extends(_extends({
        clientId: clientId
      }, clientSecret ? {
        clientSecret: clientSecret
      } : {}), {}, {
        redirectUri: redirectUri,
        grantType: grantType
      });

      if (isRefresh) {
        payload = _extends(_extends({}, payload), {}, {
          grantType: 'refresh_token',
          refresh_token: code
        });
      } else {
        var pkce = _this6.getPkce();

        var codeVerifier = pkce.codeVerifier;
        payload = _extends(_extends({}, payload), {}, {
          code: code,
          codeVerifier: codeVerifier
        });
      }

      return Promise.resolve(fetch("" + (tokenEndpoint || provider + "/token"), {
        headers: {
          'Content-Type': contentType || 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: toUrlEncoded(payload)
      })).then(function (response) {
        _this6.removeItem('pkce');

        return Promise.resolve(response.json()).then(function (json) {
          if (isRefresh && !json.refresh_token) {
            json.refresh_token = payload.refresh_token;
          }

          if ('error' in json) {
            throw new Error("Error: " + json.error + ",\r\nDescription: " + json.error_description);
          }

          _this6.setAuthTokens(json);

          if (autoRefresh) {
            _this6.startTimer();
          }

          return _this6.getAuthTokens();
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.armRefreshTimer = function armRefreshTimer(refreshToken, timeoutDuration) {
    var _this7 = this;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = window.setTimeout(function () {
      _this7.fetchToken(refreshToken, true).then(function (_ref2) {
        var newRefreshToken = _ref2.refresh_token,
            expiresAt = _ref2.expires_at;
        if (!expiresAt) return;
        var now = new Date().getTime();
        var timeout = expiresAt - now;

        if (timeout > 0) {
          _this7.armRefreshTimer(newRefreshToken, timeout);
        } else {
          _this7.removeItem('auth');

          _this7.removeCodeFromLocation();
        }
      })["catch"](function (e) {
        _this7.removeItem('auth');

        _this7.removeCodeFromLocation();

        console.warn({
          e: e
        });
      });
    }, timeoutDuration);
  };

  _proto.startTimer = function startTimer() {
    var authTokens = this.getAuthTokens();

    if (!authTokens) {
      return;
    }

    var refreshToken = authTokens.refresh_token,
        expiresAt = authTokens.expires_at;

    if (!expiresAt || !refreshToken) {
      return;
    }

    var now = new Date().getTime();
    var timeout = expiresAt - now;

    if (timeout > 0) {
      this.armRefreshTimer(refreshToken, timeout);
    } else {
      this.removeItem('auth');
      this.removeCodeFromLocation();
    }
  };

  _proto.restoreUri = function restoreUri() {
    var uri = window.localStorage.getItem('preAuthUri');
    window.localStorage.removeItem('preAuthUri');
    console.log({
      uri: uri
    });

    if (uri !== null) {
      var state = this.getValueFromLocation(location, 'state');

      if (state) {
        window.localStorage.setItem('postAuthState', state);
      }

      if (this.props.onRedirectCallback) {
        window.localStorage.setItem('postAuthRedirect', "true");
      }

      window.location.replace(uri);
    }

    this.removeCodeFromLocation();
  };

  return AuthService;
}();

exports.AuthContext = AuthContext;
exports.AuthProvider = AuthProvider;
exports.AuthService = AuthService;
exports.useAuth = useAuth;
exports.withAuth = withAuth;
//# sourceMappingURL=index.js.map
