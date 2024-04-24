(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["TrezorConnect"] = factory();
	else
		root["TrezorConnect"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 2324:
/***/ ((module) => {

"use strict";

module.exports = asPromise;

/**
 * Callback as used by {@link util.asPromise}.
 * @typedef asPromiseCallback
 * @type {function}
 * @param {Error|null} error Error, if any
 * @param {...*} params Additional arguments
 * @returns {undefined}
 */

/**
 * Returns a promise from a node-style callback function.
 * @memberof util
 * @param {asPromiseCallback} fn Function to call
 * @param {*} ctx Function context
 * @param {...*} params Function arguments
 * @returns {Promise<*>} Promisified function
 */
function asPromise(fn, ctx/*, varargs */) {
    var params  = new Array(arguments.length - 1),
        offset  = 0,
        index   = 2,
        pending = true;
    while (index < arguments.length)
        params[offset++] = arguments[index++];
    return new Promise(function executor(resolve, reject) {
        params[offset] = function callback(err/*, varargs */) {
            if (pending) {
                pending = false;
                if (err)
                    reject(err);
                else {
                    var params = new Array(arguments.length - 1),
                        offset = 0;
                    while (offset < params.length)
                        params[offset++] = arguments[offset];
                    resolve.apply(null, params);
                }
            }
        };
        try {
            fn.apply(ctx || null, params);
        } catch (err) {
            if (pending) {
                pending = false;
                reject(err);
            }
        }
    });
}


/***/ }),

/***/ 5844:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


/**
 * A minimal base64 implementation for number arrays.
 * @memberof util
 * @namespace
 */
var base64 = exports;

/**
 * Calculates the byte length of a base64 encoded string.
 * @param {string} string Base64 encoded string
 * @returns {number} Byte length
 */
base64.length = function length(string) {
    var p = string.length;
    if (!p)
        return 0;
    var n = 0;
    while (--p % 4 > 1 && string.charAt(p) === "=")
        ++n;
    return Math.ceil(string.length * 3) / 4 - n;
};

// Base64 encoding table
var b64 = new Array(64);

// Base64 decoding table
var s64 = new Array(123);

// 65..90, 97..122, 48..57, 43, 47
for (var i = 0; i < 64;)
    s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;

/**
 * Encodes a buffer to a base64 encoded string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} Base64 encoded string
 */
base64.encode = function encode(buffer, start, end) {
    var parts = null,
        chunk = [];
    var i = 0, // output index
        j = 0, // goto index
        t;     // temporary
    while (start < end) {
        var b = buffer[start++];
        switch (j) {
            case 0:
                chunk[i++] = b64[b >> 2];
                t = (b & 3) << 4;
                j = 1;
                break;
            case 1:
                chunk[i++] = b64[t | b >> 4];
                t = (b & 15) << 2;
                j = 2;
                break;
            case 2:
                chunk[i++] = b64[t | b >> 6];
                chunk[i++] = b64[b & 63];
                j = 0;
                break;
        }
        if (i > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i = 0;
        }
    }
    if (j) {
        chunk[i++] = b64[t];
        chunk[i++] = 61;
        if (j === 1)
            chunk[i++] = 61;
    }
    if (parts) {
        if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
    }
    return String.fromCharCode.apply(String, chunk.slice(0, i));
};

var invalidEncoding = "invalid encoding";

/**
 * Decodes a base64 encoded string to a buffer.
 * @param {string} string Source string
 * @param {Uint8Array} buffer Destination buffer
 * @param {number} offset Destination offset
 * @returns {number} Number of bytes written
 * @throws {Error} If encoding is invalid
 */
base64.decode = function decode(string, buffer, offset) {
    var start = offset;
    var j = 0, // goto index
        t;     // temporary
    for (var i = 0; i < string.length;) {
        var c = string.charCodeAt(i++);
        if (c === 61 && j > 1)
            break;
        if ((c = s64[c]) === undefined)
            throw Error(invalidEncoding);
        switch (j) {
            case 0:
                t = c;
                j = 1;
                break;
            case 1:
                buffer[offset++] = t << 2 | (c & 48) >> 4;
                t = c;
                j = 2;
                break;
            case 2:
                buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
                t = c;
                j = 3;
                break;
            case 3:
                buffer[offset++] = (t & 3) << 6 | c;
                j = 0;
                break;
        }
    }
    if (j === 1)
        throw Error(invalidEncoding);
    return offset - start;
};

/**
 * Tests if the specified string appears to be base64 encoded.
 * @param {string} string String to test
 * @returns {boolean} `true` if probably base64 encoded, otherwise false
 */
base64.test = function test(string) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
};


/***/ }),

/***/ 9596:
/***/ ((module) => {

"use strict";

module.exports = codegen;

/**
 * Begins generating a function.
 * @memberof util
 * @param {string[]} functionParams Function parameter names
 * @param {string} [functionName] Function name if not anonymous
 * @returns {Codegen} Appender that appends code to the function's body
 */
function codegen(functionParams, functionName) {

    /* istanbul ignore if */
    if (typeof functionParams === "string") {
        functionName = functionParams;
        functionParams = undefined;
    }

    var body = [];

    /**
     * Appends code to the function's body or finishes generation.
     * @typedef Codegen
     * @type {function}
     * @param {string|Object.<string,*>} [formatStringOrScope] Format string or, to finish the function, an object of additional scope variables, if any
     * @param {...*} [formatParams] Format parameters
     * @returns {Codegen|Function} Itself or the generated function if finished
     * @throws {Error} If format parameter counts do not match
     */

    function Codegen(formatStringOrScope) {
        // note that explicit array handling below makes this ~50% faster

        // finish the function
        if (typeof formatStringOrScope !== "string") {
            var source = toString();
            if (codegen.verbose)
                console.log("codegen: " + source); // eslint-disable-line no-console
            source = "return " + source;
            if (formatStringOrScope) {
                var scopeKeys   = Object.keys(formatStringOrScope),
                    scopeParams = new Array(scopeKeys.length + 1),
                    scopeValues = new Array(scopeKeys.length),
                    scopeOffset = 0;
                while (scopeOffset < scopeKeys.length) {
                    scopeParams[scopeOffset] = scopeKeys[scopeOffset];
                    scopeValues[scopeOffset] = formatStringOrScope[scopeKeys[scopeOffset++]];
                }
                scopeParams[scopeOffset] = source;
                return Function.apply(null, scopeParams).apply(null, scopeValues); // eslint-disable-line no-new-func
            }
            return Function(source)(); // eslint-disable-line no-new-func
        }

        // otherwise append to body
        var formatParams = new Array(arguments.length - 1),
            formatOffset = 0;
        while (formatOffset < formatParams.length)
            formatParams[formatOffset] = arguments[++formatOffset];
        formatOffset = 0;
        formatStringOrScope = formatStringOrScope.replace(/%([%dfijs])/g, function replace($0, $1) {
            var value = formatParams[formatOffset++];
            switch ($1) {
                case "d": case "f": return String(Number(value));
                case "i": return String(Math.floor(value));
                case "j": return JSON.stringify(value);
                case "s": return String(value);
            }
            return "%";
        });
        if (formatOffset !== formatParams.length)
            throw Error("parameter count mismatch");
        body.push(formatStringOrScope);
        return Codegen;
    }

    function toString(functionNameOverride) {
        return "function " + (functionNameOverride || functionName || "") + "(" + (functionParams && functionParams.join(",") || "") + "){\n  " + body.join("\n  ") + "\n}";
    }

    Codegen.toString = toString;
    return Codegen;
}

/**
 * Begins generating a function.
 * @memberof util
 * @function codegen
 * @param {string} [functionName] Function name if not anonymous
 * @returns {Codegen} Appender that appends code to the function's body
 * @variation 2
 */

/**
 * When set to `true`, codegen will log generated code to console. Useful for debugging.
 * @name util.codegen.verbose
 * @type {boolean}
 */
codegen.verbose = false;


/***/ }),

/***/ 5760:
/***/ ((module) => {

"use strict";

module.exports = EventEmitter;

/**
 * Constructs a new event emitter instance.
 * @classdesc A minimal event emitter.
 * @memberof util
 * @constructor
 */
function EventEmitter() {

    /**
     * Registered listeners.
     * @type {Object.<string,*>}
     * @private
     */
    this._listeners = {};
}

/**
 * Registers an event listener.
 * @param {string} evt Event name
 * @param {function} fn Listener
 * @param {*} [ctx] Listener context
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.on = function on(evt, fn, ctx) {
    (this._listeners[evt] || (this._listeners[evt] = [])).push({
        fn  : fn,
        ctx : ctx || this
    });
    return this;
};

/**
 * Removes an event listener or any matching listeners if arguments are omitted.
 * @param {string} [evt] Event name. Removes all listeners if omitted.
 * @param {function} [fn] Listener to remove. Removes all listeners of `evt` if omitted.
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.off = function off(evt, fn) {
    if (evt === undefined)
        this._listeners = {};
    else {
        if (fn === undefined)
            this._listeners[evt] = [];
        else {
            var listeners = this._listeners[evt];
            for (var i = 0; i < listeners.length;)
                if (listeners[i].fn === fn)
                    listeners.splice(i, 1);
                else
                    ++i;
        }
    }
    return this;
};

/**
 * Emits an event by calling its listeners with the specified arguments.
 * @param {string} evt Event name
 * @param {...*} args Arguments
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.emit = function emit(evt) {
    var listeners = this._listeners[evt];
    if (listeners) {
        var args = [],
            i = 1;
        for (; i < arguments.length;)
            args.push(arguments[i++]);
        for (i = 0; i < listeners.length;)
            listeners[i].fn.apply(listeners[i++].ctx, args);
    }
    return this;
};


/***/ }),

/***/ 4916:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = fetch;

var asPromise = __webpack_require__(2324),
    inquire   = __webpack_require__(5872);

var fs = inquire("fs");

/**
 * Node-style callback as used by {@link util.fetch}.
 * @typedef FetchCallback
 * @type {function}
 * @param {?Error} error Error, if any, otherwise `null`
 * @param {string} [contents] File contents, if there hasn't been an error
 * @returns {undefined}
 */

/**
 * Options as used by {@link util.fetch}.
 * @typedef FetchOptions
 * @type {Object}
 * @property {boolean} [binary=false] Whether expecting a binary response
 * @property {boolean} [xhr=false] If `true`, forces the use of XMLHttpRequest
 */

/**
 * Fetches the contents of a file.
 * @memberof util
 * @param {string} filename File path or url
 * @param {FetchOptions} options Fetch options
 * @param {FetchCallback} callback Callback function
 * @returns {undefined}
 */
function fetch(filename, options, callback) {
    if (typeof options === "function") {
        callback = options;
        options = {};
    } else if (!options)
        options = {};

    if (!callback)
        return asPromise(fetch, this, filename, options); // eslint-disable-line no-invalid-this

    // if a node-like filesystem is present, try it first but fall back to XHR if nothing is found.
    if (!options.xhr && fs && fs.readFile)
        return fs.readFile(filename, function fetchReadFileCallback(err, contents) {
            return err && typeof XMLHttpRequest !== "undefined"
                ? fetch.xhr(filename, options, callback)
                : err
                ? callback(err)
                : callback(null, options.binary ? contents : contents.toString("utf8"));
        });

    // use the XHR version otherwise.
    return fetch.xhr(filename, options, callback);
}

/**
 * Fetches the contents of a file.
 * @name util.fetch
 * @function
 * @param {string} path File path or url
 * @param {FetchCallback} callback Callback function
 * @returns {undefined}
 * @variation 2
 */

/**
 * Fetches the contents of a file.
 * @name util.fetch
 * @function
 * @param {string} path File path or url
 * @param {FetchOptions} [options] Fetch options
 * @returns {Promise<string|Uint8Array>} Promise
 * @variation 3
 */

/**/
fetch.xhr = function fetch_xhr(filename, options, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange /* works everywhere */ = function fetchOnReadyStateChange() {

        if (xhr.readyState !== 4)
            return undefined;

        // local cors security errors return status 0 / empty string, too. afaik this cannot be
        // reliably distinguished from an actually empty file for security reasons. feel free
        // to send a pull request if you are aware of a solution.
        if (xhr.status !== 0 && xhr.status !== 200)
            return callback(Error("status " + xhr.status));

        // if binary data is expected, make sure that some sort of array is returned, even if
        // ArrayBuffers are not supported. the binary string fallback, however, is unsafe.
        if (options.binary) {
            var buffer = xhr.response;
            if (!buffer) {
                buffer = [];
                for (var i = 0; i < xhr.responseText.length; ++i)
                    buffer.push(xhr.responseText.charCodeAt(i) & 255);
            }
            return callback(null, typeof Uint8Array !== "undefined" ? new Uint8Array(buffer) : buffer);
        }
        return callback(null, xhr.responseText);
    };

    if (options.binary) {
        // ref: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data#Receiving_binary_data_in_older_browsers
        if ("overrideMimeType" in xhr)
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.responseType = "arraybuffer";
    }

    xhr.open("GET", filename);
    xhr.send();
};


/***/ }),

/***/ 2336:
/***/ ((module) => {

"use strict";


module.exports = factory(factory);

/**
 * Reads / writes floats / doubles from / to buffers.
 * @name util.float
 * @namespace
 */

/**
 * Writes a 32 bit float to a buffer using little endian byte order.
 * @name util.float.writeFloatLE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Writes a 32 bit float to a buffer using big endian byte order.
 * @name util.float.writeFloatBE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Reads a 32 bit float from a buffer using little endian byte order.
 * @name util.float.readFloatLE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Reads a 32 bit float from a buffer using big endian byte order.
 * @name util.float.readFloatBE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Writes a 64 bit double to a buffer using little endian byte order.
 * @name util.float.writeDoubleLE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Writes a 64 bit double to a buffer using big endian byte order.
 * @name util.float.writeDoubleBE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Reads a 64 bit double from a buffer using little endian byte order.
 * @name util.float.readDoubleLE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Reads a 64 bit double from a buffer using big endian byte order.
 * @name util.float.readDoubleBE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

// Factory function for the purpose of node-based testing in modified global environments
function factory(exports) {

    // float: typed array
    if (typeof Float32Array !== "undefined") (function() {

        var f32 = new Float32Array([ -0 ]),
            f8b = new Uint8Array(f32.buffer),
            le  = f8b[3] === 128;

        function writeFloat_f32_cpy(val, buf, pos) {
            f32[0] = val;
            buf[pos    ] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
        }

        function writeFloat_f32_rev(val, buf, pos) {
            f32[0] = val;
            buf[pos    ] = f8b[3];
            buf[pos + 1] = f8b[2];
            buf[pos + 2] = f8b[1];
            buf[pos + 3] = f8b[0];
        }

        /* istanbul ignore next */
        exports.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
        /* istanbul ignore next */
        exports.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;

        function readFloat_f32_cpy(buf, pos) {
            f8b[0] = buf[pos    ];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            return f32[0];
        }

        function readFloat_f32_rev(buf, pos) {
            f8b[3] = buf[pos    ];
            f8b[2] = buf[pos + 1];
            f8b[1] = buf[pos + 2];
            f8b[0] = buf[pos + 3];
            return f32[0];
        }

        /* istanbul ignore next */
        exports.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
        /* istanbul ignore next */
        exports.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;

    // float: ieee754
    })(); else (function() {

        function writeFloat_ieee754(writeUint, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
                val = -val;
            if (val === 0)
                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos);
            else if (isNaN(val))
                writeUint(2143289344, buf, pos);
            else if (val > 3.4028234663852886e+38) // +-Infinity
                writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
            else if (val < 1.1754943508222875e-38) // denormal
                writeUint((sign << 31 | Math.round(val / 1.401298464324817e-45)) >>> 0, buf, pos);
            else {
                var exponent = Math.floor(Math.log(val) / Math.LN2),
                    mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
                writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
            }
        }

        exports.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
        exports.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);

        function readFloat_ieee754(readUint, buf, pos) {
            var uint = readUint(buf, pos),
                sign = (uint >> 31) * 2 + 1,
                exponent = uint >>> 23 & 255,
                mantissa = uint & 8388607;
            return exponent === 255
                ? mantissa
                ? NaN
                : sign * Infinity
                : exponent === 0 // denormal
                ? sign * 1.401298464324817e-45 * mantissa
                : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
        }

        exports.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
        exports.readFloatBE = readFloat_ieee754.bind(null, readUintBE);

    })();

    // double: typed array
    if (typeof Float64Array !== "undefined") (function() {

        var f64 = new Float64Array([-0]),
            f8b = new Uint8Array(f64.buffer),
            le  = f8b[7] === 128;

        function writeDouble_f64_cpy(val, buf, pos) {
            f64[0] = val;
            buf[pos    ] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
            buf[pos + 4] = f8b[4];
            buf[pos + 5] = f8b[5];
            buf[pos + 6] = f8b[6];
            buf[pos + 7] = f8b[7];
        }

        function writeDouble_f64_rev(val, buf, pos) {
            f64[0] = val;
            buf[pos    ] = f8b[7];
            buf[pos + 1] = f8b[6];
            buf[pos + 2] = f8b[5];
            buf[pos + 3] = f8b[4];
            buf[pos + 4] = f8b[3];
            buf[pos + 5] = f8b[2];
            buf[pos + 6] = f8b[1];
            buf[pos + 7] = f8b[0];
        }

        /* istanbul ignore next */
        exports.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
        /* istanbul ignore next */
        exports.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;

        function readDouble_f64_cpy(buf, pos) {
            f8b[0] = buf[pos    ];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            f8b[4] = buf[pos + 4];
            f8b[5] = buf[pos + 5];
            f8b[6] = buf[pos + 6];
            f8b[7] = buf[pos + 7];
            return f64[0];
        }

        function readDouble_f64_rev(buf, pos) {
            f8b[7] = buf[pos    ];
            f8b[6] = buf[pos + 1];
            f8b[5] = buf[pos + 2];
            f8b[4] = buf[pos + 3];
            f8b[3] = buf[pos + 4];
            f8b[2] = buf[pos + 5];
            f8b[1] = buf[pos + 6];
            f8b[0] = buf[pos + 7];
            return f64[0];
        }

        /* istanbul ignore next */
        exports.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
        /* istanbul ignore next */
        exports.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;

    // double: ieee754
    })(); else (function() {

        function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
                val = -val;
            if (val === 0) {
                writeUint(0, buf, pos + off0);
                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos + off1);
            } else if (isNaN(val)) {
                writeUint(0, buf, pos + off0);
                writeUint(2146959360, buf, pos + off1);
            } else if (val > 1.7976931348623157e+308) { // +-Infinity
                writeUint(0, buf, pos + off0);
                writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
            } else {
                var mantissa;
                if (val < 2.2250738585072014e-308) { // denormal
                    mantissa = val / 5e-324;
                    writeUint(mantissa >>> 0, buf, pos + off0);
                    writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
                } else {
                    var exponent = Math.floor(Math.log(val) / Math.LN2);
                    if (exponent === 1024)
                        exponent = 1023;
                    mantissa = val * Math.pow(2, -exponent);
                    writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
                    writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
                }
            }
        }

        exports.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
        exports.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);

        function readDouble_ieee754(readUint, off0, off1, buf, pos) {
            var lo = readUint(buf, pos + off0),
                hi = readUint(buf, pos + off1);
            var sign = (hi >> 31) * 2 + 1,
                exponent = hi >>> 20 & 2047,
                mantissa = 4294967296 * (hi & 1048575) + lo;
            return exponent === 2047
                ? mantissa
                ? NaN
                : sign * Infinity
                : exponent === 0 // denormal
                ? sign * 5e-324 * mantissa
                : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
        }

        exports.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
        exports.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);

    })();

    return exports;
}

// uint helpers

function writeUintLE(val, buf, pos) {
    buf[pos    ] =  val        & 255;
    buf[pos + 1] =  val >>> 8  & 255;
    buf[pos + 2] =  val >>> 16 & 255;
    buf[pos + 3] =  val >>> 24;
}

function writeUintBE(val, buf, pos) {
    buf[pos    ] =  val >>> 24;
    buf[pos + 1] =  val >>> 16 & 255;
    buf[pos + 2] =  val >>> 8  & 255;
    buf[pos + 3] =  val        & 255;
}

function readUintLE(buf, pos) {
    return (buf[pos    ]
          | buf[pos + 1] << 8
          | buf[pos + 2] << 16
          | buf[pos + 3] << 24) >>> 0;
}

function readUintBE(buf, pos) {
    return (buf[pos    ] << 24
          | buf[pos + 1] << 16
          | buf[pos + 2] << 8
          | buf[pos + 3]) >>> 0;
}


/***/ }),

/***/ 5872:
/***/ ((module) => {

"use strict";

module.exports = inquire;

/**
 * Requires a module only if available.
 * @memberof util
 * @param {string} moduleName Module to require
 * @returns {?Object} Required module if available and not empty, otherwise `null`
 */
function inquire(moduleName) {
    try {
        var mod = eval("quire".replace(/^/,"re"))(moduleName); // eslint-disable-line no-eval
        if (mod && (mod.length || Object.keys(mod).length))
            return mod;
    } catch (e) {} // eslint-disable-line no-empty
    return null;
}


/***/ }),

/***/ 8304:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


/**
 * A minimal path module to resolve Unix, Windows and URL paths alike.
 * @memberof util
 * @namespace
 */
var path = exports;

var isAbsolute =
/**
 * Tests if the specified path is absolute.
 * @param {string} path Path to test
 * @returns {boolean} `true` if path is absolute
 */
path.isAbsolute = function isAbsolute(path) {
    return /^(?:\/|\w+:)/.test(path);
};

var normalize =
/**
 * Normalizes the specified path.
 * @param {string} path Path to normalize
 * @returns {string} Normalized path
 */
path.normalize = function normalize(path) {
    path = path.replace(/\\/g, "/")
               .replace(/\/{2,}/g, "/");
    var parts    = path.split("/"),
        absolute = isAbsolute(path),
        prefix   = "";
    if (absolute)
        prefix = parts.shift() + "/";
    for (var i = 0; i < parts.length;) {
        if (parts[i] === "..") {
            if (i > 0 && parts[i - 1] !== "..")
                parts.splice(--i, 2);
            else if (absolute)
                parts.splice(i, 1);
            else
                ++i;
        } else if (parts[i] === ".")
            parts.splice(i, 1);
        else
            ++i;
    }
    return prefix + parts.join("/");
};

/**
 * Resolves the specified include path against the specified origin path.
 * @param {string} originPath Path to the origin file
 * @param {string} includePath Include path relative to origin path
 * @param {boolean} [alreadyNormalized=false] `true` if both paths are already known to be normalized
 * @returns {string} Path to the include file
 */
path.resolve = function resolve(originPath, includePath, alreadyNormalized) {
    if (!alreadyNormalized)
        includePath = normalize(includePath);
    if (isAbsolute(includePath))
        return includePath;
    if (!alreadyNormalized)
        originPath = normalize(originPath);
    return (originPath = originPath.replace(/(?:\/|^)[^/]+$/, "")).length ? normalize(originPath + "/" + includePath) : includePath;
};


/***/ }),

/***/ 8856:
/***/ ((module) => {

"use strict";

module.exports = pool;

/**
 * An allocator as used by {@link util.pool}.
 * @typedef PoolAllocator
 * @type {function}
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */

/**
 * A slicer as used by {@link util.pool}.
 * @typedef PoolSlicer
 * @type {function}
 * @param {number} start Start offset
 * @param {number} end End offset
 * @returns {Uint8Array} Buffer slice
 * @this {Uint8Array}
 */

/**
 * A general purpose buffer pool.
 * @memberof util
 * @function
 * @param {PoolAllocator} alloc Allocator
 * @param {PoolSlicer} slice Slicer
 * @param {number} [size=8192] Slab size
 * @returns {PoolAllocator} Pooled allocator
 */
function pool(alloc, slice, size) {
    var SIZE   = size || 8192;
    var MAX    = SIZE >>> 1;
    var slab   = null;
    var offset = SIZE;
    return function pool_alloc(size) {
        if (size < 1 || size > MAX)
            return alloc(size);
        if (offset + size > SIZE) {
            slab = alloc(SIZE);
            offset = 0;
        }
        var buf = slice.call(slab, offset, offset += size);
        if (offset & 7) // align to 32 bit
            offset = (offset | 7) + 1;
        return buf;
    };
}


/***/ }),

/***/ 2560:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


/**
 * A minimal UTF8 implementation for number arrays.
 * @memberof util
 * @namespace
 */
var utf8 = exports;

/**
 * Calculates the UTF8 byte length of a string.
 * @param {string} string String
 * @returns {number} Byte length
 */
utf8.length = function utf8_length(string) {
    var len = 0,
        c = 0;
    for (var i = 0; i < string.length; ++i) {
        c = string.charCodeAt(i);
        if (c < 128)
            len += 1;
        else if (c < 2048)
            len += 2;
        else if ((c & 0xFC00) === 0xD800 && (string.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
            ++i;
            len += 4;
        } else
            len += 3;
    }
    return len;
};

/**
 * Reads UTF8 bytes as a string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} String read
 */
utf8.read = function utf8_read(buffer, start, end) {
    var len = end - start;
    if (len < 1)
        return "";
    var parts = null,
        chunk = [],
        i = 0, // char offset
        t;     // temporary
    while (start < end) {
        t = buffer[start++];
        if (t < 128)
            chunk[i++] = t;
        else if (t > 191 && t < 224)
            chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
        else if (t > 239 && t < 365) {
            t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 0x10000;
            chunk[i++] = 0xD800 + (t >> 10);
            chunk[i++] = 0xDC00 + (t & 1023);
        } else
            chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
        if (i > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i = 0;
        }
    }
    if (parts) {
        if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
    }
    return String.fromCharCode.apply(String, chunk.slice(0, i));
};

/**
 * Writes a string as UTF8 bytes.
 * @param {string} string Source string
 * @param {Uint8Array} buffer Destination buffer
 * @param {number} offset Destination offset
 * @returns {number} Bytes written
 */
utf8.write = function utf8_write(string, buffer, offset) {
    var start = offset,
        c1, // character 1
        c2; // character 2
    for (var i = 0; i < string.length; ++i) {
        c1 = string.charCodeAt(i);
        if (c1 < 128) {
            buffer[offset++] = c1;
        } else if (c1 < 2048) {
            buffer[offset++] = c1 >> 6       | 192;
            buffer[offset++] = c1       & 63 | 128;
        } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = string.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
            c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
            ++i;
            buffer[offset++] = c1 >> 18      | 240;
            buffer[offset++] = c1 >> 12 & 63 | 128;
            buffer[offset++] = c1 >> 6  & 63 | 128;
            buffer[offset++] = c1       & 63 | 128;
        } else {
            buffer[offset++] = c1 >> 12      | 224;
            buffer[offset++] = c1 >> 6  & 63 | 128;
            buffer[offset++] = c1       & 63 | 128;
        }
    }
    return offset - start;
};


/***/ }),

/***/ 9984:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*--------------------------------------------------------------------------

@sinclair/typebox/errors

The MIT License (MIT)

Copyright (c) 2017-2023 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Errors = exports.ValueErrorIterator = exports.EscapeKey = exports.ValueErrorsUnknownTypeError = exports.ValueErrorType = void 0;
const guard_1 = __webpack_require__(5928);
const system_1 = __webpack_require__(1008);
const deref_1 = __webpack_require__(4860);
const hash_1 = __webpack_require__(548);
const Types = __webpack_require__(624);
// --------------------------------------------------------------------------
// ValueErrorType
// --------------------------------------------------------------------------
var ValueErrorType;
(function (ValueErrorType) {
    ValueErrorType[ValueErrorType["ArrayContains"] = 0] = "ArrayContains";
    ValueErrorType[ValueErrorType["ArrayMaxContains"] = 1] = "ArrayMaxContains";
    ValueErrorType[ValueErrorType["ArrayMaxItems"] = 2] = "ArrayMaxItems";
    ValueErrorType[ValueErrorType["ArrayMinContains"] = 3] = "ArrayMinContains";
    ValueErrorType[ValueErrorType["ArrayMinItems"] = 4] = "ArrayMinItems";
    ValueErrorType[ValueErrorType["ArrayUniqueItems"] = 5] = "ArrayUniqueItems";
    ValueErrorType[ValueErrorType["Array"] = 6] = "Array";
    ValueErrorType[ValueErrorType["AsyncIterator"] = 7] = "AsyncIterator";
    ValueErrorType[ValueErrorType["BigIntExclusiveMaximum"] = 8] = "BigIntExclusiveMaximum";
    ValueErrorType[ValueErrorType["BigIntExclusiveMinimum"] = 9] = "BigIntExclusiveMinimum";
    ValueErrorType[ValueErrorType["BigIntMaximum"] = 10] = "BigIntMaximum";
    ValueErrorType[ValueErrorType["BigIntMinimum"] = 11] = "BigIntMinimum";
    ValueErrorType[ValueErrorType["BigIntMultipleOf"] = 12] = "BigIntMultipleOf";
    ValueErrorType[ValueErrorType["BigInt"] = 13] = "BigInt";
    ValueErrorType[ValueErrorType["Boolean"] = 14] = "Boolean";
    ValueErrorType[ValueErrorType["DateExclusiveMaximumTimestamp"] = 15] = "DateExclusiveMaximumTimestamp";
    ValueErrorType[ValueErrorType["DateExclusiveMinimumTimestamp"] = 16] = "DateExclusiveMinimumTimestamp";
    ValueErrorType[ValueErrorType["DateMaximumTimestamp"] = 17] = "DateMaximumTimestamp";
    ValueErrorType[ValueErrorType["DateMinimumTimestamp"] = 18] = "DateMinimumTimestamp";
    ValueErrorType[ValueErrorType["DateMultipleOfTimestamp"] = 19] = "DateMultipleOfTimestamp";
    ValueErrorType[ValueErrorType["Date"] = 20] = "Date";
    ValueErrorType[ValueErrorType["Function"] = 21] = "Function";
    ValueErrorType[ValueErrorType["IntegerExclusiveMaximum"] = 22] = "IntegerExclusiveMaximum";
    ValueErrorType[ValueErrorType["IntegerExclusiveMinimum"] = 23] = "IntegerExclusiveMinimum";
    ValueErrorType[ValueErrorType["IntegerMaximum"] = 24] = "IntegerMaximum";
    ValueErrorType[ValueErrorType["IntegerMinimum"] = 25] = "IntegerMinimum";
    ValueErrorType[ValueErrorType["IntegerMultipleOf"] = 26] = "IntegerMultipleOf";
    ValueErrorType[ValueErrorType["Integer"] = 27] = "Integer";
    ValueErrorType[ValueErrorType["IntersectUnevaluatedProperties"] = 28] = "IntersectUnevaluatedProperties";
    ValueErrorType[ValueErrorType["Intersect"] = 29] = "Intersect";
    ValueErrorType[ValueErrorType["Iterator"] = 30] = "Iterator";
    ValueErrorType[ValueErrorType["Kind"] = 31] = "Kind";
    ValueErrorType[ValueErrorType["Literal"] = 32] = "Literal";
    ValueErrorType[ValueErrorType["Never"] = 33] = "Never";
    ValueErrorType[ValueErrorType["Not"] = 34] = "Not";
    ValueErrorType[ValueErrorType["Null"] = 35] = "Null";
    ValueErrorType[ValueErrorType["NumberExclusiveMaximum"] = 36] = "NumberExclusiveMaximum";
    ValueErrorType[ValueErrorType["NumberExclusiveMinimum"] = 37] = "NumberExclusiveMinimum";
    ValueErrorType[ValueErrorType["NumberMaximum"] = 38] = "NumberMaximum";
    ValueErrorType[ValueErrorType["NumberMinimum"] = 39] = "NumberMinimum";
    ValueErrorType[ValueErrorType["NumberMultipleOf"] = 40] = "NumberMultipleOf";
    ValueErrorType[ValueErrorType["Number"] = 41] = "Number";
    ValueErrorType[ValueErrorType["ObjectAdditionalProperties"] = 42] = "ObjectAdditionalProperties";
    ValueErrorType[ValueErrorType["ObjectMaxProperties"] = 43] = "ObjectMaxProperties";
    ValueErrorType[ValueErrorType["ObjectMinProperties"] = 44] = "ObjectMinProperties";
    ValueErrorType[ValueErrorType["ObjectRequiredProperty"] = 45] = "ObjectRequiredProperty";
    ValueErrorType[ValueErrorType["Object"] = 46] = "Object";
    ValueErrorType[ValueErrorType["Promise"] = 47] = "Promise";
    ValueErrorType[ValueErrorType["StringFormatUnknown"] = 48] = "StringFormatUnknown";
    ValueErrorType[ValueErrorType["StringFormat"] = 49] = "StringFormat";
    ValueErrorType[ValueErrorType["StringMaxLength"] = 50] = "StringMaxLength";
    ValueErrorType[ValueErrorType["StringMinLength"] = 51] = "StringMinLength";
    ValueErrorType[ValueErrorType["StringPattern"] = 52] = "StringPattern";
    ValueErrorType[ValueErrorType["String"] = 53] = "String";
    ValueErrorType[ValueErrorType["Symbol"] = 54] = "Symbol";
    ValueErrorType[ValueErrorType["TupleLength"] = 55] = "TupleLength";
    ValueErrorType[ValueErrorType["Tuple"] = 56] = "Tuple";
    ValueErrorType[ValueErrorType["Uint8ArrayMaxByteLength"] = 57] = "Uint8ArrayMaxByteLength";
    ValueErrorType[ValueErrorType["Uint8ArrayMinByteLength"] = 58] = "Uint8ArrayMinByteLength";
    ValueErrorType[ValueErrorType["Uint8Array"] = 59] = "Uint8Array";
    ValueErrorType[ValueErrorType["Undefined"] = 60] = "Undefined";
    ValueErrorType[ValueErrorType["Union"] = 61] = "Union";
    ValueErrorType[ValueErrorType["Void"] = 62] = "Void";
})(ValueErrorType || (exports.ValueErrorType = ValueErrorType = {}));
// --------------------------------------------------------------------------
// ValueErrors
// --------------------------------------------------------------------------
class ValueErrorsUnknownTypeError extends Types.TypeBoxError {
    constructor(schema) {
        super('Unknown type');
        this.schema = schema;
    }
}
exports.ValueErrorsUnknownTypeError = ValueErrorsUnknownTypeError;
// --------------------------------------------------------------------------
// EscapeKey
// --------------------------------------------------------------------------
function EscapeKey(key) {
    return key.replace(/~/g, '~0').replace(/\//g, '~1'); // RFC6901 Path
}
exports.EscapeKey = EscapeKey;
// --------------------------------------------------------------------------
// Guards
// --------------------------------------------------------------------------
function IsDefined(value) {
    return value !== undefined;
}
// --------------------------------------------------------------------------
// ValueErrorIterator
// --------------------------------------------------------------------------
class ValueErrorIterator {
    constructor(iterator) {
        this.iterator = iterator;
    }
    [Symbol.iterator]() {
        return this.iterator;
    }
    /** Returns the first value error or undefined if no errors */
    First() {
        const next = this.iterator.next();
        return next.done ? undefined : next.value;
    }
}
exports.ValueErrorIterator = ValueErrorIterator;
// --------------------------------------------------------------------------
// Create
// --------------------------------------------------------------------------
function Create(type, schema, path, value) {
    return { type, schema, path, value, message: system_1.TypeSystemErrorFunction.Get()(schema, type) };
}
// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------
function* TAny(schema, references, path, value) { }
function* TArray(schema, references, path, value) {
    if (!(0, guard_1.IsArray)(value)) {
        return yield Create(ValueErrorType.Array, schema, path, value);
    }
    if (IsDefined(schema.minItems) && !(value.length >= schema.minItems)) {
        yield Create(ValueErrorType.ArrayMinItems, schema, path, value);
    }
    if (IsDefined(schema.maxItems) && !(value.length <= schema.maxItems)) {
        yield Create(ValueErrorType.ArrayMaxItems, schema, path, value);
    }
    for (let i = 0; i < value.length; i++) {
        yield* Visit(schema.items, references, `${path}/${i}`, value[i]);
    }
    // prettier-ignore
    if (schema.uniqueItems === true && !((function () { const set = new Set(); for (const element of value) {
        const hashed = (0, hash_1.Hash)(element);
        if (set.has(hashed)) {
            return false;
        }
        else {
            set.add(hashed);
        }
    } return true; })())) {
        yield Create(ValueErrorType.ArrayUniqueItems, schema, path, value);
    }
    // contains
    if (!(IsDefined(schema.contains) || IsDefined(schema.minContains) || IsDefined(schema.maxContains))) {
        return;
    }
    const containsSchema = IsDefined(schema.contains) ? schema.contains : Types.Type.Never();
    const containsCount = value.reduce((acc, value, index) => (Visit(containsSchema, references, `${path}${index}`, value).next().done === true ? acc + 1 : acc), 0);
    if (containsCount === 0) {
        yield Create(ValueErrorType.ArrayContains, schema, path, value);
    }
    if ((0, guard_1.IsNumber)(schema.minContains) && containsCount < schema.minContains) {
        yield Create(ValueErrorType.ArrayMinContains, schema, path, value);
    }
    if ((0, guard_1.IsNumber)(schema.maxContains) && containsCount > schema.maxContains) {
        yield Create(ValueErrorType.ArrayMaxContains, schema, path, value);
    }
}
function* TAsyncIterator(schema, references, path, value) {
    if (!(0, guard_1.IsAsyncIterator)(value))
        yield Create(ValueErrorType.AsyncIterator, schema, path, value);
}
function* TBigInt(schema, references, path, value) {
    if (!(0, guard_1.IsBigInt)(value))
        return yield Create(ValueErrorType.BigInt, schema, path, value);
    if (IsDefined(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
        yield Create(ValueErrorType.BigIntExclusiveMaximum, schema, path, value);
    }
    if (IsDefined(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
        yield Create(ValueErrorType.BigIntExclusiveMinimum, schema, path, value);
    }
    if (IsDefined(schema.maximum) && !(value <= schema.maximum)) {
        yield Create(ValueErrorType.BigIntMaximum, schema, path, value);
    }
    if (IsDefined(schema.minimum) && !(value >= schema.minimum)) {
        yield Create(ValueErrorType.BigIntMinimum, schema, path, value);
    }
    if (IsDefined(schema.multipleOf) && !(value % schema.multipleOf === BigInt(0))) {
        yield Create(ValueErrorType.BigIntMultipleOf, schema, path, value);
    }
}
function* TBoolean(schema, references, path, value) {
    if (!(0, guard_1.IsBoolean)(value))
        yield Create(ValueErrorType.Boolean, schema, path, value);
}
function* TConstructor(schema, references, path, value) {
    yield* Visit(schema.returns, references, path, value.prototype);
}
function* TDate(schema, references, path, value) {
    if (!(0, guard_1.IsDate)(value))
        return yield Create(ValueErrorType.Date, schema, path, value);
    if (IsDefined(schema.exclusiveMaximumTimestamp) && !(value.getTime() < schema.exclusiveMaximumTimestamp)) {
        yield Create(ValueErrorType.DateExclusiveMaximumTimestamp, schema, path, value);
    }
    if (IsDefined(schema.exclusiveMinimumTimestamp) && !(value.getTime() > schema.exclusiveMinimumTimestamp)) {
        yield Create(ValueErrorType.DateExclusiveMinimumTimestamp, schema, path, value);
    }
    if (IsDefined(schema.maximumTimestamp) && !(value.getTime() <= schema.maximumTimestamp)) {
        yield Create(ValueErrorType.DateMaximumTimestamp, schema, path, value);
    }
    if (IsDefined(schema.minimumTimestamp) && !(value.getTime() >= schema.minimumTimestamp)) {
        yield Create(ValueErrorType.DateMinimumTimestamp, schema, path, value);
    }
    if (IsDefined(schema.multipleOfTimestamp) && !(value.getTime() % schema.multipleOfTimestamp === 0)) {
        yield Create(ValueErrorType.DateMultipleOfTimestamp, schema, path, value);
    }
}
function* TFunction(schema, references, path, value) {
    if (!(0, guard_1.IsFunction)(value))
        yield Create(ValueErrorType.Function, schema, path, value);
}
function* TInteger(schema, references, path, value) {
    if (!(0, guard_1.IsInteger)(value))
        return yield Create(ValueErrorType.Integer, schema, path, value);
    if (IsDefined(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
        yield Create(ValueErrorType.IntegerExclusiveMaximum, schema, path, value);
    }
    if (IsDefined(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
        yield Create(ValueErrorType.IntegerExclusiveMinimum, schema, path, value);
    }
    if (IsDefined(schema.maximum) && !(value <= schema.maximum)) {
        yield Create(ValueErrorType.IntegerMaximum, schema, path, value);
    }
    if (IsDefined(schema.minimum) && !(value >= schema.minimum)) {
        yield Create(ValueErrorType.IntegerMinimum, schema, path, value);
    }
    if (IsDefined(schema.multipleOf) && !(value % schema.multipleOf === 0)) {
        yield Create(ValueErrorType.IntegerMultipleOf, schema, path, value);
    }
}
function* TIntersect(schema, references, path, value) {
    for (const inner of schema.allOf) {
        const next = Visit(inner, references, path, value).next();
        if (!next.done) {
            yield Create(ValueErrorType.Intersect, schema, path, value);
            yield next.value;
        }
    }
    if (schema.unevaluatedProperties === false) {
        const keyCheck = new RegExp(Types.KeyResolver.ResolvePattern(schema));
        for (const valueKey of Object.getOwnPropertyNames(value)) {
            if (!keyCheck.test(valueKey)) {
                yield Create(ValueErrorType.IntersectUnevaluatedProperties, schema, `${path}/${valueKey}`, value);
            }
        }
    }
    if (typeof schema.unevaluatedProperties === 'object') {
        const keyCheck = new RegExp(Types.KeyResolver.ResolvePattern(schema));
        for (const valueKey of Object.getOwnPropertyNames(value)) {
            if (!keyCheck.test(valueKey)) {
                const next = Visit(schema.unevaluatedProperties, references, `${path}/${valueKey}`, value[valueKey]).next();
                if (!next.done)
                    yield next.value; // yield interior
            }
        }
    }
}
function* TIterator(schema, references, path, value) {
    if (!(0, guard_1.IsIterator)(value))
        yield Create(ValueErrorType.Iterator, schema, path, value);
}
function* TLiteral(schema, references, path, value) {
    if (!(value === schema.const))
        yield Create(ValueErrorType.Literal, schema, path, value);
}
function* TNever(schema, references, path, value) {
    yield Create(ValueErrorType.Never, schema, path, value);
}
function* TNot(schema, references, path, value) {
    if (Visit(schema.not, references, path, value).next().done === true)
        yield Create(ValueErrorType.Not, schema, path, value);
}
function* TNull(schema, references, path, value) {
    if (!(0, guard_1.IsNull)(value))
        yield Create(ValueErrorType.Null, schema, path, value);
}
function* TNumber(schema, references, path, value) {
    if (!system_1.TypeSystemPolicy.IsNumberLike(value))
        return yield Create(ValueErrorType.Number, schema, path, value);
    if (IsDefined(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
        yield Create(ValueErrorType.NumberExclusiveMaximum, schema, path, value);
    }
    if (IsDefined(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
        yield Create(ValueErrorType.NumberExclusiveMinimum, schema, path, value);
    }
    if (IsDefined(schema.maximum) && !(value <= schema.maximum)) {
        yield Create(ValueErrorType.NumberMaximum, schema, path, value);
    }
    if (IsDefined(schema.minimum) && !(value >= schema.minimum)) {
        yield Create(ValueErrorType.NumberMinimum, schema, path, value);
    }
    if (IsDefined(schema.multipleOf) && !(value % schema.multipleOf === 0)) {
        yield Create(ValueErrorType.NumberMultipleOf, schema, path, value);
    }
}
function* TObject(schema, references, path, value) {
    if (!system_1.TypeSystemPolicy.IsObjectLike(value))
        return yield Create(ValueErrorType.Object, schema, path, value);
    if (IsDefined(schema.minProperties) && !(Object.getOwnPropertyNames(value).length >= schema.minProperties)) {
        yield Create(ValueErrorType.ObjectMinProperties, schema, path, value);
    }
    if (IsDefined(schema.maxProperties) && !(Object.getOwnPropertyNames(value).length <= schema.maxProperties)) {
        yield Create(ValueErrorType.ObjectMaxProperties, schema, path, value);
    }
    const requiredKeys = Array.isArray(schema.required) ? schema.required : [];
    const knownKeys = Object.getOwnPropertyNames(schema.properties);
    const unknownKeys = Object.getOwnPropertyNames(value);
    for (const requiredKey of requiredKeys) {
        if (unknownKeys.includes(requiredKey))
            continue;
        yield Create(ValueErrorType.ObjectRequiredProperty, schema.properties[requiredKey], `${path}/${EscapeKey(requiredKey)}`, undefined);
    }
    if (schema.additionalProperties === false) {
        for (const valueKey of unknownKeys) {
            if (!knownKeys.includes(valueKey)) {
                yield Create(ValueErrorType.ObjectAdditionalProperties, schema, `${path}/${EscapeKey(valueKey)}`, value[valueKey]);
            }
        }
    }
    if (typeof schema.additionalProperties === 'object') {
        for (const valueKey of unknownKeys) {
            if (knownKeys.includes(valueKey))
                continue;
            yield* Visit(schema.additionalProperties, references, `${path}/${EscapeKey(valueKey)}`, value[valueKey]);
        }
    }
    for (const knownKey of knownKeys) {
        const property = schema.properties[knownKey];
        if (schema.required && schema.required.includes(knownKey)) {
            yield* Visit(property, references, `${path}/${EscapeKey(knownKey)}`, value[knownKey]);
            if (Types.ExtendsUndefined.Check(schema) && !(knownKey in value)) {
                yield Create(ValueErrorType.ObjectRequiredProperty, property, `${path}/${EscapeKey(knownKey)}`, undefined);
            }
        }
        else {
            if (system_1.TypeSystemPolicy.IsExactOptionalProperty(value, knownKey)) {
                yield* Visit(property, references, `${path}/${EscapeKey(knownKey)}`, value[knownKey]);
            }
        }
    }
}
function* TPromise(schema, references, path, value) {
    if (!(0, guard_1.IsPromise)(value))
        yield Create(ValueErrorType.Promise, schema, path, value);
}
function* TRecord(schema, references, path, value) {
    if (!system_1.TypeSystemPolicy.IsRecordLike(value))
        return yield Create(ValueErrorType.Object, schema, path, value);
    if (IsDefined(schema.minProperties) && !(Object.getOwnPropertyNames(value).length >= schema.minProperties)) {
        yield Create(ValueErrorType.ObjectMinProperties, schema, path, value);
    }
    if (IsDefined(schema.maxProperties) && !(Object.getOwnPropertyNames(value).length <= schema.maxProperties)) {
        yield Create(ValueErrorType.ObjectMaxProperties, schema, path, value);
    }
    const [patternKey, patternSchema] = Object.entries(schema.patternProperties)[0];
    const regex = new RegExp(patternKey);
    for (const [propertyKey, propertyValue] of Object.entries(value)) {
        if (regex.test(propertyKey))
            yield* Visit(patternSchema, references, `${path}/${EscapeKey(propertyKey)}`, propertyValue);
    }
    if (typeof schema.additionalProperties === 'object') {
        for (const [propertyKey, propertyValue] of Object.entries(value)) {
            if (!regex.test(propertyKey))
                yield* Visit(schema.additionalProperties, references, `${path}/${EscapeKey(propertyKey)}`, propertyValue);
        }
    }
    if (schema.additionalProperties === false) {
        for (const [propertyKey, propertyValue] of Object.entries(value)) {
            if (regex.test(propertyKey))
                continue;
            return yield Create(ValueErrorType.ObjectAdditionalProperties, schema, `${path}/${EscapeKey(propertyKey)}`, propertyValue);
        }
    }
}
function* TRef(schema, references, path, value) {
    yield* Visit((0, deref_1.Deref)(schema, references), references, path, value);
}
function* TString(schema, references, path, value) {
    if (!(0, guard_1.IsString)(value))
        return yield Create(ValueErrorType.String, schema, path, value);
    if (IsDefined(schema.minLength) && !(value.length >= schema.minLength)) {
        yield Create(ValueErrorType.StringMinLength, schema, path, value);
    }
    if (IsDefined(schema.maxLength) && !(value.length <= schema.maxLength)) {
        yield Create(ValueErrorType.StringMaxLength, schema, path, value);
    }
    if ((0, guard_1.IsString)(schema.pattern)) {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(value)) {
            yield Create(ValueErrorType.StringPattern, schema, path, value);
        }
    }
    if ((0, guard_1.IsString)(schema.format)) {
        if (!Types.FormatRegistry.Has(schema.format)) {
            yield Create(ValueErrorType.StringFormatUnknown, schema, path, value);
        }
        else {
            const format = Types.FormatRegistry.Get(schema.format);
            if (!format(value)) {
                yield Create(ValueErrorType.StringFormat, schema, path, value);
            }
        }
    }
}
function* TSymbol(schema, references, path, value) {
    if (!(0, guard_1.IsSymbol)(value))
        yield Create(ValueErrorType.Symbol, schema, path, value);
}
function* TTemplateLiteral(schema, references, path, value) {
    if (!(0, guard_1.IsString)(value))
        return yield Create(ValueErrorType.String, schema, path, value);
    const regex = new RegExp(schema.pattern);
    if (!regex.test(value)) {
        yield Create(ValueErrorType.StringPattern, schema, path, value);
    }
}
function* TThis(schema, references, path, value) {
    yield* Visit((0, deref_1.Deref)(schema, references), references, path, value);
}
function* TTuple(schema, references, path, value) {
    if (!(0, guard_1.IsArray)(value))
        return yield Create(ValueErrorType.Tuple, schema, path, value);
    if (schema.items === undefined && !(value.length === 0)) {
        return yield Create(ValueErrorType.TupleLength, schema, path, value);
    }
    if (!(value.length === schema.maxItems)) {
        return yield Create(ValueErrorType.TupleLength, schema, path, value);
    }
    if (!schema.items) {
        return;
    }
    for (let i = 0; i < schema.items.length; i++) {
        yield* Visit(schema.items[i], references, `${path}/${i}`, value[i]);
    }
}
function* TUndefined(schema, references, path, value) {
    if (!(0, guard_1.IsUndefined)(value))
        yield Create(ValueErrorType.Undefined, schema, path, value);
}
function* TUnion(schema, references, path, value) {
    let count = 0;
    for (const subschema of schema.anyOf) {
        const errors = [...Visit(subschema, references, path, value)];
        if (errors.length === 0)
            return; // matched
        count += errors.length;
    }
    if (count > 0) {
        yield Create(ValueErrorType.Union, schema, path, value);
    }
}
function* TUint8Array(schema, references, path, value) {
    if (!(0, guard_1.IsUint8Array)(value))
        return yield Create(ValueErrorType.Uint8Array, schema, path, value);
    if (IsDefined(schema.maxByteLength) && !(value.length <= schema.maxByteLength)) {
        yield Create(ValueErrorType.Uint8ArrayMaxByteLength, schema, path, value);
    }
    if (IsDefined(schema.minByteLength) && !(value.length >= schema.minByteLength)) {
        yield Create(ValueErrorType.Uint8ArrayMinByteLength, schema, path, value);
    }
}
function* TUnknown(schema, references, path, value) { }
function* TVoid(schema, references, path, value) {
    if (!system_1.TypeSystemPolicy.IsVoidLike(value))
        yield Create(ValueErrorType.Void, schema, path, value);
}
function* TKind(schema, references, path, value) {
    const check = Types.TypeRegistry.Get(schema[Types.Kind]);
    if (!check(schema, value))
        yield Create(ValueErrorType.Kind, schema, path, value);
}
function* Visit(schema, references, path, value) {
    const references_ = IsDefined(schema.$id) ? [...references, schema] : references;
    const schema_ = schema;
    switch (schema_[Types.Kind]) {
        case 'Any':
            return yield* TAny(schema_, references_, path, value);
        case 'Array':
            return yield* TArray(schema_, references_, path, value);
        case 'AsyncIterator':
            return yield* TAsyncIterator(schema_, references_, path, value);
        case 'BigInt':
            return yield* TBigInt(schema_, references_, path, value);
        case 'Boolean':
            return yield* TBoolean(schema_, references_, path, value);
        case 'Constructor':
            return yield* TConstructor(schema_, references_, path, value);
        case 'Date':
            return yield* TDate(schema_, references_, path, value);
        case 'Function':
            return yield* TFunction(schema_, references_, path, value);
        case 'Integer':
            return yield* TInteger(schema_, references_, path, value);
        case 'Intersect':
            return yield* TIntersect(schema_, references_, path, value);
        case 'Iterator':
            return yield* TIterator(schema_, references_, path, value);
        case 'Literal':
            return yield* TLiteral(schema_, references_, path, value);
        case 'Never':
            return yield* TNever(schema_, references_, path, value);
        case 'Not':
            return yield* TNot(schema_, references_, path, value);
        case 'Null':
            return yield* TNull(schema_, references_, path, value);
        case 'Number':
            return yield* TNumber(schema_, references_, path, value);
        case 'Object':
            return yield* TObject(schema_, references_, path, value);
        case 'Promise':
            return yield* TPromise(schema_, references_, path, value);
        case 'Record':
            return yield* TRecord(schema_, references_, path, value);
        case 'Ref':
            return yield* TRef(schema_, references_, path, value);
        case 'String':
            return yield* TString(schema_, references_, path, value);
        case 'Symbol':
            return yield* TSymbol(schema_, references_, path, value);
        case 'TemplateLiteral':
            return yield* TTemplateLiteral(schema_, references_, path, value);
        case 'This':
            return yield* TThis(schema_, references_, path, value);
        case 'Tuple':
            return yield* TTuple(schema_, references_, path, value);
        case 'Undefined':
            return yield* TUndefined(schema_, references_, path, value);
        case 'Union':
            return yield* TUnion(schema_, references_, path, value);
        case 'Uint8Array':
            return yield* TUint8Array(schema_, references_, path, value);
        case 'Unknown':
            return yield* TUnknown(schema_, references_, path, value);
        case 'Void':
            return yield* TVoid(schema_, references_, path, value);
        default:
            if (!Types.TypeRegistry.Has(schema_[Types.Kind]))
                throw new ValueErrorsUnknownTypeError(schema);
            return yield* TKind(schema_, references_, path, value);
    }
}
/** Returns an iterator for each error in this value. */
function Errors(...args) {
    const iterator = args.length === 3 ? Visit(args[0], args[1], '', args[2]) : Visit(args[0], [], '', args[1]);
    return new ValueErrorIterator(iterator);
}
exports.Errors = Errors;


/***/ }),

/***/ 6152:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/*--------------------------------------------------------------------------

@sinclair/typebox/errors

The MIT License (MIT)

Copyright (c) 2017-2023 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(9984), exports);


/***/ }),

/***/ 1008:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*--------------------------------------------------------------------------

@sinclair/typebox/system

The MIT License (MIT)

Copyright (c) 2017-2023 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultErrorFunction = exports.TypeSystemPolicy = exports.TypeSystemErrorFunction = exports.TypeSystem = exports.TypeSystemDuplicateFormat = exports.TypeSystemDuplicateTypeKind = void 0;
const guard_1 = __webpack_require__(5928);
const errors_1 = __webpack_require__(9984);
const Types = __webpack_require__(624);
// --------------------------------------------------------------------------
// Errors
// --------------------------------------------------------------------------
class TypeSystemDuplicateTypeKind extends Types.TypeBoxError {
    constructor(kind) {
        super(`Duplicate type kind '${kind}' detected`);
    }
}
exports.TypeSystemDuplicateTypeKind = TypeSystemDuplicateTypeKind;
class TypeSystemDuplicateFormat extends Types.TypeBoxError {
    constructor(kind) {
        super(`Duplicate string format '${kind}' detected`);
    }
}
exports.TypeSystemDuplicateFormat = TypeSystemDuplicateFormat;
// -------------------------------------------------------------------------------------------
// TypeSystem
// -------------------------------------------------------------------------------------------
/** Creates user defined types and formats and provides overrides for value checking behaviours */
var TypeSystem;
(function (TypeSystem) {
    /** Creates a new type */
    function Type(kind, check) {
        if (Types.TypeRegistry.Has(kind))
            throw new TypeSystemDuplicateTypeKind(kind);
        Types.TypeRegistry.Set(kind, check);
        return (options = {}) => Types.Type.Unsafe({ ...options, [Types.Kind]: kind });
    }
    TypeSystem.Type = Type;
    /** Creates a new string format */
    function Format(format, check) {
        if (Types.FormatRegistry.Has(format))
            throw new TypeSystemDuplicateFormat(format);
        Types.FormatRegistry.Set(format, check);
        return format;
    }
    TypeSystem.Format = Format;
})(TypeSystem || (exports.TypeSystem = TypeSystem = {}));
// --------------------------------------------------------------------------
// TypeSystemErrorFunction
// --------------------------------------------------------------------------
/** Manages error message providers */
var TypeSystemErrorFunction;
(function (TypeSystemErrorFunction) {
    let errorMessageFunction = DefaultErrorFunction;
    /** Resets the error message function to en-us */
    function Reset() {
        errorMessageFunction = DefaultErrorFunction;
    }
    TypeSystemErrorFunction.Reset = Reset;
    /** Sets the error message function used to generate error messages */
    function Set(callback) {
        errorMessageFunction = callback;
    }
    TypeSystemErrorFunction.Set = Set;
    /** Gets the error message function */
    function Get() {
        return errorMessageFunction;
    }
    TypeSystemErrorFunction.Get = Get;
})(TypeSystemErrorFunction || (exports.TypeSystemErrorFunction = TypeSystemErrorFunction = {}));
// --------------------------------------------------------------------------
// TypeSystemPolicy
// --------------------------------------------------------------------------
/** Shared assertion routines used by the value and errors modules */
var TypeSystemPolicy;
(function (TypeSystemPolicy) {
    /** Sets whether TypeBox should assert optional properties using the TypeScript `exactOptionalPropertyTypes` assertion policy. The default is `false` */
    TypeSystemPolicy.ExactOptionalPropertyTypes = false;
    /** Sets whether arrays should be treated as a kind of objects. The default is `false` */
    TypeSystemPolicy.AllowArrayObject = false;
    /** Sets whether `NaN` or `Infinity` should be treated as valid numeric values. The default is `false` */
    TypeSystemPolicy.AllowNaN = false;
    /** Sets whether `null` should validate for void types. The default is `false` */
    TypeSystemPolicy.AllowNullVoid = false;
    /** Asserts this value using the ExactOptionalPropertyTypes policy */
    function IsExactOptionalProperty(value, key) {
        return TypeSystemPolicy.ExactOptionalPropertyTypes ? key in value : value[key] !== undefined;
    }
    TypeSystemPolicy.IsExactOptionalProperty = IsExactOptionalProperty;
    /** Asserts this value using the AllowArrayObjects policy */
    function IsObjectLike(value) {
        const isObject = (0, guard_1.IsObject)(value);
        return TypeSystemPolicy.AllowArrayObject ? isObject : isObject && !(0, guard_1.IsArray)(value);
    }
    TypeSystemPolicy.IsObjectLike = IsObjectLike;
    /** Asserts this value as a record using the AllowArrayObjects policy */
    function IsRecordLike(value) {
        return IsObjectLike(value) && !(value instanceof Date) && !(value instanceof Uint8Array);
    }
    TypeSystemPolicy.IsRecordLike = IsRecordLike;
    /** Asserts this value using the AllowNaN policy */
    function IsNumberLike(value) {
        const isNumber = (0, guard_1.IsNumber)(value);
        return TypeSystemPolicy.AllowNaN ? isNumber : isNumber && Number.isFinite(value);
    }
    TypeSystemPolicy.IsNumberLike = IsNumberLike;
    /** Asserts this value using the AllowVoidNull policy */
    function IsVoidLike(value) {
        const isUndefined = (0, guard_1.IsUndefined)(value);
        return TypeSystemPolicy.AllowNullVoid ? isUndefined || value === null : isUndefined;
    }
    TypeSystemPolicy.IsVoidLike = IsVoidLike;
})(TypeSystemPolicy || (exports.TypeSystemPolicy = TypeSystemPolicy = {}));
// --------------------------------------------------------------------------
// DefaultErrorFunction
// --------------------------------------------------------------------------
/** Creates an error message using en-US as the default locale */
function DefaultErrorFunction(schema, errorType) {
    switch (errorType) {
        case errors_1.ValueErrorType.ArrayContains:
            return 'Expected array to contain at least one matching value';
        case errors_1.ValueErrorType.ArrayMaxContains:
            return `Expected array to contain no more than ${schema.maxContains} matching values`;
        case errors_1.ValueErrorType.ArrayMinContains:
            return `Expected array to contain at least ${schema.minContains} matching values`;
        case errors_1.ValueErrorType.ArrayMaxItems:
            return `Expected array length to be less or equal to ${schema.maxItems}`;
        case errors_1.ValueErrorType.ArrayMinItems:
            return `Expected array length to be greater or equal to ${schema.minItems}`;
        case errors_1.ValueErrorType.ArrayUniqueItems:
            return 'Expected array elements to be unique';
        case errors_1.ValueErrorType.Array:
            return 'Expected array';
        case errors_1.ValueErrorType.AsyncIterator:
            return 'Expected AsyncIterator';
        case errors_1.ValueErrorType.BigIntExclusiveMaximum:
            return `Expected bigint to be less than ${schema.exclusiveMaximum}`;
        case errors_1.ValueErrorType.BigIntExclusiveMinimum:
            return `Expected bigint to be greater than ${schema.exclusiveMinimum}`;
        case errors_1.ValueErrorType.BigIntMaximum:
            return `Expected bigint to be less or equal to ${schema.maximum}`;
        case errors_1.ValueErrorType.BigIntMinimum:
            return `Expected bigint to be greater or equal to ${schema.minimum}`;
        case errors_1.ValueErrorType.BigIntMultipleOf:
            return `Expected bigint to be a multiple of ${schema.multipleOf}`;
        case errors_1.ValueErrorType.BigInt:
            return 'Expected bigint';
        case errors_1.ValueErrorType.Boolean:
            return 'Expected boolean';
        case errors_1.ValueErrorType.DateExclusiveMinimumTimestamp:
            return `Expected Date timestamp to be greater than ${schema.exclusiveMinimumTimestamp}`;
        case errors_1.ValueErrorType.DateExclusiveMaximumTimestamp:
            return `Expected Date timestamp to be less than ${schema.exclusiveMaximumTimestamp}`;
        case errors_1.ValueErrorType.DateMinimumTimestamp:
            return `Expected Date timestamp to be greater or equal to ${schema.minimumTimestamp}`;
        case errors_1.ValueErrorType.DateMaximumTimestamp:
            return `Expected Date timestamp to be less or equal to ${schema.maximumTimestamp}`;
        case errors_1.ValueErrorType.DateMultipleOfTimestamp:
            return `Expected Date timestamp to be a multiple of ${schema.multipleOfTimestamp}`;
        case errors_1.ValueErrorType.Date:
            return 'Expected Date';
        case errors_1.ValueErrorType.Function:
            return 'Expected function';
        case errors_1.ValueErrorType.IntegerExclusiveMaximum:
            return `Expected integer to be less than ${schema.exclusiveMaximum}`;
        case errors_1.ValueErrorType.IntegerExclusiveMinimum:
            return `Expected integer to be greater than ${schema.exclusiveMinimum}`;
        case errors_1.ValueErrorType.IntegerMaximum:
            return `Expected integer to be less or equal to ${schema.maximum}`;
        case errors_1.ValueErrorType.IntegerMinimum:
            return `Expected integer to be greater or equal to ${schema.minimum}`;
        case errors_1.ValueErrorType.IntegerMultipleOf:
            return `Expected integer to be a multiple of ${schema.multipleOf}`;
        case errors_1.ValueErrorType.Integer:
            return 'Expected integer';
        case errors_1.ValueErrorType.IntersectUnevaluatedProperties:
            return 'Unexpected property';
        case errors_1.ValueErrorType.Intersect:
            return 'Expected all values to match';
        case errors_1.ValueErrorType.Iterator:
            return 'Expected Iterator';
        case errors_1.ValueErrorType.Literal:
            return `Expected ${typeof schema.const === 'string' ? `'${schema.const}'` : schema.const}`;
        case errors_1.ValueErrorType.Never:
            return 'Never';
        case errors_1.ValueErrorType.Not:
            return 'Value should not match';
        case errors_1.ValueErrorType.Null:
            return 'Expected null';
        case errors_1.ValueErrorType.NumberExclusiveMaximum:
            return `Expected number to be less than ${schema.exclusiveMaximum}`;
        case errors_1.ValueErrorType.NumberExclusiveMinimum:
            return `Expected number to be greater than ${schema.exclusiveMinimum}`;
        case errors_1.ValueErrorType.NumberMaximum:
            return `Expected number to be less or equal to ${schema.maximum}`;
        case errors_1.ValueErrorType.NumberMinimum:
            return `Expected number to be greater or equal to ${schema.minimum}`;
        case errors_1.ValueErrorType.NumberMultipleOf:
            return `Expected number to be a multiple of ${schema.multipleOf}`;
        case errors_1.ValueErrorType.Number:
            return 'Expected number';
        case errors_1.ValueErrorType.Object:
            return 'Expected object';
        case errors_1.ValueErrorType.ObjectAdditionalProperties:
            return 'Unexpected property';
        case errors_1.ValueErrorType.ObjectMaxProperties:
            return `Expected object to have no more than ${schema.maxProperties} properties`;
        case errors_1.ValueErrorType.ObjectMinProperties:
            return `Expected object to have at least ${schema.minProperties} properties`;
        case errors_1.ValueErrorType.ObjectRequiredProperty:
            return 'Required property';
        case errors_1.ValueErrorType.Promise:
            return 'Expected Promise';
        case errors_1.ValueErrorType.StringFormatUnknown:
            return `Unknown format '${schema.format}'`;
        case errors_1.ValueErrorType.StringFormat:
            return `Expected string to match '${schema.format}' format`;
        case errors_1.ValueErrorType.StringMaxLength:
            return `Expected string length less or equal to ${schema.maxLength}`;
        case errors_1.ValueErrorType.StringMinLength:
            return `Expected string length greater or equal to ${schema.minLength}`;
        case errors_1.ValueErrorType.StringPattern:
            return `Expected string to match '${schema.pattern}'`;
        case errors_1.ValueErrorType.String:
            return 'Expected string';
        case errors_1.ValueErrorType.Symbol:
            return 'Expected symbol';
        case errors_1.ValueErrorType.TupleLength:
            return `Expected tuple to have ${schema.maxItems || 0} elements`;
        case errors_1.ValueErrorType.Tuple:
            return 'Expected tuple';
        case errors_1.ValueErrorType.Uint8ArrayMaxByteLength:
            return `Expected byte length less or equal to ${schema.maxByteLength}`;
        case errors_1.ValueErrorType.Uint8ArrayMinByteLength:
            return `Expected byte length greater or equal to ${schema.minByteLength}`;
        case errors_1.ValueErrorType.Uint8Array:
            return 'Expected Uint8Array';
        case errors_1.ValueErrorType.Undefined:
            return 'Expected undefined';
        case errors_1.ValueErrorType.Union:
            return 'Expected union value';
        case errors_1.ValueErrorType.Void:
            return 'Expected void';
        case errors_1.ValueErrorType.Kind:
            return `Expected kind '${schema[Types.Kind]}'`;
        default:
            return 'Unknown error type';
    }
}
exports.DefaultErrorFunction = DefaultErrorFunction;


/***/ }),

/***/ 624:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*--------------------------------------------------------------------------

@sinclair/typebox

The MIT License (MIT)

Copyright (c) 2017-2023 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Type = exports.JsonType = exports.JavaScriptTypeBuilder = exports.JsonTypeBuilder = exports.TypeBuilder = exports.TypeBuilderError = exports.TransformEncodeBuilder = exports.TransformDecodeBuilder = exports.TemplateLiteralDslParser = exports.TemplateLiteralGenerator = exports.TemplateLiteralGeneratorError = exports.TemplateLiteralFinite = exports.TemplateLiteralFiniteError = exports.TemplateLiteralParser = exports.TemplateLiteralParserError = exports.TemplateLiteralResolver = exports.TemplateLiteralPattern = exports.TemplateLiteralPatternError = exports.UnionResolver = exports.KeyArrayResolver = exports.KeyArrayResolverError = exports.KeyResolver = exports.ObjectMap = exports.Intrinsic = exports.IndexedAccessor = exports.TypeClone = exports.TypeExtends = exports.TypeExtendsResult = exports.TypeExtendsError = exports.ExtendsUndefined = exports.TypeGuard = exports.TypeGuardUnknownTypeError = exports.ValueGuard = exports.FormatRegistry = exports.TypeBoxError = exports.TypeRegistry = exports.PatternStringExact = exports.PatternNumberExact = exports.PatternBooleanExact = exports.PatternString = exports.PatternNumber = exports.PatternBoolean = exports.Kind = exports.Hint = exports.Optional = exports.Readonly = exports.Transform = void 0;
// --------------------------------------------------------------------------
// Symbols
// --------------------------------------------------------------------------
exports.Transform = Symbol.for('TypeBox.Transform');
exports.Readonly = Symbol.for('TypeBox.Readonly');
exports.Optional = Symbol.for('TypeBox.Optional');
exports.Hint = Symbol.for('TypeBox.Hint');
exports.Kind = Symbol.for('TypeBox.Kind');
// --------------------------------------------------------------------------
// Patterns
// --------------------------------------------------------------------------
exports.PatternBoolean = '(true|false)';
exports.PatternNumber = '(0|[1-9][0-9]*)';
exports.PatternString = '(.*)';
exports.PatternBooleanExact = `^${exports.PatternBoolean}$`;
exports.PatternNumberExact = `^${exports.PatternNumber}$`;
exports.PatternStringExact = `^${exports.PatternString}$`;
/** A registry for user defined types */
var TypeRegistry;
(function (TypeRegistry) {
    const map = new Map();
    /** Returns the entries in this registry */
    function Entries() {
        return new Map(map);
    }
    TypeRegistry.Entries = Entries;
    /** Clears all user defined types */
    function Clear() {
        return map.clear();
    }
    TypeRegistry.Clear = Clear;
    /** Deletes a registered type */
    function Delete(kind) {
        return map.delete(kind);
    }
    TypeRegistry.Delete = Delete;
    /** Returns true if this registry contains this kind */
    function Has(kind) {
        return map.has(kind);
    }
    TypeRegistry.Has = Has;
    /** Sets a validation function for a user defined type */
    function Set(kind, func) {
        map.set(kind, func);
    }
    TypeRegistry.Set = Set;
    /** Gets a custom validation function for a user defined type */
    function Get(kind) {
        return map.get(kind);
    }
    TypeRegistry.Get = Get;
})(TypeRegistry || (exports.TypeRegistry = TypeRegistry = {}));
// --------------------------------------------------------------------------
// TypeBoxError
// --------------------------------------------------------------------------
class TypeBoxError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.TypeBoxError = TypeBoxError;
/** A registry for user defined string formats */
var FormatRegistry;
(function (FormatRegistry) {
    const map = new Map();
    /** Returns the entries in this registry */
    function Entries() {
        return new Map(map);
    }
    FormatRegistry.Entries = Entries;
    /** Clears all user defined string formats */
    function Clear() {
        return map.clear();
    }
    FormatRegistry.Clear = Clear;
    /** Deletes a registered format */
    function Delete(format) {
        return map.delete(format);
    }
    FormatRegistry.Delete = Delete;
    /** Returns true if the user defined string format exists */
    function Has(format) {
        return map.has(format);
    }
    FormatRegistry.Has = Has;
    /** Sets a validation function for a user defined string format */
    function Set(format, func) {
        map.set(format, func);
    }
    FormatRegistry.Set = Set;
    /** Gets a validation function for a user defined string format */
    function Get(format) {
        return map.get(format);
    }
    FormatRegistry.Get = Get;
})(FormatRegistry || (exports.FormatRegistry = FormatRegistry = {}));
// --------------------------------------------------------------------------
// ValueGuard
// --------------------------------------------------------------------------
/** Provides functions to type guard raw JavaScript values */
var ValueGuard;
(function (ValueGuard) {
    /** Returns true if this value is an array */
    function IsArray(value) {
        return Array.isArray(value);
    }
    ValueGuard.IsArray = IsArray;
    /** Returns true if this value is bigint */
    function IsBigInt(value) {
        return typeof value === 'bigint';
    }
    ValueGuard.IsBigInt = IsBigInt;
    /** Returns true if this value is a boolean */
    function IsBoolean(value) {
        return typeof value === 'boolean';
    }
    ValueGuard.IsBoolean = IsBoolean;
    /** Returns true if this value is a Date object */
    function IsDate(value) {
        return value instanceof globalThis.Date;
    }
    ValueGuard.IsDate = IsDate;
    /** Returns true if this value is null */
    function IsNull(value) {
        return value === null;
    }
    ValueGuard.IsNull = IsNull;
    /** Returns true if this value is number */
    function IsNumber(value) {
        return typeof value === 'number';
    }
    ValueGuard.IsNumber = IsNumber;
    /** Returns true if this value is an object */
    function IsObject(value) {
        return typeof value === 'object' && value !== null;
    }
    ValueGuard.IsObject = IsObject;
    /** Returns true if this value is string */
    function IsString(value) {
        return typeof value === 'string';
    }
    ValueGuard.IsString = IsString;
    /** Returns true if this value is a Uint8Array */
    function IsUint8Array(value) {
        return value instanceof globalThis.Uint8Array;
    }
    ValueGuard.IsUint8Array = IsUint8Array;
    /** Returns true if this value is undefined */
    function IsUndefined(value) {
        return value === undefined;
    }
    ValueGuard.IsUndefined = IsUndefined;
})(ValueGuard || (exports.ValueGuard = ValueGuard = {}));
// --------------------------------------------------------------------------
// TypeGuard
// --------------------------------------------------------------------------
class TypeGuardUnknownTypeError extends TypeBoxError {
}
exports.TypeGuardUnknownTypeError = TypeGuardUnknownTypeError;
/** Provides functions to test if JavaScript values are TypeBox types */
var TypeGuard;
(function (TypeGuard) {
    function IsPattern(value) {
        try {
            new RegExp(value);
            return true;
        }
        catch {
            return false;
        }
    }
    function IsControlCharacterFree(value) {
        if (!ValueGuard.IsString(value))
            return false;
        for (let i = 0; i < value.length; i++) {
            const code = value.charCodeAt(i);
            if ((code >= 7 && code <= 13) || code === 27 || code === 127) {
                return false;
            }
        }
        return true;
    }
    function IsAdditionalProperties(value) {
        return IsOptionalBoolean(value) || TSchema(value);
    }
    function IsOptionalBigInt(value) {
        return ValueGuard.IsUndefined(value) || ValueGuard.IsBigInt(value);
    }
    function IsOptionalNumber(value) {
        return ValueGuard.IsUndefined(value) || ValueGuard.IsNumber(value);
    }
    function IsOptionalBoolean(value) {
        return ValueGuard.IsUndefined(value) || ValueGuard.IsBoolean(value);
    }
    function IsOptionalString(value) {
        return ValueGuard.IsUndefined(value) || ValueGuard.IsString(value);
    }
    function IsOptionalPattern(value) {
        return ValueGuard.IsUndefined(value) || (ValueGuard.IsString(value) && IsControlCharacterFree(value) && IsPattern(value));
    }
    function IsOptionalFormat(value) {
        return ValueGuard.IsUndefined(value) || (ValueGuard.IsString(value) && IsControlCharacterFree(value));
    }
    function IsOptionalSchema(value) {
        return ValueGuard.IsUndefined(value) || TSchema(value);
    }
    // ----------------------------------------------------------------
    // Types
    // ----------------------------------------------------------------
    /** Returns true if the given value is TAny */
    function TAny(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Any') &&
            IsOptionalString(schema.$id));
    }
    TypeGuard.TAny = TAny;
    /** Returns true if the given value is TArray */
    function TArray(schema) {
        return (TKindOf(schema, 'Array') &&
            schema.type === 'array' &&
            IsOptionalString(schema.$id) &&
            TSchema(schema.items) &&
            IsOptionalNumber(schema.minItems) &&
            IsOptionalNumber(schema.maxItems) &&
            IsOptionalBoolean(schema.uniqueItems) &&
            IsOptionalSchema(schema.contains) &&
            IsOptionalNumber(schema.minContains) &&
            IsOptionalNumber(schema.maxContains));
    }
    TypeGuard.TArray = TArray;
    /** Returns true if the given value is TAsyncIterator */
    function TAsyncIterator(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'AsyncIterator') &&
            schema.type === 'AsyncIterator' &&
            IsOptionalString(schema.$id) &&
            TSchema(schema.items));
    }
    TypeGuard.TAsyncIterator = TAsyncIterator;
    /** Returns true if the given value is TBigInt */
    function TBigInt(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'BigInt') &&
            schema.type === 'bigint' &&
            IsOptionalString(schema.$id) &&
            IsOptionalBigInt(schema.exclusiveMaximum) &&
            IsOptionalBigInt(schema.exclusiveMinimum) &&
            IsOptionalBigInt(schema.maximum) &&
            IsOptionalBigInt(schema.minimum) &&
            IsOptionalBigInt(schema.multipleOf));
    }
    TypeGuard.TBigInt = TBigInt;
    /** Returns true if the given value is TBoolean */
    function TBoolean(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Boolean') &&
            schema.type === 'boolean' &&
            IsOptionalString(schema.$id));
    }
    TypeGuard.TBoolean = TBoolean;
    /** Returns true if the given value is TConstructor */
    function TConstructor(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Constructor') &&
            schema.type === 'Constructor' &&
            IsOptionalString(schema.$id) &&
            ValueGuard.IsArray(schema.parameters) &&
            schema.parameters.every(schema => TSchema(schema)) &&
            TSchema(schema.returns));
    }
    TypeGuard.TConstructor = TConstructor;
    /** Returns true if the given value is TDate */
    function TDate(schema) {
        return (TKindOf(schema, 'Date') &&
            schema.type === 'Date' &&
            IsOptionalString(schema.$id) &&
            IsOptionalNumber(schema.exclusiveMaximumTimestamp) &&
            IsOptionalNumber(schema.exclusiveMinimumTimestamp) &&
            IsOptionalNumber(schema.maximumTimestamp) &&
            IsOptionalNumber(schema.minimumTimestamp) &&
            IsOptionalNumber(schema.multipleOfTimestamp));
    }
    TypeGuard.TDate = TDate;
    /** Returns true if the given value is TFunction */
    function TFunction(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Function') &&
            schema.type === 'Function' &&
            IsOptionalString(schema.$id) &&
            ValueGuard.IsArray(schema.parameters) &&
            schema.parameters.every(schema => TSchema(schema)) &&
            TSchema(schema.returns));
    }
    TypeGuard.TFunction = TFunction;
    /** Returns true if the given value is TInteger */
    function TInteger(schema) {
        return (TKindOf(schema, 'Integer') &&
            schema.type === 'integer' &&
            IsOptionalString(schema.$id) &&
            IsOptionalNumber(schema.exclusiveMaximum) &&
            IsOptionalNumber(schema.exclusiveMinimum) &&
            IsOptionalNumber(schema.maximum) &&
            IsOptionalNumber(schema.minimum) &&
            IsOptionalNumber(schema.multipleOf));
    }
    TypeGuard.TInteger = TInteger;
    /** Returns true if the given value is TIntersect */
    function TIntersect(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Intersect') &&
            (ValueGuard.IsString(schema.type) && schema.type !== 'object' ? false : true) &&
            ValueGuard.IsArray(schema.allOf) &&
            schema.allOf.every(schema => TSchema(schema) && !TTransform(schema)) &&
            IsOptionalString(schema.type) &&
            (IsOptionalBoolean(schema.unevaluatedProperties) || IsOptionalSchema(schema.unevaluatedProperties)) &&
            IsOptionalString(schema.$id));
    }
    TypeGuard.TIntersect = TIntersect;
    /** Returns true if the given value is TIterator */
    function TIterator(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Iterator') &&
            schema.type === 'Iterator' &&
            IsOptionalString(schema.$id) &&
            TSchema(schema.items));
    }
    TypeGuard.TIterator = TIterator;
    /** Returns true if the given value is a TKind with the given name. */
    function TKindOf(schema, kind) {
        return TKind(schema) && schema[exports.Kind] === kind;
    }
    TypeGuard.TKindOf = TKindOf;
    /** Returns true if the given value is TKind */
    function TKind(schema) {
        return ValueGuard.IsObject(schema) && exports.Kind in schema && ValueGuard.IsString(schema[exports.Kind]);
    }
    TypeGuard.TKind = TKind;
    /** Returns true if the given value is TLiteral<string> */
    function TLiteralString(schema) {
        return TLiteral(schema) && ValueGuard.IsString(schema.const);
    }
    TypeGuard.TLiteralString = TLiteralString;
    /** Returns true if the given value is TLiteral<number> */
    function TLiteralNumber(schema) {
        return TLiteral(schema) && ValueGuard.IsNumber(schema.const);
    }
    TypeGuard.TLiteralNumber = TLiteralNumber;
    /** Returns true if the given value is TLiteral<boolean> */
    function TLiteralBoolean(schema) {
        return TLiteral(schema) && ValueGuard.IsBoolean(schema.const);
    }
    TypeGuard.TLiteralBoolean = TLiteralBoolean;
    /** Returns true if the given value is TLiteral */
    function TLiteral(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Literal') &&
            IsOptionalString(schema.$id) && (ValueGuard.IsBoolean(schema.const) ||
            ValueGuard.IsNumber(schema.const) ||
            ValueGuard.IsString(schema.const)));
    }
    TypeGuard.TLiteral = TLiteral;
    /** Returns true if the given value is TNever */
    function TNever(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Never') &&
            ValueGuard.IsObject(schema.not) &&
            Object.getOwnPropertyNames(schema.not).length === 0);
    }
    TypeGuard.TNever = TNever;
    /** Returns true if the given value is TNot */
    function TNot(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Not') &&
            TSchema(schema.not));
    }
    TypeGuard.TNot = TNot;
    /** Returns true if the given value is TNull */
    function TNull(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Null') &&
            schema.type === 'null' &&
            IsOptionalString(schema.$id));
    }
    TypeGuard.TNull = TNull;
    /** Returns true if the given value is TNumber */
    function TNumber(schema) {
        return (TKindOf(schema, 'Number') &&
            schema.type === 'number' &&
            IsOptionalString(schema.$id) &&
            IsOptionalNumber(schema.exclusiveMaximum) &&
            IsOptionalNumber(schema.exclusiveMinimum) &&
            IsOptionalNumber(schema.maximum) &&
            IsOptionalNumber(schema.minimum) &&
            IsOptionalNumber(schema.multipleOf));
    }
    TypeGuard.TNumber = TNumber;
    /** Returns true if the given value is TObject */
    function TObject(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Object') &&
            schema.type === 'object' &&
            IsOptionalString(schema.$id) &&
            ValueGuard.IsObject(schema.properties) &&
            IsAdditionalProperties(schema.additionalProperties) &&
            IsOptionalNumber(schema.minProperties) &&
            IsOptionalNumber(schema.maxProperties) &&
            Object.entries(schema.properties).every(([key, schema]) => IsControlCharacterFree(key) && TSchema(schema)));
    }
    TypeGuard.TObject = TObject;
    /** Returns true if the given value is TPromise */
    function TPromise(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Promise') &&
            schema.type === 'Promise' &&
            IsOptionalString(schema.$id) &&
            TSchema(schema.item));
    }
    TypeGuard.TPromise = TPromise;
    /** Returns true if the given value is TRecord */
    function TRecord(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Record') &&
            schema.type === 'object' &&
            IsOptionalString(schema.$id) &&
            IsAdditionalProperties(schema.additionalProperties) &&
            ValueGuard.IsObject(schema.patternProperties) &&
            ((schema) => {
                const keys = Object.getOwnPropertyNames(schema.patternProperties);
                return (keys.length === 1 &&
                    IsPattern(keys[0]) &&
                    ValueGuard.IsObject(schema.patternProperties) &&
                    TSchema(schema.patternProperties[keys[0]]));
            })(schema));
    }
    TypeGuard.TRecord = TRecord;
    /** Returns true if this value is TRecursive */
    function TRecursive(schema) {
        return ValueGuard.IsObject(schema) && exports.Hint in schema && schema[exports.Hint] === 'Recursive';
    }
    TypeGuard.TRecursive = TRecursive;
    /** Returns true if the given value is TRef */
    function TRef(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Ref') &&
            IsOptionalString(schema.$id) &&
            ValueGuard.IsString(schema.$ref));
    }
    TypeGuard.TRef = TRef;
    /** Returns true if the given value is TString */
    function TString(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'String') &&
            schema.type === 'string' &&
            IsOptionalString(schema.$id) &&
            IsOptionalNumber(schema.minLength) &&
            IsOptionalNumber(schema.maxLength) &&
            IsOptionalPattern(schema.pattern) &&
            IsOptionalFormat(schema.format));
    }
    TypeGuard.TString = TString;
    /** Returns true if the given value is TSymbol */
    function TSymbol(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Symbol') &&
            schema.type === 'symbol' &&
            IsOptionalString(schema.$id));
    }
    TypeGuard.TSymbol = TSymbol;
    /** Returns true if the given value is TTemplateLiteral */
    function TTemplateLiteral(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'TemplateLiteral') &&
            schema.type === 'string' &&
            ValueGuard.IsString(schema.pattern) &&
            schema.pattern[0] === '^' &&
            schema.pattern[schema.pattern.length - 1] === '$');
    }
    TypeGuard.TTemplateLiteral = TTemplateLiteral;
    /** Returns true if the given value is TThis */
    function TThis(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'This') &&
            IsOptionalString(schema.$id) &&
            ValueGuard.IsString(schema.$ref));
    }
    TypeGuard.TThis = TThis;
    /** Returns true of this value is TTransform */
    function TTransform(schema) {
        return ValueGuard.IsObject(schema) && exports.Transform in schema;
    }
    TypeGuard.TTransform = TTransform;
    /** Returns true if the given value is TTuple */
    function TTuple(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Tuple') &&
            schema.type === 'array' &&
            IsOptionalString(schema.$id) &&
            ValueGuard.IsNumber(schema.minItems) &&
            ValueGuard.IsNumber(schema.maxItems) &&
            schema.minItems === schema.maxItems &&
            (( // empty
            ValueGuard.IsUndefined(schema.items) &&
                ValueGuard.IsUndefined(schema.additionalItems) &&
                schema.minItems === 0) || (ValueGuard.IsArray(schema.items) &&
                schema.items.every(schema => TSchema(schema)))));
    }
    TypeGuard.TTuple = TTuple;
    /** Returns true if the given value is TUndefined */
    function TUndefined(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Undefined') &&
            schema.type === 'undefined' &&
            IsOptionalString(schema.$id));
    }
    TypeGuard.TUndefined = TUndefined;
    /** Returns true if the given value is TUnion<Literal<string | number>[]> */
    function TUnionLiteral(schema) {
        return TUnion(schema) && schema.anyOf.every((schema) => TLiteralString(schema) || TLiteralNumber(schema));
    }
    TypeGuard.TUnionLiteral = TUnionLiteral;
    /** Returns true if the given value is TUnion */
    function TUnion(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Union') &&
            IsOptionalString(schema.$id) &&
            ValueGuard.IsObject(schema) &&
            ValueGuard.IsArray(schema.anyOf) &&
            schema.anyOf.every(schema => TSchema(schema)));
    }
    TypeGuard.TUnion = TUnion;
    /** Returns true if the given value is TUint8Array */
    function TUint8Array(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Uint8Array') &&
            schema.type === 'Uint8Array' &&
            IsOptionalString(schema.$id) &&
            IsOptionalNumber(schema.minByteLength) &&
            IsOptionalNumber(schema.maxByteLength));
    }
    TypeGuard.TUint8Array = TUint8Array;
    /** Returns true if the given value is TUnknown */
    function TUnknown(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Unknown') &&
            IsOptionalString(schema.$id));
    }
    TypeGuard.TUnknown = TUnknown;
    /** Returns true if the given value is a raw TUnsafe */
    function TUnsafe(schema) {
        return TKindOf(schema, 'Unsafe');
    }
    TypeGuard.TUnsafe = TUnsafe;
    /** Returns true if the given value is TVoid */
    function TVoid(schema) {
        // prettier-ignore
        return (TKindOf(schema, 'Void') &&
            schema.type === 'void' &&
            IsOptionalString(schema.$id));
    }
    TypeGuard.TVoid = TVoid;
    /** Returns true if this value has a Readonly symbol */
    function TReadonly(schema) {
        return ValueGuard.IsObject(schema) && schema[exports.Readonly] === 'Readonly';
    }
    TypeGuard.TReadonly = TReadonly;
    /** Returns true if this value has a Optional symbol */
    function TOptional(schema) {
        return ValueGuard.IsObject(schema) && schema[exports.Optional] === 'Optional';
    }
    TypeGuard.TOptional = TOptional;
    /** Returns true if the given value is TSchema */
    function TSchema(schema) {
        // prettier-ignore
        return (ValueGuard.IsObject(schema)) && (TAny(schema) ||
            TArray(schema) ||
            TBoolean(schema) ||
            TBigInt(schema) ||
            TAsyncIterator(schema) ||
            TConstructor(schema) ||
            TDate(schema) ||
            TFunction(schema) ||
            TInteger(schema) ||
            TIntersect(schema) ||
            TIterator(schema) ||
            TLiteral(schema) ||
            TNever(schema) ||
            TNot(schema) ||
            TNull(schema) ||
            TNumber(schema) ||
            TObject(schema) ||
            TPromise(schema) ||
            TRecord(schema) ||
            TRef(schema) ||
            TString(schema) ||
            TSymbol(schema) ||
            TTemplateLiteral(schema) ||
            TThis(schema) ||
            TTuple(schema) ||
            TUndefined(schema) ||
            TUnion(schema) ||
            TUint8Array(schema) ||
            TUnknown(schema) ||
            TUnsafe(schema) ||
            TVoid(schema) ||
            (TKind(schema) && TypeRegistry.Has(schema[exports.Kind])));
    }
    TypeGuard.TSchema = TSchema;
})(TypeGuard || (exports.TypeGuard = TypeGuard = {}));
// --------------------------------------------------------------------------
// ExtendsUndefined
// --------------------------------------------------------------------------
/** Fast undefined check used for properties of type undefined */
var ExtendsUndefined;
(function (ExtendsUndefined) {
    function Check(schema) {
        return schema[exports.Kind] === 'Intersect'
            ? schema.allOf.every((schema) => Check(schema))
            : schema[exports.Kind] === 'Union'
                ? schema.anyOf.some((schema) => Check(schema))
                : schema[exports.Kind] === 'Undefined'
                    ? true
                    : schema[exports.Kind] === 'Not'
                        ? !Check(schema.not)
                        : false;
    }
    ExtendsUndefined.Check = Check;
})(ExtendsUndefined || (exports.ExtendsUndefined = ExtendsUndefined = {}));
// --------------------------------------------------------------------------
// TypeExtends
// --------------------------------------------------------------------------
class TypeExtendsError extends TypeBoxError {
}
exports.TypeExtendsError = TypeExtendsError;
var TypeExtendsResult;
(function (TypeExtendsResult) {
    TypeExtendsResult[TypeExtendsResult["Union"] = 0] = "Union";
    TypeExtendsResult[TypeExtendsResult["True"] = 1] = "True";
    TypeExtendsResult[TypeExtendsResult["False"] = 2] = "False";
})(TypeExtendsResult || (exports.TypeExtendsResult = TypeExtendsResult = {}));
var TypeExtends;
(function (TypeExtends) {
    // --------------------------------------------------------------------------
    // IntoBooleanResult
    // --------------------------------------------------------------------------
    function IntoBooleanResult(result) {
        return result === TypeExtendsResult.False ? result : TypeExtendsResult.True;
    }
    // --------------------------------------------------------------------------
    // Throw
    // --------------------------------------------------------------------------
    function Throw(message) {
        throw new TypeExtendsError(message);
    }
    // --------------------------------------------------------------------------
    // StructuralRight
    // --------------------------------------------------------------------------
    function IsStructuralRight(right) {
        // prettier-ignore
        return (TypeGuard.TNever(right) ||
            TypeGuard.TIntersect(right) ||
            TypeGuard.TUnion(right) ||
            TypeGuard.TUnknown(right) ||
            TypeGuard.TAny(right));
    }
    function StructuralRight(left, right) {
        // prettier-ignore
        return (TypeGuard.TNever(right) ? TNeverRight(left, right) :
            TypeGuard.TIntersect(right) ? TIntersectRight(left, right) :
                TypeGuard.TUnion(right) ? TUnionRight(left, right) :
                    TypeGuard.TUnknown(right) ? TUnknownRight(left, right) :
                        TypeGuard.TAny(right) ? TAnyRight(left, right) :
                            Throw('StructuralRight'));
    }
    // --------------------------------------------------------------------------
    // Any
    // --------------------------------------------------------------------------
    function TAnyRight(left, right) {
        return TypeExtendsResult.True;
    }
    function TAny(left, right) {
        // prettier-ignore
        return (TypeGuard.TIntersect(right) ? TIntersectRight(left, right) :
            (TypeGuard.TUnion(right) && right.anyOf.some((schema) => TypeGuard.TAny(schema) || TypeGuard.TUnknown(schema))) ? TypeExtendsResult.True :
                TypeGuard.TUnion(right) ? TypeExtendsResult.Union :
                    TypeGuard.TUnknown(right) ? TypeExtendsResult.True :
                        TypeGuard.TAny(right) ? TypeExtendsResult.True :
                            TypeExtendsResult.Union);
    }
    // --------------------------------------------------------------------------
    // Array
    // --------------------------------------------------------------------------
    function TArrayRight(left, right) {
        // prettier-ignore
        return (TypeGuard.TUnknown(left) ? TypeExtendsResult.False :
            TypeGuard.TAny(left) ? TypeExtendsResult.Union :
                TypeGuard.TNever(left) ? TypeExtendsResult.True :
                    TypeExtendsResult.False);
    }
    function TArray(left, right) {
        // prettier-ignore
        return (TypeGuard.TObject(right) && IsObjectArrayLike(right) ? TypeExtendsResult.True :
            IsStructuralRight(right) ? StructuralRight(left, right) :
                !TypeGuard.TArray(right) ? TypeExtendsResult.False :
                    IntoBooleanResult(Visit(left.items, right.items)));
    }
    // --------------------------------------------------------------------------
    // AsyncIterator
    // --------------------------------------------------------------------------
    function TAsyncIterator(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            !TypeGuard.TAsyncIterator(right) ? TypeExtendsResult.False :
                IntoBooleanResult(Visit(left.items, right.items)));
    }
    // --------------------------------------------------------------------------
    // BigInt
    // --------------------------------------------------------------------------
    function TBigInt(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TObject(right) ? TObjectRight(left, right) :
                TypeGuard.TRecord(right) ? TRecordRight(left, right) :
                    TypeGuard.TBigInt(right) ? TypeExtendsResult.True :
                        TypeExtendsResult.False);
    }
    // --------------------------------------------------------------------------
    // Boolean
    // --------------------------------------------------------------------------
    function TBooleanRight(left, right) {
        return TypeGuard.TLiteral(left) && ValueGuard.IsBoolean(left.const) ? TypeExtendsResult.True : TypeGuard.TBoolean(left) ? TypeExtendsResult.True : TypeExtendsResult.False;
    }
    function TBoolean(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TObject(right) ? TObjectRight(left, right) :
                TypeGuard.TRecord(right) ? TRecordRight(left, right) :
                    TypeGuard.TBoolean(right) ? TypeExtendsResult.True :
                        TypeExtendsResult.False);
    }
    // --------------------------------------------------------------------------
    // Constructor
    // --------------------------------------------------------------------------
    function TConstructor(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TObject(right) ? TObjectRight(left, right) :
                !TypeGuard.TConstructor(right) ? TypeExtendsResult.False :
                    left.parameters.length > right.parameters.length ? TypeExtendsResult.False :
                        (!left.parameters.every((schema, index) => IntoBooleanResult(Visit(right.parameters[index], schema)) === TypeExtendsResult.True)) ? TypeExtendsResult.False :
                            IntoBooleanResult(Visit(left.returns, right.returns)));
    }
    // --------------------------------------------------------------------------
    // Date
    // --------------------------------------------------------------------------
    function TDate(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TObject(right) ? TObjectRight(left, right) :
                TypeGuard.TRecord(right) ? TRecordRight(left, right) :
                    TypeGuard.TDate(right) ? TypeExtendsResult.True :
                        TypeExtendsResult.False);
    }
    // --------------------------------------------------------------------------
    // Function
    // --------------------------------------------------------------------------
    function TFunction(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TObject(right) ? TObjectRight(left, right) :
                !TypeGuard.TFunction(right) ? TypeExtendsResult.False :
                    left.parameters.length > right.parameters.length ? TypeExtendsResult.False :
                        (!left.parameters.every((schema, index) => IntoBooleanResult(Visit(right.parameters[index], schema)) === TypeExtendsResult.True)) ? TypeExtendsResult.False :
                            IntoBooleanResult(Visit(left.returns, right.returns)));
    }
    // --------------------------------------------------------------------------
    // Integer
    // --------------------------------------------------------------------------
    function TIntegerRight(left, right) {
        // prettier-ignore
        return (TypeGuard.TLiteral(left) && ValueGuard.IsNumber(left.const) ? TypeExtendsResult.True :
            TypeGuard.TNumber(left) || TypeGuard.TInteger(left) ? TypeExtendsResult.True :
                TypeExtendsResult.False);
    }
    function TInteger(left, right) {
        // prettier-ignore
        return (TypeGuard.TInteger(right) || TypeGuard.TNumber(right) ? TypeExtendsResult.True :
            IsStructuralRight(right) ? StructuralRight(left, right) :
                TypeGuard.TObject(right) ? TObjectRight(left, right) :
                    TypeGuard.TRecord(right) ? TRecordRight(left, right) :
                        TypeExtendsResult.False);
    }
    // --------------------------------------------------------------------------
    // Intersect
    // --------------------------------------------------------------------------
    function TIntersectRight(left, right) {
        // prettier-ignore
        return right.allOf.every((schema) => Visit(left, schema) === TypeExtendsResult.True)
            ? TypeExtendsResult.True
            : TypeExtendsResult.False;
    }
    function TIntersect(left, right) {
        // prettier-ignore
        return left.allOf.some((schema) => Visit(schema, right) === TypeExtendsResult.True)
            ? TypeExtendsResult.True
            : TypeExtendsResult.False;
    }
    // --------------------------------------------------------------------------
    // Iterator
    // --------------------------------------------------------------------------
    function TIterator(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            !TypeGuard.TIterator(right) ? TypeExtendsResult.False :
                IntoBooleanResult(Visit(left.items, right.items)));
    }
    // --------------------------------------------------------------------------
    // Literal
    // --------------------------------------------------------------------------
    function TLiteral(left, right) {
        // prettier-ignore
        return (TypeGuard.TLiteral(right) && right.const === left.const ? TypeExtendsResult.True :
            IsStructuralRight(right) ? StructuralRight(left, right) :
                TypeGuard.TObject(right) ? TObjectRight(left, right) :
                    TypeGuard.TRecord(right) ? TRecordRight(left, right) :
                        TypeGuard.TString(right) ? TStringRight(left, right) :
                            TypeGuard.TNumber(right) ? TNumberRight(left, right) :
                                TypeGuard.TInteger(right) ? TIntegerRight(left, right) :
                                    TypeGuard.TBoolean(right) ? TBooleanRight(left, right) :
                                        TypeExtendsResult.False);
    }
    // --------------------------------------------------------------------------
    // Never
    // --------------------------------------------------------------------------
    function TNeverRight(left, right) {
        return TypeExtendsResult.False;
    }
    function TNever(left, right) {
        return TypeExtendsResult.True;
    }
    // --------------------------------------------------------------------------
    // Not
    // --------------------------------------------------------------------------
    function UnwrapTNot(schema) {
        let [current, depth] = [schema, 0];
        while (true) {
            if (!TypeGuard.TNot(current))
                break;
            current = current.not;
            depth += 1;
        }
        return depth % 2 === 0 ? current : exports.Type.Unknown();
    }
    function TNot(left, right) {
        // TypeScript has no concept of negated types, and attempts to correctly check the negated
        // type at runtime would put TypeBox at odds with TypeScripts ability to statically infer
        // the type. Instead we unwrap to either unknown or T and continue evaluating.
        // prettier-ignore
        return (TypeGuard.TNot(left) ? Visit(UnwrapTNot(left), right) :
            TypeGuard.TNot(right) ? Visit(left, UnwrapTNot(right)) :
                Throw('Invalid fallthrough for Not'));
    }
    // --------------------------------------------------------------------------
    // Null
    // --------------------------------------------------------------------------
    function TNull(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TObject(right) ? TObjectRight(left, right) :
                TypeGuard.TRecord(right) ? TRecordRight(left, right) :
                    TypeGuard.TNull(right) ? TypeExtendsResult.True :
                        TypeExtendsResult.False);
    }
    // --------------------------------------------------------------------------
    // Number
    // --------------------------------------------------------------------------
    function TNumberRight(left, right) {
        // prettier-ignore
        return (TypeGuard.TLiteralNumber(left) ? TypeExtendsResult.True :
            TypeGuard.TNumber(left) || TypeGuard.TInteger(left) ? TypeExtendsResult.True :
                TypeExtendsResult.False);
    }
    function TNumber(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TObject(right) ? TObjectRight(left, right) :
                TypeGuard.TRecord(right) ? TRecordRight(left, right) :
                    TypeGuard.TInteger(right) || TypeGuard.TNumber(right) ? TypeExtendsResult.True :
                        TypeExtendsResult.False);
    }
    // --------------------------------------------------------------------------
    // Object
    // --------------------------------------------------------------------------
    function IsObjectPropertyCount(schema, count) {
        return Object.getOwnPropertyNames(schema.properties).length === count;
    }
    function IsObjectStringLike(schema) {
        return IsObjectArrayLike(schema);
    }
    function IsObjectSymbolLike(schema) {
        // prettier-ignore
        return IsObjectPropertyCount(schema, 0) || (IsObjectPropertyCount(schema, 1) && 'description' in schema.properties && TypeGuard.TUnion(schema.properties.description) && schema.properties.description.anyOf.length === 2 && ((TypeGuard.TString(schema.properties.description.anyOf[0]) &&
            TypeGuard.TUndefined(schema.properties.description.anyOf[1])) || (TypeGuard.TString(schema.properties.description.anyOf[1]) &&
            TypeGuard.TUndefined(schema.properties.description.anyOf[0]))));
    }
    function IsObjectNumberLike(schema) {
        return IsObjectPropertyCount(schema, 0);
    }
    function IsObjectBooleanLike(schema) {
        return IsObjectPropertyCount(schema, 0);
    }
    function IsObjectBigIntLike(schema) {
        return IsObjectPropertyCount(schema, 0);
    }
    function IsObjectDateLike(schema) {
        return IsObjectPropertyCount(schema, 0);
    }
    function IsObjectUint8ArrayLike(schema) {
        return IsObjectArrayLike(schema);
    }
    function IsObjectFunctionLike(schema) {
        const length = exports.Type.Number();
        return IsObjectPropertyCount(schema, 0) || (IsObjectPropertyCount(schema, 1) && 'length' in schema.properties && IntoBooleanResult(Visit(schema.properties['length'], length)) === TypeExtendsResult.True);
    }
    function IsObjectConstructorLike(schema) {
        return IsObjectPropertyCount(schema, 0);
    }
    function IsObjectArrayLike(schema) {
        const length = exports.Type.Number();
        return IsObjectPropertyCount(schema, 0) || (IsObjectPropertyCount(schema, 1) && 'length' in schema.properties && IntoBooleanResult(Visit(schema.properties['length'], length)) === TypeExtendsResult.True);
    }
    function IsObjectPromiseLike(schema) {
        const then = exports.Type.Function([exports.Type.Any()], exports.Type.Any());
        return IsObjectPropertyCount(schema, 0) || (IsObjectPropertyCount(schema, 1) && 'then' in schema.properties && IntoBooleanResult(Visit(schema.properties['then'], then)) === TypeExtendsResult.True);
    }
    // --------------------------------------------------------------------------
    // Property
    // --------------------------------------------------------------------------
    function Property(left, right) {
        // prettier-ignore
        return (Visit(left, right) === TypeExtendsResult.False ? TypeExtendsResult.False :
            TypeGuard.TOptional(left) && !TypeGuard.TOptional(right) ? TypeExtendsResult.False :
                TypeExtendsResult.True);
    }
    function TObjectRight(left, right) {
        // prettier-ignore
        return (TypeGuard.TUnknown(left) ? TypeExtendsResult.False :
            TypeGuard.TAny(left) ? TypeExtendsResult.Union : (TypeGuard.TNever(left) ||
                (TypeGuard.TLiteralString(left) && IsObjectStringLike(right)) ||
                (TypeGuard.TLiteralNumber(left) && IsObjectNumberLike(right)) ||
                (TypeGuard.TLiteralBoolean(left) && IsObjectBooleanLike(right)) ||
                (TypeGuard.TSymbol(left) && IsObjectSymbolLike(right)) ||
                (TypeGuard.TBigInt(left) && IsObjectBigIntLike(right)) ||
                (TypeGuard.TString(left) && IsObjectStringLike(right)) ||
                (TypeGuard.TSymbol(left) && IsObjectSymbolLike(right)) ||
                (TypeGuard.TNumber(left) && IsObjectNumberLike(right)) ||
                (TypeGuard.TInteger(left) && IsObjectNumberLike(right)) ||
                (TypeGuard.TBoolean(left) && IsObjectBooleanLike(right)) ||
                (TypeGuard.TUint8Array(left) && IsObjectUint8ArrayLike(right)) ||
                (TypeGuard.TDate(left) && IsObjectDateLike(right)) ||
                (TypeGuard.TConstructor(left) && IsObjectConstructorLike(right)) ||
                (TypeGuard.TFunction(left) && IsObjectFunctionLike(right))) ? TypeExtendsResult.True :
                (TypeGuard.TRecord(left) && TypeGuard.TString(RecordKey(left))) ? (() => {
                    // When expressing a Record with literal key values, the Record is converted into a Object with
                    // the Hint assigned as `Record`. This is used to invert the extends logic.
                    return right[exports.Hint] === 'Record' ? TypeExtendsResult.True : TypeExtendsResult.False;
                })() :
                    (TypeGuard.TRecord(left) && TypeGuard.TNumber(RecordKey(left))) ? (() => {
                        return IsObjectPropertyCount(right, 0)
                            ? TypeExtendsResult.True
                            : TypeExtendsResult.False;
                    })() :
                        TypeExtendsResult.False);
    }
    function TObject(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TRecord(right) ? TRecordRight(left, right) :
                !TypeGuard.TObject(right) ? TypeExtendsResult.False :
                    (() => {
                        for (const key of Object.getOwnPropertyNames(right.properties)) {
                            if (!(key in left.properties) && !TypeGuard.TOptional(right.properties[key])) {
                                return TypeExtendsResult.False;
                            }
                            if (TypeGuard.TOptional(right.properties[key])) {
                                return TypeExtendsResult.True;
                            }
                            if (Property(left.properties[key], right.properties[key]) === TypeExtendsResult.False) {
                                return TypeExtendsResult.False;
                            }
                        }
                        return TypeExtendsResult.True;
                    })());
    }
    // --------------------------------------------------------------------------
    // Promise
    // --------------------------------------------------------------------------
    function TPromise(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TObject(right) && IsObjectPromiseLike(right) ? TypeExtendsResult.True :
                !TypeGuard.TPromise(right) ? TypeExtendsResult.False :
                    IntoBooleanResult(Visit(left.item, right.item)));
    }
    // --------------------------------------------------------------------------
    // Record
    // --------------------------------------------------------------------------
    function RecordKey(schema) {
        // prettier-ignore
        return (exports.PatternNumberExact in schema.patternProperties ? exports.Type.Number() :
            exports.PatternStringExact in schema.patternProperties ? exports.Type.String() :
                Throw('Unknown record key pattern'));
    }
    function RecordValue(schema) {
        // prettier-ignore
        return (exports.PatternNumberExact in schema.patternProperties ? schema.patternProperties[exports.PatternNumberExact] :
            exports.PatternStringExact in schema.patternProperties ? schema.patternProperties[exports.PatternStringExact] :
                Throw('Unable to get record value schema'));
    }
    function TRecordRight(left, right) {
        const [Key, Value] = [RecordKey(right), RecordValue(right)];
        // prettier-ignore
        return ((TypeGuard.TLiteralString(left) && TypeGuard.TNumber(Key) && IntoBooleanResult(Visit(left, Value)) === TypeExtendsResult.True) ? TypeExtendsResult.True :
            TypeGuard.TUint8Array(left) && TypeGuard.TNumber(Key) ? Visit(left, Value) :
                TypeGuard.TString(left) && TypeGuard.TNumber(Key) ? Visit(left, Value) :
                    TypeGuard.TArray(left) && TypeGuard.TNumber(Key) ? Visit(left, Value) :
                        TypeGuard.TObject(left) ? (() => {
                            for (const key of Object.getOwnPropertyNames(left.properties)) {
                                if (Property(Value, left.properties[key]) === TypeExtendsResult.False) {
                                    return TypeExtendsResult.False;
                                }
                            }
                            return TypeExtendsResult.True;
                        })() :
                            TypeExtendsResult.False);
    }
    function TRecord(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TObject(right) ? TObjectRight(left, right) :
                !TypeGuard.TRecord(right) ? TypeExtendsResult.False :
                    Visit(RecordValue(left), RecordValue(right)));
    }
    // --------------------------------------------------------------------------
    // String
    // --------------------------------------------------------------------------
    function TStringRight(left, right) {
        // prettier-ignore
        return (TypeGuard.TLiteral(left) && ValueGuard.IsString(left.const) ? TypeExtendsResult.True :
            TypeGuard.TString(left) ? TypeExtendsResult.True :
                TypeExtendsResult.False);
    }
    function TString(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TObject(right) ? TObjectRight(left, right) :
                TypeGuard.TRecord(right) ? TRecordRight(left, right) :
                    TypeGuard.TString(right) ? TypeExtendsResult.True :
                        TypeExtendsResult.False);
    }
    // --------------------------------------------------------------------------
    // Symbol
    // --------------------------------------------------------------------------
    function TSymbol(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TObject(right) ? TObjectRight(left, right) :
                TypeGuard.TRecord(right) ? TRecordRight(left, right) :
                    TypeGuard.TSymbol(right) ? TypeExtendsResult.True :
                        TypeExtendsResult.False);
    }
    // --------------------------------------------------------------------------
    // TemplateLiteral
    // --------------------------------------------------------------------------
    function TTemplateLiteral(left, right) {
        // TemplateLiteral types are resolved to either unions for finite expressions or string
        // for infinite expressions. Here we call to TemplateLiteralResolver to resolve for
        // either type and continue evaluating.
        // prettier-ignore
        return (TypeGuard.TTemplateLiteral(left) ? Visit(TemplateLiteralResolver.Resolve(left), right) :
            TypeGuard.TTemplateLiteral(right) ? Visit(left, TemplateLiteralResolver.Resolve(right)) :
                Throw('Invalid fallthrough for TemplateLiteral'));
    }
    // --------------------------------------------------------------------------
    // Tuple
    // --------------------------------------------------------------------------
    function IsArrayOfTuple(left, right) {
        // prettier-ignore
        return (TypeGuard.TArray(right) &&
            left.items !== undefined &&
            left.items.every((schema) => Visit(schema, right.items) === TypeExtendsResult.True));
    }
    function TTupleRight(left, right) {
        // prettier-ignore
        return (TypeGuard.TNever(left) ? TypeExtendsResult.True :
            TypeGuard.TUnknown(left) ? TypeExtendsResult.False :
                TypeGuard.TAny(left) ? TypeExtendsResult.Union :
                    TypeExtendsResult.False);
    }
    function TTuple(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TObject(right) && IsObjectArrayLike(right) ? TypeExtendsResult.True :
                TypeGuard.TArray(right) && IsArrayOfTuple(left, right) ? TypeExtendsResult.True :
                    !TypeGuard.TTuple(right) ? TypeExtendsResult.False :
                        (ValueGuard.IsUndefined(left.items) && !ValueGuard.IsUndefined(right.items)) || (!ValueGuard.IsUndefined(left.items) && ValueGuard.IsUndefined(right.items)) ? TypeExtendsResult.False :
                            (ValueGuard.IsUndefined(left.items) && !ValueGuard.IsUndefined(right.items)) ? TypeExtendsResult.True :
                                left.items.every((schema, index) => Visit(schema, right.items[index]) === TypeExtendsResult.True) ? TypeExtendsResult.True :
                                    TypeExtendsResult.False);
    }
    // --------------------------------------------------------------------------
    // Uint8Array
    // --------------------------------------------------------------------------
    function TUint8Array(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TObject(right) ? TObjectRight(left, right) :
                TypeGuard.TRecord(right) ? TRecordRight(left, right) :
                    TypeGuard.TUint8Array(right) ? TypeExtendsResult.True :
                        TypeExtendsResult.False);
    }
    // --------------------------------------------------------------------------
    // Undefined
    // --------------------------------------------------------------------------
    function TUndefined(left, right) {
        // prettier-ignore
        return (IsStructuralRight(right) ? StructuralRight(left, right) :
            TypeGuard.TObject(right) ? TObjectRight(left, right) :
                TypeGuard.TRecord(right) ? TRecordRight(left, right) :
                    TypeGuard.TVoid(right) ? VoidRight(left, right) :
                        TypeGuard.TUndefined(right) ? TypeExtendsResult.True :
                            TypeExtendsResult.False);
    }
    // --------------------------------------------------------------------------
    // Union
    // --------------------------------------------------------------------------
    function TUnionRight(left, right) {
        // prettier-ignore
        return right.anyOf.some((schema) => Visit(left, schema) === TypeExtendsResult.True)
            ? TypeExtendsResult.True
            : TypeExtendsResult.False;
    }
    function TUnion(left, right) {
        // prettier-ignore
        return left.anyOf.every((schema) => Visit(schema, right) === TypeExtendsResult.True)
            ? TypeExtendsResult.True
            : TypeExtendsResult.False;
    }
    // --------------------------------------------------------------------------
    // Unknown
    // --------------------------------------------------------------------------
    function TUnknownRight(left, right) {
        return TypeExtendsResult.True;
    }
    function TUnknown(left, right) {
        // prettier-ignore
        return (TypeGuard.TNever(right) ? TNeverRight(left, right) :
            TypeGuard.TIntersect(right) ? TIntersectRight(left, right) :
                TypeGuard.TUnion(right) ? TUnionRight(left, right) :
                    TypeGuard.TAny(right) ? TAnyRight(left, right) :
                        TypeGuard.TString(right) ? TStringRight(left, right) :
                            TypeGuard.TNumber(right) ? TNumberRight(left, right) :
                                TypeGuard.TInteger(right) ? TIntegerRight(left, right) :
                                    TypeGuard.TBoolean(right) ? TBooleanRight(left, right) :
                                        TypeGuard.TArray(right) ? TArrayRight(left, right) :
                                            TypeGuard.TTuple(right) ? TTupleRight(left, right) :
                                                TypeGuard.TObject(right) ? TObjectRight(left, right) :
                                                    TypeGuard.TUnknown(right) ? TypeExtendsResult.True :
                                                        TypeExtendsResult.False);
    }
    // --------------------------------------------------------------------------
    // Void
    // --------------------------------------------------------------------------
    function VoidRight(left, right) {
        // prettier-ignore
        return TypeGuard.TUndefined(left) ? TypeExtendsResult.True :
            TypeGuard.TUndefined(left) ? TypeExtendsResult.True :
                TypeExtendsResult.False;
    }
    function TVoid(left, right) {
        // prettier-ignore
        return TypeGuard.TIntersect(right) ? TIntersectRight(left, right) :
            TypeGuard.TUnion(right) ? TUnionRight(left, right) :
                TypeGuard.TUnknown(right) ? TUnknownRight(left, right) :
                    TypeGuard.TAny(right) ? TAnyRight(left, right) :
                        TypeGuard.TObject(right) ? TObjectRight(left, right) :
                            TypeGuard.TVoid(right) ? TypeExtendsResult.True :
                                TypeExtendsResult.False;
    }
    function Visit(left, right) {
        // prettier-ignore
        return (
        // resolvable
        (TypeGuard.TTemplateLiteral(left) || TypeGuard.TTemplateLiteral(right)) ? TTemplateLiteral(left, right) :
            (TypeGuard.TNot(left) || TypeGuard.TNot(right)) ? TNot(left, right) :
                // standard
                TypeGuard.TAny(left) ? TAny(left, right) :
                    TypeGuard.TArray(left) ? TArray(left, right) :
                        TypeGuard.TBigInt(left) ? TBigInt(left, right) :
                            TypeGuard.TBoolean(left) ? TBoolean(left, right) :
                                TypeGuard.TAsyncIterator(left) ? TAsyncIterator(left, right) :
                                    TypeGuard.TConstructor(left) ? TConstructor(left, right) :
                                        TypeGuard.TDate(left) ? TDate(left, right) :
                                            TypeGuard.TFunction(left) ? TFunction(left, right) :
                                                TypeGuard.TInteger(left) ? TInteger(left, right) :
                                                    TypeGuard.TIntersect(left) ? TIntersect(left, right) :
                                                        TypeGuard.TIterator(left) ? TIterator(left, right) :
                                                            TypeGuard.TLiteral(left) ? TLiteral(left, right) :
                                                                TypeGuard.TNever(left) ? TNever(left, right) :
                                                                    TypeGuard.TNull(left) ? TNull(left, right) :
                                                                        TypeGuard.TNumber(left) ? TNumber(left, right) :
                                                                            TypeGuard.TObject(left) ? TObject(left, right) :
                                                                                TypeGuard.TRecord(left) ? TRecord(left, right) :
                                                                                    TypeGuard.TString(left) ? TString(left, right) :
                                                                                        TypeGuard.TSymbol(left) ? TSymbol(left, right) :
                                                                                            TypeGuard.TTuple(left) ? TTuple(left, right) :
                                                                                                TypeGuard.TPromise(left) ? TPromise(left, right) :
                                                                                                    TypeGuard.TUint8Array(left) ? TUint8Array(left, right) :
                                                                                                        TypeGuard.TUndefined(left) ? TUndefined(left, right) :
                                                                                                            TypeGuard.TUnion(left) ? TUnion(left, right) :
                                                                                                                TypeGuard.TUnknown(left) ? TUnknown(left, right) :
                                                                                                                    TypeGuard.TVoid(left) ? TVoid(left, right) :
                                                                                                                        Throw(`Unknown left type operand '${left[exports.Kind]}'`));
    }
    function Extends(left, right) {
        return Visit(left, right);
    }
    TypeExtends.Extends = Extends;
})(TypeExtends || (exports.TypeExtends = TypeExtends = {}));
// --------------------------------------------------------------------------
// TypeClone
// --------------------------------------------------------------------------
/** Specialized Clone for Types */
var TypeClone;
(function (TypeClone) {
    function ArrayType(value) {
        return value.map((value) => Visit(value));
    }
    function DateType(value) {
        return new Date(value.getTime());
    }
    function Uint8ArrayType(value) {
        return new Uint8Array(value);
    }
    function ObjectType(value) {
        const clonedProperties = Object.getOwnPropertyNames(value).reduce((acc, key) => ({ ...acc, [key]: Visit(value[key]) }), {});
        const clonedSymbols = Object.getOwnPropertySymbols(value).reduce((acc, key) => ({ ...acc, [key]: Visit(value[key]) }), {});
        return { ...clonedProperties, ...clonedSymbols };
    }
    function Visit(value) {
        // prettier-ignore
        return (ValueGuard.IsArray(value) ? ArrayType(value) :
            ValueGuard.IsDate(value) ? DateType(value) :
                ValueGuard.IsUint8Array(value) ? Uint8ArrayType(value) :
                    ValueGuard.IsObject(value) ? ObjectType(value) :
                        value);
    }
    /** Clones a Rest */
    function Rest(schemas) {
        return schemas.map((schema) => Type(schema));
    }
    TypeClone.Rest = Rest;
    /** Clones a Type */
    function Type(schema, options = {}) {
        return { ...Visit(schema), ...options };
    }
    TypeClone.Type = Type;
})(TypeClone || (exports.TypeClone = TypeClone = {}));
// --------------------------------------------------------------------------
// IndexedAccessor
// --------------------------------------------------------------------------
var IndexedAccessor;
(function (IndexedAccessor) {
    function OptionalUnwrap(schema) {
        return schema.map((schema) => {
            const { [exports.Optional]: _, ...clone } = TypeClone.Type(schema);
            return clone;
        });
    }
    function IsIntersectOptional(schema) {
        return schema.every((schema) => TypeGuard.TOptional(schema));
    }
    function IsUnionOptional(schema) {
        return schema.some((schema) => TypeGuard.TOptional(schema));
    }
    function ResolveIntersect(schema) {
        return IsIntersectOptional(schema.allOf) ? exports.Type.Optional(exports.Type.Intersect(OptionalUnwrap(schema.allOf))) : schema;
    }
    function ResolveUnion(schema) {
        return IsUnionOptional(schema.anyOf) ? exports.Type.Optional(exports.Type.Union(OptionalUnwrap(schema.anyOf))) : schema;
    }
    function ResolveOptional(schema) {
        // prettier-ignore
        return schema[exports.Kind] === 'Intersect' ? ResolveIntersect(schema) :
            schema[exports.Kind] === 'Union' ? ResolveUnion(schema) :
                schema;
    }
    function TIntersect(schema, key) {
        const resolved = schema.allOf.reduce((acc, schema) => {
            const indexed = Visit(schema, key);
            return indexed[exports.Kind] === 'Never' ? acc : [...acc, indexed];
        }, []);
        return ResolveOptional(exports.Type.Intersect(resolved));
    }
    function TUnion(schema, key) {
        const resolved = schema.anyOf.map((schema) => Visit(schema, key));
        return ResolveOptional(exports.Type.Union(resolved));
    }
    function TObject(schema, key) {
        const property = schema.properties[key];
        return ValueGuard.IsUndefined(property) ? exports.Type.Never() : exports.Type.Union([property]);
    }
    function TTuple(schema, key) {
        const items = schema.items;
        if (ValueGuard.IsUndefined(items))
            return exports.Type.Never();
        const element = items[key]; //
        if (ValueGuard.IsUndefined(element))
            return exports.Type.Never();
        return element;
    }
    function Visit(schema, key) {
        // prettier-ignore
        return schema[exports.Kind] === 'Intersect' ? TIntersect(schema, key) :
            schema[exports.Kind] === 'Union' ? TUnion(schema, key) :
                schema[exports.Kind] === 'Object' ? TObject(schema, key) :
                    schema[exports.Kind] === 'Tuple' ? TTuple(schema, key) :
                        exports.Type.Never();
    }
    function Resolve(schema, keys, options = {}) {
        const resolved = keys.map((key) => Visit(schema, key.toString()));
        return ResolveOptional(exports.Type.Union(resolved, options));
    }
    IndexedAccessor.Resolve = Resolve;
})(IndexedAccessor || (exports.IndexedAccessor = IndexedAccessor = {}));
// --------------------------------------------------------------------------
// Intrinsic
// --------------------------------------------------------------------------
var Intrinsic;
(function (Intrinsic) {
    function Uncapitalize(value) {
        const [first, rest] = [value.slice(0, 1), value.slice(1)];
        return `${first.toLowerCase()}${rest}`;
    }
    function Capitalize(value) {
        const [first, rest] = [value.slice(0, 1), value.slice(1)];
        return `${first.toUpperCase()}${rest}`;
    }
    function Uppercase(value) {
        return value.toUpperCase();
    }
    function Lowercase(value) {
        return value.toLowerCase();
    }
    function IntrinsicTemplateLiteral(schema, mode) {
        // note: template literals require special runtime handling as they are encoded in string patterns.
        // This diverges from the mapped type which would otherwise map on the template literal kind.
        const expression = TemplateLiteralParser.ParseExact(schema.pattern);
        const finite = TemplateLiteralFinite.Check(expression);
        if (!finite)
            return { ...schema, pattern: IntrinsicLiteral(schema.pattern, mode) };
        const strings = [...TemplateLiteralGenerator.Generate(expression)];
        const literals = strings.map((value) => exports.Type.Literal(value));
        const mapped = IntrinsicRest(literals, mode);
        const union = exports.Type.Union(mapped);
        return exports.Type.TemplateLiteral([union]);
    }
    function IntrinsicLiteral(value, mode) {
        // prettier-ignore
        return typeof value === 'string' ? (mode === 'Uncapitalize' ? Uncapitalize(value) :
            mode === 'Capitalize' ? Capitalize(value) :
                mode === 'Uppercase' ? Uppercase(value) :
                    mode === 'Lowercase' ? Lowercase(value) :
                        value) : value.toString();
    }
    function IntrinsicRest(schema, mode) {
        if (schema.length === 0)
            return [];
        const [L, ...R] = schema;
        return [Map(L, mode), ...IntrinsicRest(R, mode)];
    }
    function Visit(schema, mode) {
        // prettier-ignore
        return TypeGuard.TTemplateLiteral(schema) ? IntrinsicTemplateLiteral(schema, mode) :
            TypeGuard.TUnion(schema) ? exports.Type.Union(IntrinsicRest(schema.anyOf, mode)) :
                TypeGuard.TLiteral(schema) ? exports.Type.Literal(IntrinsicLiteral(schema.const, mode)) :
                    schema;
    }
    /** Applies an intrinsic string manipulation to the given type. */
    function Map(schema, mode) {
        return Visit(schema, mode);
    }
    Intrinsic.Map = Map;
})(Intrinsic || (exports.Intrinsic = Intrinsic = {}));
// --------------------------------------------------------------------------
// ObjectMap
// --------------------------------------------------------------------------
var ObjectMap;
(function (ObjectMap) {
    function TIntersect(schema, callback) {
        // prettier-ignore
        return exports.Type.Intersect(schema.allOf.map((inner) => Visit(inner, callback)), { ...schema });
    }
    function TUnion(schema, callback) {
        // prettier-ignore
        return exports.Type.Union(schema.anyOf.map((inner) => Visit(inner, callback)), { ...schema });
    }
    function TObject(schema, callback) {
        return callback(schema);
    }
    function Visit(schema, callback) {
        // There are cases where users need to map objects with unregistered kinds. Using a TypeGuard here would
        // prevent sub schema mapping as unregistered kinds will not pass TSchema checks. This is notable in the
        // case of TObject where unregistered property kinds cause the TObject check to fail. As mapping is only
        // used for composition, we use explicit checks instead.
        // prettier-ignore
        return (schema[exports.Kind] === 'Intersect' ? TIntersect(schema, callback) :
            schema[exports.Kind] === 'Union' ? TUnion(schema, callback) :
                schema[exports.Kind] === 'Object' ? TObject(schema, callback) :
                    schema);
    }
    function Map(schema, callback, options) {
        return { ...Visit(TypeClone.Type(schema), callback), ...options };
    }
    ObjectMap.Map = Map;
})(ObjectMap || (exports.ObjectMap = ObjectMap = {}));
var KeyResolver;
(function (KeyResolver) {
    function UnwrapPattern(key) {
        return key[0] === '^' && key[key.length - 1] === '$' ? key.slice(1, key.length - 1) : key;
    }
    function TIntersect(schema, options) {
        return schema.allOf.reduce((acc, schema) => [...acc, ...Visit(schema, options)], []);
    }
    function TUnion(schema, options) {
        const sets = schema.anyOf.map((inner) => Visit(inner, options));
        return [...sets.reduce((set, outer) => outer.map((key) => (sets.every((inner) => inner.includes(key)) ? set.add(key) : set))[0], new Set())];
    }
    function TObject(schema, options) {
        return Object.getOwnPropertyNames(schema.properties);
    }
    function TRecord(schema, options) {
        return options.includePatterns ? Object.getOwnPropertyNames(schema.patternProperties) : [];
    }
    function Visit(schema, options) {
        // prettier-ignore
        return (TypeGuard.TIntersect(schema) ? TIntersect(schema, options) :
            TypeGuard.TUnion(schema) ? TUnion(schema, options) :
                TypeGuard.TObject(schema) ? TObject(schema, options) :
                    TypeGuard.TRecord(schema) ? TRecord(schema, options) :
                        []);
    }
    /** Resolves an array of keys in this schema */
    function ResolveKeys(schema, options) {
        return [...new Set(Visit(schema, options))];
    }
    KeyResolver.ResolveKeys = ResolveKeys;
    /** Resolves a regular expression pattern matching all keys in this schema */
    function ResolvePattern(schema) {
        const keys = ResolveKeys(schema, { includePatterns: true });
        const pattern = keys.map((key) => `(${UnwrapPattern(key)})`);
        return `^(${pattern.join('|')})$`;
    }
    KeyResolver.ResolvePattern = ResolvePattern;
})(KeyResolver || (exports.KeyResolver = KeyResolver = {}));
// --------------------------------------------------------------------------
// KeyArrayResolver
// --------------------------------------------------------------------------
class KeyArrayResolverError extends TypeBoxError {
}
exports.KeyArrayResolverError = KeyArrayResolverError;
var KeyArrayResolver;
(function (KeyArrayResolver) {
    /** Resolves an array of string[] keys from the given schema or array type. */
    function Resolve(schema) {
        // prettier-ignore
        return Array.isArray(schema) ? schema :
            TypeGuard.TUnionLiteral(schema) ? schema.anyOf.map((schema) => schema.const.toString()) :
                TypeGuard.TLiteral(schema) ? [schema.const] :
                    TypeGuard.TTemplateLiteral(schema) ? (() => {
                        const expression = TemplateLiteralParser.ParseExact(schema.pattern);
                        if (!TemplateLiteralFinite.Check(expression))
                            throw new KeyArrayResolverError('Cannot resolve keys from infinite template expression');
                        return [...TemplateLiteralGenerator.Generate(expression)];
                    })() : [];
    }
    KeyArrayResolver.Resolve = Resolve;
})(KeyArrayResolver || (exports.KeyArrayResolver = KeyArrayResolver = {}));
// --------------------------------------------------------------------------
// UnionResolver
// --------------------------------------------------------------------------
var UnionResolver;
(function (UnionResolver) {
    function* TUnion(union) {
        for (const schema of union.anyOf) {
            if (schema[exports.Kind] === 'Union') {
                yield* TUnion(schema);
            }
            else {
                yield schema;
            }
        }
    }
    /** Returns a resolved union with interior unions flattened */
    function Resolve(union) {
        return exports.Type.Union([...TUnion(union)], { ...union });
    }
    UnionResolver.Resolve = Resolve;
})(UnionResolver || (exports.UnionResolver = UnionResolver = {}));
// --------------------------------------------------------------------------
// TemplateLiteralPattern
// --------------------------------------------------------------------------
class TemplateLiteralPatternError extends TypeBoxError {
}
exports.TemplateLiteralPatternError = TemplateLiteralPatternError;
var TemplateLiteralPattern;
(function (TemplateLiteralPattern) {
    function Throw(message) {
        throw new TemplateLiteralPatternError(message);
    }
    function Escape(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function Visit(schema, acc) {
        // prettier-ignore
        return (TypeGuard.TTemplateLiteral(schema) ? schema.pattern.slice(1, schema.pattern.length - 1) :
            TypeGuard.TUnion(schema) ? `(${schema.anyOf.map((schema) => Visit(schema, acc)).join('|')})` :
                TypeGuard.TNumber(schema) ? `${acc}${exports.PatternNumber}` :
                    TypeGuard.TInteger(schema) ? `${acc}${exports.PatternNumber}` :
                        TypeGuard.TBigInt(schema) ? `${acc}${exports.PatternNumber}` :
                            TypeGuard.TString(schema) ? `${acc}${exports.PatternString}` :
                                TypeGuard.TLiteral(schema) ? `${acc}${Escape(schema.const.toString())}` :
                                    TypeGuard.TBoolean(schema) ? `${acc}${exports.PatternBoolean}` :
                                        Throw(`Unexpected Kind '${schema[exports.Kind]}'`));
    }
    function Create(kinds) {
        return `^${kinds.map((schema) => Visit(schema, '')).join('')}\$`;
    }
    TemplateLiteralPattern.Create = Create;
})(TemplateLiteralPattern || (exports.TemplateLiteralPattern = TemplateLiteralPattern = {}));
// --------------------------------------------------------------------------------------
// TemplateLiteralResolver
// --------------------------------------------------------------------------------------
var TemplateLiteralResolver;
(function (TemplateLiteralResolver) {
    /** Resolves a template literal as a TUnion */
    function Resolve(template) {
        const expression = TemplateLiteralParser.ParseExact(template.pattern);
        if (!TemplateLiteralFinite.Check(expression))
            return exports.Type.String();
        const literals = [...TemplateLiteralGenerator.Generate(expression)].map((value) => exports.Type.Literal(value));
        return exports.Type.Union(literals);
    }
    TemplateLiteralResolver.Resolve = Resolve;
})(TemplateLiteralResolver || (exports.TemplateLiteralResolver = TemplateLiteralResolver = {}));
// --------------------------------------------------------------------------------------
// TemplateLiteralParser
// --------------------------------------------------------------------------------------
class TemplateLiteralParserError extends TypeBoxError {
}
exports.TemplateLiteralParserError = TemplateLiteralParserError;
var TemplateLiteralParser;
(function (TemplateLiteralParser) {
    function IsNonEscaped(pattern, index, char) {
        return pattern[index] === char && pattern.charCodeAt(index - 1) !== 92;
    }
    function IsOpenParen(pattern, index) {
        return IsNonEscaped(pattern, index, '(');
    }
    function IsCloseParen(pattern, index) {
        return IsNonEscaped(pattern, index, ')');
    }
    function IsSeparator(pattern, index) {
        return IsNonEscaped(pattern, index, '|');
    }
    function IsGroup(pattern) {
        if (!(IsOpenParen(pattern, 0) && IsCloseParen(pattern, pattern.length - 1)))
            return false;
        let count = 0;
        for (let index = 0; index < pattern.length; index++) {
            if (IsOpenParen(pattern, index))
                count += 1;
            if (IsCloseParen(pattern, index))
                count -= 1;
            if (count === 0 && index !== pattern.length - 1)
                return false;
        }
        return true;
    }
    function InGroup(pattern) {
        return pattern.slice(1, pattern.length - 1);
    }
    function IsPrecedenceOr(pattern) {
        let count = 0;
        for (let index = 0; index < pattern.length; index++) {
            if (IsOpenParen(pattern, index))
                count += 1;
            if (IsCloseParen(pattern, index))
                count -= 1;
            if (IsSeparator(pattern, index) && count === 0)
                return true;
        }
        return false;
    }
    function IsPrecedenceAnd(pattern) {
        for (let index = 0; index < pattern.length; index++) {
            if (IsOpenParen(pattern, index))
                return true;
        }
        return false;
    }
    function Or(pattern) {
        let [count, start] = [0, 0];
        const expressions = [];
        for (let index = 0; index < pattern.length; index++) {
            if (IsOpenParen(pattern, index))
                count += 1;
            if (IsCloseParen(pattern, index))
                count -= 1;
            if (IsSeparator(pattern, index) && count === 0) {
                const range = pattern.slice(start, index);
                if (range.length > 0)
                    expressions.push(Parse(range));
                start = index + 1;
            }
        }
        const range = pattern.slice(start);
        if (range.length > 0)
            expressions.push(Parse(range));
        if (expressions.length === 0)
            return { type: 'const', const: '' };
        if (expressions.length === 1)
            return expressions[0];
        return { type: 'or', expr: expressions };
    }
    function And(pattern) {
        function Group(value, index) {
            if (!IsOpenParen(value, index))
                throw new TemplateLiteralParserError(`TemplateLiteralParser: Index must point to open parens`);
            let count = 0;
            for (let scan = index; scan < value.length; scan++) {
                if (IsOpenParen(value, scan))
                    count += 1;
                if (IsCloseParen(value, scan))
                    count -= 1;
                if (count === 0)
                    return [index, scan];
            }
            throw new TemplateLiteralParserError(`TemplateLiteralParser: Unclosed group parens in expression`);
        }
        function Range(pattern, index) {
            for (let scan = index; scan < pattern.length; scan++) {
                if (IsOpenParen(pattern, scan))
                    return [index, scan];
            }
            return [index, pattern.length];
        }
        const expressions = [];
        for (let index = 0; index < pattern.length; index++) {
            if (IsOpenParen(pattern, index)) {
                const [start, end] = Group(pattern, index);
                const range = pattern.slice(start, end + 1);
                expressions.push(Parse(range));
                index = end;
            }
            else {
                const [start, end] = Range(pattern, index);
                const range = pattern.slice(start, end);
                if (range.length > 0)
                    expressions.push(Parse(range));
                index = end - 1;
            }
        }
        // prettier-ignore
        return (expressions.length === 0) ? { type: 'const', const: '' } :
            (expressions.length === 1) ? expressions[0] :
                { type: 'and', expr: expressions };
    }
    /** Parses a pattern and returns an expression tree */
    function Parse(pattern) {
        // prettier-ignore
        return IsGroup(pattern) ? Parse(InGroup(pattern)) :
            IsPrecedenceOr(pattern) ? Or(pattern) :
                IsPrecedenceAnd(pattern) ? And(pattern) :
                    { type: 'const', const: pattern };
    }
    TemplateLiteralParser.Parse = Parse;
    /** Parses a pattern and strips forward and trailing ^ and $ */
    function ParseExact(pattern) {
        return Parse(pattern.slice(1, pattern.length - 1));
    }
    TemplateLiteralParser.ParseExact = ParseExact;
})(TemplateLiteralParser || (exports.TemplateLiteralParser = TemplateLiteralParser = {}));
// --------------------------------------------------------------------------------------
// TemplateLiteralFinite
// --------------------------------------------------------------------------------------
class TemplateLiteralFiniteError extends TypeBoxError {
}
exports.TemplateLiteralFiniteError = TemplateLiteralFiniteError;
var TemplateLiteralFinite;
(function (TemplateLiteralFinite) {
    function Throw(message) {
        throw new TemplateLiteralFiniteError(message);
    }
    function IsNumber(expression) {
        // prettier-ignore
        return (expression.type === 'or' &&
            expression.expr.length === 2 &&
            expression.expr[0].type === 'const' &&
            expression.expr[0].const === '0' &&
            expression.expr[1].type === 'const' &&
            expression.expr[1].const === '[1-9][0-9]*');
    }
    function IsBoolean(expression) {
        // prettier-ignore
        return (expression.type === 'or' &&
            expression.expr.length === 2 &&
            expression.expr[0].type === 'const' &&
            expression.expr[0].const === 'true' &&
            expression.expr[1].type === 'const' &&
            expression.expr[1].const === 'false');
    }
    function IsString(expression) {
        return expression.type === 'const' && expression.const === '.*';
    }
    function Check(expression) {
        // prettier-ignore
        return IsBoolean(expression) ? true :
            IsNumber(expression) || IsString(expression) ? false :
                (expression.type === 'and') ? expression.expr.every((expr) => Check(expr)) :
                    (expression.type === 'or') ? expression.expr.every((expr) => Check(expr)) :
                        (expression.type === 'const') ? true :
                            Throw(`Unknown expression type`);
    }
    TemplateLiteralFinite.Check = Check;
})(TemplateLiteralFinite || (exports.TemplateLiteralFinite = TemplateLiteralFinite = {}));
// --------------------------------------------------------------------------------------
// TemplateLiteralGenerator
// --------------------------------------------------------------------------------------
class TemplateLiteralGeneratorError extends TypeBoxError {
}
exports.TemplateLiteralGeneratorError = TemplateLiteralGeneratorError;
var TemplateLiteralGenerator;
(function (TemplateLiteralGenerator) {
    function* Reduce(buffer) {
        if (buffer.length === 1)
            return yield* buffer[0];
        for (const left of buffer[0]) {
            for (const right of Reduce(buffer.slice(1))) {
                yield `${left}${right}`;
            }
        }
    }
    function* And(expression) {
        return yield* Reduce(expression.expr.map((expr) => [...Generate(expr)]));
    }
    function* Or(expression) {
        for (const expr of expression.expr)
            yield* Generate(expr);
    }
    function* Const(expression) {
        return yield expression.const;
    }
    function* Generate(expression) {
        // prettier-ignore
        return (expression.type === 'and' ? yield* And(expression) :
            expression.type === 'or' ? yield* Or(expression) :
                expression.type === 'const' ? yield* Const(expression) :
                    (() => { throw new TemplateLiteralGeneratorError('Unknown expression'); })());
    }
    TemplateLiteralGenerator.Generate = Generate;
})(TemplateLiteralGenerator || (exports.TemplateLiteralGenerator = TemplateLiteralGenerator = {}));
// ---------------------------------------------------------------------
// TemplateLiteralDslParser
// ---------------------------------------------------------------------
var TemplateLiteralDslParser;
(function (TemplateLiteralDslParser) {
    function* ParseUnion(template) {
        const trim = template.trim().replace(/"|'/g, '');
        // prettier-ignore
        return (trim === 'boolean' ? yield exports.Type.Boolean() :
            trim === 'number' ? yield exports.Type.Number() :
                trim === 'bigint' ? yield exports.Type.BigInt() :
                    trim === 'string' ? yield exports.Type.String() :
                        yield (() => {
                            const literals = trim.split('|').map((literal) => exports.Type.Literal(literal.trim()));
                            return (literals.length === 0 ? exports.Type.Never() :
                                literals.length === 1 ? literals[0] :
                                    exports.Type.Union(literals));
                        })());
    }
    function* ParseTerminal(template) {
        if (template[1] !== '{') {
            const L = exports.Type.Literal('$');
            const R = ParseLiteral(template.slice(1));
            return yield* [L, ...R];
        }
        for (let i = 2; i < template.length; i++) {
            if (template[i] === '}') {
                const L = ParseUnion(template.slice(2, i));
                const R = ParseLiteral(template.slice(i + 1));
                return yield* [...L, ...R];
            }
        }
        yield exports.Type.Literal(template);
    }
    function* ParseLiteral(template) {
        for (let i = 0; i < template.length; i++) {
            if (template[i] === '$') {
                const L = exports.Type.Literal(template.slice(0, i));
                const R = ParseTerminal(template.slice(i));
                return yield* [L, ...R];
            }
        }
        yield exports.Type.Literal(template);
    }
    function Parse(template_dsl) {
        return [...ParseLiteral(template_dsl)];
    }
    TemplateLiteralDslParser.Parse = Parse;
})(TemplateLiteralDslParser || (exports.TemplateLiteralDslParser = TemplateLiteralDslParser = {}));
// ---------------------------------------------------------------------
// TransformBuilder
// ---------------------------------------------------------------------
class TransformDecodeBuilder {
    constructor(schema) {
        this.schema = schema;
    }
    Decode(decode) {
        return new TransformEncodeBuilder(this.schema, decode);
    }
}
exports.TransformDecodeBuilder = TransformDecodeBuilder;
class TransformEncodeBuilder {
    constructor(schema, decode) {
        this.schema = schema;
        this.decode = decode;
    }
    Encode(encode) {
        const schema = TypeClone.Type(this.schema);
        // prettier-ignore
        return (TypeGuard.TTransform(schema) ? (() => {
            const Encode = (value) => schema[exports.Transform].Encode(encode(value));
            const Decode = (value) => this.decode(schema[exports.Transform].Decode(value));
            const Codec = { Encode: Encode, Decode: Decode };
            return { ...schema, [exports.Transform]: Codec };
        })() : (() => {
            const Codec = { Decode: this.decode, Encode: encode };
            return { ...schema, [exports.Transform]: Codec };
        })());
    }
}
exports.TransformEncodeBuilder = TransformEncodeBuilder;
// --------------------------------------------------------------------------
// TypeOrdinal: Used for auto $id generation
// --------------------------------------------------------------------------
let TypeOrdinal = 0;
// --------------------------------------------------------------------------
// TypeBuilder
// --------------------------------------------------------------------------
class TypeBuilderError extends TypeBoxError {
}
exports.TypeBuilderError = TypeBuilderError;
class TypeBuilder {
    /** `[Internal]` Creates a schema without `static` and `params` types */
    Create(schema) {
        return schema;
    }
    /** `[Internal]` Throws a TypeBuilder error with the given message */
    Throw(message) {
        throw new TypeBuilderError(message);
    }
    /** `[Internal]` Discards property keys from the given record type */
    Discard(record, keys) {
        return keys.reduce((acc, key) => {
            const { [key]: _, ...rest } = acc;
            return rest;
        }, record);
    }
    /** `[Json]` Omits compositing symbols from this schema */
    Strict(schema) {
        return JSON.parse(JSON.stringify(schema));
    }
}
exports.TypeBuilder = TypeBuilder;
// --------------------------------------------------------------------------
// JsonTypeBuilder
// --------------------------------------------------------------------------
class JsonTypeBuilder extends TypeBuilder {
    // ------------------------------------------------------------------------
    // Modifiers
    // ------------------------------------------------------------------------
    /** `[Json]` Creates a Readonly and Optional property */
    ReadonlyOptional(schema) {
        return this.Readonly(this.Optional(schema));
    }
    /** `[Json]` Creates a Readonly property */
    Readonly(schema) {
        return { ...TypeClone.Type(schema), [exports.Readonly]: 'Readonly' };
    }
    /** `[Json]` Creates an Optional property */
    Optional(schema) {
        return { ...TypeClone.Type(schema), [exports.Optional]: 'Optional' };
    }
    // ------------------------------------------------------------------------
    // Types
    // ------------------------------------------------------------------------
    /** `[Json]` Creates an Any type */
    Any(options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Any' });
    }
    /** `[Json]` Creates an Array type */
    Array(schema, options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Array', type: 'array', items: TypeClone.Type(schema) });
    }
    /** `[Json]` Creates a Boolean type */
    Boolean(options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Boolean', type: 'boolean' });
    }
    /** `[Json]` Intrinsic function to Capitalize LiteralString types */
    Capitalize(schema, options = {}) {
        return { ...Intrinsic.Map(TypeClone.Type(schema), 'Capitalize'), ...options };
    }
    /** `[Json]` Creates a Composite object type */
    Composite(objects, options) {
        const intersect = exports.Type.Intersect(objects, {});
        const keys = KeyResolver.ResolveKeys(intersect, { includePatterns: false });
        const properties = keys.reduce((acc, key) => ({ ...acc, [key]: exports.Type.Index(intersect, [key]) }), {});
        return exports.Type.Object(properties, options);
    }
    /** `[Json]` Creates a Enum type */
    Enum(item, options = {}) {
        if (ValueGuard.IsUndefined(item))
            return this.Throw('Enum undefined or empty');
        // prettier-ignore
        const values1 = Object.getOwnPropertyNames(item).filter((key) => isNaN(key)).map((key) => item[key]);
        const values2 = [...new Set(values1)];
        const anyOf = values2.map((value) => exports.Type.Literal(value));
        return this.Union(anyOf, { ...options, [exports.Hint]: 'Enum' });
    }
    /** `[Json]` Creates a Conditional type */
    Extends(left, right, trueType, falseType, options = {}) {
        switch (TypeExtends.Extends(left, right)) {
            case TypeExtendsResult.Union:
                return this.Union([TypeClone.Type(trueType, options), TypeClone.Type(falseType, options)]);
            case TypeExtendsResult.True:
                return TypeClone.Type(trueType, options);
            case TypeExtendsResult.False:
                return TypeClone.Type(falseType, options);
        }
    }
    /** `[Json]` Constructs a type by excluding from unionType all union members that are assignable to excludedMembers */
    Exclude(unionType, excludedMembers, options = {}) {
        // prettier-ignore
        return (TypeGuard.TTemplateLiteral(unionType) ? this.Exclude(TemplateLiteralResolver.Resolve(unionType), excludedMembers, options) :
            TypeGuard.TTemplateLiteral(excludedMembers) ? this.Exclude(unionType, TemplateLiteralResolver.Resolve(excludedMembers), options) :
                TypeGuard.TUnion(unionType) ? (() => {
                    const narrowed = unionType.anyOf.filter((inner) => TypeExtends.Extends(inner, excludedMembers) === TypeExtendsResult.False);
                    return (narrowed.length === 1 ? TypeClone.Type(narrowed[0], options) : this.Union(narrowed, options));
                })() :
                    TypeExtends.Extends(unionType, excludedMembers) !== TypeExtendsResult.False ? this.Never(options) :
                        TypeClone.Type(unionType, options));
    }
    /** `[Json]` Constructs a type by extracting from type all union members that are assignable to union */
    Extract(type, union, options = {}) {
        // prettier-ignore
        return (TypeGuard.TTemplateLiteral(type) ? this.Extract(TemplateLiteralResolver.Resolve(type), union, options) :
            TypeGuard.TTemplateLiteral(union) ? this.Extract(type, TemplateLiteralResolver.Resolve(union), options) :
                TypeGuard.TUnion(type) ? (() => {
                    const narrowed = type.anyOf.filter((inner) => TypeExtends.Extends(inner, union) !== TypeExtendsResult.False);
                    return (narrowed.length === 1 ? TypeClone.Type(narrowed[0], options) : this.Union(narrowed, options));
                })() :
                    TypeExtends.Extends(type, union) !== TypeExtendsResult.False ? TypeClone.Type(type, options) :
                        this.Never(options));
    }
    /** `[Json]` Returns an Indexed property type for the given keys */
    Index(schema, unresolved, options = {}) {
        // prettier-ignore
        return (TypeGuard.TArray(schema) && TypeGuard.TNumber(unresolved) ? (() => {
            return TypeClone.Type(schema.items, options);
        })() :
            TypeGuard.TTuple(schema) && TypeGuard.TNumber(unresolved) ? (() => {
                const items = ValueGuard.IsUndefined(schema.items) ? [] : schema.items;
                const cloned = items.map((schema) => TypeClone.Type(schema));
                return this.Union(cloned, options);
            })() : (() => {
                const keys = KeyArrayResolver.Resolve(unresolved);
                const clone = TypeClone.Type(schema);
                return IndexedAccessor.Resolve(clone, keys, options);
            })());
    }
    /** `[Json]` Creates an Integer type */
    Integer(options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Integer', type: 'integer' });
    }
    /** `[Json]` Creates an Intersect type */
    Intersect(allOf, options = {}) {
        if (allOf.length === 0)
            return exports.Type.Never();
        if (allOf.length === 1)
            return TypeClone.Type(allOf[0], options);
        if (allOf.some((schema) => TypeGuard.TTransform(schema)))
            this.Throw('Cannot intersect transform types');
        const objects = allOf.every((schema) => TypeGuard.TObject(schema));
        const cloned = TypeClone.Rest(allOf);
        // prettier-ignore
        const clonedUnevaluatedProperties = TypeGuard.TSchema(options.unevaluatedProperties)
            ? { unevaluatedProperties: TypeClone.Type(options.unevaluatedProperties) }
            : {};
        return options.unevaluatedProperties === false || TypeGuard.TSchema(options.unevaluatedProperties) || objects
            ? this.Create({ ...options, ...clonedUnevaluatedProperties, [exports.Kind]: 'Intersect', type: 'object', allOf: cloned })
            : this.Create({ ...options, ...clonedUnevaluatedProperties, [exports.Kind]: 'Intersect', allOf: cloned });
    }
    /** `[Json]` Creates a KeyOf type */
    KeyOf(schema, options = {}) {
        // prettier-ignore
        return (TypeGuard.TRecord(schema) ? (() => {
            const pattern = Object.getOwnPropertyNames(schema.patternProperties)[0];
            return (pattern === exports.PatternNumberExact ? this.Number(options) :
                pattern === exports.PatternStringExact ? this.String(options) :
                    this.Throw('Unable to resolve key type from Record key pattern'));
        })() :
            TypeGuard.TTuple(schema) ? (() => {
                const items = ValueGuard.IsUndefined(schema.items) ? [] : schema.items;
                const literals = items.map((_, index) => exports.Type.Literal(index.toString()));
                return this.Union(literals, options);
            })() :
                TypeGuard.TArray(schema) ? (() => {
                    return this.Number(options);
                })() : (() => {
                    const keys = KeyResolver.ResolveKeys(schema, { includePatterns: false });
                    if (keys.length === 0)
                        return this.Never(options);
                    const literals = keys.map((key) => this.Literal(key));
                    return this.Union(literals, options);
                })());
    }
    /** `[Json]` Creates a Literal type */
    Literal(value, options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Literal', const: value, type: typeof value });
    }
    /** `[Json]` Intrinsic function to Lowercase LiteralString types */
    Lowercase(schema, options = {}) {
        return { ...Intrinsic.Map(TypeClone.Type(schema), 'Lowercase'), ...options };
    }
    /** `[Json]` Creates a Never type */
    Never(options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Never', not: {} });
    }
    /** `[Json]` Creates a Not type */
    Not(schema, options) {
        return this.Create({ ...options, [exports.Kind]: 'Not', not: TypeClone.Type(schema) });
    }
    /** `[Json]` Creates a Null type */
    Null(options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Null', type: 'null' });
    }
    /** `[Json]` Creates a Number type */
    Number(options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Number', type: 'number' });
    }
    /** `[Json]` Creates an Object type */
    Object(properties, options = {}) {
        const propertyKeys = Object.getOwnPropertyNames(properties);
        const optionalKeys = propertyKeys.filter((key) => TypeGuard.TOptional(properties[key]));
        const requiredKeys = propertyKeys.filter((name) => !optionalKeys.includes(name));
        const clonedAdditionalProperties = TypeGuard.TSchema(options.additionalProperties) ? { additionalProperties: TypeClone.Type(options.additionalProperties) } : {};
        const clonedProperties = propertyKeys.reduce((acc, key) => ({ ...acc, [key]: TypeClone.Type(properties[key]) }), {});
        return requiredKeys.length > 0
            ? this.Create({ ...options, ...clonedAdditionalProperties, [exports.Kind]: 'Object', type: 'object', properties: clonedProperties, required: requiredKeys })
            : this.Create({ ...options, ...clonedAdditionalProperties, [exports.Kind]: 'Object', type: 'object', properties: clonedProperties });
    }
    /** `[Json]` Constructs a type whose keys are omitted from the given type */
    Omit(schema, unresolved, options = {}) {
        const keys = KeyArrayResolver.Resolve(unresolved);
        // prettier-ignore
        return ObjectMap.Map(this.Discard(TypeClone.Type(schema), ['$id', exports.Transform]), (object) => {
            if (ValueGuard.IsArray(object.required)) {
                object.required = object.required.filter((key) => !keys.includes(key));
                if (object.required.length === 0)
                    delete object.required;
            }
            for (const key of Object.getOwnPropertyNames(object.properties)) {
                if (keys.includes(key))
                    delete object.properties[key];
            }
            return this.Create(object);
        }, options);
    }
    /** `[Json]` Constructs a type where all properties are optional */
    Partial(schema, options = {}) {
        // prettier-ignore
        return ObjectMap.Map(this.Discard(TypeClone.Type(schema), ['$id', exports.Transform]), (object) => {
            const properties = Object.getOwnPropertyNames(object.properties).reduce((acc, key) => {
                return { ...acc, [key]: this.Optional(object.properties[key]) };
            }, {});
            return this.Object(properties, this.Discard(object, ['required']) /* object used as options to retain other constraints */);
        }, options);
    }
    /** `[Json]` Constructs a type whose keys are picked from the given type */
    Pick(schema, unresolved, options = {}) {
        const keys = KeyArrayResolver.Resolve(unresolved);
        // prettier-ignore
        return ObjectMap.Map(this.Discard(TypeClone.Type(schema), ['$id', exports.Transform]), (object) => {
            if (ValueGuard.IsArray(object.required)) {
                object.required = object.required.filter((key) => keys.includes(key));
                if (object.required.length === 0)
                    delete object.required;
            }
            for (const key of Object.getOwnPropertyNames(object.properties)) {
                if (!keys.includes(key))
                    delete object.properties[key];
            }
            return this.Create(object);
        }, options);
    }
    /** `[Json]` Creates a Record type */
    Record(key, schema, options = {}) {
        // prettier-ignore
        return (TypeGuard.TTemplateLiteral(key) ? (() => {
            const expression = TemplateLiteralParser.ParseExact(key.pattern);
            // prettier-ignore
            return TemplateLiteralFinite.Check(expression)
                ? (this.Object([...TemplateLiteralGenerator.Generate(expression)].reduce((acc, key) => ({ ...acc, [key]: TypeClone.Type(schema) }), {}), options))
                : this.Create({ ...options, [exports.Kind]: 'Record', type: 'object', patternProperties: { [key.pattern]: TypeClone.Type(schema) } });
        })() :
            TypeGuard.TUnion(key) ? (() => {
                const union = UnionResolver.Resolve(key);
                if (TypeGuard.TUnionLiteral(union)) {
                    const properties = union.anyOf.reduce((acc, literal) => ({ ...acc, [literal.const]: TypeClone.Type(schema) }), {});
                    return this.Object(properties, { ...options, [exports.Hint]: 'Record' });
                }
                else
                    this.Throw('Record key of type union contains non-literal types');
            })() :
                TypeGuard.TLiteral(key) ? (() => {
                    // prettier-ignore
                    return (ValueGuard.IsString(key.const) || ValueGuard.IsNumber(key.const))
                        ? this.Object({ [key.const]: TypeClone.Type(schema) }, options)
                        : this.Throw('Record key of type literal is not of type string or number');
                })() :
                    TypeGuard.TInteger(key) || TypeGuard.TNumber(key) ? (() => {
                        return this.Create({ ...options, [exports.Kind]: 'Record', type: 'object', patternProperties: { [exports.PatternNumberExact]: TypeClone.Type(schema) } });
                    })() :
                        TypeGuard.TString(key) ? (() => {
                            const pattern = ValueGuard.IsUndefined(key.pattern) ? exports.PatternStringExact : key.pattern;
                            return this.Create({ ...options, [exports.Kind]: 'Record', type: 'object', patternProperties: { [pattern]: TypeClone.Type(schema) } });
                        })() :
                            this.Never());
    }
    /** `[Json]` Creates a Recursive type */
    Recursive(callback, options = {}) {
        if (ValueGuard.IsUndefined(options.$id))
            options.$id = `T${TypeOrdinal++}`;
        const thisType = callback({ [exports.Kind]: 'This', $ref: `${options.$id}` });
        thisType.$id = options.$id;
        return this.Create({ ...options, [exports.Hint]: 'Recursive', ...thisType });
    }
    /** `[Json]` Creates a Ref type. */
    Ref(unresolved, options = {}) {
        if (ValueGuard.IsString(unresolved))
            return this.Create({ ...options, [exports.Kind]: 'Ref', $ref: unresolved });
        if (ValueGuard.IsUndefined(unresolved.$id))
            this.Throw('Reference target type must specify an $id');
        return this.Create({ ...options, [exports.Kind]: 'Ref', $ref: unresolved.$id });
    }
    /** `[Json]` Constructs a type where all properties are required */
    Required(schema, options = {}) {
        // prettier-ignore
        return ObjectMap.Map(this.Discard(TypeClone.Type(schema), ['$id', exports.Transform]), (object) => {
            const properties = Object.getOwnPropertyNames(object.properties).reduce((acc, key) => {
                return { ...acc, [key]: this.Discard(object.properties[key], [exports.Optional]) };
            }, {});
            return this.Object(properties, object /* object used as options to retain other constraints  */);
        }, options);
    }
    /** `[Json]` Extracts interior Rest elements from Tuple, Intersect and Union types */
    Rest(schema) {
        return (TypeGuard.TTuple(schema) && !ValueGuard.IsUndefined(schema.items) ? TypeClone.Rest(schema.items) : TypeGuard.TIntersect(schema) ? TypeClone.Rest(schema.allOf) : TypeGuard.TUnion(schema) ? TypeClone.Rest(schema.anyOf) : []);
    }
    /** `[Json]` Creates a String type */
    String(options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'String', type: 'string' });
    }
    /** `[Json]` Creates a TemplateLiteral type */
    TemplateLiteral(unresolved, options = {}) {
        // prettier-ignore
        const pattern = ValueGuard.IsString(unresolved)
            ? TemplateLiteralPattern.Create(TemplateLiteralDslParser.Parse(unresolved))
            : TemplateLiteralPattern.Create(unresolved);
        return this.Create({ ...options, [exports.Kind]: 'TemplateLiteral', type: 'string', pattern });
    }
    /** `[Json]` Creates a Transform type */
    Transform(schema) {
        return new TransformDecodeBuilder(schema);
    }
    /** `[Json]` Creates a Tuple type */
    Tuple(items, options = {}) {
        const [additionalItems, minItems, maxItems] = [false, items.length, items.length];
        const clonedItems = TypeClone.Rest(items);
        // prettier-ignore
        const schema = (items.length > 0 ?
            { ...options, [exports.Kind]: 'Tuple', type: 'array', items: clonedItems, additionalItems, minItems, maxItems } :
            { ...options, [exports.Kind]: 'Tuple', type: 'array', minItems, maxItems });
        return this.Create(schema);
    }
    /** `[Json]` Intrinsic function to Uncapitalize LiteralString types */
    Uncapitalize(schema, options = {}) {
        return { ...Intrinsic.Map(TypeClone.Type(schema), 'Uncapitalize'), ...options };
    }
    /** `[Json]` Creates a Union type */
    Union(union, options = {}) {
        // prettier-ignore
        return TypeGuard.TTemplateLiteral(union)
            ? TemplateLiteralResolver.Resolve(union)
            : (() => {
                const anyOf = union;
                if (anyOf.length === 0)
                    return this.Never(options);
                if (anyOf.length === 1)
                    return this.Create(TypeClone.Type(anyOf[0], options));
                const clonedAnyOf = TypeClone.Rest(anyOf);
                return this.Create({ ...options, [exports.Kind]: 'Union', anyOf: clonedAnyOf });
            })();
    }
    /** `[Json]` Creates an Unknown type */
    Unknown(options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Unknown' });
    }
    /** `[Json]` Creates a Unsafe type that will infers as the generic argument T */
    Unsafe(options = {}) {
        return this.Create({ ...options, [exports.Kind]: options[exports.Kind] || 'Unsafe' });
    }
    /** `[Json]` Intrinsic function to Uppercase LiteralString types */
    Uppercase(schema, options = {}) {
        return { ...Intrinsic.Map(TypeClone.Type(schema), 'Uppercase'), ...options };
    }
}
exports.JsonTypeBuilder = JsonTypeBuilder;
// --------------------------------------------------------------------------
// JavaScriptTypeBuilder
// --------------------------------------------------------------------------
class JavaScriptTypeBuilder extends JsonTypeBuilder {
    /** `[JavaScript]` Creates a AsyncIterator type */
    AsyncIterator(items, options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'AsyncIterator', type: 'AsyncIterator', items: TypeClone.Type(items) });
    }
    /** `[JavaScript]` Constructs a type by recursively unwrapping Promise types */
    Awaited(schema, options = {}) {
        // prettier-ignore
        const Unwrap = (rest) => rest.length > 0 ? (() => {
            const [L, ...R] = rest;
            return [this.Awaited(L), ...Unwrap(R)];
        })() : rest;
        // prettier-ignore
        return (TypeGuard.TIntersect(schema) ? exports.Type.Intersect(Unwrap(schema.allOf)) :
            TypeGuard.TUnion(schema) ? exports.Type.Union(Unwrap(schema.anyOf)) :
                TypeGuard.TPromise(schema) ? this.Awaited(schema.item) :
                    TypeClone.Type(schema, options));
    }
    /** `[JavaScript]` Creates a BigInt type */
    BigInt(options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'BigInt', type: 'bigint' });
    }
    /** `[JavaScript]` Extracts the ConstructorParameters from the given Constructor type */
    ConstructorParameters(schema, options = {}) {
        return this.Tuple([...schema.parameters], { ...options });
    }
    /** `[JavaScript]` Creates a Constructor type */
    Constructor(parameters, returns, options) {
        const [clonedParameters, clonedReturns] = [TypeClone.Rest(parameters), TypeClone.Type(returns)];
        return this.Create({ ...options, [exports.Kind]: 'Constructor', type: 'Constructor', parameters: clonedParameters, returns: clonedReturns });
    }
    /** `[JavaScript]` Creates a Date type */
    Date(options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Date', type: 'Date' });
    }
    /** `[JavaScript]` Creates a Function type */
    Function(parameters, returns, options) {
        const [clonedParameters, clonedReturns] = [TypeClone.Rest(parameters), TypeClone.Type(returns)];
        return this.Create({ ...options, [exports.Kind]: 'Function', type: 'Function', parameters: clonedParameters, returns: clonedReturns });
    }
    /** `[JavaScript]` Extracts the InstanceType from the given Constructor type */
    InstanceType(schema, options = {}) {
        return TypeClone.Type(schema.returns, options);
    }
    /** `[JavaScript]` Creates an Iterator type */
    Iterator(items, options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Iterator', type: 'Iterator', items: TypeClone.Type(items) });
    }
    /** `[JavaScript]` Extracts the Parameters from the given Function type */
    Parameters(schema, options = {}) {
        return this.Tuple(schema.parameters, { ...options });
    }
    /** `[JavaScript]` Creates a Promise type */
    Promise(item, options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Promise', type: 'Promise', item: TypeClone.Type(item) });
    }
    /** `[Extended]` Creates a String type */
    RegExp(unresolved, options = {}) {
        const pattern = ValueGuard.IsString(unresolved) ? unresolved : unresolved.source;
        return this.Create({ ...options, [exports.Kind]: 'String', type: 'string', pattern });
    }
    /**
     * @deprecated Use `Type.RegExp`
     */
    RegEx(regex, options = {}) {
        return this.RegExp(regex, options);
    }
    /** `[JavaScript]` Extracts the ReturnType from the given Function type */
    ReturnType(schema, options = {}) {
        return TypeClone.Type(schema.returns, options);
    }
    /** `[JavaScript]` Creates a Symbol type */
    Symbol(options) {
        return this.Create({ ...options, [exports.Kind]: 'Symbol', type: 'symbol' });
    }
    /** `[JavaScript]` Creates a Undefined type */
    Undefined(options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Undefined', type: 'undefined' });
    }
    /** `[JavaScript]` Creates a Uint8Array type */
    Uint8Array(options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Uint8Array', type: 'Uint8Array' });
    }
    /** `[JavaScript]` Creates a Void type */
    Void(options = {}) {
        return this.Create({ ...options, [exports.Kind]: 'Void', type: 'void' });
    }
}
exports.JavaScriptTypeBuilder = JavaScriptTypeBuilder;
/** Json Type Builder with Static Resolution for TypeScript */
exports.JsonType = new JsonTypeBuilder();
/** JavaScript Type Builder with Static Resolution for TypeScript */
exports.Type = new JavaScriptTypeBuilder();


/***/ }),

/***/ 4860:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*--------------------------------------------------------------------------

@sinclair/typebox/value

The MIT License (MIT)

Copyright (c) 2017-2023 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Deref = exports.TypeDereferenceError = void 0;
const typebox_1 = __webpack_require__(624);
class TypeDereferenceError extends typebox_1.TypeBoxError {
    constructor(schema) {
        super(`Unable to dereference schema with $id '${schema.$id}'`);
        this.schema = schema;
    }
}
exports.TypeDereferenceError = TypeDereferenceError;
/** Dereferences a schema from the references array or throws if not found */
function Deref(schema, references) {
    const index = references.findIndex((target) => target.$id === schema.$ref);
    if (index === -1)
        throw new TypeDereferenceError(schema);
    return references[index];
}
exports.Deref = Deref;


/***/ }),

/***/ 5928:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*--------------------------------------------------------------------------

@sinclair/typebox/value

The MIT License (MIT)

Copyright (c) 2017-2023 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IsValueType = exports.IsSymbol = exports.IsFunction = exports.IsString = exports.IsBigInt = exports.IsInteger = exports.IsNumber = exports.IsBoolean = exports.IsNull = exports.IsUndefined = exports.IsArray = exports.IsObject = exports.IsPlainObject = exports.HasPropertyKey = exports.IsDate = exports.IsUint8Array = exports.IsPromise = exports.IsTypedArray = exports.IsIterator = exports.IsAsyncIterator = void 0;
// --------------------------------------------------------------------------
// Iterators
// --------------------------------------------------------------------------
/** Returns true if this value is an async iterator */
function IsAsyncIterator(value) {
    return IsObject(value) && Symbol.asyncIterator in value;
}
exports.IsAsyncIterator = IsAsyncIterator;
/** Returns true if this value is an iterator */
function IsIterator(value) {
    return IsObject(value) && Symbol.iterator in value;
}
exports.IsIterator = IsIterator;
// --------------------------------------------------------------------------
// Nominal
// --------------------------------------------------------------------------
/** Returns true if this value is a typed array */
function IsTypedArray(value) {
    return ArrayBuffer.isView(value);
}
exports.IsTypedArray = IsTypedArray;
/** Returns true if this value is a Promise */
function IsPromise(value) {
    return value instanceof Promise;
}
exports.IsPromise = IsPromise;
/** Returns true if the value is a Uint8Array */
function IsUint8Array(value) {
    return value instanceof Uint8Array;
}
exports.IsUint8Array = IsUint8Array;
/** Returns true if this value is a Date */
function IsDate(value) {
    return value instanceof Date && Number.isFinite(value.getTime());
}
exports.IsDate = IsDate;
// --------------------------------------------------------------------------
// Standard
// --------------------------------------------------------------------------
/** Returns true if this value has this property key */
function HasPropertyKey(value, key) {
    return key in value;
}
exports.HasPropertyKey = HasPropertyKey;
/** Returns true if this object is not an instance of any other type */
function IsPlainObject(value) {
    return IsObject(value) && IsFunction(value.constructor) && value.constructor.name === 'Object';
}
exports.IsPlainObject = IsPlainObject;
/** Returns true of this value is an object type */
function IsObject(value) {
    return value !== null && typeof value === 'object';
}
exports.IsObject = IsObject;
/** Returns true if this value is an array, but not a typed array */
function IsArray(value) {
    return Array.isArray(value) && !ArrayBuffer.isView(value);
}
exports.IsArray = IsArray;
/** Returns true if this value is an undefined */
function IsUndefined(value) {
    return value === undefined;
}
exports.IsUndefined = IsUndefined;
/** Returns true if this value is an null */
function IsNull(value) {
    return value === null;
}
exports.IsNull = IsNull;
/** Returns true if this value is an boolean */
function IsBoolean(value) {
    return typeof value === 'boolean';
}
exports.IsBoolean = IsBoolean;
/** Returns true if this value is an number */
function IsNumber(value) {
    return typeof value === 'number';
}
exports.IsNumber = IsNumber;
/** Returns true if this value is an integer */
function IsInteger(value) {
    return IsNumber(value) && Number.isInteger(value);
}
exports.IsInteger = IsInteger;
/** Returns true if this value is bigint */
function IsBigInt(value) {
    return typeof value === 'bigint';
}
exports.IsBigInt = IsBigInt;
/** Returns true if this value is string */
function IsString(value) {
    return typeof value === 'string';
}
exports.IsString = IsString;
/** Returns true if this value is a function */
function IsFunction(value) {
    return typeof value === 'function';
}
exports.IsFunction = IsFunction;
/** Returns true if this value is a symbol */
function IsSymbol(value) {
    return typeof value === 'symbol';
}
exports.IsSymbol = IsSymbol;
/** Returns true if this value is a value type such as number, string, boolean */
function IsValueType(value) {
    // prettier-ignore
    return (IsBigInt(value) ||
        IsBoolean(value) ||
        IsNull(value) ||
        IsNumber(value) ||
        IsString(value) ||
        IsSymbol(value) ||
        IsUndefined(value));
}
exports.IsValueType = IsValueType;


/***/ }),

/***/ 548:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*--------------------------------------------------------------------------

@sinclair/typebox/value

The MIT License (MIT)

Copyright (c) 2017-2023 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Hash = exports.ByteMarker = exports.ValueHashError = void 0;
const guard_1 = __webpack_require__(5928);
// --------------------------------------------------------------------------
// Errors
// --------------------------------------------------------------------------
class ValueHashError extends Error {
    constructor(value) {
        super(`Unable to hash value`);
        this.value = value;
    }
}
exports.ValueHashError = ValueHashError;
// --------------------------------------------------------------------------
// ByteMarker
// --------------------------------------------------------------------------
var ByteMarker;
(function (ByteMarker) {
    ByteMarker[ByteMarker["Undefined"] = 0] = "Undefined";
    ByteMarker[ByteMarker["Null"] = 1] = "Null";
    ByteMarker[ByteMarker["Boolean"] = 2] = "Boolean";
    ByteMarker[ByteMarker["Number"] = 3] = "Number";
    ByteMarker[ByteMarker["String"] = 4] = "String";
    ByteMarker[ByteMarker["Object"] = 5] = "Object";
    ByteMarker[ByteMarker["Array"] = 6] = "Array";
    ByteMarker[ByteMarker["Date"] = 7] = "Date";
    ByteMarker[ByteMarker["Uint8Array"] = 8] = "Uint8Array";
    ByteMarker[ByteMarker["Symbol"] = 9] = "Symbol";
    ByteMarker[ByteMarker["BigInt"] = 10] = "BigInt";
})(ByteMarker || (exports.ByteMarker = ByteMarker = {}));
// --------------------------------------------------------------------------
// State
// --------------------------------------------------------------------------
let Accumulator = BigInt('14695981039346656037');
const [Prime, Size] = [BigInt('1099511628211'), BigInt('2') ** BigInt('64')];
const Bytes = Array.from({ length: 256 }).map((_, i) => BigInt(i));
const F64 = new Float64Array(1);
const F64In = new DataView(F64.buffer);
const F64Out = new Uint8Array(F64.buffer);
// --------------------------------------------------------------------------
// NumberToBytes
// --------------------------------------------------------------------------
function* NumberToBytes(value) {
    const byteCount = value === 0 ? 1 : Math.ceil(Math.floor(Math.log2(value) + 1) / 8);
    for (let i = 0; i < byteCount; i++) {
        yield (value >> (8 * (byteCount - 1 - i))) & 0xff;
    }
}
// --------------------------------------------------------------------------
// Hashing Functions
// --------------------------------------------------------------------------
function ArrayType(value) {
    FNV1A64(ByteMarker.Array);
    for (const item of value) {
        Visit(item);
    }
}
function BooleanType(value) {
    FNV1A64(ByteMarker.Boolean);
    FNV1A64(value ? 1 : 0);
}
function BigIntType(value) {
    FNV1A64(ByteMarker.BigInt);
    F64In.setBigInt64(0, value);
    for (const byte of F64Out) {
        FNV1A64(byte);
    }
}
function DateType(value) {
    FNV1A64(ByteMarker.Date);
    Visit(value.getTime());
}
function NullType(value) {
    FNV1A64(ByteMarker.Null);
}
function NumberType(value) {
    FNV1A64(ByteMarker.Number);
    F64In.setFloat64(0, value);
    for (const byte of F64Out) {
        FNV1A64(byte);
    }
}
function ObjectType(value) {
    FNV1A64(ByteMarker.Object);
    for (const key of globalThis.Object.keys(value).sort()) {
        Visit(key);
        Visit(value[key]);
    }
}
function StringType(value) {
    FNV1A64(ByteMarker.String);
    for (let i = 0; i < value.length; i++) {
        for (const byte of NumberToBytes(value.charCodeAt(i))) {
            FNV1A64(byte);
        }
    }
}
function SymbolType(value) {
    FNV1A64(ByteMarker.Symbol);
    Visit(value.description);
}
function Uint8ArrayType(value) {
    FNV1A64(ByteMarker.Uint8Array);
    for (let i = 0; i < value.length; i++) {
        FNV1A64(value[i]);
    }
}
function UndefinedType(value) {
    return FNV1A64(ByteMarker.Undefined);
}
function Visit(value) {
    if ((0, guard_1.IsArray)(value))
        return ArrayType(value);
    if ((0, guard_1.IsBoolean)(value))
        return BooleanType(value);
    if ((0, guard_1.IsBigInt)(value))
        return BigIntType(value);
    if ((0, guard_1.IsDate)(value))
        return DateType(value);
    if ((0, guard_1.IsNull)(value))
        return NullType(value);
    if ((0, guard_1.IsNumber)(value))
        return NumberType(value);
    if ((0, guard_1.IsPlainObject)(value))
        return ObjectType(value);
    if ((0, guard_1.IsString)(value))
        return StringType(value);
    if ((0, guard_1.IsSymbol)(value))
        return SymbolType(value);
    if ((0, guard_1.IsUint8Array)(value))
        return Uint8ArrayType(value);
    if ((0, guard_1.IsUndefined)(value))
        return UndefinedType(value);
    throw new ValueHashError(value);
}
function FNV1A64(byte) {
    Accumulator = Accumulator ^ Bytes[byte];
    Accumulator = (Accumulator * Prime) % Size;
}
// --------------------------------------------------------------------------
// Hash
// --------------------------------------------------------------------------
/** Creates a FNV1A-64 non cryptographic hash of the given value */
function Hash(value) {
    Accumulator = BigInt('14695981039346656037');
    Visit(value);
    return Accumulator;
}
exports.Hash = Hash;


/***/ }),

/***/ 7312:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});
exports.E = void 0;
const connect_common_1 = __webpack_require__(4200);
class WindowServiceWorkerChannel extends connect_common_1.AbstractMessageChannel {
  constructor({
    name,
    channel
  }) {
    super({
      channel,
      sendFn: message => {
        if (!this.port) throw new Error('port not assigned');
        this.port.postMessage(message);
      }
    });
    const port = chrome.runtime.connect({
      name
    });
    this.port = port;
    this.connect();
  }
  connect() {
    var _a;
    (_a = this.port) === null || _a === void 0 ? void 0 : _a.onMessage.addListener(message => {
      if (message.channel.here === this.channel.here) return;
      this.onMessage(message);
    });
    this.isConnected = true;
  }
  disconnect() {
    var _a;
    if (!this.isConnected) return;
    (_a = this.port) === null || _a === void 0 ? void 0 : _a.disconnect();
    this.isConnected = false;
  }
}
exports.E = WindowServiceWorkerChannel;

/***/ }),

/***/ 1832:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.NETWORK_IDS = exports.PROTOCOL_MAGICS = void 0;
var PROTOCOL_MAGICS;
(function (PROTOCOL_MAGICS) {
  PROTOCOL_MAGICS[PROTOCOL_MAGICS["mainnet"] = 764824073] = "mainnet";
  PROTOCOL_MAGICS[PROTOCOL_MAGICS["testnet_preprod"] = 1] = "testnet_preprod";
  PROTOCOL_MAGICS[PROTOCOL_MAGICS["testnet_preview"] = 2] = "testnet_preview";
  PROTOCOL_MAGICS[PROTOCOL_MAGICS["testnet_legacy"] = 1097911063] = "testnet_legacy";
})(PROTOCOL_MAGICS || (exports.PROTOCOL_MAGICS = PROTOCOL_MAGICS = {}));
var NETWORK_IDS;
(function (NETWORK_IDS) {
  NETWORK_IDS[NETWORK_IDS["mainnet"] = 1] = "mainnet";
  NETWORK_IDS[NETWORK_IDS["testnet"] = 0] = "testnet";
})(NETWORK_IDS || (exports.NETWORK_IDS = NETWORK_IDS = {}));

/***/ }),

/***/ 2776:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.LIBUSB_ERROR_MESSAGE = exports.serializeError = exports.TypedError = exports.TrezorError = exports.ERROR_CODES = void 0;
exports.ERROR_CODES = {
  Init_NotInitialized: 'TrezorConnect not initialized',
  Init_AlreadyInitialized: 'TrezorConnect has been already initialized',
  Init_IframeBlocked: 'Iframe blocked',
  Init_IframeTimeout: 'Iframe timeout',
  Init_ManifestMissing: 'Manifest not set. Read more at https://github.com/trezor/trezor-suite/blob/develop/docs/packages/connect/index.md',
  Popup_ConnectionMissing: 'Unable to establish connection with iframe',
  Transport_Missing: 'Transport is missing',
  Transport_InvalidProtobuf: '',
  Method_InvalidPackage: 'This package is not suitable to work with browser. Use @trezor/connect-web package instead',
  Method_InvalidParameter: '',
  Method_NotAllowed: 'Method not allowed for this configuration',
  Method_PermissionsNotGranted: 'Permissions not granted',
  Method_Cancel: 'Cancelled',
  Method_Interrupted: 'Popup closed',
  Method_UnknownCoin: 'Coin not found',
  Method_AddressNotMatch: 'Addresses do not match',
  Method_FirmwareUpdate_DownloadFailed: 'Failed to download firmware binary',
  Method_Discovery_BundleException: '',
  Method_Override: 'override',
  Method_NoResponse: 'Call resolved without response',
  Backend_NotSupported: 'BlockchainLink settings not found in coins.json',
  Backend_WorkerMissing: '',
  Backend_Disconnected: 'Backend disconnected',
  Backend_Invalid: 'Invalid backend',
  Backend_Error: '',
  Runtime: '',
  Device_NotFound: 'Device not found',
  Device_InitializeFailed: '',
  Device_FwException: '',
  Device_ModeException: '',
  Device_Disconnected: 'Device disconnected',
  Device_UsedElsewhere: 'Device is used in another window',
  Device_InvalidState: 'Passphrase is incorrect',
  Device_CallInProgress: 'Device call in progress'
};
class TrezorError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.message = message;
  }
}
exports.TrezorError = TrezorError;
const TypedError = (id, message) => new TrezorError(id, message || exports.ERROR_CODES[id]);
exports.TypedError = TypedError;
const serializeError = payload => {
  if (payload && payload.error instanceof Error) {
    return {
      error: payload.error.message,
      code: payload.error.code
    };
  }
  return payload;
};
exports.serializeError = serializeError;
exports.LIBUSB_ERROR_MESSAGE = 'LIBUSB_ERROR';

/***/ }),

/***/ 6743:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.PROTO = exports.NEM = exports.CARDANO = exports.NETWORK = exports.ERRORS = void 0;
const tslib_1 = __webpack_require__(2376);
exports.ERRORS = tslib_1.__importStar(__webpack_require__(2776));
exports.NETWORK = tslib_1.__importStar(__webpack_require__(3736));
exports.CARDANO = tslib_1.__importStar(__webpack_require__(1832));
exports.NEM = tslib_1.__importStar(__webpack_require__(6836));
var protobuf_1 = __webpack_require__(9184);
Object.defineProperty(exports, "PROTO", ({
  enumerable: true,
  get: function () {
    return protobuf_1.MessagesSchema;
  }
}));

/***/ }),

/***/ 6836:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.EnumTxVersion = exports.TxVersion = exports.EnumTxType = exports.TxType = exports.EnumNetworks = exports.Networks = void 0;
const schema_utils_1 = __webpack_require__(3404);
var Networks;
(function (Networks) {
  Networks[Networks["mainnet"] = 104] = "mainnet";
  Networks[Networks["testnet"] = 152] = "testnet";
  Networks[Networks["mijin"] = 96] = "mijin";
})(Networks || (exports.Networks = Networks = {}));
exports.EnumNetworks = schema_utils_1.Type.Enum(Networks);
var TxType;
(function (TxType) {
  TxType[TxType["TRANSFER"] = 257] = "TRANSFER";
  TxType[TxType["COSIGNING"] = 258] = "COSIGNING";
  TxType[TxType["IMPORTANCE_TRANSFER"] = 2049] = "IMPORTANCE_TRANSFER";
  TxType[TxType["AGGREGATE_MODIFICATION"] = 4097] = "AGGREGATE_MODIFICATION";
  TxType[TxType["MULTISIG_SIGNATURE"] = 4098] = "MULTISIG_SIGNATURE";
  TxType[TxType["MULTISIG"] = 4100] = "MULTISIG";
  TxType[TxType["PROVISION_NAMESPACE"] = 8193] = "PROVISION_NAMESPACE";
  TxType[TxType["MOSAIC_CREATION"] = 16385] = "MOSAIC_CREATION";
  TxType[TxType["SUPPLY_CHANGE"] = 16386] = "SUPPLY_CHANGE";
})(TxType || (exports.TxType = TxType = {}));
exports.EnumTxType = schema_utils_1.Type.Enum(TxType);
var TxVersion;
(function (TxVersion) {
  TxVersion[TxVersion["mainnet"] = 1744830464] = "mainnet";
  TxVersion[TxVersion["testnet"] = -1744830464] = "testnet";
  TxVersion[TxVersion["mijin"] = 1610612736] = "mijin";
})(TxVersion || (exports.TxVersion = TxVersion = {}));
exports.EnumTxVersion = schema_utils_1.Type.Enum(TxVersion);

/***/ }),

/***/ 3736:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.MODULES = exports.TYPES = void 0;
exports.TYPES = {
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  eos: 'Eos',
  nem: 'NEM',
  stellar: 'Stellar',
  cardano: 'Cardano',
  ripple: 'Ripple',
  tezos: 'Tezos',
  binance: 'Binance',
  solana: 'Solana'
};
exports.MODULES = ['binance', 'cardano', 'eos', 'ethereum', 'nem', 'ripple', 'solana', 'stellar', 'tezos'];

/***/ }),

/***/ 7632:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.parseConnectSettings = exports.corsValidator = exports.DEFAULT_PRIORITY = void 0;
const version_1 = __webpack_require__(2187);
exports.DEFAULT_PRIORITY = 2;
const initialSettings = {
  configSrc: './data/config.json',
  version: version_1.VERSION,
  debug: false,
  priority: exports.DEFAULT_PRIORITY,
  trustedHost: true,
  connectSrc: version_1.DEFAULT_DOMAIN,
  iframeSrc: `${version_1.DEFAULT_DOMAIN}iframe.html`,
  popup: false,
  popupSrc: `${version_1.DEFAULT_DOMAIN}popup.html`,
  webusbSrc: `${version_1.DEFAULT_DOMAIN}webusb.html`,
  transports: undefined,
  pendingTransportEvent: true,
  env: 'node',
  lazyLoad: false,
  timestamp: new Date().getTime(),
  interactionTimeout: 600,
  sharedLogger: true
};
const parseManifest = manifest => {
  if (!manifest) return;
  if (typeof manifest.email !== 'string') return;
  if (typeof manifest.appUrl !== 'string') return;
  return {
    email: manifest.email,
    appUrl: manifest.appUrl
  };
};
const corsValidator = url => {
  if (typeof url !== 'string') return;
  if (url.match(/^https:\/\/([A-Za-z0-9\-_]+\.)*trezor\.io\//)) return url;
  if (url.match(/^https?:\/\/localhost:[58][0-9]{3}\//)) return url;
  if (url.match(/^https:\/\/([A-Za-z0-9\-_]+\.)*sldev\.cz\//)) return url;
  if (url.match(/^https?:\/\/([A-Za-z0-9\-_]+\.)*trezoriovpjcahpzkrewelclulmszwbqpzmzgub37gbcjlvluxtruqad\.onion\//)) return url;
};
exports.corsValidator = corsValidator;
const parseConnectSettings = (input = {}) => {
  var _a;
  const settings = {
    ...initialSettings
  };
  if ('debug' in input) {
    if (typeof input.debug === 'boolean') {
      settings.debug = input.debug;
    } else if (typeof input.debug === 'string') {
      settings.debug = input.debug === 'true';
    }
  }
  if (input.trustedHost === false) {
    settings.trustedHost = input.trustedHost;
  }
  if (typeof input.connectSrc === 'string' && ((_a = input.connectSrc) === null || _a === void 0 ? void 0 : _a.startsWith('http'))) {
    settings.connectSrc = (0, exports.corsValidator)(input.connectSrc);
  } else if (settings.trustedHost) {
    settings.connectSrc = input.connectSrc;
  }
  const src = settings.connectSrc || version_1.DEFAULT_DOMAIN;
  settings.iframeSrc = `${src}iframe.html`;
  settings.popupSrc = `${src}popup.html`;
  settings.webusbSrc = `${src}webusb.html`;
  if (typeof input.transportReconnect === 'boolean') {
    settings.transportReconnect = input.transportReconnect;
  }
  if (typeof input.webusb === 'boolean') {
    settings.webusb = input.webusb;
  }
  if (Array.isArray(input.transports)) {
    settings.transports = input.transports;
  }
  if (typeof input.popup === 'boolean') {
    settings.popup = input.popup;
  }
  if (typeof input.lazyLoad === 'boolean') {
    settings.lazyLoad = input.lazyLoad;
  }
  if (typeof input.pendingTransportEvent === 'boolean') {
    settings.pendingTransportEvent = input.pendingTransportEvent;
  }
  if (typeof input.extension === 'string') {
    settings.extension = input.extension;
  }
  if (typeof input.env === 'string') {
    settings.env = input.env;
  }
  if (typeof input.timestamp === 'number') {
    settings.timestamp = input.timestamp;
  }
  if (typeof input.interactionTimeout === 'number') {
    settings.interactionTimeout = input.interactionTimeout;
  }
  if (typeof input.manifest === 'object') {
    settings.manifest = parseManifest(input.manifest);
  }
  if (typeof input.sharedLogger === 'boolean') {
    settings.sharedLogger = input.sharedLogger;
  }
  if (typeof input.useCoreInPopup === 'boolean') {
    settings.useCoreInPopup = input.useCoreInPopup;
  }
  return settings;
};
exports.parseConnectSettings = parseConnectSettings;

/***/ }),

/***/ 2187:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.DEFAULT_DOMAIN = exports.VERSION = void 0;
exports.VERSION = '9.2.0';
const versionN = exports.VERSION.split('.').map(s => parseInt(s, 10));
exports.DEFAULT_DOMAIN = `https://connect.trezor.io/${versionN[0]}/`;

/***/ }),

/***/ 9996:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createBlockchainMessage = exports.BLOCKCHAIN = exports.BLOCKCHAIN_EVENT = void 0;
exports.BLOCKCHAIN_EVENT = 'BLOCKCHAIN_EVENT';
exports.BLOCKCHAIN = {
  CONNECT: 'blockchain-connect',
  RECONNECTING: 'blockchain-reconnecting',
  ERROR: 'blockchain-error',
  BLOCK: 'blockchain-block',
  NOTIFICATION: 'blockchain-notification',
  FIAT_RATES_UPDATE: 'fiat-rates-update'
};
const createBlockchainMessage = (type, payload) => ({
  event: exports.BLOCKCHAIN_EVENT,
  type,
  payload
});
exports.createBlockchainMessage = createBlockchainMessage;

/***/ }),

/***/ 9091:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createResponseMessage = exports.RESPONSE_EVENT = void 0;
const errors_1 = __webpack_require__(2776);
exports.RESPONSE_EVENT = 'RESPONSE_EVENT';
const createResponseMessage = (id, success, payload) => ({
  event: exports.RESPONSE_EVENT,
  type: exports.RESPONSE_EVENT,
  id,
  success,
  payload: success ? payload : (0, errors_1.serializeError)(payload)
});
exports.createResponseMessage = createResponseMessage;

/***/ }),

/***/ 9336:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createErrorMessage = exports.parseMessage = exports.CORE_EVENT = void 0;
exports.CORE_EVENT = 'CORE_EVENT';
const parseMessage = messageData => {
  const message = {
    event: messageData.event,
    type: messageData.type,
    payload: messageData.payload
  };
  if (typeof messageData.id === 'number') {
    message.id = messageData.id;
  }
  if (typeof messageData.success === 'boolean') {
    message.success = messageData.success;
  }
  return message;
};
exports.parseMessage = parseMessage;
const createErrorMessage = error => ({
  success: false,
  payload: {
    error: error.message,
    code: error.code
  }
});
exports.createErrorMessage = createErrorMessage;

/***/ }),

/***/ 6912:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createDeviceMessage = exports.DEVICE = exports.DEVICE_EVENT = void 0;
exports.DEVICE_EVENT = 'DEVICE_EVENT';
exports.DEVICE = {
  CONNECT: 'device-connect',
  CONNECT_UNACQUIRED: 'device-connect_unacquired',
  DISCONNECT: 'device-disconnect',
  CHANGED: 'device-changed',
  ACQUIRE: 'device-acquire',
  RELEASE: 'device-release',
  ACQUIRED: 'device-acquired',
  RELEASED: 'device-released',
  USED_ELSEWHERE: 'device-used_elsewhere',
  LOADING: 'device-loading',
  BUTTON: 'button',
  PIN: 'pin',
  PASSPHRASE: 'passphrase',
  PASSPHRASE_ON_DEVICE: 'passphrase_on_device',
  WORD: 'word'
};
const createDeviceMessage = (type, payload) => ({
  event: exports.DEVICE_EVENT,
  type,
  payload
});
exports.createDeviceMessage = createDeviceMessage;

/***/ }),

/***/ 7360:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createIFrameMessage = exports.IFRAME = void 0;
const ui_request_1 = __webpack_require__(8956);
exports.IFRAME = {
  BOOTSTRAP: 'iframe-bootstrap',
  LOADED: 'iframe-loaded',
  INIT: 'iframe-init',
  ERROR: 'iframe-error',
  CALL: 'iframe-call',
  LOG: 'iframe-log'
};
const createIFrameMessage = (type, payload) => ({
  event: ui_request_1.UI_EVENT,
  type,
  payload
});
exports.createIFrameMessage = createIFrameMessage;

/***/ }),

/***/ 9660:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.UI = void 0;
const tslib_1 = __webpack_require__(2376);
const ui_request_1 = __webpack_require__(8956);
const ui_response_1 = __webpack_require__(5600);
tslib_1.__exportStar(__webpack_require__(9996), exports);
tslib_1.__exportStar(__webpack_require__(9091), exports);
tslib_1.__exportStar(__webpack_require__(9336), exports);
tslib_1.__exportStar(__webpack_require__(6912), exports);
tslib_1.__exportStar(__webpack_require__(7360), exports);
tslib_1.__exportStar(__webpack_require__(4176), exports);
tslib_1.__exportStar(__webpack_require__(1324), exports);
tslib_1.__exportStar(__webpack_require__(4124), exports);
tslib_1.__exportStar(__webpack_require__(8956), exports);
tslib_1.__exportStar(__webpack_require__(5600), exports);
tslib_1.__exportStar(__webpack_require__(2948), exports);
exports.UI = {
  ...ui_request_1.UI_REQUEST,
  ...ui_response_1.UI_RESPONSE
};

/***/ }),

/***/ 4176:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createPopupMessage = exports.POPUP = void 0;
const ui_request_1 = __webpack_require__(8956);
exports.POPUP = {
  BOOTSTRAP: 'popup-bootstrap',
  LOADED: 'popup-loaded',
  CORE_LOADED: 'popup-core-loaded',
  INIT: 'popup-init',
  ERROR: 'popup-error',
  EXTENSION_USB_PERMISSIONS: 'open-usb-permissions',
  HANDSHAKE: 'popup-handshake',
  CLOSED: 'popup-closed',
  CANCEL_POPUP_REQUEST: 'ui-cancel-popup-request',
  CLOSE_WINDOW: 'window.close',
  ANALYTICS_RESPONSE: 'popup-analytics-response',
  CONTENT_SCRIPT_LOADED: 'popup-content-script-loaded',
  METHOD_INFO: 'popup-method-info'
};
const createPopupMessage = (type, payload) => ({
  event: ui_request_1.UI_EVENT,
  type,
  payload
});
exports.createPopupMessage = createPopupMessage;

/***/ }),

/***/ 1324:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createTransportMessage = exports.TRANSPORT_EVENT = exports.TRANSPORT = void 0;
const errors_1 = __webpack_require__(2776);
var constants_1 = __webpack_require__(2528);
Object.defineProperty(exports, "TRANSPORT", ({
  enumerable: true,
  get: function () {
    return constants_1.TRANSPORT;
  }
}));
exports.TRANSPORT_EVENT = 'TRANSPORT_EVENT';
const createTransportMessage = (type, payload) => ({
  event: exports.TRANSPORT_EVENT,
  type,
  payload: 'error' in payload ? (0, errors_1.serializeError)(payload) : payload
});
exports.createTransportMessage = createTransportMessage;

/***/ }),

/***/ 4124:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));

/***/ }),

/***/ 8956:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createUiMessage = exports.UI_REQUEST = exports.UI_EVENT = void 0;
exports.UI_EVENT = 'UI_EVENT';
exports.UI_REQUEST = {
  TRANSPORT: 'ui-no_transport',
  BOOTLOADER: 'ui-device_bootloader_mode',
  NOT_IN_BOOTLOADER: 'ui-device_not_in_bootloader_mode',
  REQUIRE_MODE: 'ui-device_require_mode',
  INITIALIZE: 'ui-device_not_initialized',
  SEEDLESS: 'ui-device_seedless',
  FIRMWARE_OLD: 'ui-device_firmware_old',
  FIRMWARE_OUTDATED: 'ui-device_firmware_outdated',
  FIRMWARE_NOT_SUPPORTED: 'ui-device_firmware_unsupported',
  FIRMWARE_NOT_COMPATIBLE: 'ui-device_firmware_not_compatible',
  FIRMWARE_NOT_INSTALLED: 'ui-device_firmware_not_installed',
  FIRMWARE_PROGRESS: 'ui-firmware-progress',
  DEVICE_NEEDS_BACKUP: 'ui-device_needs_backup',
  REQUEST_UI_WINDOW: 'ui-request_window',
  CLOSE_UI_WINDOW: 'ui-close_window',
  REQUEST_PERMISSION: 'ui-request_permission',
  REQUEST_CONFIRMATION: 'ui-request_confirmation',
  REQUEST_PIN: 'ui-request_pin',
  INVALID_PIN: 'ui-invalid_pin',
  REQUEST_PASSPHRASE: 'ui-request_passphrase',
  REQUEST_PASSPHRASE_ON_DEVICE: 'ui-request_passphrase_on_device',
  INVALID_PASSPHRASE: 'ui-invalid_passphrase',
  CONNECT: 'ui-connect',
  LOADING: 'ui-loading',
  SET_OPERATION: 'ui-set_operation',
  SELECT_DEVICE: 'ui-select_device',
  SELECT_ACCOUNT: 'ui-select_account',
  SELECT_FEE: 'ui-select_fee',
  UPDATE_CUSTOM_FEE: 'ui-update_custom_fee',
  INSUFFICIENT_FUNDS: 'ui-insufficient_funds',
  REQUEST_BUTTON: 'ui-button',
  REQUEST_WORD: 'ui-request_word',
  LOGIN_CHALLENGE_REQUEST: 'ui-login_challenge_request',
  BUNDLE_PROGRESS: 'ui-bundle_progress',
  ADDRESS_VALIDATION: 'ui-address_validation',
  IFRAME_FAILURE: 'ui-iframe_failure'
};
const createUiMessage = (type, payload) => ({
  event: exports.UI_EVENT,
  type,
  payload
});
exports.createUiMessage = createUiMessage;

/***/ }),

/***/ 5600:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createUiResponse = exports.UI_RESPONSE = void 0;
const ui_request_1 = __webpack_require__(8956);
exports.UI_RESPONSE = {
  RECEIVE_PERMISSION: 'ui-receive_permission',
  RECEIVE_CONFIRMATION: 'ui-receive_confirmation',
  RECEIVE_PIN: 'ui-receive_pin',
  RECEIVE_PASSPHRASE: 'ui-receive_passphrase',
  RECEIVE_DEVICE: 'ui-receive_device',
  RECEIVE_ACCOUNT: 'ui-receive_account',
  RECEIVE_FEE: 'ui-receive_fee',
  RECEIVE_WORD: 'ui-receive_word',
  INVALID_PASSPHRASE_ACTION: 'ui-invalid_passphrase_action',
  CHANGE_SETTINGS: 'ui-change_settings',
  LOGIN_CHALLENGE_RESPONSE: 'ui-login_challenge_response'
};
const createUiResponse = (type, payload) => ({
  event: ui_request_1.UI_EVENT,
  type,
  payload
});
exports.createUiResponse = createUiResponse;

/***/ }),

/***/ 2948:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.WEBEXTENSION = void 0;
exports.WEBEXTENSION = {
  USB_PERMISSIONS_BROADCAST: 'usb-permissions',
  USB_PERMISSIONS_INIT: 'usb-permissions-init',
  USB_PERMISSIONS_CLOSE: 'usb-permissions-close',
  USB_PERMISSIONS_FINISHED: 'usb-permissions-finished',
  CHANNEL_HANDSHAKE_CONFIRM: 'channel-handshake-confirm'
};

/***/ }),

/***/ 1396:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.parseConnectSettings = void 0;
const tslib_1 = __webpack_require__(2376);
tslib_1.__exportStar(__webpack_require__(6743), exports);
tslib_1.__exportStar(__webpack_require__(9660), exports);
tslib_1.__exportStar(__webpack_require__(4612), exports);
var connectSettings_1 = __webpack_require__(7632);
Object.defineProperty(exports, "parseConnectSettings", ({
  enumerable: true,
  get: function () {
    return connectSettings_1.parseConnectSettings;
  }
}));

/***/ }),

/***/ 7464:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});
exports.i = void 0;
const events_1 = __webpack_require__(9660);
const factory = ({
  eventEmitter,
  manifest,
  init,
  call,
  requestLogin,
  uiResponse,
  renderWebUSBButton,
  disableWebUSB,
  requestWebUSBDevice,
  cancel,
  dispose
}) => {
  const api = {
    manifest,
    init,
    getSettings: () => call({
      method: 'getSettings'
    }),
    on: (type, fn) => {
      eventEmitter.on(type, fn);
    },
    off: (type, fn) => {
      eventEmitter.removeListener(type, fn);
    },
    removeAllListeners: type => {
      if (typeof type === 'string') {
        eventEmitter.removeAllListeners(type);
      } else {
        eventEmitter.removeAllListeners();
      }
    },
    uiResponse,
    blockchainGetAccountBalanceHistory: params => call({
      ...params,
      method: 'blockchainGetAccountBalanceHistory'
    }),
    blockchainGetCurrentFiatRates: params => call({
      ...params,
      method: 'blockchainGetCurrentFiatRates'
    }),
    blockchainGetFiatRatesForTimestamps: params => call({
      ...params,
      method: 'blockchainGetFiatRatesForTimestamps'
    }),
    blockchainDisconnect: params => call({
      ...params,
      method: 'blockchainDisconnect'
    }),
    blockchainEstimateFee: params => call({
      ...params,
      method: 'blockchainEstimateFee'
    }),
    blockchainGetTransactions: params => call({
      ...params,
      method: 'blockchainGetTransactions'
    }),
    blockchainSetCustomBackend: params => call({
      ...params,
      method: 'blockchainSetCustomBackend'
    }),
    blockchainSubscribe: params => call({
      ...params,
      method: 'blockchainSubscribe'
    }),
    blockchainSubscribeFiatRates: params => call({
      ...params,
      method: 'blockchainSubscribeFiatRates'
    }),
    blockchainUnsubscribe: params => call({
      ...params,
      method: 'blockchainUnsubscribe'
    }),
    blockchainUnsubscribeFiatRates: params => call({
      ...params,
      method: 'blockchainUnsubscribeFiatRates'
    }),
    requestLogin: params => requestLogin(params),
    cardanoGetAddress: params => call({
      ...params,
      method: 'cardanoGetAddress',
      useEventListener: eventEmitter.listenerCount(events_1.UI.ADDRESS_VALIDATION) > 0
    }),
    cardanoGetNativeScriptHash: params => call({
      ...params,
      method: 'cardanoGetNativeScriptHash'
    }),
    cardanoGetPublicKey: params => call({
      ...params,
      method: 'cardanoGetPublicKey'
    }),
    cardanoSignTransaction: params => call({
      ...params,
      method: 'cardanoSignTransaction'
    }),
    cardanoComposeTransaction: params => call({
      ...params,
      method: 'cardanoComposeTransaction'
    }),
    cipherKeyValue: params => call({
      ...params,
      method: 'cipherKeyValue'
    }),
    composeTransaction: params => call({
      ...params,
      method: 'composeTransaction'
    }),
    ethereumGetAddress: params => call({
      ...params,
      method: 'ethereumGetAddress',
      useEventListener: eventEmitter.listenerCount(events_1.UI.ADDRESS_VALIDATION) > 0
    }),
    ethereumGetPublicKey: params => call({
      ...params,
      method: 'ethereumGetPublicKey'
    }),
    ethereumSignMessage: params => call({
      ...params,
      method: 'ethereumSignMessage'
    }),
    ethereumSignTransaction: params => call({
      ...params,
      method: 'ethereumSignTransaction'
    }),
    ethereumSignTypedData: params => call({
      ...params,
      method: 'ethereumSignTypedData'
    }),
    ethereumVerifyMessage: params => call({
      ...params,
      method: 'ethereumVerifyMessage'
    }),
    getAccountDescriptor: params => call({
      ...params,
      method: 'getAccountDescriptor'
    }),
    getAccountInfo: params => call({
      ...params,
      method: 'getAccountInfo'
    }),
    getAddress: params => call({
      ...params,
      method: 'getAddress',
      useEventListener: eventEmitter.listenerCount(events_1.UI.ADDRESS_VALIDATION) > 0
    }),
    getDeviceState: params => call({
      ...params,
      method: 'getDeviceState'
    }),
    getFeatures: params => call({
      ...params,
      method: 'getFeatures'
    }),
    getFirmwareHash: params => call({
      ...params,
      method: 'getFirmwareHash'
    }),
    getOwnershipId: params => call({
      ...params,
      method: 'getOwnershipId'
    }),
    getOwnershipProof: params => call({
      ...params,
      method: 'getOwnershipProof'
    }),
    getPublicKey: params => call({
      ...params,
      method: 'getPublicKey'
    }),
    nemGetAddress: params => call({
      ...params,
      method: 'nemGetAddress',
      useEventListener: eventEmitter.listenerCount(events_1.UI.ADDRESS_VALIDATION) > 0
    }),
    nemSignTransaction: params => call({
      ...params,
      method: 'nemSignTransaction'
    }),
    pushTransaction: params => call({
      ...params,
      method: 'pushTransaction'
    }),
    rippleGetAddress: params => call({
      ...params,
      method: 'rippleGetAddress',
      useEventListener: eventEmitter.listenerCount(events_1.UI.ADDRESS_VALIDATION) > 0
    }),
    rippleSignTransaction: params => call({
      ...params,
      method: 'rippleSignTransaction'
    }),
    signMessage: params => call({
      ...params,
      method: 'signMessage'
    }),
    signTransaction: params => call({
      ...params,
      method: 'signTransaction'
    }),
    solanaGetPublicKey: params => call({
      ...params,
      method: 'solanaGetPublicKey'
    }),
    solanaGetAddress: params => call({
      ...params,
      method: 'solanaGetAddress'
    }),
    solanaSignTransaction: params => call({
      ...params,
      method: 'solanaSignTransaction'
    }),
    stellarGetAddress: params => call({
      ...params,
      method: 'stellarGetAddress',
      useEventListener: eventEmitter.listenerCount(events_1.UI.ADDRESS_VALIDATION) > 0
    }),
    stellarSignTransaction: params => call({
      ...params,
      method: 'stellarSignTransaction'
    }),
    tezosGetAddress: params => call({
      ...params,
      method: 'tezosGetAddress',
      useEventListener: eventEmitter.listenerCount(events_1.UI.ADDRESS_VALIDATION) > 0
    }),
    tezosGetPublicKey: params => call({
      ...params,
      method: 'tezosGetPublicKey'
    }),
    tezosSignTransaction: params => call({
      ...params,
      method: 'tezosSignTransaction'
    }),
    unlockPath: params => call({
      ...params,
      method: 'unlockPath'
    }),
    eosGetPublicKey: params => call({
      ...params,
      method: 'eosGetPublicKey'
    }),
    eosSignTransaction: params => call({
      ...params,
      method: 'eosSignTransaction'
    }),
    binanceGetAddress: params => call({
      ...params,
      method: 'binanceGetAddress',
      useEventListener: eventEmitter.listenerCount(events_1.UI.ADDRESS_VALIDATION) > 0
    }),
    binanceGetPublicKey: params => call({
      ...params,
      method: 'binanceGetPublicKey'
    }),
    binanceSignTransaction: params => call({
      ...params,
      method: 'binanceSignTransaction'
    }),
    verifyMessage: params => call({
      ...params,
      method: 'verifyMessage'
    }),
    resetDevice: params => call({
      ...params,
      method: 'resetDevice'
    }),
    wipeDevice: params => call({
      ...params,
      method: 'wipeDevice'
    }),
    checkFirmwareAuthenticity: params => call({
      ...params,
      method: 'checkFirmwareAuthenticity'
    }),
    applyFlags: params => call({
      ...params,
      method: 'applyFlags'
    }),
    applySettings: params => call({
      ...params,
      method: 'applySettings'
    }),
    authenticateDevice: params => call({
      ...params,
      method: 'authenticateDevice'
    }),
    authorizeCoinjoin: params => call({
      ...params,
      method: 'authorizeCoinjoin'
    }),
    cancelCoinjoinAuthorization: params => call({
      ...params,
      method: 'cancelCoinjoinAuthorization'
    }),
    showDeviceTutorial: params => call({
      ...params,
      method: 'showDeviceTutorial'
    }),
    backupDevice: params => call({
      ...params,
      method: 'backupDevice'
    }),
    changeLanguage: params => call({
      ...params,
      method: 'changeLanguage'
    }),
    changePin: params => call({
      ...params,
      method: 'changePin'
    }),
    changeWipeCode: params => call({
      ...params,
      method: 'changeWipeCode'
    }),
    firmwareUpdate: params => call({
      ...params,
      method: 'firmwareUpdate'
    }),
    recoveryDevice: params => call({
      ...params,
      method: 'recoveryDevice'
    }),
    getCoinInfo: params => call({
      ...params,
      method: 'getCoinInfo'
    }),
    rebootToBootloader: params => call({
      ...params,
      method: 'rebootToBootloader'
    }),
    setBusy: params => call({
      ...params,
      method: 'setBusy'
    }),
    setProxy: params => call({
      ...params,
      method: 'setProxy'
    }),
    dispose,
    cancel,
    renderWebUSBButton,
    disableWebUSB,
    requestWebUSBDevice
  };
  return api;
};
exports.i = factory;

/***/ }),

/***/ 595:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));

/***/ }),

/***/ 768:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.BinanceSignTransaction = exports.BinancePreparedTransaction = exports.BinancePreparedMessage = exports.BinanceSDKTransaction = void 0;
const constants_1 = __webpack_require__(6743);
const params_1 = __webpack_require__(7800);
const schema_utils_1 = __webpack_require__(3404);
exports.BinanceSDKTransaction = schema_utils_1.Type.Object({
  chain_id: schema_utils_1.Type.String(),
  account_number: schema_utils_1.Type.Optional(schema_utils_1.Type.Number()),
  memo: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  sequence: schema_utils_1.Type.Optional(schema_utils_1.Type.Number()),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.Number()),
  transfer: schema_utils_1.Type.Optional(constants_1.PROTO.BinanceTransferMsg),
  placeOrder: schema_utils_1.Type.Optional(constants_1.PROTO.BinanceOrderMsg),
  cancelOrder: schema_utils_1.Type.Optional(constants_1.PROTO.BinanceCancelMsg)
});
exports.BinancePreparedMessage = schema_utils_1.Type.Union([schema_utils_1.Type.Intersect([constants_1.PROTO.BinanceTransferMsg, schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('BinanceTransferMsg')
})]), schema_utils_1.Type.Intersect([constants_1.PROTO.BinanceOrderMsg, schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('BinanceOrderMsg')
})]), schema_utils_1.Type.Intersect([constants_1.PROTO.BinanceCancelMsg, schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('BinanceCancelMsg')
})])]);
exports.BinancePreparedTransaction = schema_utils_1.Type.Intersect([exports.BinanceSDKTransaction, schema_utils_1.Type.Object({
  messages: schema_utils_1.Type.Array(exports.BinancePreparedMessage),
  account_number: schema_utils_1.Type.Number(),
  sequence: schema_utils_1.Type.Number(),
  source: schema_utils_1.Type.Number()
})]);
exports.BinanceSignTransaction = schema_utils_1.Type.Object({
  path: params_1.DerivationPath,
  transaction: exports.BinanceSDKTransaction,
  chunkify: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean())
});

/***/ }),

/***/ 1216:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.VerifyMessage = exports.SignMessage = void 0;
const params_1 = __webpack_require__(7800);
const schema_utils_1 = __webpack_require__(3404);
exports.SignMessage = schema_utils_1.Type.Object({
  path: params_1.DerivationPath,
  coin: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  message: schema_utils_1.Type.String(),
  hex: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean()),
  no_script_type: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean())
});
exports.VerifyMessage = schema_utils_1.Type.Object({
  address: schema_utils_1.Type.String(),
  signature: schema_utils_1.Type.String(),
  message: schema_utils_1.Type.String(),
  coin: schema_utils_1.Type.String(),
  hex: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean())
});

/***/ }),

/***/ 7240:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.CardanoSignedTxData = exports.CardanoAuxiliaryDataSupplement = exports.CardanoSignedTxWitness = exports.CardanoSignTransactionExtended = exports.CardanoSignTransaction = exports.CardanoAuxiliaryData = exports.CardanoCVoteRegistrationParameters = exports.CardanoCVoteRegistrationDelegation = exports.CardanoReferenceInput = exports.CardanoRequiredSigner = exports.CardanoCollateralInput = exports.CardanoMint = exports.CardanoWithdrawal = exports.CardanoCertificate = exports.CardanoPoolParameters = exports.CardanoPoolMargin = exports.CardanoPoolMetadata = exports.CardanoPoolRelay = exports.CardanoPoolOwner = exports.CardanoOutput = exports.CardanoAssetGroup = exports.CardanoToken = exports.CardanoInput = exports.CardanoGetPublicKey = exports.CardanoNativeScriptHash = exports.CardanoGetNativeScriptHash = exports.CardanoNativeScript = exports.CardanoGetAddress = exports.CardanoAddressParameters = exports.CardanoCertificatePointer = void 0;
const schema_utils_1 = __webpack_require__(3404);
const constants_1 = __webpack_require__(6743);
const params_1 = __webpack_require__(7800);
exports.CardanoCertificatePointer = schema_utils_1.Type.Object({
  blockIndex: schema_utils_1.Type.Number(),
  txIndex: schema_utils_1.Type.Number(),
  certificateIndex: schema_utils_1.Type.Number()
});
exports.CardanoAddressParameters = schema_utils_1.Type.Object({
  addressType: constants_1.PROTO.EnumCardanoAddressType,
  path: schema_utils_1.Type.Optional(params_1.DerivationPath),
  stakingPath: schema_utils_1.Type.Optional(params_1.DerivationPath),
  stakingKeyHash: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  certificatePointer: schema_utils_1.Type.Optional(exports.CardanoCertificatePointer),
  paymentScriptHash: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  stakingScriptHash: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.CardanoGetAddress = schema_utils_1.Type.Object({
  addressParameters: exports.CardanoAddressParameters,
  protocolMagic: schema_utils_1.Type.Number(),
  networkId: schema_utils_1.Type.Number(),
  address: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  showOnTrezor: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean()),
  derivationType: schema_utils_1.Type.Optional(constants_1.PROTO.EnumCardanoDerivationType),
  chunkify: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean())
});
exports.CardanoNativeScript = schema_utils_1.Type.Recursive(This => schema_utils_1.Type.Object({
  type: constants_1.PROTO.EnumCardanoNativeScriptType,
  scripts: schema_utils_1.Type.Optional(schema_utils_1.Type.Array(This)),
  keyHash: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  keyPath: schema_utils_1.Type.Optional(params_1.DerivationPath),
  requiredSignaturesCount: schema_utils_1.Type.Optional(schema_utils_1.Type.Number()),
  invalidBefore: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  invalidHereafter: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
}));
exports.CardanoGetNativeScriptHash = schema_utils_1.Type.Object({
  script: exports.CardanoNativeScript,
  displayFormat: constants_1.PROTO.EnumCardanoNativeScriptHashDisplayFormat,
  derivationType: schema_utils_1.Type.Optional(constants_1.PROTO.EnumCardanoDerivationType)
});
exports.CardanoNativeScriptHash = schema_utils_1.Type.Object({
  scriptHash: schema_utils_1.Type.String()
});
exports.CardanoGetPublicKey = schema_utils_1.Type.Intersect([params_1.GetPublicKey, schema_utils_1.Type.Object({
  derivationType: schema_utils_1.Type.Optional(constants_1.PROTO.EnumCardanoDerivationType)
})]);
exports.CardanoInput = schema_utils_1.Type.Object({
  path: schema_utils_1.Type.Optional(params_1.DerivationPath),
  prev_hash: schema_utils_1.Type.String(),
  prev_index: schema_utils_1.Type.Number()
});
exports.CardanoToken = schema_utils_1.Type.Object({
  assetNameBytes: schema_utils_1.Type.String(),
  amount: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  mintAmount: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.CardanoAssetGroup = schema_utils_1.Type.Object({
  policyId: schema_utils_1.Type.String(),
  tokenAmounts: schema_utils_1.Type.Array(exports.CardanoToken)
});
exports.CardanoOutput = schema_utils_1.Type.Intersect([schema_utils_1.Type.Union([schema_utils_1.Type.Object({
  addressParameters: exports.CardanoAddressParameters
}), schema_utils_1.Type.Object({
  address: schema_utils_1.Type.String()
})]), schema_utils_1.Type.Object({
  amount: schema_utils_1.Type.String(),
  tokenBundle: schema_utils_1.Type.Optional(schema_utils_1.Type.Array(exports.CardanoAssetGroup)),
  datumHash: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  format: schema_utils_1.Type.Optional(constants_1.PROTO.EnumCardanoTxOutputSerializationFormat),
  inlineDatum: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  referenceScript: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
})]);
exports.CardanoPoolOwner = schema_utils_1.Type.Object({
  stakingKeyPath: schema_utils_1.Type.Optional(params_1.DerivationPath),
  stakingKeyHash: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.CardanoPoolRelay = schema_utils_1.Type.Object({
  type: constants_1.PROTO.EnumCardanoPoolRelayType,
  ipv4Address: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  ipv6Address: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  port: schema_utils_1.Type.Optional(schema_utils_1.Type.Number()),
  hostName: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.CardanoPoolMetadata = schema_utils_1.Type.Object({
  url: schema_utils_1.Type.String(),
  hash: schema_utils_1.Type.String()
});
exports.CardanoPoolMargin = schema_utils_1.Type.Object({
  numerator: schema_utils_1.Type.String(),
  denominator: schema_utils_1.Type.String()
});
exports.CardanoPoolParameters = schema_utils_1.Type.Object({
  poolId: schema_utils_1.Type.String(),
  vrfKeyHash: schema_utils_1.Type.String(),
  pledge: schema_utils_1.Type.String(),
  cost: schema_utils_1.Type.String(),
  margin: exports.CardanoPoolMargin,
  rewardAccount: schema_utils_1.Type.String(),
  owners: schema_utils_1.Type.Array(exports.CardanoPoolOwner, {
    minItems: 1
  }),
  relays: schema_utils_1.Type.Array(exports.CardanoPoolRelay),
  metadata: schema_utils_1.Type.Optional(exports.CardanoPoolMetadata)
});
exports.CardanoCertificate = schema_utils_1.Type.Object({
  type: constants_1.PROTO.EnumCardanoCertificateType,
  path: schema_utils_1.Type.Optional(params_1.DerivationPath),
  pool: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  poolParameters: schema_utils_1.Type.Optional(exports.CardanoPoolParameters),
  scriptHash: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  keyHash: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.CardanoWithdrawal = schema_utils_1.Type.Object({
  path: schema_utils_1.Type.Optional(params_1.DerivationPath),
  amount: schema_utils_1.Type.String(),
  scriptHash: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  keyHash: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.CardanoMint = schema_utils_1.Type.Array(exports.CardanoAssetGroup);
exports.CardanoCollateralInput = schema_utils_1.Type.Object({
  path: schema_utils_1.Type.Optional(params_1.DerivationPath),
  prev_hash: schema_utils_1.Type.String(),
  prev_index: schema_utils_1.Type.Number()
});
exports.CardanoRequiredSigner = schema_utils_1.Type.Object({
  keyPath: schema_utils_1.Type.Optional(params_1.DerivationPath),
  keyHash: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.CardanoReferenceInput = schema_utils_1.Type.Object({
  prev_hash: schema_utils_1.Type.String(),
  prev_index: schema_utils_1.Type.Number()
});
exports.CardanoCVoteRegistrationDelegation = schema_utils_1.Type.Object({
  votePublicKey: schema_utils_1.Type.String(),
  weight: schema_utils_1.Type.Number()
});
exports.CardanoCVoteRegistrationParameters = schema_utils_1.Type.Object({
  votePublicKey: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  stakingPath: params_1.DerivationPath,
  paymentAddressParameters: schema_utils_1.Type.Optional(exports.CardanoAddressParameters),
  nonce: schema_utils_1.Type.String(),
  format: schema_utils_1.Type.Optional(constants_1.PROTO.EnumCardanoCVoteRegistrationFormat),
  delegations: schema_utils_1.Type.Optional(schema_utils_1.Type.Array(exports.CardanoCVoteRegistrationDelegation)),
  votingPurpose: schema_utils_1.Type.Optional(schema_utils_1.Type.Number()),
  paymentAddress: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.CardanoAuxiliaryData = schema_utils_1.Type.Object({
  hash: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  cVoteRegistrationParameters: schema_utils_1.Type.Optional(exports.CardanoCVoteRegistrationParameters)
});
exports.CardanoSignTransaction = schema_utils_1.Type.Object({
  inputs: schema_utils_1.Type.Array(exports.CardanoInput),
  outputs: schema_utils_1.Type.Array(exports.CardanoOutput),
  fee: schema_utils_1.Type.Uint(),
  ttl: schema_utils_1.Type.Optional(schema_utils_1.Type.Uint()),
  certificates: schema_utils_1.Type.Optional(schema_utils_1.Type.Array(exports.CardanoCertificate)),
  withdrawals: schema_utils_1.Type.Optional(schema_utils_1.Type.Array(exports.CardanoWithdrawal)),
  validityIntervalStart: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  auxiliaryData: schema_utils_1.Type.Optional(exports.CardanoAuxiliaryData),
  mint: schema_utils_1.Type.Optional(exports.CardanoMint),
  scriptDataHash: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  collateralInputs: schema_utils_1.Type.Optional(schema_utils_1.Type.Array(exports.CardanoCollateralInput)),
  requiredSigners: schema_utils_1.Type.Optional(schema_utils_1.Type.Array(exports.CardanoRequiredSigner)),
  collateralReturn: schema_utils_1.Type.Optional(exports.CardanoOutput),
  totalCollateral: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  referenceInputs: schema_utils_1.Type.Optional(schema_utils_1.Type.Array(exports.CardanoReferenceInput)),
  additionalWitnessRequests: schema_utils_1.Type.Optional(schema_utils_1.Type.Array(params_1.DerivationPath)),
  protocolMagic: schema_utils_1.Type.Number(),
  networkId: schema_utils_1.Type.Number(),
  signingMode: constants_1.PROTO.EnumCardanoTxSigningMode,
  derivationType: schema_utils_1.Type.Optional(constants_1.PROTO.EnumCardanoDerivationType),
  includeNetworkId: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean()),
  chunkify: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean())
});
exports.CardanoSignTransactionExtended = schema_utils_1.Type.Intersect([exports.CardanoSignTransaction, schema_utils_1.Type.Object({
  unsignedTx: schema_utils_1.Type.Object({
    body: schema_utils_1.Type.String(),
    hash: schema_utils_1.Type.String()
  }),
  testnet: schema_utils_1.Type.Boolean()
})]);
exports.CardanoSignedTxWitness = schema_utils_1.Type.Object({
  type: constants_1.PROTO.EnumCardanoTxWitnessType,
  pubKey: schema_utils_1.Type.String(),
  signature: schema_utils_1.Type.String(),
  chainCode: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.CardanoAuxiliaryDataSupplement = schema_utils_1.Type.Object({
  type: constants_1.PROTO.EnumCardanoTxAuxiliaryDataSupplementType,
  auxiliaryDataHash: schema_utils_1.Type.String(),
  cVoteRegistrationSignature: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.CardanoSignedTxData = schema_utils_1.Type.Object({
  hash: schema_utils_1.Type.String(),
  witnesses: schema_utils_1.Type.Array(exports.CardanoSignedTxWitness),
  auxiliaryDataSupplement: schema_utils_1.Type.Optional(exports.CardanoAuxiliaryDataSupplement)
});

/***/ }),

/***/ 2869:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.EosSignTransaction = exports.EosSDKTransaction = exports.EosTxAction = exports.EosTxActionCommon = exports.EosAuthorization = exports.EosTxHeader = exports.EosPublicKey = void 0;
const constants_1 = __webpack_require__(6743);
const params_1 = __webpack_require__(7800);
const schema_utils_1 = __webpack_require__(3404);
exports.EosPublicKey = schema_utils_1.Type.Object({
  wifPublicKey: schema_utils_1.Type.String(),
  rawPublicKey: schema_utils_1.Type.String(),
  path: schema_utils_1.Type.Array(schema_utils_1.Type.Number()),
  serializedPath: schema_utils_1.Type.String()
});
exports.EosTxHeader = schema_utils_1.Type.Object({
  expiration: schema_utils_1.Type.Union([schema_utils_1.Type.Uint(), schema_utils_1.Type.String()]),
  refBlockNum: schema_utils_1.Type.Number(),
  refBlockPrefix: schema_utils_1.Type.Number(),
  maxNetUsageWords: schema_utils_1.Type.Number(),
  maxCpuUsageMs: schema_utils_1.Type.Number(),
  delaySec: schema_utils_1.Type.Number()
});
exports.EosAuthorization = schema_utils_1.Type.Object({
  threshold: schema_utils_1.Type.Number(),
  keys: schema_utils_1.Type.Array(constants_1.PROTO.EosAuthorizationKey),
  accounts: schema_utils_1.Type.Array(schema_utils_1.Type.Object({
    permission: constants_1.PROTO.EosPermissionLevel,
    weight: schema_utils_1.Type.Number()
  })),
  waits: schema_utils_1.Type.Array(constants_1.PROTO.EosAuthorizationWait)
});
exports.EosTxActionCommon = schema_utils_1.Type.Object({
  account: schema_utils_1.Type.String(),
  authorization: schema_utils_1.Type.Array(constants_1.PROTO.EosPermissionLevel)
});
exports.EosTxAction = schema_utils_1.Type.Union([schema_utils_1.Type.Intersect([exports.EosTxActionCommon, schema_utils_1.Type.Object({
  name: schema_utils_1.Type.Literal('transfer'),
  data: schema_utils_1.Type.Object({
    from: schema_utils_1.Type.String(),
    to: schema_utils_1.Type.String(),
    quantity: schema_utils_1.Type.String(),
    memo: schema_utils_1.Type.String()
  })
})]), schema_utils_1.Type.Intersect([exports.EosTxActionCommon, schema_utils_1.Type.Object({
  name: schema_utils_1.Type.Literal('delegatebw'),
  data: schema_utils_1.Type.Object({
    from: schema_utils_1.Type.String(),
    receiver: schema_utils_1.Type.String(),
    stake_net_quantity: schema_utils_1.Type.String(),
    stake_cpu_quantity: schema_utils_1.Type.String(),
    transfer: schema_utils_1.Type.Boolean()
  })
})]), schema_utils_1.Type.Intersect([exports.EosTxActionCommon, schema_utils_1.Type.Object({
  name: schema_utils_1.Type.Literal('undelegatebw'),
  data: schema_utils_1.Type.Object({
    from: schema_utils_1.Type.String(),
    receiver: schema_utils_1.Type.String(),
    unstake_net_quantity: schema_utils_1.Type.String(),
    unstake_cpu_quantity: schema_utils_1.Type.String()
  })
})]), schema_utils_1.Type.Intersect([exports.EosTxActionCommon, schema_utils_1.Type.Object({
  name: schema_utils_1.Type.Literal('buyram'),
  data: schema_utils_1.Type.Object({
    payer: schema_utils_1.Type.String(),
    receiver: schema_utils_1.Type.String(),
    quant: schema_utils_1.Type.String()
  })
})]), schema_utils_1.Type.Intersect([exports.EosTxActionCommon, schema_utils_1.Type.Object({
  name: schema_utils_1.Type.Literal('buyrambytes'),
  data: constants_1.PROTO.EosActionBuyRamBytes
})]), schema_utils_1.Type.Intersect([exports.EosTxActionCommon, schema_utils_1.Type.Object({
  name: schema_utils_1.Type.Literal('sellram'),
  data: constants_1.PROTO.EosActionSellRam
})]), schema_utils_1.Type.Intersect([exports.EosTxActionCommon, schema_utils_1.Type.Object({
  name: schema_utils_1.Type.Literal('voteproducer'),
  data: schema_utils_1.Type.Object({
    voter: schema_utils_1.Type.String(),
    proxy: schema_utils_1.Type.String(),
    producers: schema_utils_1.Type.Array(schema_utils_1.Type.String())
  })
})]), schema_utils_1.Type.Intersect([exports.EosTxActionCommon, schema_utils_1.Type.Object({
  name: schema_utils_1.Type.Literal('refund'),
  data: constants_1.PROTO.EosActionRefund
})]), schema_utils_1.Type.Intersect([exports.EosTxActionCommon, schema_utils_1.Type.Object({
  name: schema_utils_1.Type.Literal('updateauth'),
  data: schema_utils_1.Type.Object({
    account: schema_utils_1.Type.String(),
    permission: schema_utils_1.Type.String(),
    parent: schema_utils_1.Type.String(),
    auth: exports.EosAuthorization
  })
})]), schema_utils_1.Type.Intersect([exports.EosTxActionCommon, schema_utils_1.Type.Object({
  name: schema_utils_1.Type.Literal('deleteauth'),
  data: constants_1.PROTO.EosActionDeleteAuth
})]), schema_utils_1.Type.Intersect([exports.EosTxActionCommon, schema_utils_1.Type.Object({
  name: schema_utils_1.Type.Literal('linkauth'),
  data: constants_1.PROTO.EosActionLinkAuth
})]), schema_utils_1.Type.Intersect([exports.EosTxActionCommon, schema_utils_1.Type.Object({
  name: schema_utils_1.Type.Literal('unlinkauth'),
  data: constants_1.PROTO.EosActionUnlinkAuth
})]), schema_utils_1.Type.Intersect([exports.EosTxActionCommon, schema_utils_1.Type.Object({
  name: schema_utils_1.Type.Literal('newaccount'),
  data: schema_utils_1.Type.Object({
    creator: schema_utils_1.Type.String(),
    name: schema_utils_1.Type.String(),
    owner: exports.EosAuthorization,
    active: exports.EosAuthorization
  })
})])]);
exports.EosSDKTransaction = schema_utils_1.Type.Object({
  chainId: schema_utils_1.Type.String(),
  header: exports.EosTxHeader,
  actions: schema_utils_1.Type.Array(schema_utils_1.Type.Union([exports.EosTxAction, schema_utils_1.Type.Intersect([exports.EosTxActionCommon, schema_utils_1.Type.Object({
    name: schema_utils_1.Type.String(),
    data: schema_utils_1.Type.String()
  })])]))
});
exports.EosSignTransaction = schema_utils_1.Type.Object({
  path: params_1.DerivationPath,
  transaction: exports.EosSDKTransaction,
  chunkify: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean())
});

/***/ }),

/***/ 2972:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.EthereumVerifyMessage = exports.EthereumSignTypedHash = exports.EthereumSignTypedData = exports.EthereumSignTypedDataMessage = exports.EthereumSignTypedDataTypes = exports.EthereumSignedTx = exports.EthereumSignTransaction = exports.EthereumTransactionEIP1559 = exports.EthereumAccessList = exports.EthereumTransaction = exports.EthereumSignMessage = void 0;
const schema_utils_1 = __webpack_require__(3404);
const params_1 = __webpack_require__(7800);
exports.EthereumSignMessage = schema_utils_1.Type.Object({
  path: params_1.DerivationPath,
  message: schema_utils_1.Type.String(),
  hex: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean())
});
exports.EthereumTransaction = schema_utils_1.Type.Object({
  to: schema_utils_1.Type.String(),
  value: schema_utils_1.Type.String(),
  gasPrice: schema_utils_1.Type.String(),
  gasLimit: schema_utils_1.Type.String(),
  maxFeePerGas: schema_utils_1.Type.Optional(schema_utils_1.Type.Undefined()),
  maxPriorityFeePerGas: schema_utils_1.Type.Optional(schema_utils_1.Type.Undefined()),
  nonce: schema_utils_1.Type.String(),
  data: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  chainId: schema_utils_1.Type.Number(),
  txType: schema_utils_1.Type.Optional(schema_utils_1.Type.Number())
});
exports.EthereumAccessList = schema_utils_1.Type.Object({
  address: schema_utils_1.Type.String(),
  storageKeys: schema_utils_1.Type.Array(schema_utils_1.Type.String())
});
exports.EthereumTransactionEIP1559 = schema_utils_1.Type.Object({
  to: schema_utils_1.Type.String(),
  value: schema_utils_1.Type.String(),
  gasLimit: schema_utils_1.Type.String(),
  gasPrice: schema_utils_1.Type.Optional(schema_utils_1.Type.Undefined()),
  nonce: schema_utils_1.Type.String(),
  data: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  chainId: schema_utils_1.Type.Number(),
  maxFeePerGas: schema_utils_1.Type.String(),
  maxPriorityFeePerGas: schema_utils_1.Type.String(),
  accessList: schema_utils_1.Type.Optional(schema_utils_1.Type.Array(exports.EthereumAccessList))
});
exports.EthereumSignTransaction = schema_utils_1.Type.Object({
  path: params_1.DerivationPath,
  transaction: schema_utils_1.Type.Union([exports.EthereumTransaction, exports.EthereumTransactionEIP1559]),
  chunkify: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean())
});
exports.EthereumSignedTx = schema_utils_1.Type.Object({
  v: schema_utils_1.Type.String(),
  r: schema_utils_1.Type.String(),
  s: schema_utils_1.Type.String(),
  serializedTx: schema_utils_1.Type.String()
});
const EthereumSignTypedDataTypeProperty = schema_utils_1.Type.Object({
  name: schema_utils_1.Type.String(),
  type: schema_utils_1.Type.String()
});
exports.EthereumSignTypedDataTypes = schema_utils_1.Type.Object({
  EIP712Domain: schema_utils_1.Type.Array(EthereumSignTypedDataTypeProperty)
}, {
  additionalProperties: schema_utils_1.Type.Array(EthereumSignTypedDataTypeProperty)
});
exports.EthereumSignTypedDataMessage = schema_utils_1.Type.Object({
  types: exports.EthereumSignTypedDataTypes,
  primaryType: schema_utils_1.Type.String(),
  domain: schema_utils_1.Type.Object({
    name: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
    version: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
    chainId: schema_utils_1.Type.Optional(schema_utils_1.Type.Union([schema_utils_1.Type.Number(), schema_utils_1.Type.BigInt(), schema_utils_1.Type.String()])),
    verifyingContract: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
    salt: schema_utils_1.Type.Optional(schema_utils_1.Type.Union([schema_utils_1.Type.ArrayBuffer(), schema_utils_1.Type.String()]))
  }),
  message: schema_utils_1.Type.Object({}, {
    additionalProperties: schema_utils_1.Type.Any()
  })
});
exports.EthereumSignTypedData = schema_utils_1.Type.Object({
  path: params_1.DerivationPath,
  data: exports.EthereumSignTypedDataMessage,
  metamask_v4_compat: schema_utils_1.Type.Boolean(),
  domain_separator_hash: schema_utils_1.Type.Optional(schema_utils_1.Type.Undefined()),
  message_hash: schema_utils_1.Type.Optional(schema_utils_1.Type.Undefined())
});
exports.EthereumSignTypedHash = schema_utils_1.Type.Object({
  path: params_1.DerivationPath,
  data: exports.EthereumSignTypedDataMessage,
  metamask_v4_compat: schema_utils_1.Type.Boolean(),
  domain_separator_hash: schema_utils_1.Type.String(),
  message_hash: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.EthereumVerifyMessage = schema_utils_1.Type.Object({
  address: schema_utils_1.Type.String(),
  message: schema_utils_1.Type.String(),
  hex: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean()),
  signature: schema_utils_1.Type.String()
});

/***/ }),

/***/ 9280:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));

/***/ }),

/***/ 3608:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.RippleSignedTx = exports.RippleSignTransaction = exports.RippleTransaction = exports.RipplePayment = void 0;
const params_1 = __webpack_require__(7800);
const schema_utils_1 = __webpack_require__(3404);
exports.RipplePayment = schema_utils_1.Type.Object({
  amount: schema_utils_1.Type.String(),
  destination: schema_utils_1.Type.String(),
  destinationTag: schema_utils_1.Type.Optional(schema_utils_1.Type.Number())
});
exports.RippleTransaction = schema_utils_1.Type.Object({
  fee: schema_utils_1.Type.String(),
  flags: schema_utils_1.Type.Optional(schema_utils_1.Type.Number()),
  sequence: schema_utils_1.Type.Number(),
  maxLedgerVersion: schema_utils_1.Type.Optional(schema_utils_1.Type.Number()),
  payment: exports.RipplePayment
});
exports.RippleSignTransaction = schema_utils_1.Type.Object({
  path: params_1.DerivationPath,
  transaction: exports.RippleTransaction,
  chunkify: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean())
});
exports.RippleSignedTx = schema_utils_1.Type.Object({
  serializedTx: schema_utils_1.Type.String(),
  signature: schema_utils_1.Type.String()
});

/***/ }),

/***/ 4624:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.SolanaSignedTransaction = exports.SolanaSignTransaction = exports.SolanaTxAdditionalInfo = exports.SolanaTxTokenAccountInfo = exports.SolanaPublicKey = void 0;
const params_1 = __webpack_require__(7800);
const schema_utils_1 = __webpack_require__(3404);
exports.SolanaPublicKey = schema_utils_1.Type.Intersect([params_1.PublicKey, schema_utils_1.Type.Object({
  publicKey: schema_utils_1.Type.String()
})]);
exports.SolanaTxTokenAccountInfo = schema_utils_1.Type.Object({
  baseAddress: schema_utils_1.Type.String(),
  tokenProgram: schema_utils_1.Type.String(),
  tokenMint: schema_utils_1.Type.String(),
  tokenAccount: schema_utils_1.Type.String()
});
exports.SolanaTxAdditionalInfo = schema_utils_1.Type.Object({
  tokenAccountsInfos: schema_utils_1.Type.Optional(schema_utils_1.Type.Array(exports.SolanaTxTokenAccountInfo, {
    minItems: 1
  }))
});
exports.SolanaSignTransaction = schema_utils_1.Type.Object({
  path: schema_utils_1.Type.Union([schema_utils_1.Type.String(), schema_utils_1.Type.Array(schema_utils_1.Type.Number())]),
  serializedTx: schema_utils_1.Type.String(),
  additionalInfo: schema_utils_1.Type.Optional(exports.SolanaTxAdditionalInfo)
});
exports.SolanaSignedTransaction = schema_utils_1.Type.Object({
  signature: schema_utils_1.Type.String()
});

/***/ }),

/***/ 2788:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.StellarOperationMessage = exports.StellarSignedTx = exports.StellarSignTransaction = exports.StellarTransaction = exports.StellarOperation = exports.StellarClaimClaimableBalanceOperation = exports.StellarInflationOperation = exports.StellarBumpSequenceOperation = exports.StellarManageDataOperation = exports.StellarAccountMergeOperation = exports.StellarAllowTrustOperation = exports.StellarChangeTrustOperation = exports.StellarSetOptionsOperation = exports.StellarManageBuyOfferOperation = exports.StellarManageSellOfferOperation = exports.StellarPassiveSellOfferOperation = exports.StellarPathPaymentStrictSendOperation = exports.StellarPathPaymentStrictReceiveOperation = exports.StellarPaymentOperation = exports.StellarCreateAccountOperation = exports.StellarAsset = void 0;
const constants_1 = __webpack_require__(6743);
const params_1 = __webpack_require__(7800);
const schema_utils_1 = __webpack_require__(3404);
exports.StellarAsset = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Union([constants_1.PROTO.EnumStellarAssetType, schema_utils_1.Type.KeyOfEnum(constants_1.PROTO.StellarAssetType)]),
  code: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  issuer: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.StellarCreateAccountOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('createAccount'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  destination: schema_utils_1.Type.String(),
  startingBalance: schema_utils_1.Type.String()
});
exports.StellarPaymentOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('payment'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  destination: schema_utils_1.Type.String(),
  asset: exports.StellarAsset,
  amount: schema_utils_1.Type.String()
});
exports.StellarPathPaymentStrictReceiveOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('pathPaymentStrictReceive'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  sendAsset: exports.StellarAsset,
  sendMax: schema_utils_1.Type.Uint(),
  destination: schema_utils_1.Type.String(),
  destAsset: exports.StellarAsset,
  destAmount: schema_utils_1.Type.Uint(),
  path: schema_utils_1.Type.Optional(schema_utils_1.Type.Array(exports.StellarAsset))
});
exports.StellarPathPaymentStrictSendOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('pathPaymentStrictSend'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  sendAsset: exports.StellarAsset,
  sendAmount: schema_utils_1.Type.Uint(),
  destination: schema_utils_1.Type.String(),
  destAsset: exports.StellarAsset,
  destMin: schema_utils_1.Type.Uint(),
  path: schema_utils_1.Type.Optional(schema_utils_1.Type.Array(exports.StellarAsset))
});
exports.StellarPassiveSellOfferOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('createPassiveSellOffer'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  buying: exports.StellarAsset,
  selling: exports.StellarAsset,
  amount: schema_utils_1.Type.Uint(),
  price: schema_utils_1.Type.Object({
    n: schema_utils_1.Type.Number(),
    d: schema_utils_1.Type.Number()
  })
});
exports.StellarManageSellOfferOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('manageSellOffer'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  buying: exports.StellarAsset,
  selling: exports.StellarAsset,
  amount: schema_utils_1.Type.Uint(),
  offerId: schema_utils_1.Type.Optional(schema_utils_1.Type.Uint()),
  price: schema_utils_1.Type.Object({
    n: schema_utils_1.Type.Number(),
    d: schema_utils_1.Type.Number()
  })
});
exports.StellarManageBuyOfferOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('manageBuyOffer'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  buying: exports.StellarAsset,
  selling: exports.StellarAsset,
  amount: schema_utils_1.Type.Uint(),
  offerId: schema_utils_1.Type.Optional(schema_utils_1.Type.Uint()),
  price: schema_utils_1.Type.Object({
    n: schema_utils_1.Type.Number(),
    d: schema_utils_1.Type.Number()
  })
});
exports.StellarSetOptionsOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('setOptions'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  signer: schema_utils_1.Type.Optional(schema_utils_1.Type.Object({
    type: constants_1.PROTO.EnumStellarSignerType,
    key: schema_utils_1.Type.Union([schema_utils_1.Type.String(), schema_utils_1.Type.Buffer()]),
    weight: schema_utils_1.Type.Optional(schema_utils_1.Type.Number())
  })),
  inflationDest: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  clearFlags: schema_utils_1.Type.Optional(schema_utils_1.Type.Number()),
  setFlags: schema_utils_1.Type.Optional(schema_utils_1.Type.Number()),
  masterWeight: schema_utils_1.Type.Optional(schema_utils_1.Type.Uint()),
  lowThreshold: schema_utils_1.Type.Optional(schema_utils_1.Type.Uint()),
  medThreshold: schema_utils_1.Type.Optional(schema_utils_1.Type.Uint()),
  highThreshold: schema_utils_1.Type.Optional(schema_utils_1.Type.Uint()),
  homeDomain: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.StellarChangeTrustOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('changeTrust'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  line: exports.StellarAsset,
  limit: schema_utils_1.Type.String()
});
exports.StellarAllowTrustOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('allowTrust'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  trustor: schema_utils_1.Type.String(),
  assetCode: schema_utils_1.Type.String(),
  assetType: constants_1.PROTO.EnumStellarAssetType,
  authorize: schema_utils_1.Type.Optional(schema_utils_1.Type.Union([schema_utils_1.Type.Boolean(), schema_utils_1.Type.Undefined()]))
});
exports.StellarAccountMergeOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('accountMerge'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  destination: schema_utils_1.Type.String()
});
exports.StellarManageDataOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('manageData'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  name: schema_utils_1.Type.String(),
  value: schema_utils_1.Type.Optional(schema_utils_1.Type.Union([schema_utils_1.Type.String(), schema_utils_1.Type.Buffer()]))
});
exports.StellarBumpSequenceOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('bumpSequence'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  bumpTo: schema_utils_1.Type.Uint()
});
exports.StellarInflationOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('inflation'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.StellarClaimClaimableBalanceOperation = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('claimClaimableBalance'),
  source: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  balanceId: schema_utils_1.Type.String()
});
exports.StellarOperation = schema_utils_1.Type.Union([exports.StellarCreateAccountOperation, exports.StellarPaymentOperation, exports.StellarPathPaymentStrictReceiveOperation, exports.StellarPathPaymentStrictSendOperation, exports.StellarPassiveSellOfferOperation, exports.StellarManageSellOfferOperation, exports.StellarManageBuyOfferOperation, exports.StellarSetOptionsOperation, exports.StellarChangeTrustOperation, exports.StellarAllowTrustOperation, exports.StellarAccountMergeOperation, exports.StellarInflationOperation, exports.StellarManageDataOperation, exports.StellarBumpSequenceOperation, exports.StellarClaimClaimableBalanceOperation]);
exports.StellarTransaction = schema_utils_1.Type.Object({
  source: schema_utils_1.Type.String(),
  fee: schema_utils_1.Type.Number(),
  sequence: schema_utils_1.Type.Uint(),
  timebounds: schema_utils_1.Type.Optional(schema_utils_1.Type.Object({
    minTime: schema_utils_1.Type.Number(),
    maxTime: schema_utils_1.Type.Number()
  })),
  memo: schema_utils_1.Type.Optional(schema_utils_1.Type.Object({
    type: constants_1.PROTO.EnumStellarMemoType,
    id: schema_utils_1.Type.Optional(schema_utils_1.Type.Uint()),
    text: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
    hash: schema_utils_1.Type.Optional(schema_utils_1.Type.Union([schema_utils_1.Type.String(), schema_utils_1.Type.Buffer()]))
  })),
  operations: schema_utils_1.Type.Array(exports.StellarOperation)
});
exports.StellarSignTransaction = schema_utils_1.Type.Object({
  path: params_1.DerivationPath,
  networkPassphrase: schema_utils_1.Type.String(),
  transaction: exports.StellarTransaction
});
exports.StellarSignedTx = schema_utils_1.Type.Object({
  publicKey: schema_utils_1.Type.String(),
  signature: schema_utils_1.Type.String()
});
exports.StellarOperationMessage = schema_utils_1.Type.Union([schema_utils_1.Type.Intersect([schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('StellarCreateAccountOp')
}), constants_1.PROTO.StellarCreateAccountOp]), schema_utils_1.Type.Intersect([schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('StellarPaymentOp')
}), constants_1.PROTO.StellarPaymentOp]), schema_utils_1.Type.Intersect([schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('StellarPathPaymentStrictReceiveOp')
}), constants_1.PROTO.StellarPathPaymentStrictReceiveOp]), schema_utils_1.Type.Intersect([schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('StellarPathPaymentStrictSendOp')
}), constants_1.PROTO.StellarPathPaymentStrictSendOp]), schema_utils_1.Type.Intersect([schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('StellarManageSellOfferOp')
}), constants_1.PROTO.StellarManageSellOfferOp]), schema_utils_1.Type.Intersect([schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('StellarManageBuyOfferOp')
}), constants_1.PROTO.StellarManageBuyOfferOp]), schema_utils_1.Type.Intersect([schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('StellarCreatePassiveSellOfferOp')
}), constants_1.PROTO.StellarCreatePassiveSellOfferOp]), schema_utils_1.Type.Intersect([schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('StellarSetOptionsOp')
}), constants_1.PROTO.StellarSetOptionsOp]), schema_utils_1.Type.Intersect([schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('StellarChangeTrustOp')
}), constants_1.PROTO.StellarChangeTrustOp]), schema_utils_1.Type.Intersect([schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('StellarAllowTrustOp')
}), constants_1.PROTO.StellarAllowTrustOp]), schema_utils_1.Type.Intersect([schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('StellarAccountMergeOp')
}), constants_1.PROTO.StellarAccountMergeOp]), schema_utils_1.Type.Intersect([schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('StellarManageDataOp')
}), constants_1.PROTO.StellarManageDataOp]), schema_utils_1.Type.Intersect([schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('StellarBumpSequenceOp')
}), constants_1.PROTO.StellarBumpSequenceOp]), schema_utils_1.Type.Intersect([schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('StellarClaimClaimableBalanceOp')
}), constants_1.PROTO.StellarClaimClaimableBalanceOp])]);

/***/ }),

/***/ 6344:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.TezosSignTransaction = exports.TezosOperation = exports.TezosDelegationOperation = exports.TezosOriginationOperation = exports.TezosTransactionOperation = exports.TezosParametersManager = exports.TezosManagerTransfer = exports.TezosRevealOperation = void 0;
const params_1 = __webpack_require__(7800);
const schema_utils_1 = __webpack_require__(3404);
exports.TezosRevealOperation = schema_utils_1.Type.Object({
  source: schema_utils_1.Type.String(),
  fee: schema_utils_1.Type.Number(),
  counter: schema_utils_1.Type.Number(),
  gas_limit: schema_utils_1.Type.Number(),
  storage_limit: schema_utils_1.Type.Number(),
  public_key: schema_utils_1.Type.String()
});
exports.TezosManagerTransfer = schema_utils_1.Type.Object({
  destination: schema_utils_1.Type.String(),
  amount: schema_utils_1.Type.Number()
});
exports.TezosParametersManager = schema_utils_1.Type.Object({
  set_delegate: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  cancel_delegate: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean()),
  transfer: schema_utils_1.Type.Optional(exports.TezosManagerTransfer)
});
exports.TezosTransactionOperation = schema_utils_1.Type.Object({
  source: schema_utils_1.Type.String(),
  destination: schema_utils_1.Type.String(),
  amount: schema_utils_1.Type.Number(),
  counter: schema_utils_1.Type.Number(),
  fee: schema_utils_1.Type.Number(),
  gas_limit: schema_utils_1.Type.Number(),
  storage_limit: schema_utils_1.Type.Number(),
  parameters: schema_utils_1.Type.Optional(schema_utils_1.Type.Array(schema_utils_1.Type.Number())),
  parameters_manager: schema_utils_1.Type.Optional(exports.TezosParametersManager)
});
exports.TezosOriginationOperation = schema_utils_1.Type.Object({
  source: schema_utils_1.Type.String(),
  balance: schema_utils_1.Type.Number(),
  delegate: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  script: params_1.DerivationPath,
  fee: schema_utils_1.Type.Number(),
  counter: schema_utils_1.Type.Number(),
  gas_limit: schema_utils_1.Type.Number(),
  storage_limit: schema_utils_1.Type.Number()
});
exports.TezosDelegationOperation = schema_utils_1.Type.Object({
  source: schema_utils_1.Type.String(),
  delegate: schema_utils_1.Type.String(),
  fee: schema_utils_1.Type.Number(),
  counter: schema_utils_1.Type.Number(),
  gas_limit: schema_utils_1.Type.Number(),
  storage_limit: schema_utils_1.Type.Number()
});
exports.TezosOperation = schema_utils_1.Type.Object({
  reveal: schema_utils_1.Type.Optional(exports.TezosRevealOperation),
  transaction: schema_utils_1.Type.Optional(exports.TezosTransactionOperation),
  origination: schema_utils_1.Type.Optional(exports.TezosOriginationOperation),
  delegation: schema_utils_1.Type.Optional(exports.TezosDelegationOperation)
});
exports.TezosSignTransaction = schema_utils_1.Type.Object({
  path: params_1.DerivationPath,
  branch: schema_utils_1.Type.String(),
  operation: exports.TezosOperation,
  chunkify: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean())
});

/***/ }),

/***/ 6464:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.CoinInfo = exports.MiscNetworkInfo = exports.EthereumNetworkInfo = exports.BitcoinNetworkInfo = exports.BlockchainLink = exports.CoinSupport = exports.CoinObj = exports.Network = exports.Bip32 = void 0;
const schema_utils_1 = __webpack_require__(3404);
const fees_1 = __webpack_require__(7284);
exports.Bip32 = schema_utils_1.Type.Object({
  public: schema_utils_1.Type.Number(),
  private: schema_utils_1.Type.Number()
});
exports.Network = schema_utils_1.Type.Object({
  messagePrefix: schema_utils_1.Type.String(),
  bech32: schema_utils_1.Type.String(),
  bip32: exports.Bip32,
  pubKeyHash: schema_utils_1.Type.Number(),
  scriptHash: schema_utils_1.Type.Number(),
  wif: schema_utils_1.Type.Number(),
  forkId: schema_utils_1.Type.Optional(schema_utils_1.Type.Number())
});
exports.CoinObj = schema_utils_1.Type.Object({
  coin: schema_utils_1.Type.String()
});
exports.CoinSupport = schema_utils_1.Type.Object({
  connect: schema_utils_1.Type.Boolean(),
  T1B1: schema_utils_1.Type.Union([schema_utils_1.Type.String(), schema_utils_1.Type.Literal(false)]),
  T2T1: schema_utils_1.Type.Union([schema_utils_1.Type.String(), schema_utils_1.Type.Literal(false)]),
  T2B1: schema_utils_1.Type.Union([schema_utils_1.Type.String(), schema_utils_1.Type.Literal(false)])
});
exports.BlockchainLink = schema_utils_1.Type.Object({
  type: schema_utils_1.Type.String(),
  url: schema_utils_1.Type.Array(schema_utils_1.Type.String())
});
const Common = schema_utils_1.Type.Object({
  label: schema_utils_1.Type.String(),
  name: schema_utils_1.Type.String(),
  shortcut: schema_utils_1.Type.String(),
  slip44: schema_utils_1.Type.Number(),
  support: exports.CoinSupport,
  decimals: schema_utils_1.Type.Number(),
  blockchainLink: schema_utils_1.Type.Optional(exports.BlockchainLink),
  blockTime: schema_utils_1.Type.Number(),
  minFee: schema_utils_1.Type.Number(),
  maxFee: schema_utils_1.Type.Number(),
  defaultFees: schema_utils_1.Type.Array(fees_1.FeeLevel)
});
exports.BitcoinNetworkInfo = schema_utils_1.Type.Intersect([Common, schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('bitcoin'),
  cashAddrPrefix: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  curveName: schema_utils_1.Type.String(),
  dustLimit: schema_utils_1.Type.Number(),
  forceBip143: schema_utils_1.Type.Boolean(),
  hashGenesisBlock: schema_utils_1.Type.String(),
  maxAddressLength: schema_utils_1.Type.Number(),
  maxFeeSatoshiKb: schema_utils_1.Type.Number(),
  minAddressLength: schema_utils_1.Type.Number(),
  minFeeSatoshiKb: schema_utils_1.Type.Number(),
  segwit: schema_utils_1.Type.Boolean(),
  xPubMagic: schema_utils_1.Type.Number(),
  xPubMagicSegwitNative: schema_utils_1.Type.Optional(schema_utils_1.Type.Number()),
  xPubMagicSegwit: schema_utils_1.Type.Optional(schema_utils_1.Type.Number()),
  taproot: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean()),
  network: exports.Network,
  isBitcoin: schema_utils_1.Type.Boolean()
})]);
exports.EthereumNetworkInfo = schema_utils_1.Type.Intersect([Common, schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Literal('ethereum'),
  chainId: schema_utils_1.Type.Number(),
  network: schema_utils_1.Type.Optional(schema_utils_1.Type.Undefined())
})]);
exports.MiscNetworkInfo = schema_utils_1.Type.Intersect([Common, schema_utils_1.Type.Object({
  type: schema_utils_1.Type.Union([schema_utils_1.Type.Literal('misc'), schema_utils_1.Type.Literal('nem')]),
  curve: schema_utils_1.Type.String(),
  network: schema_utils_1.Type.Optional(schema_utils_1.Type.Undefined())
})]);
exports.CoinInfo = schema_utils_1.Type.Union([exports.BitcoinNetworkInfo, exports.EthereumNetworkInfo, exports.MiscNetworkInfo]);

/***/ }),

/***/ 5840:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.DeviceModelInternal = exports.FirmwareType = void 0;
var FirmwareType;
(function (FirmwareType) {
  FirmwareType["BitcoinOnly"] = "bitcoin-only";
  FirmwareType["Regular"] = "regular";
})(FirmwareType || (exports.FirmwareType = FirmwareType = {}));
var protobuf_1 = __webpack_require__(9184);
Object.defineProperty(exports, "DeviceModelInternal", ({
  enumerable: true,
  get: function () {
    return protobuf_1.DeviceModelInternal;
  }
}));

/***/ }),

/***/ 7284:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.SelectFeeLevel = exports.FeeLevel = exports.FeeInfo = void 0;
const schema_utils_1 = __webpack_require__(3404);
exports.FeeInfo = schema_utils_1.Type.Object({
  blockTime: schema_utils_1.Type.Number(),
  minFee: schema_utils_1.Type.Number(),
  maxFee: schema_utils_1.Type.Number(),
  dustLimit: schema_utils_1.Type.Number()
});
exports.FeeLevel = schema_utils_1.Type.Object({
  label: schema_utils_1.Type.Union([schema_utils_1.Type.Literal('high'), schema_utils_1.Type.Literal('normal'), schema_utils_1.Type.Literal('economy'), schema_utils_1.Type.Literal('low'), schema_utils_1.Type.Literal('custom')]),
  feePerUnit: schema_utils_1.Type.String(),
  blocks: schema_utils_1.Type.Number(),
  feeLimit: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  feePerTx: schema_utils_1.Type.Optional(schema_utils_1.Type.String())
});
exports.SelectFeeLevel = schema_utils_1.Type.Union([schema_utils_1.Type.Object({
  name: schema_utils_1.Type.String(),
  fee: schema_utils_1.Type.Literal('0'),
  feePerByte: schema_utils_1.Type.Optional(schema_utils_1.Type.Undefined()),
  disabled: schema_utils_1.Type.Literal(true)
}), schema_utils_1.Type.Object({
  name: schema_utils_1.Type.String(),
  fee: schema_utils_1.Type.String(),
  feePerByte: schema_utils_1.Type.String(),
  minutes: schema_utils_1.Type.Number(),
  total: schema_utils_1.Type.String()
})]);

/***/ }),

/***/ 2256:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.IntermediaryVersion = void 0;
const schema_utils_1 = __webpack_require__(3404);
exports.IntermediaryVersion = schema_utils_1.Type.Union([schema_utils_1.Type.Literal(1), schema_utils_1.Type.Literal(2), schema_utils_1.Type.Literal(3)]);

/***/ }),

/***/ 4612:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
const tslib_1 = __webpack_require__(2376);
tslib_1.__exportStar(__webpack_require__(9280), exports);
tslib_1.__exportStar(__webpack_require__(595), exports);
tslib_1.__exportStar(__webpack_require__(6464), exports);
tslib_1.__exportStar(__webpack_require__(5840), exports);
tslib_1.__exportStar(__webpack_require__(7284), exports);
tslib_1.__exportStar(__webpack_require__(2256), exports);
tslib_1.__exportStar(__webpack_require__(7800), exports);
tslib_1.__exportStar(__webpack_require__(2296), exports);
tslib_1.__exportStar(__webpack_require__(7240), exports);
tslib_1.__exportStar(__webpack_require__(768), exports);
tslib_1.__exportStar(__webpack_require__(1216), exports);
tslib_1.__exportStar(__webpack_require__(2869), exports);
tslib_1.__exportStar(__webpack_require__(3608), exports);
tslib_1.__exportStar(__webpack_require__(2972), exports);
tslib_1.__exportStar(__webpack_require__(4624), exports);
tslib_1.__exportStar(__webpack_require__(2788), exports);
tslib_1.__exportStar(__webpack_require__(6344), exports);

/***/ }),

/***/ 7800:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.PublicKey = exports.GetPublicKey = exports.GetAddress = exports.DerivationPath = exports.Bundle = void 0;
const schema_utils_1 = __webpack_require__(3404);
const Bundle = type => schema_utils_1.Type.Object({
  bundle: schema_utils_1.Type.Array(type, {
    minItems: 1
  })
});
exports.Bundle = Bundle;
exports.DerivationPath = schema_utils_1.Type.Union([schema_utils_1.Type.String(), schema_utils_1.Type.Array(schema_utils_1.Type.Number())]);
exports.GetAddress = schema_utils_1.Type.Object({
  path: exports.DerivationPath,
  address: schema_utils_1.Type.Optional(schema_utils_1.Type.String()),
  showOnTrezor: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean()),
  chunkify: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean()),
  useEventListener: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean())
});
exports.GetPublicKey = schema_utils_1.Type.Object({
  path: exports.DerivationPath,
  showOnTrezor: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean()),
  suppressBackupWarning: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean()),
  chunkify: schema_utils_1.Type.Optional(schema_utils_1.Type.Boolean())
});
exports.PublicKey = schema_utils_1.Type.Object({
  publicKey: schema_utils_1.Type.String(),
  path: schema_utils_1.Type.Array(schema_utils_1.Type.Number()),
  serializedPath: schema_utils_1.Type.String()
});

/***/ }),

/***/ 2296:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));

/***/ }),

/***/ 2528:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.TRANSPORT = exports.ACTION_TIMEOUT = exports.TREZOR_USB_DESCRIPTORS = exports.T1_HID_VENDOR = exports.ENDPOINT_ID = exports.INTERFACE_ID = exports.CONFIGURATION_ID = void 0;
exports.CONFIGURATION_ID = 1;
exports.INTERFACE_ID = 0;
exports.ENDPOINT_ID = 1;
exports.T1_HID_VENDOR = 0x534c;
exports.TREZOR_USB_DESCRIPTORS = [{
  vendorId: 0x534c,
  productId: 0x0001
}, {
  vendorId: 0x1209,
  productId: 0x53c0
}, {
  vendorId: 0x1209,
  productId: 0x53c1
}];
exports.ACTION_TIMEOUT = 10000;
exports.TRANSPORT = {
  START: 'transport-start',
  ERROR: 'transport-error',
  UPDATE: 'transport-update',
  DISABLE_WEBUSB: 'transport-disable_webusb',
  REQUEST_DEVICE: 'transport-request_device'
};

/***/ }),

/***/ 4200:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractMessageChannel: () => (/* reexport safe */ _messageChannel_abstract__WEBPACK_IMPORTED_MODULE_1__.G),
/* harmony export */   getInstallerPackage: () => (/* reexport safe */ _systemInfo__WEBPACK_IMPORTED_MODULE_2__.o),
/* harmony export */   getSystemInfo: () => (/* reexport safe */ _systemInfo__WEBPACK_IMPORTED_MODULE_2__.c),
/* harmony export */   storage: () => (/* reexport safe */ _storage__WEBPACK_IMPORTED_MODULE_0__._)
/* harmony export */ });
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6452);
/* harmony import */ var _messageChannel_abstract__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7652);
/* harmony import */ var _systemInfo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1956);




/***/ }),

/***/ 7652:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   G: () => (/* binding */ AbstractMessageChannel)
/* harmony export */ });
/* harmony import */ var _trezor_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(316);
/* harmony import */ var _trezor_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6932);
/* harmony import */ var _trezor_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4108);
/**
 * IMPORTS WARNING
 * this file is bundled into content script so be careful what you are importing not to bloat the bundle
 */





// TODO: so logger should be probably moved to connect common, or this file should be moved to connect
// import type { Log } from '@trezor/connect/lib/utils/debug';

/**
 * concepts:
 * - it handshakes automatically with the other side of the channel
 * - it queues messages fired before handshake and sends them after handshake is done
 */
class AbstractMessageChannel extends _trezor_utils__WEBPACK_IMPORTED_MODULE_0__/* .TypedEmitter */ .I {
  messagePromises = {};
  /** queue of messages that were scheduled before handshake */
  messagesQueue = [];
  messageID = 0;
  isConnected = false;
  handshakeMaxRetries = 5;
  handshakeRetryInterval = 2000;

  /**
   * function that passes data to the other side of the channel
   */

  /**
   * channel identifiers that pairs AbstractMessageChannel instances on sending and receiving end together
   */

  constructor({
    sendFn,
    channel,
    logger,
    lazyHandshake = false,
    legacyMode = false
  }) {
    super();
    this.channel = channel;
    this.sendFn = sendFn;
    this.lazyHandshake = lazyHandshake;
    this.legacyMode = legacyMode;
    this.logger = logger;
  }

  /**
   * initiates handshake sequence with peer. resolves after communication with peer is established
   */
  init() {
    if (!this.handshakeFinished) {
      this.handshakeFinished = (0,_trezor_utils__WEBPACK_IMPORTED_MODULE_1__/* .createDeferred */ .E)();
      if (this.legacyMode) {
        // Bypass handshake for communication with legacy components
        // We add a delay for enough time for the other side to be ready
        setTimeout(() => {
          this.handshakeFinished?.resolve();
        }, 500);
      }
      if (!this.lazyHandshake) {
        // When `lazyHandshake` handshakeWithPeer will start when received channel-handshake-request.
        this.handshakeWithPeer();
      }
    }
    return this.handshakeFinished.promise;
  }

  /**
   * handshake between both parties of the channel.
   * both parties initiate handshake procedure and keep asking over time in a loop until they time out or receive confirmation from peer
   */
  handshakeWithPeer() {
    this.logger?.log(this.channel.here, 'handshake');
    return (0,_trezor_utils__WEBPACK_IMPORTED_MODULE_2__/* .scheduleAction */ .a)(async () => {
      this.postMessage({
        type: 'channel-handshake-request',
        data: {
          success: true,
          payload: undefined
        }
      }, {
        usePromise: false,
        useQueue: false
      });
      await this.handshakeFinished?.promise;
    }, {
      attempts: this.handshakeMaxRetries,
      timeout: this.handshakeRetryInterval
    }).then(() => {
      this.logger?.log(this.channel.here, 'handshake confirmed');
      this.messagesQueue.forEach(message => {
        message.channel = this.channel;
        this.sendFn(message);
      });
      this.messagesQueue = [];
    }).catch(() => {
      this.handshakeFinished?.reject(new Error('handshake failed'));
      this.handshakeFinished = undefined;
    });
  }

  /**
   * message received from communication channel in descendants of this class
   * should be handled by this common onMessage method
   */
  onMessage(_message) {
    // Older code used to send message as a data property of the message object.
    // This is a workaround to keep backward compatibility.
    let message = _message;
    if (this.legacyMode && message.type === undefined && 'data' in message && typeof message.data === 'object' && message.data !== null && 'type' in message.data && typeof message.data.type === 'string') {
      // @ts-expect-error
      message = message.data;
    }
    const {
      channel,
      id,
      type,
      payload,
      success
    } = message;

    // Don't verify channel in legacy mode
    if (!this.legacyMode) {
      if (!channel?.peer || channel.peer !== this.channel.here) {
        // To wrong peer
        return;
      }
      if (!channel?.here || this.channel.peer !== channel.here) {
        // From wrong peer
        return;
      }
    }
    if (type === 'channel-handshake-request') {
      this.postMessage({
        type: 'channel-handshake-confirm',
        data: {
          success: true,
          payload: undefined
        }
      }, {
        usePromise: false,
        useQueue: false
      });
      if (this.lazyHandshake) {
        // When received channel-handshake-request in lazyHandshake mode we start from this side.
        this.handshakeWithPeer();
      }
      return;
    }
    if (type === 'channel-handshake-confirm') {
      this.handshakeFinished?.resolve(undefined);
      return;
    }
    if (this.messagePromises[id]) {
      this.messagePromises[id].resolve({
        id,
        payload,
        success
      });
      delete this.messagePromises[id];
    }
    const messagePromisesLength = Object.keys(this.messagePromises).length;
    if (messagePromisesLength > 5) {
      this.logger?.warn(`too many message promises (${messagePromisesLength}). this feels unexpected!`);
    }

    // @ts-expect-error TS complains for odd reasons
    this.emit('message', message);
  }

  // todo: outgoing messages should be typed
  postMessage(message, {
    usePromise = true,
    useQueue = true
  } = {}) {
    message.channel = this.channel;
    if (!usePromise) {
      try {
        this.sendFn(message);
      } catch (err) {
        if (useQueue) {
          this.messagesQueue.push(message);
        }
      }
      return;
    }
    this.messageID++;
    message.id = this.messageID;
    this.messagePromises[message.id] = (0,_trezor_utils__WEBPACK_IMPORTED_MODULE_1__/* .createDeferred */ .E)();
    try {
      this.sendFn(message);
    } catch (err) {
      if (useQueue) {
        this.messagesQueue.push(message);
      }
    }
    return this.messagePromises[message.id].promise;
  }
  resolveMessagePromises(resolvePayload) {
    // This is used when we know that the connection has been interrupted but there might be something waiting for it.
    Object.keys(this.messagePromises).forEach(id => this.messagePromises[id].resolve({
      id,
      payload: resolvePayload
    }));
  }
  clear() {
    this.handshakeFinished = undefined;
  }
}

/***/ }),

/***/ 6452:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _: () => (/* binding */ storage)
/* harmony export */ });
/* harmony import */ var _trezor_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6932);
// https://github.com/trezor/connect/blob/develop/src/js/storage/index.js


const storageVersion = 2;
const storageName = `storage_v${storageVersion}`;

/**
 * remembered:
 *  - physical device from webusb pairing dialogue
 *  - passphrase to be used
 */

// TODO: move storage somewhere else. Having it here brings couple of problems:
// - We can not import types from connect (would cause cyclic dependency)
// - it has here dependency on window object, not good

const getEmptyState = () => ({
  origin: {}
});
let memoryStorage = getEmptyState();
const getPermanentStorage = () => {
  const ls = localStorage.getItem(storageName);
  return ls ? JSON.parse(ls) : getEmptyState();
};
class Storage extends _trezor_utils__WEBPACK_IMPORTED_MODULE_0__/* .TypedEmitter */ .I {
  save(getNewState, temporary = false) {
    if (temporary || !__webpack_require__.g.window) {
      memoryStorage = getNewState(memoryStorage);
      return;
    }
    try {
      const newState = getNewState(getPermanentStorage());
      localStorage.setItem(storageName, JSON.stringify(newState));
      this.emit('changed', newState);
    } catch (err) {
      // memory storage is fallback of the last resort
      console.warn('long term storage not available');
      memoryStorage = getNewState(memoryStorage);
    }
  }
  saveForOrigin(getNewState, origin, temporary = false) {
    this.save(state => ({
      ...state,
      origin: {
        ...state.origin,
        [origin]: getNewState(state.origin?.[origin] || {})
      }
    }), temporary);
  }
  load(temporary = false) {
    if (temporary || !__webpack_require__.g?.window?.localStorage) {
      return memoryStorage;
    }
    try {
      return getPermanentStorage();
    } catch (err) {
      // memory storage is fallback of the last resort
      console.warn('long term storage not available');
      return memoryStorage;
    }
  }
  loadForOrigin(origin, temporary = false) {
    const state = this.load(temporary);
    return state.origin?.[origin] || {};
  }
}
const storage = new Storage();


/***/ }),

/***/ 1956:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  o: () => (/* binding */ getInstallerPackage),
  c: () => (/* binding */ getSystemInfo)
});

// EXTERNAL MODULE: ../../node_modules/ua-parser-js/src/ua-parser.js
var ua_parser = __webpack_require__(1332);
var ua_parser_default = /*#__PURE__*/__webpack_require__.n(ua_parser);
;// CONCATENATED MODULE: ../env-utils/src/envUtils.ts

const isWeb = () => process.env.SUITE_TYPE === 'web';
const isDesktop = () => process.env.SUITE_TYPE === 'desktop';
const isNative = () => false;
const getEnvironment = () => {
  if (isWeb()) return 'web';
  return 'desktop';
};
let userAgentParser;

/* This way, we can override simple utils, which helps to polyfill methods which are not available in react-native. */
const getUserAgent = () => window.navigator.userAgent;
const getUserAgentParser = () => {
  if (!userAgentParser) {
    const ua = getUserAgent();
    userAgentParser = new (ua_parser_default())(ua);
  }
  return userAgentParser;
};
const isAndroid = () => /Android/.test(getUserAgent());
const isChromeOs = () => /CrOS/.test(getUserAgent());
const getBrowserVersion = () => getUserAgentParser().getBrowser().version || '';
const getCommitHash = () => process.env.COMMITHASH || '';

/* Not correct for Linux as there is many different distributions in different versions */
const getOsVersion = () => getUserAgentParser().getOS().version || '';
const getSuiteVersion = () => process.env.VERSION || '';
const getBrowserName = () => {
  const browserName = getUserAgentParser().getBrowser().name;
  return browserName?.toLowerCase() || '';
};
const isFirefox = () => getBrowserName() === 'firefox';

// List of platforms https://docker.apachezone.com/blog/74
const getPlatform = () => window.navigator.platform;
const getPlatformLanguages = () => window.navigator.languages;
const getScreenWidth = () => window.screen.width;
const getScreenHeight = () => window.screen.height;
const getWindowWidth = () => window.innerWidth;
const getWindowHeight = () => window.innerHeight;
const getLocationOrigin = () => window.location.origin;
const getLocationHostname = () => window.location.hostname;
const getProcessPlatform = () => typeof process !== 'undefined' ? process.platform : '';
const isMacOs = () => {
  if (getProcessPlatform() === 'darwin') return true;
  if (typeof window === 'undefined') return;
  return getPlatform().startsWith('Mac');
};
const isWindows = () => {
  if (getProcessPlatform() === 'win32') return true;
  if (typeof window === 'undefined') return;
  return getPlatform().startsWith('Win');
};
const isIOs = () => ['iPhone', 'iPad', 'iPod'].includes(getPlatform());
const isLinux = () => {
  if (getProcessPlatform() === 'linux') return true;
  if (typeof window === 'undefined') return;

  // exclude Android and Chrome OS as window.navigator.platform of those OS is Linux
  if (isAndroid() || isChromeOs()) return false;
  return getPlatform().startsWith('Linux');
};
const isCodesignBuild = () => process.env.IS_CODESIGN_BUILD === 'true';
const getOsName = () => {
  if (isWindows()) return 'windows';
  if (isMacOs()) return 'macos';
  if (isAndroid()) return 'android';
  if (isChromeOs()) return 'chromeos';
  if (isLinux()) return 'linux';
  if (isIOs()) return 'ios';
  return '';
};
const getOsNameWeb = () => getUserAgentParser().getOS().name;
const getOsFamily = () => {
  const osName = getUserAgentParser().getOS().name;
  if (osName === 'Windows') {
    return 'Windows';
  }
  if (osName === 'Mac OS') {
    return 'MacOS';
  }
  return 'Linux';
};
const getDeviceType = () => getUserAgentParser().getDevice().type;
const envUtils = {
  isWeb,
  isDesktop,
  isNative,
  getEnvironment,
  getUserAgent,
  isAndroid,
  isChromeOs,
  getOsVersion,
  getBrowserName,
  getBrowserVersion,
  getCommitHash,
  getDeviceType,
  getSuiteVersion,
  isFirefox,
  getPlatform,
  getPlatformLanguages,
  getScreenWidth,
  getScreenHeight,
  getWindowWidth,
  getWindowHeight,
  getLocationOrigin,
  getLocationHostname,
  getProcessPlatform,
  isMacOs,
  isWindows,
  isIOs,
  isLinux,
  isCodesignBuild,
  getOsName,
  getOsNameWeb,
  getOsFamily
};
;// CONCATENATED MODULE: ../env-utils/src/index.ts

const {
  isWeb: src_isWeb,
  isDesktop: src_isDesktop,
  isNative: src_isNative,
  getEnvironment: src_getEnvironment,
  getUserAgent: src_getUserAgent,
  isAndroid: src_isAndroid,
  isChromeOs: src_isChromeOs,
  getBrowserVersion: src_getBrowserVersion,
  getBrowserName: src_getBrowserName,
  getCommitHash: src_getCommitHash,
  getDeviceType: src_getDeviceType,
  getOsVersion: src_getOsVersion,
  getSuiteVersion: src_getSuiteVersion,
  isFirefox: src_isFirefox,
  getPlatform: src_getPlatform,
  getPlatformLanguages: src_getPlatformLanguages,
  getScreenWidth: src_getScreenWidth,
  getScreenHeight: src_getScreenHeight,
  getWindowWidth: src_getWindowWidth,
  getWindowHeight: src_getWindowHeight,
  getLocationOrigin: src_getLocationOrigin,
  getLocationHostname: src_getLocationHostname,
  getProcessPlatform: src_getProcessPlatform,
  isMacOs: src_isMacOs,
  isWindows: src_isWindows,
  isIOs: src_isIOs,
  isLinux: src_isLinux,
  isCodesignBuild: src_isCodesignBuild,
  getOsName: src_getOsName,
  getOsNameWeb: src_getOsNameWeb,
  getOsFamily: src_getOsFamily
} = envUtils;
;// CONCATENATED MODULE: ../connect-common/src/systemInfo.ts

const getInstallerPackage = () => {
  const agent = src_getUserAgent();
  switch (src_getOsFamily()) {
    case 'MacOS':
      return 'mac';
    case 'Windows':
      {
        const arch = agent.match(/(Win64|WOW64)/) ? '64' : '32';
        return `win${arch}`;
      }
    case 'Linux':
      {
        const isRpm = agent.match(/CentOS|Fedora|Mandriva|Mageia|Red Hat|Scientific|SUSE/) ? 'rpm' : 'deb';
        const is64x = agent.match(/Linux i[3456]86/) ? '32' : '64';
        return `${isRpm}${is64x}`;
      }
    default:
    // no default, type safe
  }
};
const getSystemInfo = supportedBrowsers => {
  const browserName = src_getBrowserName();
  const browserVersion = src_getBrowserVersion();
  const supportedBrowser = browserName ? supportedBrowsers[browserName.toLowerCase()] : undefined;
  const outdatedBrowser = supportedBrowser ? supportedBrowser.version > parseInt(browserVersion, 10) : false;
  const mobile = src_getDeviceType() === 'mobile';
  const supportedMobile = mobile ? 'usb' in navigator : true;
  const supported = !!(supportedBrowser && !outdatedBrowser && supportedMobile);
  return {
    os: {
      family: src_getOsFamily(),
      mobile
    },
    browser: {
      supported,
      outdated: outdatedBrowser
    }
  };
};

/***/ }),

/***/ 9184:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  DeviceModelInternal: () => (/* reexport */ messages_schema_DeviceModelInternal),
  Messages: () => (/* reexport */ messages_namespaceObject),
  MessagesSchema: () => (/* reexport */ messages_schema_namespaceObject),
  createMessageFromName: () => (/* reexport */ createMessageFromName),
  createMessageFromType: () => (/* reexport */ createMessageFromType),
  decode: () => (/* reexport */ decode),
  encode: () => (/* reexport */ encode),
  messageToJSON: () => (/* reexport */ messageToJSON),
  parseConfigure: () => (/* reexport */ parseConfigure),
  patch: () => (/* reexport */ patch)
});

// NAMESPACE OBJECT: ../protobuf/src/messages.ts
var messages_namespaceObject = {};
__webpack_require__.r(messages_namespaceObject);
__webpack_require__.d(messages_namespaceObject, {
  AmountUnit: () => (AmountUnit),
  BinanceOrderSide: () => (BinanceOrderSide),
  BinanceOrderType: () => (BinanceOrderType),
  BinanceTimeInForce: () => (BinanceTimeInForce),
  BootCommand: () => (BootCommand),
  CardanoAddressType: () => (CardanoAddressType),
  CardanoCVoteRegistrationFormat: () => (CardanoCVoteRegistrationFormat),
  CardanoCertificateType: () => (CardanoCertificateType),
  CardanoDerivationType: () => (CardanoDerivationType),
  CardanoNativeScriptHashDisplayFormat: () => (CardanoNativeScriptHashDisplayFormat),
  CardanoNativeScriptType: () => (CardanoNativeScriptType),
  CardanoPoolRelayType: () => (CardanoPoolRelayType),
  CardanoTxAuxiliaryDataSupplementType: () => (CardanoTxAuxiliaryDataSupplementType),
  CardanoTxOutputSerializationFormat: () => (CardanoTxOutputSerializationFormat),
  CardanoTxSigningMode: () => (CardanoTxSigningMode),
  CardanoTxWitnessType: () => (CardanoTxWitnessType),
  DebugButton: () => (DebugButton),
  DebugPhysicalButton: () => (DebugPhysicalButton),
  DecredStakingSpendType: () => (DecredStakingSpendType),
  DeviceModelInternal: () => (DeviceModelInternal),
  Enum_BackupType: () => (Enum_BackupType),
  Enum_ButtonRequestType: () => (Enum_ButtonRequestType),
  Enum_Capability: () => (Enum_Capability),
  Enum_HomescreenFormat: () => (Enum_HomescreenFormat),
  Enum_InputScriptType: () => (Enum_InputScriptType),
  Enum_OutputScriptType: () => (Enum_OutputScriptType),
  Enum_PinMatrixRequestType: () => (Enum_PinMatrixRequestType),
  Enum_RequestType: () => (Enum_RequestType),
  Enum_SafetyCheckLevel: () => (Enum_SafetyCheckLevel),
  Enum_WordRequestType: () => (Enum_WordRequestType),
  EthereumDataType: () => (EthereumDataType),
  EthereumDefinitionType: () => (EthereumDefinitionType),
  FailureType: () => (FailureType),
  MoneroNetworkType: () => (MoneroNetworkType),
  NEMImportanceTransferMode: () => (NEMImportanceTransferMode),
  NEMModificationType: () => (NEMModificationType),
  NEMMosaicLevy: () => (NEMMosaicLevy),
  NEMSupplyChangeType: () => (NEMSupplyChangeType),
  RecoveryDeviceType: () => (RecoveryDeviceType),
  SdProtectOperationType: () => (SdProtectOperationType),
  StellarAssetType: () => (StellarAssetType),
  StellarMemoType: () => (StellarMemoType),
  StellarSignerType: () => (StellarSignerType),
  TezosBallotType: () => (TezosBallotType),
  TezosContractType: () => (TezosContractType)
});

// NAMESPACE OBJECT: ../protobuf/src/messages-schema.ts
var messages_schema_namespaceObject = {};
__webpack_require__.r(messages_schema_namespaceObject);
__webpack_require__.d(messages_schema_namespaceObject, {
  Address: () => (Address),
  AmountUnit: () => (messages_schema_AmountUnit),
  ApplyFlags: () => (ApplyFlags),
  ApplySettings: () => (ApplySettings),
  AuthenticateDevice: () => (AuthenticateDevice),
  AuthenticityProof: () => (AuthenticityProof),
  AuthorizeCoinJoin: () => (AuthorizeCoinJoin),
  BackupDevice: () => (BackupDevice),
  BackupType: () => (BackupType),
  BinanceAddress: () => (BinanceAddress),
  BinanceCancelMsg: () => (BinanceCancelMsg),
  BinanceCoin: () => (BinanceCoin),
  BinanceGetAddress: () => (BinanceGetAddress),
  BinanceGetPublicKey: () => (BinanceGetPublicKey),
  BinanceInputOutput: () => (BinanceInputOutput),
  BinanceOrderMsg: () => (BinanceOrderMsg),
  BinanceOrderSide: () => (messages_schema_BinanceOrderSide),
  BinanceOrderType: () => (messages_schema_BinanceOrderType),
  BinancePublicKey: () => (BinancePublicKey),
  BinanceSignTx: () => (BinanceSignTx),
  BinanceSignedTx: () => (BinanceSignedTx),
  BinanceTimeInForce: () => (messages_schema_BinanceTimeInForce),
  BinanceTransferMsg: () => (BinanceTransferMsg),
  BinanceTxRequest: () => (BinanceTxRequest),
  BootCommand: () => (messages_schema_BootCommand),
  ButtonAck: () => (ButtonAck),
  ButtonRequest: () => (ButtonRequest),
  ButtonRequestType: () => (ButtonRequestType),
  Cancel: () => (Cancel),
  CancelAuthorization: () => (CancelAuthorization),
  Capability: () => (Capability),
  CardanoAddress: () => (CardanoAddress),
  CardanoAddressParametersType: () => (CardanoAddressParametersType),
  CardanoAddressType: () => (messages_schema_CardanoAddressType),
  CardanoAssetGroup: () => (CardanoAssetGroup),
  CardanoBlockchainPointerType: () => (CardanoBlockchainPointerType),
  CardanoCVoteRegistrationDelegation: () => (CardanoCVoteRegistrationDelegation),
  CardanoCVoteRegistrationFormat: () => (messages_schema_CardanoCVoteRegistrationFormat),
  CardanoCVoteRegistrationParametersType: () => (CardanoCVoteRegistrationParametersType),
  CardanoCertificateType: () => (messages_schema_CardanoCertificateType),
  CardanoDerivationType: () => (messages_schema_CardanoDerivationType),
  CardanoGetAddress: () => (CardanoGetAddress),
  CardanoGetNativeScriptHash: () => (CardanoGetNativeScriptHash),
  CardanoGetPublicKey: () => (CardanoGetPublicKey),
  CardanoNativeScript: () => (CardanoNativeScript),
  CardanoNativeScriptHash: () => (CardanoNativeScriptHash),
  CardanoNativeScriptHashDisplayFormat: () => (messages_schema_CardanoNativeScriptHashDisplayFormat),
  CardanoNativeScriptType: () => (messages_schema_CardanoNativeScriptType),
  CardanoPoolMetadataType: () => (CardanoPoolMetadataType),
  CardanoPoolOwner: () => (CardanoPoolOwner),
  CardanoPoolParametersType: () => (CardanoPoolParametersType),
  CardanoPoolRelayParameters: () => (CardanoPoolRelayParameters),
  CardanoPoolRelayType: () => (messages_schema_CardanoPoolRelayType),
  CardanoPublicKey: () => (CardanoPublicKey),
  CardanoSignTxFinished: () => (CardanoSignTxFinished),
  CardanoSignTxInit: () => (CardanoSignTxInit),
  CardanoToken: () => (CardanoToken),
  CardanoTxAuxiliaryData: () => (CardanoTxAuxiliaryData),
  CardanoTxAuxiliaryDataSupplement: () => (CardanoTxAuxiliaryDataSupplement),
  CardanoTxAuxiliaryDataSupplementType: () => (messages_schema_CardanoTxAuxiliaryDataSupplementType),
  CardanoTxBodyHash: () => (CardanoTxBodyHash),
  CardanoTxCertificate: () => (CardanoTxCertificate),
  CardanoTxCollateralInput: () => (CardanoTxCollateralInput),
  CardanoTxHostAck: () => (CardanoTxHostAck),
  CardanoTxInlineDatumChunk: () => (CardanoTxInlineDatumChunk),
  CardanoTxInput: () => (CardanoTxInput),
  CardanoTxItemAck: () => (CardanoTxItemAck),
  CardanoTxMint: () => (CardanoTxMint),
  CardanoTxOutput: () => (CardanoTxOutput),
  CardanoTxOutputSerializationFormat: () => (messages_schema_CardanoTxOutputSerializationFormat),
  CardanoTxReferenceInput: () => (CardanoTxReferenceInput),
  CardanoTxReferenceScriptChunk: () => (CardanoTxReferenceScriptChunk),
  CardanoTxRequiredSigner: () => (CardanoTxRequiredSigner),
  CardanoTxSigningMode: () => (messages_schema_CardanoTxSigningMode),
  CardanoTxWithdrawal: () => (CardanoTxWithdrawal),
  CardanoTxWitnessRequest: () => (CardanoTxWitnessRequest),
  CardanoTxWitnessResponse: () => (CardanoTxWitnessResponse),
  CardanoTxWitnessType: () => (messages_schema_CardanoTxWitnessType),
  ChangeLanguage: () => (ChangeLanguage),
  ChangeOutputScriptType: () => (ChangeOutputScriptType),
  ChangePin: () => (ChangePin),
  ChangeWipeCode: () => (ChangeWipeCode),
  CipherKeyValue: () => (CipherKeyValue),
  CipheredKeyValue: () => (CipheredKeyValue),
  CoinJoinRequest: () => (CoinJoinRequest),
  CoinPurchaseMemo: () => (CoinPurchaseMemo),
  DebugButton: () => (messages_schema_DebugButton),
  DebugLinkResetDebugEvents: () => (DebugLinkResetDebugEvents),
  DebugPhysicalButton: () => (messages_schema_DebugPhysicalButton),
  DecredStakingSpendType: () => (messages_schema_DecredStakingSpendType),
  Deprecated_PassphraseStateAck: () => (Deprecated_PassphraseStateAck),
  Deprecated_PassphraseStateRequest: () => (Deprecated_PassphraseStateRequest),
  DeviceModelInternal: () => (messages_schema_DeviceModelInternal),
  DoPreauthorized: () => (DoPreauthorized),
  ECDHSessionKey: () => (ECDHSessionKey),
  EndSession: () => (EndSession),
  Entropy: () => (Entropy),
  EntropyAck: () => (EntropyAck),
  EntropyRequest: () => (EntropyRequest),
  EnumAmountUnit: () => (EnumAmountUnit),
  EnumBinanceOrderSide: () => (EnumBinanceOrderSide),
  EnumBinanceOrderType: () => (EnumBinanceOrderType),
  EnumBinanceTimeInForce: () => (EnumBinanceTimeInForce),
  EnumBootCommand: () => (EnumBootCommand),
  EnumCardanoAddressType: () => (EnumCardanoAddressType),
  EnumCardanoCVoteRegistrationFormat: () => (EnumCardanoCVoteRegistrationFormat),
  EnumCardanoCertificateType: () => (EnumCardanoCertificateType),
  EnumCardanoDerivationType: () => (EnumCardanoDerivationType),
  EnumCardanoNativeScriptHashDisplayFormat: () => (EnumCardanoNativeScriptHashDisplayFormat),
  EnumCardanoNativeScriptType: () => (EnumCardanoNativeScriptType),
  EnumCardanoPoolRelayType: () => (EnumCardanoPoolRelayType),
  EnumCardanoTxAuxiliaryDataSupplementType: () => (EnumCardanoTxAuxiliaryDataSupplementType),
  EnumCardanoTxOutputSerializationFormat: () => (EnumCardanoTxOutputSerializationFormat),
  EnumCardanoTxSigningMode: () => (EnumCardanoTxSigningMode),
  EnumCardanoTxWitnessType: () => (EnumCardanoTxWitnessType),
  EnumDebugButton: () => (EnumDebugButton),
  EnumDebugPhysicalButton: () => (EnumDebugPhysicalButton),
  EnumDecredStakingSpendType: () => (EnumDecredStakingSpendType),
  EnumDeviceModelInternal: () => (EnumDeviceModelInternal),
  EnumEnum_BackupType: () => (EnumEnum_BackupType),
  EnumEnum_ButtonRequestType: () => (EnumEnum_ButtonRequestType),
  EnumEnum_Capability: () => (EnumEnum_Capability),
  EnumEnum_HomescreenFormat: () => (EnumEnum_HomescreenFormat),
  EnumEnum_InputScriptType: () => (EnumEnum_InputScriptType),
  EnumEnum_OutputScriptType: () => (EnumEnum_OutputScriptType),
  EnumEnum_PinMatrixRequestType: () => (EnumEnum_PinMatrixRequestType),
  EnumEnum_RequestType: () => (EnumEnum_RequestType),
  EnumEnum_SafetyCheckLevel: () => (EnumEnum_SafetyCheckLevel),
  EnumEnum_WordRequestType: () => (EnumEnum_WordRequestType),
  EnumEthereumDataType: () => (EnumEthereumDataType),
  EnumEthereumDefinitionType: () => (EnumEthereumDefinitionType),
  EnumFailureType: () => (EnumFailureType),
  EnumMoneroNetworkType: () => (EnumMoneroNetworkType),
  EnumNEMImportanceTransferMode: () => (EnumNEMImportanceTransferMode),
  EnumNEMModificationType: () => (EnumNEMModificationType),
  EnumNEMMosaicLevy: () => (EnumNEMMosaicLevy),
  EnumNEMSupplyChangeType: () => (EnumNEMSupplyChangeType),
  EnumRecoveryDeviceType: () => (EnumRecoveryDeviceType),
  EnumSdProtectOperationType: () => (EnumSdProtectOperationType),
  EnumStellarAssetType: () => (EnumStellarAssetType),
  EnumStellarMemoType: () => (EnumStellarMemoType),
  EnumStellarSignerType: () => (EnumStellarSignerType),
  EnumTezosBallotType: () => (EnumTezosBallotType),
  EnumTezosContractType: () => (EnumTezosContractType),
  Enum_BackupType: () => (messages_schema_Enum_BackupType),
  Enum_ButtonRequestType: () => (messages_schema_Enum_ButtonRequestType),
  Enum_Capability: () => (messages_schema_Enum_Capability),
  Enum_HomescreenFormat: () => (messages_schema_Enum_HomescreenFormat),
  Enum_InputScriptType: () => (messages_schema_Enum_InputScriptType),
  Enum_OutputScriptType: () => (messages_schema_Enum_OutputScriptType),
  Enum_PinMatrixRequestType: () => (messages_schema_Enum_PinMatrixRequestType),
  Enum_RequestType: () => (messages_schema_Enum_RequestType),
  Enum_SafetyCheckLevel: () => (messages_schema_Enum_SafetyCheckLevel),
  Enum_WordRequestType: () => (messages_schema_Enum_WordRequestType),
  EosActionBuyRam: () => (EosActionBuyRam),
  EosActionBuyRamBytes: () => (EosActionBuyRamBytes),
  EosActionCommon: () => (EosActionCommon),
  EosActionDelegate: () => (EosActionDelegate),
  EosActionDeleteAuth: () => (EosActionDeleteAuth),
  EosActionLinkAuth: () => (EosActionLinkAuth),
  EosActionNewAccount: () => (EosActionNewAccount),
  EosActionRefund: () => (EosActionRefund),
  EosActionSellRam: () => (EosActionSellRam),
  EosActionTransfer: () => (EosActionTransfer),
  EosActionUndelegate: () => (EosActionUndelegate),
  EosActionUnknown: () => (EosActionUnknown),
  EosActionUnlinkAuth: () => (EosActionUnlinkAuth),
  EosActionUpdateAuth: () => (EosActionUpdateAuth),
  EosActionVoteProducer: () => (EosActionVoteProducer),
  EosAsset: () => (EosAsset),
  EosAuthorization: () => (EosAuthorization),
  EosAuthorizationAccount: () => (EosAuthorizationAccount),
  EosAuthorizationKey: () => (EosAuthorizationKey),
  EosAuthorizationWait: () => (EosAuthorizationWait),
  EosGetPublicKey: () => (EosGetPublicKey),
  EosPermissionLevel: () => (EosPermissionLevel),
  EosPublicKey: () => (EosPublicKey),
  EosSignTx: () => (EosSignTx),
  EosSignedTx: () => (EosSignedTx),
  EosTxActionAck: () => (EosTxActionAck),
  EosTxActionRequest: () => (EosTxActionRequest),
  EosTxHeader: () => (EosTxHeader),
  EthereumAccessList: () => (EthereumAccessList),
  EthereumAddress: () => (EthereumAddress),
  EthereumDataType: () => (messages_schema_EthereumDataType),
  EthereumDefinitionType: () => (messages_schema_EthereumDefinitionType),
  EthereumDefinitions: () => (EthereumDefinitions),
  EthereumFieldType: () => (EthereumFieldType),
  EthereumGetAddress: () => (EthereumGetAddress),
  EthereumGetPublicKey: () => (EthereumGetPublicKey),
  EthereumMessageSignature: () => (EthereumMessageSignature),
  EthereumNetworkInfo: () => (EthereumNetworkInfo),
  EthereumPublicKey: () => (EthereumPublicKey),
  EthereumSignMessage: () => (EthereumSignMessage),
  EthereumSignTx: () => (EthereumSignTx),
  EthereumSignTxEIP1559: () => (EthereumSignTxEIP1559),
  EthereumSignTypedData: () => (EthereumSignTypedData),
  EthereumSignTypedHash: () => (EthereumSignTypedHash),
  EthereumStructMember: () => (EthereumStructMember),
  EthereumTokenInfo: () => (EthereumTokenInfo),
  EthereumTxAck: () => (EthereumTxAck),
  EthereumTxRequest: () => (EthereumTxRequest),
  EthereumTypedDataSignature: () => (EthereumTypedDataSignature),
  EthereumTypedDataStructAck: () => (EthereumTypedDataStructAck),
  EthereumTypedDataStructRequest: () => (EthereumTypedDataStructRequest),
  EthereumTypedDataValueAck: () => (EthereumTypedDataValueAck),
  EthereumTypedDataValueRequest: () => (EthereumTypedDataValueRequest),
  EthereumVerifyMessage: () => (EthereumVerifyMessage),
  Failure: () => (Failure),
  FailureType: () => (messages_schema_FailureType),
  Features: () => (Features),
  FirmwareErase: () => (FirmwareErase),
  FirmwareHash: () => (FirmwareHash),
  FirmwareRequest: () => (FirmwareRequest),
  FirmwareUpload: () => (FirmwareUpload),
  GetAddress: () => (GetAddress),
  GetECDHSessionKey: () => (GetECDHSessionKey),
  GetEntropy: () => (GetEntropy),
  GetFeatures: () => (GetFeatures),
  GetFirmwareHash: () => (GetFirmwareHash),
  GetNextU2FCounter: () => (GetNextU2FCounter),
  GetNonce: () => (GetNonce),
  GetOwnershipId: () => (GetOwnershipId),
  GetOwnershipProof: () => (GetOwnershipProof),
  GetPublicKey: () => (GetPublicKey),
  HDNodePathType: () => (HDNodePathType),
  HDNodeType: () => (HDNodeType),
  HomescreenFormat: () => (HomescreenFormat),
  IdentityType: () => (IdentityType),
  Initialize: () => (Initialize),
  InputScriptType: () => (InputScriptType),
  InternalInputScriptType: () => (InternalInputScriptType),
  LockDevice: () => (LockDevice),
  MessageSignature: () => (MessageSignature),
  MessageType: () => (MessageType),
  MoneroNetworkType: () => (messages_schema_MoneroNetworkType),
  MultisigRedeemScriptType: () => (MultisigRedeemScriptType),
  NEMAddress: () => (NEMAddress),
  NEMAggregateModification: () => (NEMAggregateModification),
  NEMCosignatoryModification: () => (NEMCosignatoryModification),
  NEMDecryptMessage: () => (NEMDecryptMessage),
  NEMDecryptedMessage: () => (NEMDecryptedMessage),
  NEMGetAddress: () => (NEMGetAddress),
  NEMImportanceTransfer: () => (NEMImportanceTransfer),
  NEMImportanceTransferMode: () => (messages_schema_NEMImportanceTransferMode),
  NEMModificationType: () => (messages_schema_NEMModificationType),
  NEMMosaic: () => (NEMMosaic),
  NEMMosaicCreation: () => (NEMMosaicCreation),
  NEMMosaicDefinition: () => (NEMMosaicDefinition),
  NEMMosaicLevy: () => (messages_schema_NEMMosaicLevy),
  NEMMosaicSupplyChange: () => (NEMMosaicSupplyChange),
  NEMProvisionNamespace: () => (NEMProvisionNamespace),
  NEMSignTx: () => (NEMSignTx),
  NEMSignedTx: () => (NEMSignedTx),
  NEMSupplyChangeType: () => (messages_schema_NEMSupplyChangeType),
  NEMTransactionCommon: () => (NEMTransactionCommon),
  NEMTransfer: () => (NEMTransfer),
  NextU2FCounter: () => (NextU2FCounter),
  Nonce: () => (Nonce),
  OutputScriptType: () => (OutputScriptType),
  OwnershipId: () => (OwnershipId),
  OwnershipProof: () => (OwnershipProof),
  PassphraseAck: () => (PassphraseAck),
  PassphraseRequest: () => (PassphraseRequest),
  PaymentRequestMemo: () => (PaymentRequestMemo),
  PinMatrixAck: () => (PinMatrixAck),
  PinMatrixRequest: () => (PinMatrixRequest),
  PinMatrixRequestType: () => (PinMatrixRequestType),
  Ping: () => (Ping),
  PreauthorizedRequest: () => (PreauthorizedRequest),
  PrevInput: () => (PrevInput),
  PrevOutput: () => (PrevOutput),
  PrevTx: () => (PrevTx),
  ProdTestT1: () => (ProdTestT1),
  PublicKey: () => (PublicKey),
  RebootToBootloader: () => (RebootToBootloader),
  RecoveryDevice: () => (RecoveryDevice),
  RecoveryDeviceType: () => (messages_schema_RecoveryDeviceType),
  RefundMemo: () => (RefundMemo),
  RequestType: () => (RequestType),
  ResetDevice: () => (ResetDevice),
  RippleAddress: () => (RippleAddress),
  RippleGetAddress: () => (RippleGetAddress),
  RipplePayment: () => (RipplePayment),
  RippleSignTx: () => (RippleSignTx),
  RippleSignedTx: () => (RippleSignedTx),
  SafetyCheckLevel: () => (SafetyCheckLevel),
  SdProtect: () => (SdProtect),
  SdProtectOperationType: () => (messages_schema_SdProtectOperationType),
  SetBusy: () => (SetBusy),
  SetU2FCounter: () => (SetU2FCounter),
  ShowDeviceTutorial: () => (ShowDeviceTutorial),
  SignIdentity: () => (SignIdentity),
  SignMessage: () => (SignMessage),
  SignTx: () => (SignTx),
  SignedIdentity: () => (SignedIdentity),
  SolanaAddress: () => (SolanaAddress),
  SolanaGetAddress: () => (SolanaGetAddress),
  SolanaGetPublicKey: () => (SolanaGetPublicKey),
  SolanaPublicKey: () => (SolanaPublicKey),
  SolanaSignTx: () => (SolanaSignTx),
  SolanaTxAdditionalInfo: () => (SolanaTxAdditionalInfo),
  SolanaTxSignature: () => (SolanaTxSignature),
  SolanaTxTokenAccountInfo: () => (SolanaTxTokenAccountInfo),
  StellarAccountMergeOp: () => (StellarAccountMergeOp),
  StellarAddress: () => (StellarAddress),
  StellarAllowTrustOp: () => (StellarAllowTrustOp),
  StellarAsset: () => (StellarAsset),
  StellarAssetType: () => (messages_schema_StellarAssetType),
  StellarBumpSequenceOp: () => (StellarBumpSequenceOp),
  StellarChangeTrustOp: () => (StellarChangeTrustOp),
  StellarClaimClaimableBalanceOp: () => (StellarClaimClaimableBalanceOp),
  StellarCreateAccountOp: () => (StellarCreateAccountOp),
  StellarCreatePassiveSellOfferOp: () => (StellarCreatePassiveSellOfferOp),
  StellarGetAddress: () => (StellarGetAddress),
  StellarManageBuyOfferOp: () => (StellarManageBuyOfferOp),
  StellarManageDataOp: () => (StellarManageDataOp),
  StellarManageSellOfferOp: () => (StellarManageSellOfferOp),
  StellarMemoType: () => (messages_schema_StellarMemoType),
  StellarPathPaymentStrictReceiveOp: () => (StellarPathPaymentStrictReceiveOp),
  StellarPathPaymentStrictSendOp: () => (StellarPathPaymentStrictSendOp),
  StellarPaymentOp: () => (StellarPaymentOp),
  StellarSetOptionsOp: () => (StellarSetOptionsOp),
  StellarSignTx: () => (StellarSignTx),
  StellarSignedTx: () => (StellarSignedTx),
  StellarSignerType: () => (messages_schema_StellarSignerType),
  StellarTxOpRequest: () => (StellarTxOpRequest),
  Success: () => (Success),
  TextMemo: () => (TextMemo),
  TezosAddress: () => (TezosAddress),
  TezosBallotOp: () => (TezosBallotOp),
  TezosBallotType: () => (messages_schema_TezosBallotType),
  TezosContractID: () => (TezosContractID),
  TezosContractType: () => (messages_schema_TezosContractType),
  TezosDelegationOp: () => (TezosDelegationOp),
  TezosGetAddress: () => (TezosGetAddress),
  TezosGetPublicKey: () => (TezosGetPublicKey),
  TezosManagerTransfer: () => (TezosManagerTransfer),
  TezosOriginationOp: () => (TezosOriginationOp),
  TezosParametersManager: () => (TezosParametersManager),
  TezosProposalOp: () => (TezosProposalOp),
  TezosPublicKey: () => (TezosPublicKey),
  TezosRevealOp: () => (TezosRevealOp),
  TezosSignTx: () => (TezosSignTx),
  TezosSignedTx: () => (TezosSignedTx),
  TezosTransactionOp: () => (TezosTransactionOp),
  TranslationDataAck: () => (TranslationDataAck),
  TranslationDataRequest: () => (TranslationDataRequest),
  TxAck: () => (TxAck),
  TxAckInput: () => (TxAckInput),
  TxAckInputWrapper: () => (TxAckInputWrapper),
  TxAckOutput: () => (TxAckOutput),
  TxAckOutputWrapper: () => (TxAckOutputWrapper),
  TxAckPaymentRequest: () => (TxAckPaymentRequest),
  TxAckPrevExtraData: () => (TxAckPrevExtraData),
  TxAckPrevExtraDataWrapper: () => (TxAckPrevExtraDataWrapper),
  TxAckPrevInput: () => (TxAckPrevInput),
  TxAckPrevInputWrapper: () => (TxAckPrevInputWrapper),
  TxAckPrevMeta: () => (TxAckPrevMeta),
  TxAckPrevOutput: () => (TxAckPrevOutput),
  TxAckPrevOutputWrapper: () => (TxAckPrevOutputWrapper),
  TxAckResponse: () => (TxAckResponse),
  TxInput: () => (TxInput),
  TxInputType: () => (TxInputType),
  TxOutput: () => (TxOutput),
  TxOutputBinType: () => (TxOutputBinType),
  TxOutputType: () => (TxOutputType),
  TxRequest: () => (TxRequest),
  TxRequestDetailsType: () => (TxRequestDetailsType),
  TxRequestSerializedType: () => (TxRequestSerializedType),
  UnlockBootloader: () => (UnlockBootloader),
  UnlockPath: () => (UnlockPath),
  UnlockedPathRequest: () => (UnlockedPathRequest),
  VerifyMessage: () => (VerifyMessage),
  WipeDevice: () => (WipeDevice),
  WordAck: () => (WordAck),
  WordRequest: () => (WordRequest),
  WordRequestType: () => (WordRequestType),
  experimental_field: () => (experimental_field),
  experimental_message: () => (experimental_message)
});

// EXTERNAL MODULE: ../../node_modules/protobufjs/light.js
var light = __webpack_require__(2496);
;// CONCATENATED MODULE: ../protobuf/src/utils.ts
// Module for loading the protobuf description from serialized description


const primitiveTypes = ['bool', 'string', 'bytes', 'int32', 'int64', 'uint32', 'uint64', 'sint32', 'sint64', 'fixed32', 'fixed64', 'sfixed32', 'sfixed64', 'double', 'float'];

/**
 * Determines whether given field is "primitive"
 * bool, strings, uint32 => true
 * HDNodeType => false
 */
const isPrimitiveField = field => primitiveTypes.includes(field);
function parseConfigure(data) {
  if (typeof data === 'string') {
    return light.Root.fromJSON(JSON.parse(data));
  }
  return light.Root.fromJSON(data);
}
const createMessageFromName = (messages, name) => {
  const Message = messages.lookupType(name);
  const MessageType = messages.lookupEnum('MessageType');
  let messageType = MessageType.values[`MessageType_${name}`];
  if (!messageType && Message.options) {
    messageType = Message.options['(wire_type)'];
  }
  return {
    Message,
    messageType
  };
};
const createMessageFromType = (messages, typeId) => {
  const MessageType = messages.lookupEnum('MessageType');
  const messageName = MessageType.valuesById[typeId].replace('MessageType_', '');
  const Message = messages.lookupType(messageName);
  return {
    Message,
    messageName
  };
};
;// CONCATENATED MODULE: ../protobuf/src/decode.ts

const transform = (field, value) => {
  if (isPrimitiveField(field.type)) {
    // [compatibility]: optional undefined keys should be null. Example: Features.fw_major.
    if (field.optional && typeof value === 'undefined') {
      return null;
    }
    if (field.type === 'bytes') {
      return Buffer.from(value).toString('hex');
    }

    // [compatibility]
    // it is likely that we can remove this right away because trezor-connect tests don't ever trigger this condition
    // we should probably make sure that trezor-connect treats following protobuf types as strings: int64, uint64, sint64, fixed64, sfixed64
    if (field.long) {
      if (Number.isSafeInteger(value.toNumber())) {
        // old trezor-link behavior https://github.com/trezor/trezor-link/blob/9c200cc5608976cff0542484525e98c753ba1888/src/lowlevel/protobuf/message_decoder.js#L80
        return value.toNumber();
      }

      // otherwise return as string
      return value.toString();
    }
    return value;
  }

  // enum type
  if ('valuesById' in field.resolvedType) {
    return field.resolvedType.valuesById[value];
  }
  // message type
  if (field.resolvedType.fields) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return messageToJSON(value, field.resolvedType.fields);
  }
  // should not happen
  throw new Error(`transport: decode: case not handled: ${field}`);
};
function messageToJSON(MessageParam, fields) {
  // MessageParams was being called with undefined
  if (!MessageParam) {
    return {};
  }
  // get rid of Message.prototype references
  const {
    ...message
  } = MessageParam;
  const res = {};
  Object.keys(fields).forEach(key => {
    const field = fields[key];
    // @ts-expect-error
    const value = message[key];
    if (field.repeated) {
      res[key] = value.map(v => transform(field, v));
    } else {
      res[key] = transform(field, value);
    }
  });
  return res;
}
const decode = (MessageParam, data) => {
  const decoded = MessageParam.decode(new Uint8Array(data));

  // [compatibility]: in the end it should be possible to get rid of messageToJSON method and call
  // Message.toObject(decoded) to return result as plain javascript object. This method should be able to do
  // all required conversions (for example bytes to hex) but we can't use it at the moment for compatibility reasons
  // for example difference between enum decoding when [enum] vs enum
  return messageToJSON(decoded, decoded.$type.fields);
};
;// CONCATENATED MODULE: ../protobuf/src/encode.ts

const encode_transform = (fieldType, value) => {
  if (fieldType === 'bytes') {
    // special edge case
    // for example MultisigRedeemScriptType might have field signatures ['', '', ''] (check in TrezorConnect signTransactionMultisig test fixtures).
    // trezor needs to receive such field as signatures: [b'', b'', b'']. If we transfer this to empty buffer with protobufjs, this will be decoded by
    // trezor as signatures: [] (empty array)
    if (typeof value === 'string' && !value) return value;

    // normal flow
    return Buffer.from(value, 'hex');
  }
  if (typeof value === 'number' && !Number.isSafeInteger(value)) {
    throw new RangeError('field value is not within safe integer range');
  }
  return value;
};
function patch(Message, payload) {
  const patched = {};
  if (!Message.fields) {
    return patched;
  }
  Object.keys(Message.fields).forEach(key => {
    const field = Message.fields[key];
    const value = payload[key];

    // no value for this field
    if (typeof value === 'undefined') {
      return;
    }
    // primitive type
    if (isPrimitiveField(field.type)) {
      if (field.repeated) {
        patched[key] = value.map(v => encode_transform(field.type, v));
      } else {
        patched[key] = encode_transform(field.type, value);
      }
      return;
    }
    // repeated
    if (field.repeated) {
      const RefMessage = Message.lookupTypeOrEnum(field.type);
      patched[key] = value.map(v => patch(RefMessage, v));
    }
    // message type
    else if (typeof value === 'object' && value !== null) {
      const RefMessage = Message.lookupType(field.type);
      patched[key] = patch(RefMessage, value);
    }
    // enum type
    else if (typeof value === 'number') {
      const RefMessage = Message.lookupEnum(field.type);
      patched[key] = RefMessage.values[value];
    } else {
      patched[key] = value;
    }
  });
  return patched;
}
const encode = (Message, data) => {
  const payload = patch(Message, data);
  const message = Message.fromObject(payload);
  // Encode a message to an Uint8Array (browser) or Buffer (node)
  const bytes = Message.encode(message).finish();
  return Buffer.from(bytes);
};
;// CONCATENATED MODULE: ../protobuf/src/messages.ts
// This file is auto generated from data/messages/message.json

// custom type uint32/64 may be represented as string

// custom type sint32/64

let DeviceModelInternal = /*#__PURE__*/function (DeviceModelInternal) {
  DeviceModelInternal["T1B1"] = "T1B1";
  DeviceModelInternal["T2T1"] = "T2T1";
  DeviceModelInternal["T2B1"] = "T2B1";
  return DeviceModelInternal;
}({});

// BinanceGetAddress

// BinanceAddress

// BinanceGetPublicKey

// BinancePublicKey

// BinanceSignTx

// BinanceTxRequest

// BinanceTransferMsg

let BinanceOrderType = /*#__PURE__*/function (BinanceOrderType) {
  BinanceOrderType[BinanceOrderType["OT_UNKNOWN"] = 0] = "OT_UNKNOWN";
  BinanceOrderType[BinanceOrderType["MARKET"] = 1] = "MARKET";
  BinanceOrderType[BinanceOrderType["LIMIT"] = 2] = "LIMIT";
  BinanceOrderType[BinanceOrderType["OT_RESERVED"] = 3] = "OT_RESERVED";
  return BinanceOrderType;
}({});
let BinanceOrderSide = /*#__PURE__*/function (BinanceOrderSide) {
  BinanceOrderSide[BinanceOrderSide["SIDE_UNKNOWN"] = 0] = "SIDE_UNKNOWN";
  BinanceOrderSide[BinanceOrderSide["BUY"] = 1] = "BUY";
  BinanceOrderSide[BinanceOrderSide["SELL"] = 2] = "SELL";
  return BinanceOrderSide;
}({});
let BinanceTimeInForce = /*#__PURE__*/function (BinanceTimeInForce) {
  BinanceTimeInForce[BinanceTimeInForce["TIF_UNKNOWN"] = 0] = "TIF_UNKNOWN";
  BinanceTimeInForce[BinanceTimeInForce["GTE"] = 1] = "GTE";
  BinanceTimeInForce[BinanceTimeInForce["TIF_RESERVED"] = 2] = "TIF_RESERVED";
  BinanceTimeInForce[BinanceTimeInForce["IOC"] = 3] = "IOC";
  return BinanceTimeInForce;
}({});

// BinanceOrderMsg

// BinanceCancelMsg

// BinanceSignedTx

let Enum_InputScriptType = /*#__PURE__*/function (Enum_InputScriptType) {
  Enum_InputScriptType[Enum_InputScriptType["SPENDADDRESS"] = 0] = "SPENDADDRESS";
  Enum_InputScriptType[Enum_InputScriptType["SPENDMULTISIG"] = 1] = "SPENDMULTISIG";
  Enum_InputScriptType[Enum_InputScriptType["EXTERNAL"] = 2] = "EXTERNAL";
  Enum_InputScriptType[Enum_InputScriptType["SPENDWITNESS"] = 3] = "SPENDWITNESS";
  Enum_InputScriptType[Enum_InputScriptType["SPENDP2SHWITNESS"] = 4] = "SPENDP2SHWITNESS";
  Enum_InputScriptType[Enum_InputScriptType["SPENDTAPROOT"] = 5] = "SPENDTAPROOT";
  return Enum_InputScriptType;
}({});
let Enum_OutputScriptType = /*#__PURE__*/function (Enum_OutputScriptType) {
  Enum_OutputScriptType[Enum_OutputScriptType["PAYTOADDRESS"] = 0] = "PAYTOADDRESS";
  Enum_OutputScriptType[Enum_OutputScriptType["PAYTOSCRIPTHASH"] = 1] = "PAYTOSCRIPTHASH";
  Enum_OutputScriptType[Enum_OutputScriptType["PAYTOMULTISIG"] = 2] = "PAYTOMULTISIG";
  Enum_OutputScriptType[Enum_OutputScriptType["PAYTOOPRETURN"] = 3] = "PAYTOOPRETURN";
  Enum_OutputScriptType[Enum_OutputScriptType["PAYTOWITNESS"] = 4] = "PAYTOWITNESS";
  Enum_OutputScriptType[Enum_OutputScriptType["PAYTOP2SHWITNESS"] = 5] = "PAYTOP2SHWITNESS";
  Enum_OutputScriptType[Enum_OutputScriptType["PAYTOTAPROOT"] = 6] = "PAYTOTAPROOT";
  return Enum_OutputScriptType;
}({});
let DecredStakingSpendType = /*#__PURE__*/function (DecredStakingSpendType) {
  DecredStakingSpendType[DecredStakingSpendType["SSGen"] = 0] = "SSGen";
  DecredStakingSpendType[DecredStakingSpendType["SSRTX"] = 1] = "SSRTX";
  return DecredStakingSpendType;
}({});
let AmountUnit = /*#__PURE__*/function (AmountUnit) {
  AmountUnit[AmountUnit["BITCOIN"] = 0] = "BITCOIN";
  AmountUnit[AmountUnit["MILLIBITCOIN"] = 1] = "MILLIBITCOIN";
  AmountUnit[AmountUnit["MICROBITCOIN"] = 2] = "MICROBITCOIN";
  AmountUnit[AmountUnit["SATOSHI"] = 3] = "SATOSHI";
  return AmountUnit;
}({});

// HDNodeType

// MultisigRedeemScriptType

// GetPublicKey

// PublicKey

// GetAddress

// Address

// GetOwnershipId

// OwnershipId

// SignMessage

// MessageSignature

// VerifyMessage

// SignTx

let Enum_RequestType = /*#__PURE__*/function (Enum_RequestType) {
  Enum_RequestType[Enum_RequestType["TXINPUT"] = 0] = "TXINPUT";
  Enum_RequestType[Enum_RequestType["TXOUTPUT"] = 1] = "TXOUTPUT";
  Enum_RequestType[Enum_RequestType["TXMETA"] = 2] = "TXMETA";
  Enum_RequestType[Enum_RequestType["TXFINISHED"] = 3] = "TXFINISHED";
  Enum_RequestType[Enum_RequestType["TXEXTRADATA"] = 4] = "TXEXTRADATA";
  Enum_RequestType[Enum_RequestType["TXORIGINPUT"] = 5] = "TXORIGINPUT";
  Enum_RequestType[Enum_RequestType["TXORIGOUTPUT"] = 6] = "TXORIGOUTPUT";
  Enum_RequestType[Enum_RequestType["TXPAYMENTREQ"] = 7] = "TXPAYMENTREQ";
  return Enum_RequestType;
}({});

// TxRequest

// TxInputType replacement
// TxInputType needs more exact types
// differences: external input (no address_n + required script_pubkey)

// TxInputType replacement end

// TxOutputType replacement
// TxOutputType needs more exact types
// differences: external output (no address_n), opreturn output (no address_n, no address)

// - TxOutputType replacement end

// PrevTx

// PrevInput

// PrevOutput

// TxAckPaymentRequest

// TxAck
// TxAck replacement
// TxAck needs more exact types
// PrevInput and TxInputType requires exact responses in TxAckResponse
// main difference: PrevInput should not contain address_n (unexpected field by protobuf)

// - TxAck replacement end

// TxAckInput

// TxAckOutput

// TxAckPrevMeta

// TxAckPrevInput

// TxAckPrevOutput

// TxAckPrevExtraData

// GetOwnershipProof

// OwnershipProof

// AuthorizeCoinJoin

// FirmwareErase

// FirmwareRequest

// FirmwareUpload

// ProdTestT1

let CardanoDerivationType = /*#__PURE__*/function (CardanoDerivationType) {
  CardanoDerivationType[CardanoDerivationType["LEDGER"] = 0] = "LEDGER";
  CardanoDerivationType[CardanoDerivationType["ICARUS"] = 1] = "ICARUS";
  CardanoDerivationType[CardanoDerivationType["ICARUS_TREZOR"] = 2] = "ICARUS_TREZOR";
  return CardanoDerivationType;
}({});
let CardanoAddressType = /*#__PURE__*/function (CardanoAddressType) {
  CardanoAddressType[CardanoAddressType["BASE"] = 0] = "BASE";
  CardanoAddressType[CardanoAddressType["BASE_SCRIPT_KEY"] = 1] = "BASE_SCRIPT_KEY";
  CardanoAddressType[CardanoAddressType["BASE_KEY_SCRIPT"] = 2] = "BASE_KEY_SCRIPT";
  CardanoAddressType[CardanoAddressType["BASE_SCRIPT_SCRIPT"] = 3] = "BASE_SCRIPT_SCRIPT";
  CardanoAddressType[CardanoAddressType["POINTER"] = 4] = "POINTER";
  CardanoAddressType[CardanoAddressType["POINTER_SCRIPT"] = 5] = "POINTER_SCRIPT";
  CardanoAddressType[CardanoAddressType["ENTERPRISE"] = 6] = "ENTERPRISE";
  CardanoAddressType[CardanoAddressType["ENTERPRISE_SCRIPT"] = 7] = "ENTERPRISE_SCRIPT";
  CardanoAddressType[CardanoAddressType["BYRON"] = 8] = "BYRON";
  CardanoAddressType[CardanoAddressType["REWARD"] = 14] = "REWARD";
  CardanoAddressType[CardanoAddressType["REWARD_SCRIPT"] = 15] = "REWARD_SCRIPT";
  return CardanoAddressType;
}({});
let CardanoNativeScriptType = /*#__PURE__*/function (CardanoNativeScriptType) {
  CardanoNativeScriptType[CardanoNativeScriptType["PUB_KEY"] = 0] = "PUB_KEY";
  CardanoNativeScriptType[CardanoNativeScriptType["ALL"] = 1] = "ALL";
  CardanoNativeScriptType[CardanoNativeScriptType["ANY"] = 2] = "ANY";
  CardanoNativeScriptType[CardanoNativeScriptType["N_OF_K"] = 3] = "N_OF_K";
  CardanoNativeScriptType[CardanoNativeScriptType["INVALID_BEFORE"] = 4] = "INVALID_BEFORE";
  CardanoNativeScriptType[CardanoNativeScriptType["INVALID_HEREAFTER"] = 5] = "INVALID_HEREAFTER";
  return CardanoNativeScriptType;
}({});
let CardanoNativeScriptHashDisplayFormat = /*#__PURE__*/function (CardanoNativeScriptHashDisplayFormat) {
  CardanoNativeScriptHashDisplayFormat[CardanoNativeScriptHashDisplayFormat["HIDE"] = 0] = "HIDE";
  CardanoNativeScriptHashDisplayFormat[CardanoNativeScriptHashDisplayFormat["BECH32"] = 1] = "BECH32";
  CardanoNativeScriptHashDisplayFormat[CardanoNativeScriptHashDisplayFormat["POLICY_ID"] = 2] = "POLICY_ID";
  return CardanoNativeScriptHashDisplayFormat;
}({});
let CardanoTxOutputSerializationFormat = /*#__PURE__*/function (CardanoTxOutputSerializationFormat) {
  CardanoTxOutputSerializationFormat[CardanoTxOutputSerializationFormat["ARRAY_LEGACY"] = 0] = "ARRAY_LEGACY";
  CardanoTxOutputSerializationFormat[CardanoTxOutputSerializationFormat["MAP_BABBAGE"] = 1] = "MAP_BABBAGE";
  return CardanoTxOutputSerializationFormat;
}({});
let CardanoCertificateType = /*#__PURE__*/function (CardanoCertificateType) {
  CardanoCertificateType[CardanoCertificateType["STAKE_REGISTRATION"] = 0] = "STAKE_REGISTRATION";
  CardanoCertificateType[CardanoCertificateType["STAKE_DEREGISTRATION"] = 1] = "STAKE_DEREGISTRATION";
  CardanoCertificateType[CardanoCertificateType["STAKE_DELEGATION"] = 2] = "STAKE_DELEGATION";
  CardanoCertificateType[CardanoCertificateType["STAKE_POOL_REGISTRATION"] = 3] = "STAKE_POOL_REGISTRATION";
  return CardanoCertificateType;
}({});
let CardanoPoolRelayType = /*#__PURE__*/function (CardanoPoolRelayType) {
  CardanoPoolRelayType[CardanoPoolRelayType["SINGLE_HOST_IP"] = 0] = "SINGLE_HOST_IP";
  CardanoPoolRelayType[CardanoPoolRelayType["SINGLE_HOST_NAME"] = 1] = "SINGLE_HOST_NAME";
  CardanoPoolRelayType[CardanoPoolRelayType["MULTIPLE_HOST_NAME"] = 2] = "MULTIPLE_HOST_NAME";
  return CardanoPoolRelayType;
}({});
let CardanoTxAuxiliaryDataSupplementType = /*#__PURE__*/function (CardanoTxAuxiliaryDataSupplementType) {
  CardanoTxAuxiliaryDataSupplementType[CardanoTxAuxiliaryDataSupplementType["NONE"] = 0] = "NONE";
  CardanoTxAuxiliaryDataSupplementType[CardanoTxAuxiliaryDataSupplementType["CVOTE_REGISTRATION_SIGNATURE"] = 1] = "CVOTE_REGISTRATION_SIGNATURE";
  return CardanoTxAuxiliaryDataSupplementType;
}({});
let CardanoCVoteRegistrationFormat = /*#__PURE__*/function (CardanoCVoteRegistrationFormat) {
  CardanoCVoteRegistrationFormat[CardanoCVoteRegistrationFormat["CIP15"] = 0] = "CIP15";
  CardanoCVoteRegistrationFormat[CardanoCVoteRegistrationFormat["CIP36"] = 1] = "CIP36";
  return CardanoCVoteRegistrationFormat;
}({});
let CardanoTxSigningMode = /*#__PURE__*/function (CardanoTxSigningMode) {
  CardanoTxSigningMode[CardanoTxSigningMode["ORDINARY_TRANSACTION"] = 0] = "ORDINARY_TRANSACTION";
  CardanoTxSigningMode[CardanoTxSigningMode["POOL_REGISTRATION_AS_OWNER"] = 1] = "POOL_REGISTRATION_AS_OWNER";
  CardanoTxSigningMode[CardanoTxSigningMode["MULTISIG_TRANSACTION"] = 2] = "MULTISIG_TRANSACTION";
  CardanoTxSigningMode[CardanoTxSigningMode["PLUTUS_TRANSACTION"] = 3] = "PLUTUS_TRANSACTION";
  return CardanoTxSigningMode;
}({});
let CardanoTxWitnessType = /*#__PURE__*/function (CardanoTxWitnessType) {
  CardanoTxWitnessType[CardanoTxWitnessType["BYRON_WITNESS"] = 0] = "BYRON_WITNESS";
  CardanoTxWitnessType[CardanoTxWitnessType["SHELLEY_WITNESS"] = 1] = "SHELLEY_WITNESS";
  return CardanoTxWitnessType;
}({});

// CardanoBlockchainPointerType

// CardanoNativeScript

// CardanoGetNativeScriptHash

// CardanoNativeScriptHash

// CardanoAddressParametersType

// CardanoGetAddress

// CardanoAddress

// CardanoGetPublicKey

// CardanoPublicKey

// CardanoSignTxInit

// CardanoTxInput

// CardanoTxOutput

// CardanoAssetGroup

// CardanoToken

// CardanoTxInlineDatumChunk

// CardanoTxReferenceScriptChunk

// CardanoPoolOwner

// CardanoPoolRelayParameters

// CardanoPoolMetadataType

// CardanoPoolParametersType

// CardanoTxCertificate

// CardanoTxWithdrawal

// CardanoCVoteRegistrationDelegation

// CardanoCVoteRegistrationParametersType

// CardanoTxAuxiliaryData

// CardanoTxMint

// CardanoTxCollateralInput

// CardanoTxRequiredSigner

// CardanoTxReferenceInput

// CardanoTxItemAck

// CardanoTxAuxiliaryDataSupplement

// CardanoTxWitnessRequest

// CardanoTxWitnessResponse

// CardanoTxHostAck

// CardanoTxBodyHash

// CardanoSignTxFinished

// Success

let FailureType = /*#__PURE__*/function (FailureType) {
  FailureType[FailureType["Failure_UnexpectedMessage"] = 1] = "Failure_UnexpectedMessage";
  FailureType[FailureType["Failure_ButtonExpected"] = 2] = "Failure_ButtonExpected";
  FailureType[FailureType["Failure_DataError"] = 3] = "Failure_DataError";
  FailureType[FailureType["Failure_ActionCancelled"] = 4] = "Failure_ActionCancelled";
  FailureType[FailureType["Failure_PinExpected"] = 5] = "Failure_PinExpected";
  FailureType[FailureType["Failure_PinCancelled"] = 6] = "Failure_PinCancelled";
  FailureType[FailureType["Failure_PinInvalid"] = 7] = "Failure_PinInvalid";
  FailureType[FailureType["Failure_InvalidSignature"] = 8] = "Failure_InvalidSignature";
  FailureType[FailureType["Failure_ProcessError"] = 9] = "Failure_ProcessError";
  FailureType[FailureType["Failure_NotEnoughFunds"] = 10] = "Failure_NotEnoughFunds";
  FailureType[FailureType["Failure_NotInitialized"] = 11] = "Failure_NotInitialized";
  FailureType[FailureType["Failure_PinMismatch"] = 12] = "Failure_PinMismatch";
  FailureType[FailureType["Failure_WipeCodeMismatch"] = 13] = "Failure_WipeCodeMismatch";
  FailureType[FailureType["Failure_InvalidSession"] = 14] = "Failure_InvalidSession";
  FailureType[FailureType["Failure_FirmwareError"] = 99] = "Failure_FirmwareError";
  return FailureType;
}({});

// Failure

let Enum_ButtonRequestType = /*#__PURE__*/function (Enum_ButtonRequestType) {
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_Other"] = 1] = "ButtonRequest_Other";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_FeeOverThreshold"] = 2] = "ButtonRequest_FeeOverThreshold";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_ConfirmOutput"] = 3] = "ButtonRequest_ConfirmOutput";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_ResetDevice"] = 4] = "ButtonRequest_ResetDevice";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_ConfirmWord"] = 5] = "ButtonRequest_ConfirmWord";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_WipeDevice"] = 6] = "ButtonRequest_WipeDevice";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_ProtectCall"] = 7] = "ButtonRequest_ProtectCall";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_SignTx"] = 8] = "ButtonRequest_SignTx";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_FirmwareCheck"] = 9] = "ButtonRequest_FirmwareCheck";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_Address"] = 10] = "ButtonRequest_Address";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_PublicKey"] = 11] = "ButtonRequest_PublicKey";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_MnemonicWordCount"] = 12] = "ButtonRequest_MnemonicWordCount";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_MnemonicInput"] = 13] = "ButtonRequest_MnemonicInput";
  Enum_ButtonRequestType[Enum_ButtonRequestType["_Deprecated_ButtonRequest_PassphraseType"] = 14] = "_Deprecated_ButtonRequest_PassphraseType";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_UnknownDerivationPath"] = 15] = "ButtonRequest_UnknownDerivationPath";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_RecoveryHomepage"] = 16] = "ButtonRequest_RecoveryHomepage";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_Success"] = 17] = "ButtonRequest_Success";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_Warning"] = 18] = "ButtonRequest_Warning";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_PassphraseEntry"] = 19] = "ButtonRequest_PassphraseEntry";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_PinEntry"] = 20] = "ButtonRequest_PinEntry";
  return Enum_ButtonRequestType;
}({});

// ButtonRequest

// ButtonAck

let Enum_PinMatrixRequestType = /*#__PURE__*/function (Enum_PinMatrixRequestType) {
  Enum_PinMatrixRequestType[Enum_PinMatrixRequestType["PinMatrixRequestType_Current"] = 1] = "PinMatrixRequestType_Current";
  Enum_PinMatrixRequestType[Enum_PinMatrixRequestType["PinMatrixRequestType_NewFirst"] = 2] = "PinMatrixRequestType_NewFirst";
  Enum_PinMatrixRequestType[Enum_PinMatrixRequestType["PinMatrixRequestType_NewSecond"] = 3] = "PinMatrixRequestType_NewSecond";
  Enum_PinMatrixRequestType[Enum_PinMatrixRequestType["PinMatrixRequestType_WipeCodeFirst"] = 4] = "PinMatrixRequestType_WipeCodeFirst";
  Enum_PinMatrixRequestType[Enum_PinMatrixRequestType["PinMatrixRequestType_WipeCodeSecond"] = 5] = "PinMatrixRequestType_WipeCodeSecond";
  return Enum_PinMatrixRequestType;
}({});

// PinMatrixRequest

// PinMatrixAck

// PassphraseRequest

// PassphraseAck

// Deprecated_PassphraseStateRequest

// Deprecated_PassphraseStateAck

// CipherKeyValue

// CipheredKeyValue

// IdentityType

// SignIdentity

// SignedIdentity

// GetECDHSessionKey

// ECDHSessionKey

let DebugButton = /*#__PURE__*/function (DebugButton) {
  DebugButton[DebugButton["NO"] = 0] = "NO";
  DebugButton[DebugButton["YES"] = 1] = "YES";
  DebugButton[DebugButton["INFO"] = 2] = "INFO";
  return DebugButton;
}({});
let DebugPhysicalButton = /*#__PURE__*/function (DebugPhysicalButton) {
  DebugPhysicalButton[DebugPhysicalButton["LEFT_BTN"] = 0] = "LEFT_BTN";
  DebugPhysicalButton[DebugPhysicalButton["MIDDLE_BTN"] = 1] = "MIDDLE_BTN";
  DebugPhysicalButton[DebugPhysicalButton["RIGHT_BTN"] = 2] = "RIGHT_BTN";
  return DebugPhysicalButton;
}({});

// DebugLinkResetDebugEvents

// EosGetPublicKey

// EosPublicKey

// EosSignTx

// EosTxActionRequest

// EosTxActionAck

// EosSignedTx

let EthereumDefinitionType = /*#__PURE__*/function (EthereumDefinitionType) {
  EthereumDefinitionType[EthereumDefinitionType["NETWORK"] = 0] = "NETWORK";
  EthereumDefinitionType[EthereumDefinitionType["TOKEN"] = 1] = "TOKEN";
  return EthereumDefinitionType;
}({});

// EthereumNetworkInfo

// EthereumTokenInfo

// EthereumDefinitions

// EthereumSignTypedData

// EthereumTypedDataStructRequest

let EthereumDataType = /*#__PURE__*/function (EthereumDataType) {
  EthereumDataType[EthereumDataType["UINT"] = 1] = "UINT";
  EthereumDataType[EthereumDataType["INT"] = 2] = "INT";
  EthereumDataType[EthereumDataType["BYTES"] = 3] = "BYTES";
  EthereumDataType[EthereumDataType["STRING"] = 4] = "STRING";
  EthereumDataType[EthereumDataType["BOOL"] = 5] = "BOOL";
  EthereumDataType[EthereumDataType["ADDRESS"] = 6] = "ADDRESS";
  EthereumDataType[EthereumDataType["ARRAY"] = 7] = "ARRAY";
  EthereumDataType[EthereumDataType["STRUCT"] = 8] = "STRUCT";
  return EthereumDataType;
}({});

// EthereumTypedDataStructAck

// EthereumTypedDataValueRequest

// EthereumTypedDataValueAck

// EthereumGetPublicKey

// EthereumPublicKey

// EthereumGetAddress

// EthereumAddress

// EthereumSignTx

// EthereumSignTxEIP1559

// EthereumTxRequest

// EthereumTxAck

// EthereumSignMessage

// EthereumMessageSignature

// EthereumVerifyMessage

// EthereumSignTypedHash

// EthereumTypedDataSignature

let Enum_BackupType = /*#__PURE__*/function (Enum_BackupType) {
  Enum_BackupType[Enum_BackupType["Bip39"] = 0] = "Bip39";
  Enum_BackupType[Enum_BackupType["Slip39_Basic"] = 1] = "Slip39_Basic";
  Enum_BackupType[Enum_BackupType["Slip39_Advanced"] = 2] = "Slip39_Advanced";
  return Enum_BackupType;
}({});
let Enum_SafetyCheckLevel = /*#__PURE__*/function (Enum_SafetyCheckLevel) {
  Enum_SafetyCheckLevel[Enum_SafetyCheckLevel["Strict"] = 0] = "Strict";
  Enum_SafetyCheckLevel[Enum_SafetyCheckLevel["PromptAlways"] = 1] = "PromptAlways";
  Enum_SafetyCheckLevel[Enum_SafetyCheckLevel["PromptTemporarily"] = 2] = "PromptTemporarily";
  return Enum_SafetyCheckLevel;
}({});
let Enum_HomescreenFormat = /*#__PURE__*/function (Enum_HomescreenFormat) {
  Enum_HomescreenFormat[Enum_HomescreenFormat["Toif"] = 1] = "Toif";
  Enum_HomescreenFormat[Enum_HomescreenFormat["Jpeg"] = 2] = "Jpeg";
  Enum_HomescreenFormat[Enum_HomescreenFormat["ToiG"] = 3] = "ToiG";
  return Enum_HomescreenFormat;
}({});

// Initialize

// GetFeatures

let Enum_Capability = /*#__PURE__*/function (Enum_Capability) {
  Enum_Capability[Enum_Capability["Capability_Bitcoin"] = 1] = "Capability_Bitcoin";
  Enum_Capability[Enum_Capability["Capability_Bitcoin_like"] = 2] = "Capability_Bitcoin_like";
  Enum_Capability[Enum_Capability["Capability_Binance"] = 3] = "Capability_Binance";
  Enum_Capability[Enum_Capability["Capability_Cardano"] = 4] = "Capability_Cardano";
  Enum_Capability[Enum_Capability["Capability_Crypto"] = 5] = "Capability_Crypto";
  Enum_Capability[Enum_Capability["Capability_EOS"] = 6] = "Capability_EOS";
  Enum_Capability[Enum_Capability["Capability_Ethereum"] = 7] = "Capability_Ethereum";
  Enum_Capability[Enum_Capability["Capability_Lisk"] = 8] = "Capability_Lisk";
  Enum_Capability[Enum_Capability["Capability_Monero"] = 9] = "Capability_Monero";
  Enum_Capability[Enum_Capability["Capability_NEM"] = 10] = "Capability_NEM";
  Enum_Capability[Enum_Capability["Capability_Ripple"] = 11] = "Capability_Ripple";
  Enum_Capability[Enum_Capability["Capability_Stellar"] = 12] = "Capability_Stellar";
  Enum_Capability[Enum_Capability["Capability_Tezos"] = 13] = "Capability_Tezos";
  Enum_Capability[Enum_Capability["Capability_U2F"] = 14] = "Capability_U2F";
  Enum_Capability[Enum_Capability["Capability_Shamir"] = 15] = "Capability_Shamir";
  Enum_Capability[Enum_Capability["Capability_ShamirGroups"] = 16] = "Capability_ShamirGroups";
  Enum_Capability[Enum_Capability["Capability_PassphraseEntry"] = 17] = "Capability_PassphraseEntry";
  Enum_Capability[Enum_Capability["Capability_Solana"] = 18] = "Capability_Solana";
  Enum_Capability[Enum_Capability["Capability_Translations"] = 19] = "Capability_Translations";
  return Enum_Capability;
}({});

// Features

// LockDevice

// SetBusy

// EndSession

// ApplySettings

// ChangeLanguage

// TranslationDataRequest

// TranslationDataAck

// ApplyFlags

// ChangePin

// ChangeWipeCode

let SdProtectOperationType = /*#__PURE__*/function (SdProtectOperationType) {
  SdProtectOperationType[SdProtectOperationType["DISABLE"] = 0] = "DISABLE";
  SdProtectOperationType[SdProtectOperationType["ENABLE"] = 1] = "ENABLE";
  SdProtectOperationType[SdProtectOperationType["REFRESH"] = 2] = "REFRESH";
  return SdProtectOperationType;
}({});

// SdProtect

// Ping

// Cancel

// GetEntropy

// Entropy

// GetFirmwareHash

// FirmwareHash

// AuthenticateDevice

// AuthenticityProof

// WipeDevice

// ResetDevice

// BackupDevice

// EntropyRequest

// EntropyAck

let RecoveryDeviceType = /*#__PURE__*/function (RecoveryDeviceType) {
  RecoveryDeviceType[RecoveryDeviceType["RecoveryDeviceType_ScrambledWords"] = 0] = "RecoveryDeviceType_ScrambledWords";
  RecoveryDeviceType[RecoveryDeviceType["RecoveryDeviceType_Matrix"] = 1] = "RecoveryDeviceType_Matrix";
  return RecoveryDeviceType;
}({});

// RecoveryDevice

let Enum_WordRequestType = /*#__PURE__*/function (Enum_WordRequestType) {
  Enum_WordRequestType[Enum_WordRequestType["WordRequestType_Plain"] = 0] = "WordRequestType_Plain";
  Enum_WordRequestType[Enum_WordRequestType["WordRequestType_Matrix9"] = 1] = "WordRequestType_Matrix9";
  Enum_WordRequestType[Enum_WordRequestType["WordRequestType_Matrix6"] = 2] = "WordRequestType_Matrix6";
  return Enum_WordRequestType;
}({});

// WordRequest

// WordAck

// SetU2FCounter

// GetNextU2FCounter

// NextU2FCounter

// DoPreauthorized

// PreauthorizedRequest

// CancelAuthorization

let BootCommand = /*#__PURE__*/function (BootCommand) {
  BootCommand[BootCommand["STOP_AND_WAIT"] = 0] = "STOP_AND_WAIT";
  BootCommand[BootCommand["INSTALL_UPGRADE"] = 1] = "INSTALL_UPGRADE";
  return BootCommand;
}({});

// RebootToBootloader

// GetNonce

// Nonce

// UnlockPath

// UnlockedPathRequest

// ShowDeviceTutorial

// UnlockBootloader

let MoneroNetworkType = /*#__PURE__*/function (MoneroNetworkType) {
  MoneroNetworkType[MoneroNetworkType["MAINNET"] = 0] = "MAINNET";
  MoneroNetworkType[MoneroNetworkType["TESTNET"] = 1] = "TESTNET";
  MoneroNetworkType[MoneroNetworkType["STAGENET"] = 2] = "STAGENET";
  MoneroNetworkType[MoneroNetworkType["FAKECHAIN"] = 3] = "FAKECHAIN";
  return MoneroNetworkType;
}({});

// NEMGetAddress

// NEMAddress

let NEMMosaicLevy = /*#__PURE__*/function (NEMMosaicLevy) {
  NEMMosaicLevy[NEMMosaicLevy["MosaicLevy_Absolute"] = 1] = "MosaicLevy_Absolute";
  NEMMosaicLevy[NEMMosaicLevy["MosaicLevy_Percentile"] = 2] = "MosaicLevy_Percentile";
  return NEMMosaicLevy;
}({});
let NEMSupplyChangeType = /*#__PURE__*/function (NEMSupplyChangeType) {
  NEMSupplyChangeType[NEMSupplyChangeType["SupplyChange_Increase"] = 1] = "SupplyChange_Increase";
  NEMSupplyChangeType[NEMSupplyChangeType["SupplyChange_Decrease"] = 2] = "SupplyChange_Decrease";
  return NEMSupplyChangeType;
}({});
let NEMModificationType = /*#__PURE__*/function (NEMModificationType) {
  NEMModificationType[NEMModificationType["CosignatoryModification_Add"] = 1] = "CosignatoryModification_Add";
  NEMModificationType[NEMModificationType["CosignatoryModification_Delete"] = 2] = "CosignatoryModification_Delete";
  return NEMModificationType;
}({});
let NEMImportanceTransferMode = /*#__PURE__*/function (NEMImportanceTransferMode) {
  NEMImportanceTransferMode[NEMImportanceTransferMode["ImportanceTransfer_Activate"] = 1] = "ImportanceTransfer_Activate";
  NEMImportanceTransferMode[NEMImportanceTransferMode["ImportanceTransfer_Deactivate"] = 2] = "ImportanceTransfer_Deactivate";
  return NEMImportanceTransferMode;
}({});

// NEMSignTx

// NEMSignedTx

// NEMDecryptMessage

// NEMDecryptedMessage

// experimental_message

// experimental_field

// RippleGetAddress

// RippleAddress

// RippleSignTx

// RippleSignedTx

// SolanaGetPublicKey

// SolanaPublicKey

// SolanaGetAddress

// SolanaAddress

// SolanaTxTokenAccountInfo

// SolanaTxAdditionalInfo

// SolanaSignTx

// SolanaTxSignature

let StellarAssetType = /*#__PURE__*/function (StellarAssetType) {
  StellarAssetType[StellarAssetType["NATIVE"] = 0] = "NATIVE";
  StellarAssetType[StellarAssetType["ALPHANUM4"] = 1] = "ALPHANUM4";
  StellarAssetType[StellarAssetType["ALPHANUM12"] = 2] = "ALPHANUM12";
  return StellarAssetType;
}({});

// StellarAsset

// StellarGetAddress

// StellarAddress

let StellarMemoType = /*#__PURE__*/function (StellarMemoType) {
  StellarMemoType[StellarMemoType["NONE"] = 0] = "NONE";
  StellarMemoType[StellarMemoType["TEXT"] = 1] = "TEXT";
  StellarMemoType[StellarMemoType["ID"] = 2] = "ID";
  StellarMemoType[StellarMemoType["HASH"] = 3] = "HASH";
  StellarMemoType[StellarMemoType["RETURN"] = 4] = "RETURN";
  return StellarMemoType;
}({});

// StellarSignTx

// StellarTxOpRequest

// StellarPaymentOp

// StellarCreateAccountOp

// StellarPathPaymentStrictReceiveOp

// StellarPathPaymentStrictSendOp

// StellarManageSellOfferOp

// StellarManageBuyOfferOp

// StellarCreatePassiveSellOfferOp

let StellarSignerType = /*#__PURE__*/function (StellarSignerType) {
  StellarSignerType[StellarSignerType["ACCOUNT"] = 0] = "ACCOUNT";
  StellarSignerType[StellarSignerType["PRE_AUTH"] = 1] = "PRE_AUTH";
  StellarSignerType[StellarSignerType["HASH"] = 2] = "HASH";
  return StellarSignerType;
}({});

// StellarSetOptionsOp

// StellarChangeTrustOp

// StellarAllowTrustOp

// StellarAccountMergeOp

// StellarManageDataOp

// StellarBumpSequenceOp

// StellarClaimClaimableBalanceOp

// StellarSignedTx

// TezosGetAddress

// TezosAddress

// TezosGetPublicKey

// TezosPublicKey

let TezosContractType = /*#__PURE__*/function (TezosContractType) {
  TezosContractType[TezosContractType["Implicit"] = 0] = "Implicit";
  TezosContractType[TezosContractType["Originated"] = 1] = "Originated";
  return TezosContractType;
}({});
let TezosBallotType = /*#__PURE__*/function (TezosBallotType) {
  TezosBallotType[TezosBallotType["Yay"] = 0] = "Yay";
  TezosBallotType[TezosBallotType["Nay"] = 1] = "Nay";
  TezosBallotType[TezosBallotType["Pass"] = 2] = "Pass";
  return TezosBallotType;
}({});

// TezosSignTx

// TezosSignedTx

// custom connect definitions
// EXTERNAL MODULE: ../schema-utils/src/index.ts + 7 modules
var src = __webpack_require__(3404);
;// CONCATENATED MODULE: ../protobuf/src/messages-schema.ts

let messages_schema_DeviceModelInternal = /*#__PURE__*/function (DeviceModelInternal) {
  DeviceModelInternal["T1B1"] = "T1B1";
  DeviceModelInternal["T2T1"] = "T2T1";
  DeviceModelInternal["T2B1"] = "T2B1";
  return DeviceModelInternal;
}({});
const EnumDeviceModelInternal = src.Type.Enum(messages_schema_DeviceModelInternal);
const BinanceGetAddress = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  show_display: src.Type.Optional(src.Type.Boolean()),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const BinanceAddress = src.Type.Object({
  address: src.Type.String()
});
const BinanceGetPublicKey = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  show_display: src.Type.Optional(src.Type.Boolean())
});
const BinancePublicKey = src.Type.Object({
  public_key: src.Type.String()
});
const BinanceSignTx = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  msg_count: src.Type.Number(),
  account_number: src.Type.Number(),
  chain_id: src.Type.Optional(src.Type.String()),
  memo: src.Type.Optional(src.Type.String()),
  sequence: src.Type.Number(),
  source: src.Type.Number(),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const BinanceTxRequest = src.Type.Object({});
const BinanceCoin = src.Type.Object({
  amount: src.Type.Uint(),
  denom: src.Type.String()
});
const BinanceInputOutput = src.Type.Object({
  address: src.Type.String(),
  coins: src.Type.Array(BinanceCoin)
});
const BinanceTransferMsg = src.Type.Object({
  inputs: src.Type.Array(BinanceInputOutput),
  outputs: src.Type.Array(BinanceInputOutput),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
let messages_schema_BinanceOrderType = /*#__PURE__*/function (BinanceOrderType) {
  BinanceOrderType[BinanceOrderType["OT_UNKNOWN"] = 0] = "OT_UNKNOWN";
  BinanceOrderType[BinanceOrderType["MARKET"] = 1] = "MARKET";
  BinanceOrderType[BinanceOrderType["LIMIT"] = 2] = "LIMIT";
  BinanceOrderType[BinanceOrderType["OT_RESERVED"] = 3] = "OT_RESERVED";
  return BinanceOrderType;
}({});
const EnumBinanceOrderType = src.Type.Enum(messages_schema_BinanceOrderType);
let messages_schema_BinanceOrderSide = /*#__PURE__*/function (BinanceOrderSide) {
  BinanceOrderSide[BinanceOrderSide["SIDE_UNKNOWN"] = 0] = "SIDE_UNKNOWN";
  BinanceOrderSide[BinanceOrderSide["BUY"] = 1] = "BUY";
  BinanceOrderSide[BinanceOrderSide["SELL"] = 2] = "SELL";
  return BinanceOrderSide;
}({});
const EnumBinanceOrderSide = src.Type.Enum(messages_schema_BinanceOrderSide);
let messages_schema_BinanceTimeInForce = /*#__PURE__*/function (BinanceTimeInForce) {
  BinanceTimeInForce[BinanceTimeInForce["TIF_UNKNOWN"] = 0] = "TIF_UNKNOWN";
  BinanceTimeInForce[BinanceTimeInForce["GTE"] = 1] = "GTE";
  BinanceTimeInForce[BinanceTimeInForce["TIF_RESERVED"] = 2] = "TIF_RESERVED";
  BinanceTimeInForce[BinanceTimeInForce["IOC"] = 3] = "IOC";
  return BinanceTimeInForce;
}({});
const EnumBinanceTimeInForce = src.Type.Enum(messages_schema_BinanceTimeInForce);
const BinanceOrderMsg = src.Type.Object({
  id: src.Type.Optional(src.Type.String()),
  ordertype: EnumBinanceOrderType,
  price: src.Type.Number(),
  quantity: src.Type.Number(),
  sender: src.Type.Optional(src.Type.String()),
  side: EnumBinanceOrderSide,
  symbol: src.Type.Optional(src.Type.String()),
  timeinforce: EnumBinanceTimeInForce
});
const BinanceCancelMsg = src.Type.Object({
  refid: src.Type.Optional(src.Type.String()),
  sender: src.Type.Optional(src.Type.String()),
  symbol: src.Type.Optional(src.Type.String())
});
const BinanceSignedTx = src.Type.Object({
  signature: src.Type.String(),
  public_key: src.Type.String()
});
let messages_schema_Enum_InputScriptType = /*#__PURE__*/function (Enum_InputScriptType) {
  Enum_InputScriptType[Enum_InputScriptType["SPENDADDRESS"] = 0] = "SPENDADDRESS";
  Enum_InputScriptType[Enum_InputScriptType["SPENDMULTISIG"] = 1] = "SPENDMULTISIG";
  Enum_InputScriptType[Enum_InputScriptType["EXTERNAL"] = 2] = "EXTERNAL";
  Enum_InputScriptType[Enum_InputScriptType["SPENDWITNESS"] = 3] = "SPENDWITNESS";
  Enum_InputScriptType[Enum_InputScriptType["SPENDP2SHWITNESS"] = 4] = "SPENDP2SHWITNESS";
  Enum_InputScriptType[Enum_InputScriptType["SPENDTAPROOT"] = 5] = "SPENDTAPROOT";
  return Enum_InputScriptType;
}({});
const EnumEnum_InputScriptType = src.Type.Enum(messages_schema_Enum_InputScriptType);
const InputScriptType = src.Type.KeyOfEnum(messages_schema_Enum_InputScriptType);
let messages_schema_Enum_OutputScriptType = /*#__PURE__*/function (Enum_OutputScriptType) {
  Enum_OutputScriptType[Enum_OutputScriptType["PAYTOADDRESS"] = 0] = "PAYTOADDRESS";
  Enum_OutputScriptType[Enum_OutputScriptType["PAYTOSCRIPTHASH"] = 1] = "PAYTOSCRIPTHASH";
  Enum_OutputScriptType[Enum_OutputScriptType["PAYTOMULTISIG"] = 2] = "PAYTOMULTISIG";
  Enum_OutputScriptType[Enum_OutputScriptType["PAYTOOPRETURN"] = 3] = "PAYTOOPRETURN";
  Enum_OutputScriptType[Enum_OutputScriptType["PAYTOWITNESS"] = 4] = "PAYTOWITNESS";
  Enum_OutputScriptType[Enum_OutputScriptType["PAYTOP2SHWITNESS"] = 5] = "PAYTOP2SHWITNESS";
  Enum_OutputScriptType[Enum_OutputScriptType["PAYTOTAPROOT"] = 6] = "PAYTOTAPROOT";
  return Enum_OutputScriptType;
}({});
const EnumEnum_OutputScriptType = src.Type.Enum(messages_schema_Enum_OutputScriptType);
const OutputScriptType = src.Type.KeyOfEnum(messages_schema_Enum_OutputScriptType);
let messages_schema_DecredStakingSpendType = /*#__PURE__*/function (DecredStakingSpendType) {
  DecredStakingSpendType[DecredStakingSpendType["SSGen"] = 0] = "SSGen";
  DecredStakingSpendType[DecredStakingSpendType["SSRTX"] = 1] = "SSRTX";
  return DecredStakingSpendType;
}({});
const EnumDecredStakingSpendType = src.Type.Enum(messages_schema_DecredStakingSpendType);
let messages_schema_AmountUnit = /*#__PURE__*/function (AmountUnit) {
  AmountUnit[AmountUnit["BITCOIN"] = 0] = "BITCOIN";
  AmountUnit[AmountUnit["MILLIBITCOIN"] = 1] = "MILLIBITCOIN";
  AmountUnit[AmountUnit["MICROBITCOIN"] = 2] = "MICROBITCOIN";
  AmountUnit[AmountUnit["SATOSHI"] = 3] = "SATOSHI";
  return AmountUnit;
}({});
const EnumAmountUnit = src.Type.Enum(messages_schema_AmountUnit);
const HDNodeType = src.Type.Object({
  depth: src.Type.Number(),
  fingerprint: src.Type.Number(),
  child_num: src.Type.Number(),
  chain_code: src.Type.String(),
  private_key: src.Type.Optional(src.Type.String()),
  public_key: src.Type.String()
});
const HDNodePathType = src.Type.Object({
  node: src.Type.Union([HDNodeType, src.Type.String()]),
  address_n: src.Type.Array(src.Type.Number())
});
const MultisigRedeemScriptType = src.Type.Object({
  pubkeys: src.Type.Array(HDNodePathType),
  signatures: src.Type.Array(src.Type.String()),
  m: src.Type.Number(),
  nodes: src.Type.Optional(src.Type.Array(HDNodeType)),
  address_n: src.Type.Optional(src.Type.Array(src.Type.Number()))
});
const GetPublicKey = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  ecdsa_curve_name: src.Type.Optional(src.Type.String()),
  show_display: src.Type.Optional(src.Type.Boolean()),
  coin_name: src.Type.Optional(src.Type.String()),
  script_type: src.Type.Optional(InputScriptType),
  ignore_xpub_magic: src.Type.Optional(src.Type.Boolean())
});
const PublicKey = src.Type.Object({
  node: HDNodeType,
  xpub: src.Type.String(),
  root_fingerprint: src.Type.Optional(src.Type.Number()),
  descriptor: src.Type.Optional(src.Type.String())
});
const GetAddress = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  coin_name: src.Type.Optional(src.Type.String()),
  show_display: src.Type.Optional(src.Type.Boolean()),
  multisig: src.Type.Optional(MultisigRedeemScriptType),
  script_type: src.Type.Optional(InputScriptType),
  ignore_xpub_magic: src.Type.Optional(src.Type.Boolean()),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const Address = src.Type.Object({
  address: src.Type.String(),
  mac: src.Type.Optional(src.Type.String())
});
const GetOwnershipId = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  coin_name: src.Type.Optional(src.Type.String()),
  multisig: src.Type.Optional(MultisigRedeemScriptType),
  script_type: src.Type.Optional(InputScriptType)
});
const OwnershipId = src.Type.Object({
  ownership_id: src.Type.String()
});
const SignMessage = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  message: src.Type.String(),
  coin_name: src.Type.Optional(src.Type.String()),
  script_type: src.Type.Optional(InputScriptType),
  no_script_type: src.Type.Optional(src.Type.Boolean()),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const MessageSignature = src.Type.Object({
  address: src.Type.String(),
  signature: src.Type.String()
});
const VerifyMessage = src.Type.Object({
  address: src.Type.String(),
  signature: src.Type.String(),
  message: src.Type.String(),
  coin_name: src.Type.Optional(src.Type.String()),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const CoinJoinRequest = src.Type.Object({
  fee_rate: src.Type.Number(),
  no_fee_threshold: src.Type.Number(),
  min_registrable_amount: src.Type.Number(),
  mask_public_key: src.Type.String(),
  signature: src.Type.String()
});
const SignTx = src.Type.Object({
  outputs_count: src.Type.Number(),
  inputs_count: src.Type.Number(),
  coin_name: src.Type.Optional(src.Type.String()),
  version: src.Type.Optional(src.Type.Number()),
  lock_time: src.Type.Optional(src.Type.Number()),
  expiry: src.Type.Optional(src.Type.Number()),
  overwintered: src.Type.Optional(src.Type.Boolean()),
  version_group_id: src.Type.Optional(src.Type.Number()),
  timestamp: src.Type.Optional(src.Type.Number()),
  branch_id: src.Type.Optional(src.Type.Number()),
  amount_unit: src.Type.Optional(EnumAmountUnit),
  decred_staking_ticket: src.Type.Optional(src.Type.Boolean()),
  serialize: src.Type.Optional(src.Type.Boolean()),
  coinjoin_request: src.Type.Optional(CoinJoinRequest),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
let messages_schema_Enum_RequestType = /*#__PURE__*/function (Enum_RequestType) {
  Enum_RequestType[Enum_RequestType["TXINPUT"] = 0] = "TXINPUT";
  Enum_RequestType[Enum_RequestType["TXOUTPUT"] = 1] = "TXOUTPUT";
  Enum_RequestType[Enum_RequestType["TXMETA"] = 2] = "TXMETA";
  Enum_RequestType[Enum_RequestType["TXFINISHED"] = 3] = "TXFINISHED";
  Enum_RequestType[Enum_RequestType["TXEXTRADATA"] = 4] = "TXEXTRADATA";
  Enum_RequestType[Enum_RequestType["TXORIGINPUT"] = 5] = "TXORIGINPUT";
  Enum_RequestType[Enum_RequestType["TXORIGOUTPUT"] = 6] = "TXORIGOUTPUT";
  Enum_RequestType[Enum_RequestType["TXPAYMENTREQ"] = 7] = "TXPAYMENTREQ";
  return Enum_RequestType;
}({});
const EnumEnum_RequestType = src.Type.Enum(messages_schema_Enum_RequestType);
const RequestType = src.Type.KeyOfEnum(messages_schema_Enum_RequestType);
const TxRequestDetailsType = src.Type.Object({
  request_index: src.Type.Number(),
  tx_hash: src.Type.Optional(src.Type.String()),
  extra_data_len: src.Type.Optional(src.Type.Number()),
  extra_data_offset: src.Type.Optional(src.Type.Number())
});
const TxRequestSerializedType = src.Type.Object({
  signature_index: src.Type.Optional(src.Type.Number()),
  signature: src.Type.Optional(src.Type.String()),
  serialized_tx: src.Type.Optional(src.Type.String())
});
const TxRequest = src.Type.Object({
  request_type: RequestType,
  details: TxRequestDetailsType,
  serialized: src.Type.Optional(TxRequestSerializedType)
});
const InternalInputScriptType = src.Type.Exclude(InputScriptType, src.Type.Literal('EXTERNAL'));
const CommonTxInputType = src.Type.Object({
  prev_hash: src.Type.String(),
  prev_index: src.Type.Number(),
  amount: src.Type.Uint(),
  sequence: src.Type.Optional(src.Type.Number()),
  multisig: src.Type.Optional(MultisigRedeemScriptType),
  decred_tree: src.Type.Optional(src.Type.Number()),
  orig_hash: src.Type.Optional(src.Type.String()),
  orig_index: src.Type.Optional(src.Type.Number()),
  decred_staking_spend: src.Type.Optional(EnumDecredStakingSpendType),
  script_pubkey: src.Type.Optional(src.Type.String()),
  coinjoin_flags: src.Type.Optional(src.Type.Number()),
  script_sig: src.Type.Optional(src.Type.String()),
  witness: src.Type.Optional(src.Type.String()),
  ownership_proof: src.Type.Optional(src.Type.String()),
  commitment_data: src.Type.Optional(src.Type.String())
});
const TxInputType = src.Type.Union([src.Type.Intersect([CommonTxInputType, src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  script_type: src.Type.Optional(InternalInputScriptType)
})]), src.Type.Intersect([CommonTxInputType, src.Type.Object({
  address_n: src.Type.Optional(src.Type.Undefined()),
  script_type: src.Type.Literal('EXTERNAL'),
  script_pubkey: src.Type.String()
})])]);
const TxInput = TxInputType;
const TxOutputBinType = src.Type.Object({
  amount: src.Type.Uint(),
  script_pubkey: src.Type.String(),
  decred_script_version: src.Type.Optional(src.Type.Number())
});
const ChangeOutputScriptType = src.Type.Exclude(OutputScriptType, src.Type.Literal('PAYTOOPRETURN'));
const TxOutputType = src.Type.Union([src.Type.Object({
  address: src.Type.String(),
  address_n: src.Type.Optional(src.Type.Undefined()),
  script_type: src.Type.Literal('PAYTOADDRESS'),
  amount: src.Type.Uint(),
  multisig: src.Type.Optional(MultisigRedeemScriptType),
  orig_hash: src.Type.Optional(src.Type.String()),
  orig_index: src.Type.Optional(src.Type.Number()),
  payment_req_index: src.Type.Optional(src.Type.Number())
}), src.Type.Object({
  address: src.Type.Optional(src.Type.Undefined()),
  address_n: src.Type.Array(src.Type.Number()),
  script_type: src.Type.Optional(ChangeOutputScriptType),
  amount: src.Type.Uint(),
  multisig: src.Type.Optional(MultisigRedeemScriptType),
  orig_hash: src.Type.Optional(src.Type.String()),
  orig_index: src.Type.Optional(src.Type.Number()),
  payment_req_index: src.Type.Optional(src.Type.Number())
}), src.Type.Object({
  address: src.Type.String(),
  address_n: src.Type.Optional(src.Type.Undefined()),
  script_type: src.Type.Optional(ChangeOutputScriptType),
  amount: src.Type.Uint(),
  multisig: src.Type.Optional(MultisigRedeemScriptType),
  orig_hash: src.Type.Optional(src.Type.String()),
  orig_index: src.Type.Optional(src.Type.Number()),
  payment_req_index: src.Type.Optional(src.Type.Number())
}), src.Type.Object({
  address: src.Type.Optional(src.Type.Undefined()),
  address_n: src.Type.Optional(src.Type.Undefined()),
  amount: src.Type.Union([src.Type.Literal('0'), src.Type.Literal(0)]),
  op_return_data: src.Type.String(),
  script_type: src.Type.Literal('PAYTOOPRETURN'),
  orig_hash: src.Type.Optional(src.Type.String()),
  orig_index: src.Type.Optional(src.Type.Number()),
  payment_req_index: src.Type.Optional(src.Type.Number())
})]);
const TxOutput = TxOutputType;
const PrevTx = src.Type.Object({
  version: src.Type.Number(),
  lock_time: src.Type.Number(),
  inputs_count: src.Type.Number(),
  outputs_count: src.Type.Number(),
  extra_data_len: src.Type.Optional(src.Type.Number()),
  expiry: src.Type.Optional(src.Type.Number()),
  version_group_id: src.Type.Optional(src.Type.Number()),
  timestamp: src.Type.Optional(src.Type.Number()),
  branch_id: src.Type.Optional(src.Type.Number())
});
const PrevInput = src.Type.Object({
  prev_hash: src.Type.String(),
  prev_index: src.Type.Number(),
  script_sig: src.Type.String(),
  sequence: src.Type.Number(),
  decred_tree: src.Type.Optional(src.Type.Number())
});
const PrevOutput = src.Type.Object({
  amount: src.Type.Uint(),
  script_pubkey: src.Type.String(),
  decred_script_version: src.Type.Optional(src.Type.Number())
});
const TextMemo = src.Type.Object({
  text: src.Type.String()
});
const RefundMemo = src.Type.Object({
  address: src.Type.String(),
  mac: src.Type.String()
});
const CoinPurchaseMemo = src.Type.Object({
  coin_type: src.Type.Number(),
  amount: src.Type.Uint(),
  address: src.Type.String(),
  mac: src.Type.String()
});
const PaymentRequestMemo = src.Type.Object({
  text_memo: src.Type.Optional(TextMemo),
  refund_memo: src.Type.Optional(RefundMemo),
  coin_purchase_memo: src.Type.Optional(CoinPurchaseMemo)
});
const TxAckPaymentRequest = src.Type.Object({
  nonce: src.Type.Optional(src.Type.String()),
  recipient_name: src.Type.String(),
  memos: src.Type.Optional(src.Type.Array(PaymentRequestMemo)),
  amount: src.Type.Optional(src.Type.Uint()),
  signature: src.Type.String()
});
const TxAckResponse = src.Type.Union([src.Type.Object({
  inputs: src.Type.Array(src.Type.Union([TxInputType, PrevInput]))
}), src.Type.Object({
  bin_outputs: src.Type.Array(TxOutputBinType)
}), src.Type.Object({
  outputs: src.Type.Array(TxOutputType)
}), src.Type.Object({
  extra_data: src.Type.String()
}), src.Type.Object({
  version: src.Type.Optional(src.Type.Number()),
  lock_time: src.Type.Optional(src.Type.Number()),
  inputs_cnt: src.Type.Number(),
  outputs_cnt: src.Type.Number(),
  extra_data: src.Type.Optional(src.Type.String()),
  extra_data_len: src.Type.Optional(src.Type.Number()),
  timestamp: src.Type.Optional(src.Type.Number()),
  version_group_id: src.Type.Optional(src.Type.Number()),
  expiry: src.Type.Optional(src.Type.Number()),
  branch_id: src.Type.Optional(src.Type.Number())
})]);
const TxAck = src.Type.Object({
  tx: TxAckResponse
});
const TxAckInputWrapper = src.Type.Object({
  input: TxInput
});
const TxAckInput = src.Type.Object({
  tx: TxAckInputWrapper
});
const TxAckOutputWrapper = src.Type.Object({
  output: TxOutput
});
const TxAckOutput = src.Type.Object({
  tx: TxAckOutputWrapper
});
const TxAckPrevMeta = src.Type.Object({
  tx: PrevTx
});
const TxAckPrevInputWrapper = src.Type.Object({
  input: PrevInput
});
const TxAckPrevInput = src.Type.Object({
  tx: TxAckPrevInputWrapper
});
const TxAckPrevOutputWrapper = src.Type.Object({
  output: PrevOutput
});
const TxAckPrevOutput = src.Type.Object({
  tx: TxAckPrevOutputWrapper
});
const TxAckPrevExtraDataWrapper = src.Type.Object({
  extra_data_chunk: src.Type.String()
});
const TxAckPrevExtraData = src.Type.Object({
  tx: TxAckPrevExtraDataWrapper
});
const GetOwnershipProof = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  coin_name: src.Type.Optional(src.Type.String()),
  script_type: src.Type.Optional(InputScriptType),
  multisig: src.Type.Optional(MultisigRedeemScriptType),
  user_confirmation: src.Type.Optional(src.Type.Boolean()),
  ownership_ids: src.Type.Optional(src.Type.Array(src.Type.String())),
  commitment_data: src.Type.Optional(src.Type.String())
});
const OwnershipProof = src.Type.Object({
  ownership_proof: src.Type.String(),
  signature: src.Type.String()
});
const AuthorizeCoinJoin = src.Type.Object({
  coordinator: src.Type.String(),
  max_rounds: src.Type.Number(),
  max_coordinator_fee_rate: src.Type.Number(),
  max_fee_per_kvbyte: src.Type.Number(),
  address_n: src.Type.Array(src.Type.Number()),
  coin_name: src.Type.Optional(src.Type.String()),
  script_type: src.Type.Optional(InputScriptType),
  amount_unit: src.Type.Optional(EnumAmountUnit)
});
const FirmwareErase = src.Type.Object({
  length: src.Type.Optional(src.Type.Number())
});
const FirmwareRequest = src.Type.Object({
  offset: src.Type.Number(),
  length: src.Type.Number()
});
const FirmwareUpload = src.Type.Object({
  payload: src.Type.Union([src.Type.Buffer(), src.Type.ArrayBuffer()]),
  hash: src.Type.Optional(src.Type.String())
});
const ProdTestT1 = src.Type.Object({
  payload: src.Type.Optional(src.Type.String())
});
let messages_schema_CardanoDerivationType = /*#__PURE__*/function (CardanoDerivationType) {
  CardanoDerivationType[CardanoDerivationType["LEDGER"] = 0] = "LEDGER";
  CardanoDerivationType[CardanoDerivationType["ICARUS"] = 1] = "ICARUS";
  CardanoDerivationType[CardanoDerivationType["ICARUS_TREZOR"] = 2] = "ICARUS_TREZOR";
  return CardanoDerivationType;
}({});
const EnumCardanoDerivationType = src.Type.Enum(messages_schema_CardanoDerivationType);
let messages_schema_CardanoAddressType = /*#__PURE__*/function (CardanoAddressType) {
  CardanoAddressType[CardanoAddressType["BASE"] = 0] = "BASE";
  CardanoAddressType[CardanoAddressType["BASE_SCRIPT_KEY"] = 1] = "BASE_SCRIPT_KEY";
  CardanoAddressType[CardanoAddressType["BASE_KEY_SCRIPT"] = 2] = "BASE_KEY_SCRIPT";
  CardanoAddressType[CardanoAddressType["BASE_SCRIPT_SCRIPT"] = 3] = "BASE_SCRIPT_SCRIPT";
  CardanoAddressType[CardanoAddressType["POINTER"] = 4] = "POINTER";
  CardanoAddressType[CardanoAddressType["POINTER_SCRIPT"] = 5] = "POINTER_SCRIPT";
  CardanoAddressType[CardanoAddressType["ENTERPRISE"] = 6] = "ENTERPRISE";
  CardanoAddressType[CardanoAddressType["ENTERPRISE_SCRIPT"] = 7] = "ENTERPRISE_SCRIPT";
  CardanoAddressType[CardanoAddressType["BYRON"] = 8] = "BYRON";
  CardanoAddressType[CardanoAddressType["REWARD"] = 14] = "REWARD";
  CardanoAddressType[CardanoAddressType["REWARD_SCRIPT"] = 15] = "REWARD_SCRIPT";
  return CardanoAddressType;
}({});
const EnumCardanoAddressType = src.Type.Enum(messages_schema_CardanoAddressType);
let messages_schema_CardanoNativeScriptType = /*#__PURE__*/function (CardanoNativeScriptType) {
  CardanoNativeScriptType[CardanoNativeScriptType["PUB_KEY"] = 0] = "PUB_KEY";
  CardanoNativeScriptType[CardanoNativeScriptType["ALL"] = 1] = "ALL";
  CardanoNativeScriptType[CardanoNativeScriptType["ANY"] = 2] = "ANY";
  CardanoNativeScriptType[CardanoNativeScriptType["N_OF_K"] = 3] = "N_OF_K";
  CardanoNativeScriptType[CardanoNativeScriptType["INVALID_BEFORE"] = 4] = "INVALID_BEFORE";
  CardanoNativeScriptType[CardanoNativeScriptType["INVALID_HEREAFTER"] = 5] = "INVALID_HEREAFTER";
  return CardanoNativeScriptType;
}({});
const EnumCardanoNativeScriptType = src.Type.Enum(messages_schema_CardanoNativeScriptType);
let messages_schema_CardanoNativeScriptHashDisplayFormat = /*#__PURE__*/function (CardanoNativeScriptHashDisplayFormat) {
  CardanoNativeScriptHashDisplayFormat[CardanoNativeScriptHashDisplayFormat["HIDE"] = 0] = "HIDE";
  CardanoNativeScriptHashDisplayFormat[CardanoNativeScriptHashDisplayFormat["BECH32"] = 1] = "BECH32";
  CardanoNativeScriptHashDisplayFormat[CardanoNativeScriptHashDisplayFormat["POLICY_ID"] = 2] = "POLICY_ID";
  return CardanoNativeScriptHashDisplayFormat;
}({});
const EnumCardanoNativeScriptHashDisplayFormat = src.Type.Enum(messages_schema_CardanoNativeScriptHashDisplayFormat);
let messages_schema_CardanoTxOutputSerializationFormat = /*#__PURE__*/function (CardanoTxOutputSerializationFormat) {
  CardanoTxOutputSerializationFormat[CardanoTxOutputSerializationFormat["ARRAY_LEGACY"] = 0] = "ARRAY_LEGACY";
  CardanoTxOutputSerializationFormat[CardanoTxOutputSerializationFormat["MAP_BABBAGE"] = 1] = "MAP_BABBAGE";
  return CardanoTxOutputSerializationFormat;
}({});
const EnumCardanoTxOutputSerializationFormat = src.Type.Enum(messages_schema_CardanoTxOutputSerializationFormat);
let messages_schema_CardanoCertificateType = /*#__PURE__*/function (CardanoCertificateType) {
  CardanoCertificateType[CardanoCertificateType["STAKE_REGISTRATION"] = 0] = "STAKE_REGISTRATION";
  CardanoCertificateType[CardanoCertificateType["STAKE_DEREGISTRATION"] = 1] = "STAKE_DEREGISTRATION";
  CardanoCertificateType[CardanoCertificateType["STAKE_DELEGATION"] = 2] = "STAKE_DELEGATION";
  CardanoCertificateType[CardanoCertificateType["STAKE_POOL_REGISTRATION"] = 3] = "STAKE_POOL_REGISTRATION";
  return CardanoCertificateType;
}({});
const EnumCardanoCertificateType = src.Type.Enum(messages_schema_CardanoCertificateType);
let messages_schema_CardanoPoolRelayType = /*#__PURE__*/function (CardanoPoolRelayType) {
  CardanoPoolRelayType[CardanoPoolRelayType["SINGLE_HOST_IP"] = 0] = "SINGLE_HOST_IP";
  CardanoPoolRelayType[CardanoPoolRelayType["SINGLE_HOST_NAME"] = 1] = "SINGLE_HOST_NAME";
  CardanoPoolRelayType[CardanoPoolRelayType["MULTIPLE_HOST_NAME"] = 2] = "MULTIPLE_HOST_NAME";
  return CardanoPoolRelayType;
}({});
const EnumCardanoPoolRelayType = src.Type.Enum(messages_schema_CardanoPoolRelayType);
let messages_schema_CardanoTxAuxiliaryDataSupplementType = /*#__PURE__*/function (CardanoTxAuxiliaryDataSupplementType) {
  CardanoTxAuxiliaryDataSupplementType[CardanoTxAuxiliaryDataSupplementType["NONE"] = 0] = "NONE";
  CardanoTxAuxiliaryDataSupplementType[CardanoTxAuxiliaryDataSupplementType["CVOTE_REGISTRATION_SIGNATURE"] = 1] = "CVOTE_REGISTRATION_SIGNATURE";
  return CardanoTxAuxiliaryDataSupplementType;
}({});
const EnumCardanoTxAuxiliaryDataSupplementType = src.Type.Enum(messages_schema_CardanoTxAuxiliaryDataSupplementType);
let messages_schema_CardanoCVoteRegistrationFormat = /*#__PURE__*/function (CardanoCVoteRegistrationFormat) {
  CardanoCVoteRegistrationFormat[CardanoCVoteRegistrationFormat["CIP15"] = 0] = "CIP15";
  CardanoCVoteRegistrationFormat[CardanoCVoteRegistrationFormat["CIP36"] = 1] = "CIP36";
  return CardanoCVoteRegistrationFormat;
}({});
const EnumCardanoCVoteRegistrationFormat = src.Type.Enum(messages_schema_CardanoCVoteRegistrationFormat);
let messages_schema_CardanoTxSigningMode = /*#__PURE__*/function (CardanoTxSigningMode) {
  CardanoTxSigningMode[CardanoTxSigningMode["ORDINARY_TRANSACTION"] = 0] = "ORDINARY_TRANSACTION";
  CardanoTxSigningMode[CardanoTxSigningMode["POOL_REGISTRATION_AS_OWNER"] = 1] = "POOL_REGISTRATION_AS_OWNER";
  CardanoTxSigningMode[CardanoTxSigningMode["MULTISIG_TRANSACTION"] = 2] = "MULTISIG_TRANSACTION";
  CardanoTxSigningMode[CardanoTxSigningMode["PLUTUS_TRANSACTION"] = 3] = "PLUTUS_TRANSACTION";
  return CardanoTxSigningMode;
}({});
const EnumCardanoTxSigningMode = src.Type.Enum(messages_schema_CardanoTxSigningMode);
let messages_schema_CardanoTxWitnessType = /*#__PURE__*/function (CardanoTxWitnessType) {
  CardanoTxWitnessType[CardanoTxWitnessType["BYRON_WITNESS"] = 0] = "BYRON_WITNESS";
  CardanoTxWitnessType[CardanoTxWitnessType["SHELLEY_WITNESS"] = 1] = "SHELLEY_WITNESS";
  return CardanoTxWitnessType;
}({});
const EnumCardanoTxWitnessType = src.Type.Enum(messages_schema_CardanoTxWitnessType);
const CardanoBlockchainPointerType = src.Type.Object({
  block_index: src.Type.Number(),
  tx_index: src.Type.Number(),
  certificate_index: src.Type.Number()
});
const CardanoNativeScript = src.Type.Recursive(This => src.Type.Object({
  type: EnumCardanoNativeScriptType,
  scripts: src.Type.Optional(src.Type.Array(This)),
  key_hash: src.Type.Optional(src.Type.String()),
  key_path: src.Type.Optional(src.Type.Array(src.Type.Number())),
  required_signatures_count: src.Type.Optional(src.Type.Number()),
  invalid_before: src.Type.Optional(src.Type.Uint()),
  invalid_hereafter: src.Type.Optional(src.Type.Uint())
}));
const CardanoGetNativeScriptHash = src.Type.Object({
  script: CardanoNativeScript,
  display_format: EnumCardanoNativeScriptHashDisplayFormat,
  derivation_type: EnumCardanoDerivationType
});
const CardanoNativeScriptHash = src.Type.Object({
  script_hash: src.Type.String()
});
const CardanoAddressParametersType = src.Type.Object({
  address_type: EnumCardanoAddressType,
  address_n: src.Type.Array(src.Type.Number()),
  address_n_staking: src.Type.Array(src.Type.Number()),
  staking_key_hash: src.Type.Optional(src.Type.String()),
  certificate_pointer: src.Type.Optional(CardanoBlockchainPointerType),
  script_payment_hash: src.Type.Optional(src.Type.String()),
  script_staking_hash: src.Type.Optional(src.Type.String())
});
const CardanoGetAddress = src.Type.Object({
  show_display: src.Type.Optional(src.Type.Boolean()),
  protocol_magic: src.Type.Number(),
  network_id: src.Type.Number(),
  address_parameters: CardanoAddressParametersType,
  derivation_type: EnumCardanoDerivationType,
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const CardanoAddress = src.Type.Object({
  address: src.Type.String()
});
const CardanoGetPublicKey = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  show_display: src.Type.Optional(src.Type.Boolean()),
  derivation_type: EnumCardanoDerivationType
});
const CardanoPublicKey = src.Type.Object({
  xpub: src.Type.String(),
  node: HDNodeType
});
const CardanoSignTxInit = src.Type.Object({
  signing_mode: EnumCardanoTxSigningMode,
  protocol_magic: src.Type.Number(),
  network_id: src.Type.Number(),
  inputs_count: src.Type.Number(),
  outputs_count: src.Type.Number(),
  fee: src.Type.Uint(),
  ttl: src.Type.Optional(src.Type.Uint()),
  certificates_count: src.Type.Number(),
  withdrawals_count: src.Type.Number(),
  has_auxiliary_data: src.Type.Boolean(),
  validity_interval_start: src.Type.Optional(src.Type.Uint()),
  witness_requests_count: src.Type.Number(),
  minting_asset_groups_count: src.Type.Number(),
  derivation_type: EnumCardanoDerivationType,
  include_network_id: src.Type.Optional(src.Type.Boolean()),
  script_data_hash: src.Type.Optional(src.Type.String()),
  collateral_inputs_count: src.Type.Number(),
  required_signers_count: src.Type.Number(),
  has_collateral_return: src.Type.Optional(src.Type.Boolean()),
  total_collateral: src.Type.Optional(src.Type.Uint()),
  reference_inputs_count: src.Type.Optional(src.Type.Number()),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const CardanoTxInput = src.Type.Object({
  prev_hash: src.Type.String(),
  prev_index: src.Type.Number()
});
const CardanoTxOutput = src.Type.Object({
  address: src.Type.Optional(src.Type.String()),
  address_parameters: src.Type.Optional(CardanoAddressParametersType),
  amount: src.Type.Uint(),
  asset_groups_count: src.Type.Number(),
  datum_hash: src.Type.Optional(src.Type.String()),
  format: src.Type.Optional(EnumCardanoTxOutputSerializationFormat),
  inline_datum_size: src.Type.Optional(src.Type.Number()),
  reference_script_size: src.Type.Optional(src.Type.Number())
});
const CardanoAssetGroup = src.Type.Object({
  policy_id: src.Type.String(),
  tokens_count: src.Type.Number()
});
const CardanoToken = src.Type.Object({
  asset_name_bytes: src.Type.String(),
  amount: src.Type.Optional(src.Type.Uint()),
  mint_amount: src.Type.Optional(src.Type.Uint({
    allowNegative: true
  }))
});
const CardanoTxInlineDatumChunk = src.Type.Object({
  data: src.Type.String()
});
const CardanoTxReferenceScriptChunk = src.Type.Object({
  data: src.Type.String()
});
const CardanoPoolOwner = src.Type.Object({
  staking_key_path: src.Type.Optional(src.Type.Array(src.Type.Number())),
  staking_key_hash: src.Type.Optional(src.Type.String())
});
const CardanoPoolRelayParameters = src.Type.Object({
  type: EnumCardanoPoolRelayType,
  ipv4_address: src.Type.Optional(src.Type.String()),
  ipv6_address: src.Type.Optional(src.Type.String()),
  host_name: src.Type.Optional(src.Type.String()),
  port: src.Type.Optional(src.Type.Number())
});
const CardanoPoolMetadataType = src.Type.Object({
  url: src.Type.String(),
  hash: src.Type.String()
});
const CardanoPoolParametersType = src.Type.Object({
  pool_id: src.Type.String(),
  vrf_key_hash: src.Type.String(),
  pledge: src.Type.Uint(),
  cost: src.Type.Uint(),
  margin_numerator: src.Type.Uint(),
  margin_denominator: src.Type.Uint(),
  reward_account: src.Type.String(),
  metadata: src.Type.Optional(CardanoPoolMetadataType),
  owners_count: src.Type.Number(),
  relays_count: src.Type.Number()
});
const CardanoTxCertificate = src.Type.Object({
  type: EnumCardanoCertificateType,
  path: src.Type.Optional(src.Type.Array(src.Type.Number())),
  pool: src.Type.Optional(src.Type.String()),
  pool_parameters: src.Type.Optional(CardanoPoolParametersType),
  script_hash: src.Type.Optional(src.Type.String()),
  key_hash: src.Type.Optional(src.Type.String())
});
const CardanoTxWithdrawal = src.Type.Object({
  path: src.Type.Optional(src.Type.Array(src.Type.Number())),
  amount: src.Type.Uint(),
  script_hash: src.Type.Optional(src.Type.String()),
  key_hash: src.Type.Optional(src.Type.String())
});
const CardanoCVoteRegistrationDelegation = src.Type.Object({
  vote_public_key: src.Type.String(),
  weight: src.Type.Uint()
});
const CardanoCVoteRegistrationParametersType = src.Type.Object({
  vote_public_key: src.Type.Optional(src.Type.String()),
  staking_path: src.Type.Array(src.Type.Number()),
  payment_address_parameters: src.Type.Optional(CardanoAddressParametersType),
  nonce: src.Type.Uint(),
  format: src.Type.Optional(EnumCardanoCVoteRegistrationFormat),
  delegations: src.Type.Optional(src.Type.Array(CardanoCVoteRegistrationDelegation)),
  voting_purpose: src.Type.Optional(src.Type.Uint()),
  payment_address: src.Type.Optional(src.Type.String())
});
const CardanoTxAuxiliaryData = src.Type.Object({
  cvote_registration_parameters: src.Type.Optional(CardanoCVoteRegistrationParametersType),
  hash: src.Type.Optional(src.Type.String())
});
const CardanoTxMint = src.Type.Object({
  asset_groups_count: src.Type.Number()
});
const CardanoTxCollateralInput = src.Type.Object({
  prev_hash: src.Type.String(),
  prev_index: src.Type.Number()
});
const CardanoTxRequiredSigner = src.Type.Object({
  key_hash: src.Type.Optional(src.Type.String()),
  key_path: src.Type.Optional(src.Type.Array(src.Type.Number()))
});
const CardanoTxReferenceInput = src.Type.Object({
  prev_hash: src.Type.String(),
  prev_index: src.Type.Number()
});
const CardanoTxItemAck = src.Type.Object({});
const CardanoTxAuxiliaryDataSupplement = src.Type.Object({
  type: EnumCardanoTxAuxiliaryDataSupplementType,
  auxiliary_data_hash: src.Type.Optional(src.Type.String()),
  cvote_registration_signature: src.Type.Optional(src.Type.String())
});
const CardanoTxWitnessRequest = src.Type.Object({
  path: src.Type.Array(src.Type.Number())
});
const CardanoTxWitnessResponse = src.Type.Object({
  type: EnumCardanoTxWitnessType,
  pub_key: src.Type.String(),
  signature: src.Type.String(),
  chain_code: src.Type.Optional(src.Type.String())
});
const CardanoTxHostAck = src.Type.Object({});
const CardanoTxBodyHash = src.Type.Object({
  tx_hash: src.Type.String()
});
const CardanoSignTxFinished = src.Type.Object({});
const Success = src.Type.Object({
  message: src.Type.String()
});
let messages_schema_FailureType = /*#__PURE__*/function (FailureType) {
  FailureType[FailureType["Failure_UnexpectedMessage"] = 1] = "Failure_UnexpectedMessage";
  FailureType[FailureType["Failure_ButtonExpected"] = 2] = "Failure_ButtonExpected";
  FailureType[FailureType["Failure_DataError"] = 3] = "Failure_DataError";
  FailureType[FailureType["Failure_ActionCancelled"] = 4] = "Failure_ActionCancelled";
  FailureType[FailureType["Failure_PinExpected"] = 5] = "Failure_PinExpected";
  FailureType[FailureType["Failure_PinCancelled"] = 6] = "Failure_PinCancelled";
  FailureType[FailureType["Failure_PinInvalid"] = 7] = "Failure_PinInvalid";
  FailureType[FailureType["Failure_InvalidSignature"] = 8] = "Failure_InvalidSignature";
  FailureType[FailureType["Failure_ProcessError"] = 9] = "Failure_ProcessError";
  FailureType[FailureType["Failure_NotEnoughFunds"] = 10] = "Failure_NotEnoughFunds";
  FailureType[FailureType["Failure_NotInitialized"] = 11] = "Failure_NotInitialized";
  FailureType[FailureType["Failure_PinMismatch"] = 12] = "Failure_PinMismatch";
  FailureType[FailureType["Failure_WipeCodeMismatch"] = 13] = "Failure_WipeCodeMismatch";
  FailureType[FailureType["Failure_InvalidSession"] = 14] = "Failure_InvalidSession";
  FailureType[FailureType["Failure_FirmwareError"] = 99] = "Failure_FirmwareError";
  return FailureType;
}({});
const EnumFailureType = src.Type.Enum(messages_schema_FailureType);
const Failure = src.Type.Object({
  code: src.Type.Optional(EnumFailureType),
  message: src.Type.Optional(src.Type.String())
});
let messages_schema_Enum_ButtonRequestType = /*#__PURE__*/function (Enum_ButtonRequestType) {
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_Other"] = 1] = "ButtonRequest_Other";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_FeeOverThreshold"] = 2] = "ButtonRequest_FeeOverThreshold";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_ConfirmOutput"] = 3] = "ButtonRequest_ConfirmOutput";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_ResetDevice"] = 4] = "ButtonRequest_ResetDevice";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_ConfirmWord"] = 5] = "ButtonRequest_ConfirmWord";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_WipeDevice"] = 6] = "ButtonRequest_WipeDevice";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_ProtectCall"] = 7] = "ButtonRequest_ProtectCall";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_SignTx"] = 8] = "ButtonRequest_SignTx";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_FirmwareCheck"] = 9] = "ButtonRequest_FirmwareCheck";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_Address"] = 10] = "ButtonRequest_Address";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_PublicKey"] = 11] = "ButtonRequest_PublicKey";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_MnemonicWordCount"] = 12] = "ButtonRequest_MnemonicWordCount";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_MnemonicInput"] = 13] = "ButtonRequest_MnemonicInput";
  Enum_ButtonRequestType[Enum_ButtonRequestType["_Deprecated_ButtonRequest_PassphraseType"] = 14] = "_Deprecated_ButtonRequest_PassphraseType";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_UnknownDerivationPath"] = 15] = "ButtonRequest_UnknownDerivationPath";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_RecoveryHomepage"] = 16] = "ButtonRequest_RecoveryHomepage";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_Success"] = 17] = "ButtonRequest_Success";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_Warning"] = 18] = "ButtonRequest_Warning";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_PassphraseEntry"] = 19] = "ButtonRequest_PassphraseEntry";
  Enum_ButtonRequestType[Enum_ButtonRequestType["ButtonRequest_PinEntry"] = 20] = "ButtonRequest_PinEntry";
  return Enum_ButtonRequestType;
}({});
const EnumEnum_ButtonRequestType = src.Type.Enum(messages_schema_Enum_ButtonRequestType);
const ButtonRequestType = src.Type.KeyOfEnum(messages_schema_Enum_ButtonRequestType);
const ButtonRequest = src.Type.Object({
  code: src.Type.Optional(ButtonRequestType),
  pages: src.Type.Optional(src.Type.Number())
});
const ButtonAck = src.Type.Object({});
let messages_schema_Enum_PinMatrixRequestType = /*#__PURE__*/function (Enum_PinMatrixRequestType) {
  Enum_PinMatrixRequestType[Enum_PinMatrixRequestType["PinMatrixRequestType_Current"] = 1] = "PinMatrixRequestType_Current";
  Enum_PinMatrixRequestType[Enum_PinMatrixRequestType["PinMatrixRequestType_NewFirst"] = 2] = "PinMatrixRequestType_NewFirst";
  Enum_PinMatrixRequestType[Enum_PinMatrixRequestType["PinMatrixRequestType_NewSecond"] = 3] = "PinMatrixRequestType_NewSecond";
  Enum_PinMatrixRequestType[Enum_PinMatrixRequestType["PinMatrixRequestType_WipeCodeFirst"] = 4] = "PinMatrixRequestType_WipeCodeFirst";
  Enum_PinMatrixRequestType[Enum_PinMatrixRequestType["PinMatrixRequestType_WipeCodeSecond"] = 5] = "PinMatrixRequestType_WipeCodeSecond";
  return Enum_PinMatrixRequestType;
}({});
const EnumEnum_PinMatrixRequestType = src.Type.Enum(messages_schema_Enum_PinMatrixRequestType);
const PinMatrixRequestType = src.Type.KeyOfEnum(messages_schema_Enum_PinMatrixRequestType);
const PinMatrixRequest = src.Type.Object({
  type: src.Type.Optional(PinMatrixRequestType)
});
const PinMatrixAck = src.Type.Object({
  pin: src.Type.String()
});
const PassphraseRequest = src.Type.Object({
  _on_device: src.Type.Optional(src.Type.Boolean())
});
const PassphraseAck = src.Type.Object({
  passphrase: src.Type.Optional(src.Type.String()),
  _state: src.Type.Optional(src.Type.String()),
  on_device: src.Type.Optional(src.Type.Boolean())
});
const Deprecated_PassphraseStateRequest = src.Type.Object({
  state: src.Type.Optional(src.Type.String())
});
const Deprecated_PassphraseStateAck = src.Type.Object({});
const CipherKeyValue = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  key: src.Type.String(),
  value: src.Type.String(),
  encrypt: src.Type.Optional(src.Type.Boolean()),
  ask_on_encrypt: src.Type.Optional(src.Type.Boolean()),
  ask_on_decrypt: src.Type.Optional(src.Type.Boolean()),
  iv: src.Type.Optional(src.Type.String())
});
const CipheredKeyValue = src.Type.Object({
  value: src.Type.String()
});
const IdentityType = src.Type.Object({
  proto: src.Type.Optional(src.Type.String()),
  user: src.Type.Optional(src.Type.String()),
  host: src.Type.Optional(src.Type.String()),
  port: src.Type.Optional(src.Type.String()),
  path: src.Type.Optional(src.Type.String()),
  index: src.Type.Optional(src.Type.Number())
});
const SignIdentity = src.Type.Object({
  identity: IdentityType,
  challenge_hidden: src.Type.Optional(src.Type.String()),
  challenge_visual: src.Type.Optional(src.Type.String()),
  ecdsa_curve_name: src.Type.Optional(src.Type.String())
});
const SignedIdentity = src.Type.Object({
  address: src.Type.String(),
  public_key: src.Type.String(),
  signature: src.Type.String()
});
const GetECDHSessionKey = src.Type.Object({
  identity: IdentityType,
  peer_public_key: src.Type.String(),
  ecdsa_curve_name: src.Type.Optional(src.Type.String())
});
const ECDHSessionKey = src.Type.Object({
  session_key: src.Type.String(),
  public_key: src.Type.Optional(src.Type.String())
});
let messages_schema_DebugButton = /*#__PURE__*/function (DebugButton) {
  DebugButton[DebugButton["NO"] = 0] = "NO";
  DebugButton[DebugButton["YES"] = 1] = "YES";
  DebugButton[DebugButton["INFO"] = 2] = "INFO";
  return DebugButton;
}({});
const EnumDebugButton = src.Type.Enum(messages_schema_DebugButton);
let messages_schema_DebugPhysicalButton = /*#__PURE__*/function (DebugPhysicalButton) {
  DebugPhysicalButton[DebugPhysicalButton["LEFT_BTN"] = 0] = "LEFT_BTN";
  DebugPhysicalButton[DebugPhysicalButton["MIDDLE_BTN"] = 1] = "MIDDLE_BTN";
  DebugPhysicalButton[DebugPhysicalButton["RIGHT_BTN"] = 2] = "RIGHT_BTN";
  return DebugPhysicalButton;
}({});
const EnumDebugPhysicalButton = src.Type.Enum(messages_schema_DebugPhysicalButton);
const DebugLinkResetDebugEvents = src.Type.Object({});
const EosGetPublicKey = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  show_display: src.Type.Optional(src.Type.Boolean()),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const EosPublicKey = src.Type.Object({
  wif_public_key: src.Type.String(),
  raw_public_key: src.Type.String()
});
const EosTxHeader = src.Type.Object({
  expiration: src.Type.Number(),
  ref_block_num: src.Type.Number(),
  ref_block_prefix: src.Type.Number(),
  max_net_usage_words: src.Type.Number(),
  max_cpu_usage_ms: src.Type.Number(),
  delay_sec: src.Type.Number()
});
const EosSignTx = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  chain_id: src.Type.String(),
  header: EosTxHeader,
  num_actions: src.Type.Number(),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const EosTxActionRequest = src.Type.Object({
  data_size: src.Type.Optional(src.Type.Number())
});
const EosAsset = src.Type.Object({
  amount: src.Type.Uint(),
  symbol: src.Type.String()
});
const EosPermissionLevel = src.Type.Object({
  actor: src.Type.String(),
  permission: src.Type.String()
});
const EosAuthorizationKey = src.Type.Object({
  type: src.Type.Optional(src.Type.Number()),
  key: src.Type.String(),
  address_n: src.Type.Optional(src.Type.Array(src.Type.Number())),
  weight: src.Type.Number()
});
const EosAuthorizationAccount = src.Type.Object({
  account: EosPermissionLevel,
  weight: src.Type.Number()
});
const EosAuthorizationWait = src.Type.Object({
  wait_sec: src.Type.Number(),
  weight: src.Type.Number()
});
const EosAuthorization = src.Type.Object({
  threshold: src.Type.Number(),
  keys: src.Type.Array(EosAuthorizationKey),
  accounts: src.Type.Array(EosAuthorizationAccount),
  waits: src.Type.Array(EosAuthorizationWait)
});
const EosActionCommon = src.Type.Object({
  account: src.Type.String(),
  name: src.Type.String(),
  authorization: src.Type.Array(EosPermissionLevel)
});
const EosActionTransfer = src.Type.Object({
  sender: src.Type.String(),
  receiver: src.Type.String(),
  quantity: EosAsset,
  memo: src.Type.String()
});
const EosActionDelegate = src.Type.Object({
  sender: src.Type.String(),
  receiver: src.Type.String(),
  net_quantity: EosAsset,
  cpu_quantity: EosAsset,
  transfer: src.Type.Boolean()
});
const EosActionUndelegate = src.Type.Object({
  sender: src.Type.String(),
  receiver: src.Type.String(),
  net_quantity: EosAsset,
  cpu_quantity: EosAsset
});
const EosActionRefund = src.Type.Object({
  owner: src.Type.String()
});
const EosActionBuyRam = src.Type.Object({
  payer: src.Type.String(),
  receiver: src.Type.String(),
  quantity: EosAsset
});
const EosActionBuyRamBytes = src.Type.Object({
  payer: src.Type.String(),
  receiver: src.Type.String(),
  bytes: src.Type.Number()
});
const EosActionSellRam = src.Type.Object({
  account: src.Type.String(),
  bytes: src.Type.Number()
});
const EosActionVoteProducer = src.Type.Object({
  voter: src.Type.String(),
  proxy: src.Type.String(),
  producers: src.Type.Array(src.Type.String())
});
const EosActionUpdateAuth = src.Type.Object({
  account: src.Type.String(),
  permission: src.Type.String(),
  parent: src.Type.String(),
  auth: EosAuthorization
});
const EosActionDeleteAuth = src.Type.Object({
  account: src.Type.String(),
  permission: src.Type.String()
});
const EosActionLinkAuth = src.Type.Object({
  account: src.Type.String(),
  code: src.Type.String(),
  type: src.Type.String(),
  requirement: src.Type.String()
});
const EosActionUnlinkAuth = src.Type.Object({
  account: src.Type.String(),
  code: src.Type.String(),
  type: src.Type.String()
});
const EosActionNewAccount = src.Type.Object({
  creator: src.Type.String(),
  name: src.Type.String(),
  owner: EosAuthorization,
  active: EosAuthorization
});
const EosActionUnknown = src.Type.Object({
  data_size: src.Type.Number(),
  data_chunk: src.Type.String()
});
const EosTxActionAck = src.Type.Object({
  common: EosActionCommon,
  transfer: src.Type.Optional(EosActionTransfer),
  delegate: src.Type.Optional(EosActionDelegate),
  undelegate: src.Type.Optional(EosActionUndelegate),
  refund: src.Type.Optional(EosActionRefund),
  buy_ram: src.Type.Optional(EosActionBuyRam),
  buy_ram_bytes: src.Type.Optional(EosActionBuyRamBytes),
  sell_ram: src.Type.Optional(EosActionSellRam),
  vote_producer: src.Type.Optional(EosActionVoteProducer),
  update_auth: src.Type.Optional(EosActionUpdateAuth),
  delete_auth: src.Type.Optional(EosActionDeleteAuth),
  link_auth: src.Type.Optional(EosActionLinkAuth),
  unlink_auth: src.Type.Optional(EosActionUnlinkAuth),
  new_account: src.Type.Optional(EosActionNewAccount),
  unknown: src.Type.Optional(EosActionUnknown)
});
const EosSignedTx = src.Type.Object({
  signature: src.Type.String()
});
let messages_schema_EthereumDefinitionType = /*#__PURE__*/function (EthereumDefinitionType) {
  EthereumDefinitionType[EthereumDefinitionType["NETWORK"] = 0] = "NETWORK";
  EthereumDefinitionType[EthereumDefinitionType["TOKEN"] = 1] = "TOKEN";
  return EthereumDefinitionType;
}({});
const EnumEthereumDefinitionType = src.Type.Enum(messages_schema_EthereumDefinitionType);
const EthereumNetworkInfo = src.Type.Object({
  chain_id: src.Type.Number(),
  symbol: src.Type.String(),
  slip44: src.Type.Number(),
  name: src.Type.String()
});
const EthereumTokenInfo = src.Type.Object({
  address: src.Type.String(),
  chain_id: src.Type.Number(),
  symbol: src.Type.String(),
  decimals: src.Type.Number(),
  name: src.Type.String()
});
const EthereumDefinitions = src.Type.Object({
  encoded_network: src.Type.Optional(src.Type.ArrayBuffer()),
  encoded_token: src.Type.Optional(src.Type.ArrayBuffer())
});
const EthereumSignTypedData = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  primary_type: src.Type.String(),
  metamask_v4_compat: src.Type.Optional(src.Type.Boolean()),
  definitions: src.Type.Optional(EthereumDefinitions)
});
const EthereumTypedDataStructRequest = src.Type.Object({
  name: src.Type.String()
});
let messages_schema_EthereumDataType = /*#__PURE__*/function (EthereumDataType) {
  EthereumDataType[EthereumDataType["UINT"] = 1] = "UINT";
  EthereumDataType[EthereumDataType["INT"] = 2] = "INT";
  EthereumDataType[EthereumDataType["BYTES"] = 3] = "BYTES";
  EthereumDataType[EthereumDataType["STRING"] = 4] = "STRING";
  EthereumDataType[EthereumDataType["BOOL"] = 5] = "BOOL";
  EthereumDataType[EthereumDataType["ADDRESS"] = 6] = "ADDRESS";
  EthereumDataType[EthereumDataType["ARRAY"] = 7] = "ARRAY";
  EthereumDataType[EthereumDataType["STRUCT"] = 8] = "STRUCT";
  return EthereumDataType;
}({});
const EnumEthereumDataType = src.Type.Enum(messages_schema_EthereumDataType);
const EthereumFieldType = src.Type.Recursive(This => src.Type.Object({
  data_type: EnumEthereumDataType,
  size: src.Type.Optional(src.Type.Number()),
  entry_type: src.Type.Optional(This),
  struct_name: src.Type.Optional(src.Type.String())
}));
const EthereumStructMember = src.Type.Object({
  type: EthereumFieldType,
  name: src.Type.String()
});
const EthereumTypedDataStructAck = src.Type.Object({
  members: src.Type.Array(EthereumStructMember)
});
const EthereumTypedDataValueRequest = src.Type.Object({
  member_path: src.Type.Array(src.Type.Number())
});
const EthereumTypedDataValueAck = src.Type.Object({
  value: src.Type.String()
});
const EthereumGetPublicKey = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  show_display: src.Type.Optional(src.Type.Boolean())
});
const EthereumPublicKey = src.Type.Object({
  node: HDNodeType,
  xpub: src.Type.String()
});
const EthereumGetAddress = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  show_display: src.Type.Optional(src.Type.Boolean()),
  encoded_network: src.Type.Optional(src.Type.ArrayBuffer()),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const EthereumAddress = src.Type.Object({
  _old_address: src.Type.Optional(src.Type.String()),
  address: src.Type.String()
});
const EthereumSignTx = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  nonce: src.Type.Optional(src.Type.String()),
  gas_price: src.Type.String(),
  gas_limit: src.Type.String(),
  to: src.Type.Optional(src.Type.String()),
  value: src.Type.Optional(src.Type.String()),
  data_initial_chunk: src.Type.Optional(src.Type.String()),
  data_length: src.Type.Optional(src.Type.Number()),
  chain_id: src.Type.Number(),
  tx_type: src.Type.Optional(src.Type.Number()),
  definitions: src.Type.Optional(EthereumDefinitions),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const EthereumAccessList = src.Type.Object({
  address: src.Type.String(),
  storage_keys: src.Type.Array(src.Type.String())
});
const EthereumSignTxEIP1559 = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  nonce: src.Type.String(),
  max_gas_fee: src.Type.String(),
  max_priority_fee: src.Type.String(),
  gas_limit: src.Type.String(),
  to: src.Type.Optional(src.Type.String()),
  value: src.Type.String(),
  data_initial_chunk: src.Type.Optional(src.Type.String()),
  data_length: src.Type.Number(),
  chain_id: src.Type.Number(),
  access_list: src.Type.Array(EthereumAccessList),
  definitions: src.Type.Optional(EthereumDefinitions),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const EthereumTxRequest = src.Type.Object({
  data_length: src.Type.Optional(src.Type.Number()),
  signature_v: src.Type.Optional(src.Type.Number()),
  signature_r: src.Type.Optional(src.Type.String()),
  signature_s: src.Type.Optional(src.Type.String())
});
const EthereumTxAck = src.Type.Object({
  data_chunk: src.Type.String()
});
const EthereumSignMessage = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  message: src.Type.String(),
  encoded_network: src.Type.Optional(src.Type.ArrayBuffer()),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const EthereumMessageSignature = src.Type.Object({
  signature: src.Type.String(),
  address: src.Type.String()
});
const EthereumVerifyMessage = src.Type.Object({
  signature: src.Type.String(),
  message: src.Type.String(),
  address: src.Type.String(),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const EthereumSignTypedHash = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  domain_separator_hash: src.Type.String(),
  message_hash: src.Type.Optional(src.Type.String()),
  encoded_network: src.Type.Optional(src.Type.ArrayBuffer())
});
const EthereumTypedDataSignature = src.Type.Object({
  signature: src.Type.String(),
  address: src.Type.String()
});
let messages_schema_Enum_BackupType = /*#__PURE__*/function (Enum_BackupType) {
  Enum_BackupType[Enum_BackupType["Bip39"] = 0] = "Bip39";
  Enum_BackupType[Enum_BackupType["Slip39_Basic"] = 1] = "Slip39_Basic";
  Enum_BackupType[Enum_BackupType["Slip39_Advanced"] = 2] = "Slip39_Advanced";
  return Enum_BackupType;
}({});
const EnumEnum_BackupType = src.Type.Enum(messages_schema_Enum_BackupType);
const BackupType = src.Type.KeyOfEnum(messages_schema_Enum_BackupType);
let messages_schema_Enum_SafetyCheckLevel = /*#__PURE__*/function (Enum_SafetyCheckLevel) {
  Enum_SafetyCheckLevel[Enum_SafetyCheckLevel["Strict"] = 0] = "Strict";
  Enum_SafetyCheckLevel[Enum_SafetyCheckLevel["PromptAlways"] = 1] = "PromptAlways";
  Enum_SafetyCheckLevel[Enum_SafetyCheckLevel["PromptTemporarily"] = 2] = "PromptTemporarily";
  return Enum_SafetyCheckLevel;
}({});
const EnumEnum_SafetyCheckLevel = src.Type.Enum(messages_schema_Enum_SafetyCheckLevel);
const SafetyCheckLevel = src.Type.KeyOfEnum(messages_schema_Enum_SafetyCheckLevel);
let messages_schema_Enum_HomescreenFormat = /*#__PURE__*/function (Enum_HomescreenFormat) {
  Enum_HomescreenFormat[Enum_HomescreenFormat["Toif"] = 1] = "Toif";
  Enum_HomescreenFormat[Enum_HomescreenFormat["Jpeg"] = 2] = "Jpeg";
  Enum_HomescreenFormat[Enum_HomescreenFormat["ToiG"] = 3] = "ToiG";
  return Enum_HomescreenFormat;
}({});
const EnumEnum_HomescreenFormat = src.Type.Enum(messages_schema_Enum_HomescreenFormat);
const HomescreenFormat = src.Type.KeyOfEnum(messages_schema_Enum_HomescreenFormat);
const Initialize = src.Type.Object({
  session_id: src.Type.Optional(src.Type.String()),
  _skip_passphrase: src.Type.Optional(src.Type.Boolean()),
  derive_cardano: src.Type.Optional(src.Type.Boolean())
});
const GetFeatures = src.Type.Object({});
let messages_schema_Enum_Capability = /*#__PURE__*/function (Enum_Capability) {
  Enum_Capability[Enum_Capability["Capability_Bitcoin"] = 1] = "Capability_Bitcoin";
  Enum_Capability[Enum_Capability["Capability_Bitcoin_like"] = 2] = "Capability_Bitcoin_like";
  Enum_Capability[Enum_Capability["Capability_Binance"] = 3] = "Capability_Binance";
  Enum_Capability[Enum_Capability["Capability_Cardano"] = 4] = "Capability_Cardano";
  Enum_Capability[Enum_Capability["Capability_Crypto"] = 5] = "Capability_Crypto";
  Enum_Capability[Enum_Capability["Capability_EOS"] = 6] = "Capability_EOS";
  Enum_Capability[Enum_Capability["Capability_Ethereum"] = 7] = "Capability_Ethereum";
  Enum_Capability[Enum_Capability["Capability_Lisk"] = 8] = "Capability_Lisk";
  Enum_Capability[Enum_Capability["Capability_Monero"] = 9] = "Capability_Monero";
  Enum_Capability[Enum_Capability["Capability_NEM"] = 10] = "Capability_NEM";
  Enum_Capability[Enum_Capability["Capability_Ripple"] = 11] = "Capability_Ripple";
  Enum_Capability[Enum_Capability["Capability_Stellar"] = 12] = "Capability_Stellar";
  Enum_Capability[Enum_Capability["Capability_Tezos"] = 13] = "Capability_Tezos";
  Enum_Capability[Enum_Capability["Capability_U2F"] = 14] = "Capability_U2F";
  Enum_Capability[Enum_Capability["Capability_Shamir"] = 15] = "Capability_Shamir";
  Enum_Capability[Enum_Capability["Capability_ShamirGroups"] = 16] = "Capability_ShamirGroups";
  Enum_Capability[Enum_Capability["Capability_PassphraseEntry"] = 17] = "Capability_PassphraseEntry";
  Enum_Capability[Enum_Capability["Capability_Solana"] = 18] = "Capability_Solana";
  Enum_Capability[Enum_Capability["Capability_Translations"] = 19] = "Capability_Translations";
  return Enum_Capability;
}({});
const EnumEnum_Capability = src.Type.Enum(messages_schema_Enum_Capability);
const Capability = src.Type.KeyOfEnum(messages_schema_Enum_Capability);
const Features = src.Type.Object({
  vendor: src.Type.String(),
  major_version: src.Type.Number(),
  minor_version: src.Type.Number(),
  patch_version: src.Type.Number(),
  bootloader_mode: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  device_id: src.Type.Union([src.Type.String(), src.Type.Null()]),
  pin_protection: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  passphrase_protection: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  language: src.Type.Union([src.Type.String(), src.Type.Null()]),
  label: src.Type.Union([src.Type.String(), src.Type.Null()]),
  initialized: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  revision: src.Type.Union([src.Type.String(), src.Type.Null()]),
  bootloader_hash: src.Type.Union([src.Type.String(), src.Type.Null()]),
  imported: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  unlocked: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  _passphrase_cached: src.Type.Optional(src.Type.Boolean()),
  firmware_present: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  needs_backup: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  flags: src.Type.Union([src.Type.Number(), src.Type.Null()]),
  model: src.Type.String(),
  fw_major: src.Type.Union([src.Type.Number(), src.Type.Null()]),
  fw_minor: src.Type.Union([src.Type.Number(), src.Type.Null()]),
  fw_patch: src.Type.Union([src.Type.Number(), src.Type.Null()]),
  fw_vendor: src.Type.Union([src.Type.String(), src.Type.Null()]),
  unfinished_backup: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  no_backup: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  recovery_mode: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  capabilities: src.Type.Array(Capability),
  backup_type: src.Type.Union([BackupType, src.Type.Null()]),
  sd_card_present: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  sd_protection: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  wipe_code_protection: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  session_id: src.Type.Union([src.Type.String(), src.Type.Null()]),
  passphrase_always_on_device: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  safety_checks: src.Type.Union([SafetyCheckLevel, src.Type.Null()]),
  auto_lock_delay_ms: src.Type.Union([src.Type.Number(), src.Type.Null()]),
  display_rotation: src.Type.Union([src.Type.Number(), src.Type.Null()]),
  experimental_features: src.Type.Union([src.Type.Boolean(), src.Type.Null()]),
  busy: src.Type.Optional(src.Type.Boolean()),
  homescreen_format: src.Type.Optional(HomescreenFormat),
  hide_passphrase_from_host: src.Type.Optional(src.Type.Boolean()),
  internal_model: EnumDeviceModelInternal,
  unit_color: src.Type.Optional(src.Type.Number()),
  unit_btconly: src.Type.Optional(src.Type.Boolean()),
  homescreen_width: src.Type.Optional(src.Type.Number()),
  homescreen_height: src.Type.Optional(src.Type.Number()),
  bootloader_locked: src.Type.Optional(src.Type.Boolean()),
  language_version_matches: src.Type.Optional(src.Type.Boolean())
});
const LockDevice = src.Type.Object({});
const SetBusy = src.Type.Object({
  expiry_ms: src.Type.Optional(src.Type.Number())
});
const EndSession = src.Type.Object({});
const ApplySettings = src.Type.Object({
  language: src.Type.Optional(src.Type.String()),
  label: src.Type.Optional(src.Type.String()),
  use_passphrase: src.Type.Optional(src.Type.Boolean()),
  homescreen: src.Type.Optional(src.Type.String()),
  _passphrase_source: src.Type.Optional(src.Type.Number()),
  auto_lock_delay_ms: src.Type.Optional(src.Type.Number()),
  display_rotation: src.Type.Optional(src.Type.Number()),
  passphrase_always_on_device: src.Type.Optional(src.Type.Boolean()),
  safety_checks: src.Type.Optional(SafetyCheckLevel),
  experimental_features: src.Type.Optional(src.Type.Boolean()),
  hide_passphrase_from_host: src.Type.Optional(src.Type.Boolean())
});
const ChangeLanguage = src.Type.Object({
  data_length: src.Type.Number(),
  show_display: src.Type.Optional(src.Type.Boolean())
});
const TranslationDataRequest = src.Type.Object({
  data_length: src.Type.Number(),
  data_offset: src.Type.Number()
});
const TranslationDataAck = src.Type.Object({
  data_chunk: src.Type.String()
});
const ApplyFlags = src.Type.Object({
  flags: src.Type.Number()
});
const ChangePin = src.Type.Object({
  remove: src.Type.Optional(src.Type.Boolean())
});
const ChangeWipeCode = src.Type.Object({
  remove: src.Type.Optional(src.Type.Boolean())
});
let messages_schema_SdProtectOperationType = /*#__PURE__*/function (SdProtectOperationType) {
  SdProtectOperationType[SdProtectOperationType["DISABLE"] = 0] = "DISABLE";
  SdProtectOperationType[SdProtectOperationType["ENABLE"] = 1] = "ENABLE";
  SdProtectOperationType[SdProtectOperationType["REFRESH"] = 2] = "REFRESH";
  return SdProtectOperationType;
}({});
const EnumSdProtectOperationType = src.Type.Enum(messages_schema_SdProtectOperationType);
const SdProtect = src.Type.Object({
  operation: EnumSdProtectOperationType
});
const Ping = src.Type.Object({
  message: src.Type.Optional(src.Type.String()),
  button_protection: src.Type.Optional(src.Type.Boolean())
});
const Cancel = src.Type.Object({});
const GetEntropy = src.Type.Object({
  size: src.Type.Number()
});
const Entropy = src.Type.Object({
  entropy: src.Type.String()
});
const GetFirmwareHash = src.Type.Object({
  challenge: src.Type.Optional(src.Type.String())
});
const FirmwareHash = src.Type.Object({
  hash: src.Type.String()
});
const AuthenticateDevice = src.Type.Object({
  challenge: src.Type.String()
});
const AuthenticityProof = src.Type.Object({
  certificates: src.Type.Array(src.Type.String()),
  signature: src.Type.String()
});
const WipeDevice = src.Type.Object({});
const ResetDevice = src.Type.Object({
  display_random: src.Type.Optional(src.Type.Boolean()),
  strength: src.Type.Optional(src.Type.Number()),
  passphrase_protection: src.Type.Optional(src.Type.Boolean()),
  pin_protection: src.Type.Optional(src.Type.Boolean()),
  language: src.Type.Optional(src.Type.String()),
  label: src.Type.Optional(src.Type.String()),
  u2f_counter: src.Type.Optional(src.Type.Number()),
  skip_backup: src.Type.Optional(src.Type.Boolean()),
  no_backup: src.Type.Optional(src.Type.Boolean()),
  backup_type: src.Type.Optional(src.Type.Union([src.Type.String(), src.Type.Number()]))
});
const BackupDevice = src.Type.Object({});
const EntropyRequest = src.Type.Object({});
const EntropyAck = src.Type.Object({
  entropy: src.Type.String()
});
let messages_schema_RecoveryDeviceType = /*#__PURE__*/function (RecoveryDeviceType) {
  RecoveryDeviceType[RecoveryDeviceType["RecoveryDeviceType_ScrambledWords"] = 0] = "RecoveryDeviceType_ScrambledWords";
  RecoveryDeviceType[RecoveryDeviceType["RecoveryDeviceType_Matrix"] = 1] = "RecoveryDeviceType_Matrix";
  return RecoveryDeviceType;
}({});
const EnumRecoveryDeviceType = src.Type.Enum(messages_schema_RecoveryDeviceType);
const RecoveryDevice = src.Type.Object({
  word_count: src.Type.Optional(src.Type.Number()),
  passphrase_protection: src.Type.Optional(src.Type.Boolean()),
  pin_protection: src.Type.Optional(src.Type.Boolean()),
  language: src.Type.Optional(src.Type.String()),
  label: src.Type.Optional(src.Type.String()),
  enforce_wordlist: src.Type.Optional(src.Type.Boolean()),
  type: src.Type.Optional(EnumRecoveryDeviceType),
  u2f_counter: src.Type.Optional(src.Type.Number()),
  dry_run: src.Type.Optional(src.Type.Boolean())
});
let messages_schema_Enum_WordRequestType = /*#__PURE__*/function (Enum_WordRequestType) {
  Enum_WordRequestType[Enum_WordRequestType["WordRequestType_Plain"] = 0] = "WordRequestType_Plain";
  Enum_WordRequestType[Enum_WordRequestType["WordRequestType_Matrix9"] = 1] = "WordRequestType_Matrix9";
  Enum_WordRequestType[Enum_WordRequestType["WordRequestType_Matrix6"] = 2] = "WordRequestType_Matrix6";
  return Enum_WordRequestType;
}({});
const EnumEnum_WordRequestType = src.Type.Enum(messages_schema_Enum_WordRequestType);
const WordRequestType = src.Type.KeyOfEnum(messages_schema_Enum_WordRequestType);
const WordRequest = src.Type.Object({
  type: WordRequestType
});
const WordAck = src.Type.Object({
  word: src.Type.String()
});
const SetU2FCounter = src.Type.Object({
  u2f_counter: src.Type.Number()
});
const GetNextU2FCounter = src.Type.Object({});
const NextU2FCounter = src.Type.Object({
  u2f_counter: src.Type.Number()
});
const DoPreauthorized = src.Type.Object({});
const PreauthorizedRequest = src.Type.Object({});
const CancelAuthorization = src.Type.Object({});
let messages_schema_BootCommand = /*#__PURE__*/function (BootCommand) {
  BootCommand[BootCommand["STOP_AND_WAIT"] = 0] = "STOP_AND_WAIT";
  BootCommand[BootCommand["INSTALL_UPGRADE"] = 1] = "INSTALL_UPGRADE";
  return BootCommand;
}({});
const EnumBootCommand = src.Type.Enum(messages_schema_BootCommand);
const RebootToBootloader = src.Type.Object({
  boot_command: src.Type.Optional(EnumBootCommand),
  firmware_header: src.Type.Optional(src.Type.String()),
  language_data_length: src.Type.Optional(src.Type.Number())
});
const GetNonce = src.Type.Object({});
const Nonce = src.Type.Object({
  nonce: src.Type.String()
});
const UnlockPath = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  mac: src.Type.Optional(src.Type.String())
});
const UnlockedPathRequest = src.Type.Object({
  mac: src.Type.Optional(src.Type.String())
});
const ShowDeviceTutorial = src.Type.Object({});
const UnlockBootloader = src.Type.Object({});
let messages_schema_MoneroNetworkType = /*#__PURE__*/function (MoneroNetworkType) {
  MoneroNetworkType[MoneroNetworkType["MAINNET"] = 0] = "MAINNET";
  MoneroNetworkType[MoneroNetworkType["TESTNET"] = 1] = "TESTNET";
  MoneroNetworkType[MoneroNetworkType["STAGENET"] = 2] = "STAGENET";
  MoneroNetworkType[MoneroNetworkType["FAKECHAIN"] = 3] = "FAKECHAIN";
  return MoneroNetworkType;
}({});
const EnumMoneroNetworkType = src.Type.Enum(messages_schema_MoneroNetworkType);
const NEMGetAddress = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  network: src.Type.Optional(src.Type.Number()),
  show_display: src.Type.Optional(src.Type.Boolean()),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const NEMAddress = src.Type.Object({
  address: src.Type.String()
});
const NEMTransactionCommon = src.Type.Object({
  address_n: src.Type.Optional(src.Type.Array(src.Type.Number())),
  network: src.Type.Optional(src.Type.Number()),
  timestamp: src.Type.Number(),
  fee: src.Type.Uint(),
  deadline: src.Type.Number(),
  signer: src.Type.Optional(src.Type.String())
});
const NEMMosaic = src.Type.Object({
  namespace: src.Type.String(),
  mosaic: src.Type.String(),
  quantity: src.Type.Number()
});
const NEMTransfer = src.Type.Object({
  recipient: src.Type.String(),
  amount: src.Type.Uint(),
  payload: src.Type.Optional(src.Type.String()),
  public_key: src.Type.Optional(src.Type.String()),
  mosaics: src.Type.Optional(src.Type.Array(NEMMosaic))
});
const NEMProvisionNamespace = src.Type.Object({
  namespace: src.Type.String(),
  parent: src.Type.Optional(src.Type.String()),
  sink: src.Type.String(),
  fee: src.Type.Uint()
});
let messages_schema_NEMMosaicLevy = /*#__PURE__*/function (NEMMosaicLevy) {
  NEMMosaicLevy[NEMMosaicLevy["MosaicLevy_Absolute"] = 1] = "MosaicLevy_Absolute";
  NEMMosaicLevy[NEMMosaicLevy["MosaicLevy_Percentile"] = 2] = "MosaicLevy_Percentile";
  return NEMMosaicLevy;
}({});
const EnumNEMMosaicLevy = src.Type.Enum(messages_schema_NEMMosaicLevy);
const NEMMosaicDefinition = src.Type.Object({
  name: src.Type.Optional(src.Type.String()),
  ticker: src.Type.Optional(src.Type.String()),
  namespace: src.Type.String(),
  mosaic: src.Type.String(),
  divisibility: src.Type.Optional(src.Type.Number()),
  levy: src.Type.Optional(EnumNEMMosaicLevy),
  fee: src.Type.Optional(src.Type.Uint()),
  levy_address: src.Type.Optional(src.Type.String()),
  levy_namespace: src.Type.Optional(src.Type.String()),
  levy_mosaic: src.Type.Optional(src.Type.String()),
  supply: src.Type.Optional(src.Type.Number()),
  mutable_supply: src.Type.Optional(src.Type.Boolean()),
  transferable: src.Type.Optional(src.Type.Boolean()),
  description: src.Type.String(),
  networks: src.Type.Optional(src.Type.Array(src.Type.Number()))
});
const NEMMosaicCreation = src.Type.Object({
  definition: NEMMosaicDefinition,
  sink: src.Type.String(),
  fee: src.Type.Uint()
});
let messages_schema_NEMSupplyChangeType = /*#__PURE__*/function (NEMSupplyChangeType) {
  NEMSupplyChangeType[NEMSupplyChangeType["SupplyChange_Increase"] = 1] = "SupplyChange_Increase";
  NEMSupplyChangeType[NEMSupplyChangeType["SupplyChange_Decrease"] = 2] = "SupplyChange_Decrease";
  return NEMSupplyChangeType;
}({});
const EnumNEMSupplyChangeType = src.Type.Enum(messages_schema_NEMSupplyChangeType);
const NEMMosaicSupplyChange = src.Type.Object({
  namespace: src.Type.String(),
  mosaic: src.Type.String(),
  type: EnumNEMSupplyChangeType,
  delta: src.Type.Number()
});
let messages_schema_NEMModificationType = /*#__PURE__*/function (NEMModificationType) {
  NEMModificationType[NEMModificationType["CosignatoryModification_Add"] = 1] = "CosignatoryModification_Add";
  NEMModificationType[NEMModificationType["CosignatoryModification_Delete"] = 2] = "CosignatoryModification_Delete";
  return NEMModificationType;
}({});
const EnumNEMModificationType = src.Type.Enum(messages_schema_NEMModificationType);
const NEMCosignatoryModification = src.Type.Object({
  type: EnumNEMModificationType,
  public_key: src.Type.String()
});
const NEMAggregateModification = src.Type.Object({
  modifications: src.Type.Optional(src.Type.Array(NEMCosignatoryModification)),
  relative_change: src.Type.Optional(src.Type.Number())
});
let messages_schema_NEMImportanceTransferMode = /*#__PURE__*/function (NEMImportanceTransferMode) {
  NEMImportanceTransferMode[NEMImportanceTransferMode["ImportanceTransfer_Activate"] = 1] = "ImportanceTransfer_Activate";
  NEMImportanceTransferMode[NEMImportanceTransferMode["ImportanceTransfer_Deactivate"] = 2] = "ImportanceTransfer_Deactivate";
  return NEMImportanceTransferMode;
}({});
const EnumNEMImportanceTransferMode = src.Type.Enum(messages_schema_NEMImportanceTransferMode);
const NEMImportanceTransfer = src.Type.Object({
  mode: EnumNEMImportanceTransferMode,
  public_key: src.Type.String()
});
const NEMSignTx = src.Type.Object({
  transaction: NEMTransactionCommon,
  multisig: src.Type.Optional(NEMTransactionCommon),
  transfer: src.Type.Optional(NEMTransfer),
  cosigning: src.Type.Optional(src.Type.Boolean()),
  provision_namespace: src.Type.Optional(NEMProvisionNamespace),
  mosaic_creation: src.Type.Optional(NEMMosaicCreation),
  supply_change: src.Type.Optional(NEMMosaicSupplyChange),
  aggregate_modification: src.Type.Optional(NEMAggregateModification),
  importance_transfer: src.Type.Optional(NEMImportanceTransfer),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const NEMSignedTx = src.Type.Object({
  data: src.Type.String(),
  signature: src.Type.String()
});
const NEMDecryptMessage = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  network: src.Type.Optional(src.Type.Number()),
  public_key: src.Type.Optional(src.Type.String()),
  payload: src.Type.Optional(src.Type.String())
});
const NEMDecryptedMessage = src.Type.Object({
  payload: src.Type.String()
});
const experimental_message = src.Type.Object({});
const experimental_field = src.Type.Object({});
const RippleGetAddress = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  show_display: src.Type.Optional(src.Type.Boolean()),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const RippleAddress = src.Type.Object({
  address: src.Type.String()
});
const RipplePayment = src.Type.Object({
  amount: src.Type.Uint(),
  destination: src.Type.String(),
  destination_tag: src.Type.Optional(src.Type.Number())
});
const RippleSignTx = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  fee: src.Type.Uint(),
  flags: src.Type.Optional(src.Type.Number()),
  sequence: src.Type.Number(),
  last_ledger_sequence: src.Type.Optional(src.Type.Number()),
  payment: RipplePayment,
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const RippleSignedTx = src.Type.Object({
  signature: src.Type.String(),
  serialized_tx: src.Type.String()
});
const SolanaGetPublicKey = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  show_display: src.Type.Optional(src.Type.Boolean())
});
const SolanaPublicKey = src.Type.Object({
  public_key: src.Type.String()
});
const SolanaGetAddress = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  show_display: src.Type.Optional(src.Type.Boolean()),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const SolanaAddress = src.Type.Object({
  address: src.Type.String()
});
const SolanaTxTokenAccountInfo = src.Type.Object({
  base_address: src.Type.String(),
  token_program: src.Type.String(),
  token_mint: src.Type.String(),
  token_account: src.Type.String()
});
const SolanaTxAdditionalInfo = src.Type.Object({
  token_accounts_infos: src.Type.Array(SolanaTxTokenAccountInfo)
});
const SolanaSignTx = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  serialized_tx: src.Type.String(),
  additional_info: src.Type.Optional(SolanaTxAdditionalInfo)
});
const SolanaTxSignature = src.Type.Object({
  signature: src.Type.String()
});
let messages_schema_StellarAssetType = /*#__PURE__*/function (StellarAssetType) {
  StellarAssetType[StellarAssetType["NATIVE"] = 0] = "NATIVE";
  StellarAssetType[StellarAssetType["ALPHANUM4"] = 1] = "ALPHANUM4";
  StellarAssetType[StellarAssetType["ALPHANUM12"] = 2] = "ALPHANUM12";
  return StellarAssetType;
}({});
const EnumStellarAssetType = src.Type.Enum(messages_schema_StellarAssetType);
const StellarAsset = src.Type.Object({
  type: src.Type.Union([src.Type.Literal(0), src.Type.Literal(1), src.Type.Literal(2), src.Type.Literal('NATIVE'), src.Type.Literal('ALPHANUM4'), src.Type.Literal('ALPHANUM12')]),
  code: src.Type.Optional(src.Type.String()),
  issuer: src.Type.Optional(src.Type.String())
});
const StellarGetAddress = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  show_display: src.Type.Optional(src.Type.Boolean()),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const StellarAddress = src.Type.Object({
  address: src.Type.String()
});
let messages_schema_StellarMemoType = /*#__PURE__*/function (StellarMemoType) {
  StellarMemoType[StellarMemoType["NONE"] = 0] = "NONE";
  StellarMemoType[StellarMemoType["TEXT"] = 1] = "TEXT";
  StellarMemoType[StellarMemoType["ID"] = 2] = "ID";
  StellarMemoType[StellarMemoType["HASH"] = 3] = "HASH";
  StellarMemoType[StellarMemoType["RETURN"] = 4] = "RETURN";
  return StellarMemoType;
}({});
const EnumStellarMemoType = src.Type.Enum(messages_schema_StellarMemoType);
const StellarSignTx = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  network_passphrase: src.Type.String(),
  source_account: src.Type.String(),
  fee: src.Type.Uint(),
  sequence_number: src.Type.Uint(),
  timebounds_start: src.Type.Number(),
  timebounds_end: src.Type.Number(),
  memo_type: EnumStellarMemoType,
  memo_text: src.Type.Optional(src.Type.String()),
  memo_id: src.Type.Optional(src.Type.Uint()),
  memo_hash: src.Type.Optional(src.Type.Union([src.Type.Buffer(), src.Type.String()])),
  num_operations: src.Type.Number()
});
const StellarTxOpRequest = src.Type.Object({});
const StellarPaymentOp = src.Type.Object({
  source_account: src.Type.Optional(src.Type.String()),
  destination_account: src.Type.String(),
  asset: StellarAsset,
  amount: src.Type.Uint()
});
const StellarCreateAccountOp = src.Type.Object({
  source_account: src.Type.Optional(src.Type.String()),
  new_account: src.Type.String(),
  starting_balance: src.Type.Uint()
});
const StellarPathPaymentStrictReceiveOp = src.Type.Object({
  source_account: src.Type.Optional(src.Type.String()),
  send_asset: StellarAsset,
  send_max: src.Type.Uint(),
  destination_account: src.Type.String(),
  destination_asset: StellarAsset,
  destination_amount: src.Type.Uint(),
  paths: src.Type.Optional(src.Type.Array(StellarAsset))
});
const StellarPathPaymentStrictSendOp = src.Type.Object({
  source_account: src.Type.Optional(src.Type.String()),
  send_asset: StellarAsset,
  send_amount: src.Type.Uint(),
  destination_account: src.Type.String(),
  destination_asset: StellarAsset,
  destination_min: src.Type.Uint(),
  paths: src.Type.Optional(src.Type.Array(StellarAsset))
});
const StellarManageSellOfferOp = src.Type.Object({
  source_account: src.Type.Optional(src.Type.String()),
  selling_asset: StellarAsset,
  buying_asset: StellarAsset,
  amount: src.Type.Uint(),
  price_n: src.Type.Number(),
  price_d: src.Type.Number(),
  offer_id: src.Type.Uint()
});
const StellarManageBuyOfferOp = src.Type.Object({
  source_account: src.Type.Optional(src.Type.String()),
  selling_asset: StellarAsset,
  buying_asset: StellarAsset,
  amount: src.Type.Uint(),
  price_n: src.Type.Number(),
  price_d: src.Type.Number(),
  offer_id: src.Type.Uint()
});
const StellarCreatePassiveSellOfferOp = src.Type.Object({
  source_account: src.Type.Optional(src.Type.String()),
  selling_asset: StellarAsset,
  buying_asset: StellarAsset,
  amount: src.Type.Uint(),
  price_n: src.Type.Number(),
  price_d: src.Type.Number()
});
let messages_schema_StellarSignerType = /*#__PURE__*/function (StellarSignerType) {
  StellarSignerType[StellarSignerType["ACCOUNT"] = 0] = "ACCOUNT";
  StellarSignerType[StellarSignerType["PRE_AUTH"] = 1] = "PRE_AUTH";
  StellarSignerType[StellarSignerType["HASH"] = 2] = "HASH";
  return StellarSignerType;
}({});
const EnumStellarSignerType = src.Type.Enum(messages_schema_StellarSignerType);
const StellarSetOptionsOp = src.Type.Object({
  source_account: src.Type.Optional(src.Type.String()),
  inflation_destination_account: src.Type.Optional(src.Type.String()),
  clear_flags: src.Type.Optional(src.Type.Number()),
  set_flags: src.Type.Optional(src.Type.Number()),
  master_weight: src.Type.Optional(src.Type.Uint()),
  low_threshold: src.Type.Optional(src.Type.Uint()),
  medium_threshold: src.Type.Optional(src.Type.Uint()),
  high_threshold: src.Type.Optional(src.Type.Uint()),
  home_domain: src.Type.Optional(src.Type.String()),
  signer_type: src.Type.Optional(EnumStellarSignerType),
  signer_key: src.Type.Optional(src.Type.Union([src.Type.Buffer(), src.Type.String()])),
  signer_weight: src.Type.Optional(src.Type.Number())
});
const StellarChangeTrustOp = src.Type.Object({
  source_account: src.Type.Optional(src.Type.String()),
  asset: StellarAsset,
  limit: src.Type.Uint()
});
const StellarAllowTrustOp = src.Type.Object({
  source_account: src.Type.Optional(src.Type.String()),
  trusted_account: src.Type.String(),
  asset_type: EnumStellarAssetType,
  asset_code: src.Type.Optional(src.Type.String()),
  is_authorized: src.Type.Boolean()
});
const StellarAccountMergeOp = src.Type.Object({
  source_account: src.Type.Optional(src.Type.String()),
  destination_account: src.Type.String()
});
const StellarManageDataOp = src.Type.Object({
  source_account: src.Type.Optional(src.Type.String()),
  key: src.Type.String(),
  value: src.Type.Optional(src.Type.Union([src.Type.Buffer(), src.Type.String()]))
});
const StellarBumpSequenceOp = src.Type.Object({
  source_account: src.Type.Optional(src.Type.String()),
  bump_to: src.Type.Uint()
});
const StellarClaimClaimableBalanceOp = src.Type.Object({
  source_account: src.Type.Optional(src.Type.String()),
  balance_id: src.Type.String()
});
const StellarSignedTx = src.Type.Object({
  public_key: src.Type.String(),
  signature: src.Type.String()
});
const TezosGetAddress = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  show_display: src.Type.Optional(src.Type.Boolean()),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const TezosAddress = src.Type.Object({
  address: src.Type.String()
});
const TezosGetPublicKey = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  show_display: src.Type.Optional(src.Type.Boolean()),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const TezosPublicKey = src.Type.Object({
  public_key: src.Type.String()
});
let messages_schema_TezosContractType = /*#__PURE__*/function (TezosContractType) {
  TezosContractType[TezosContractType["Implicit"] = 0] = "Implicit";
  TezosContractType[TezosContractType["Originated"] = 1] = "Originated";
  return TezosContractType;
}({});
const EnumTezosContractType = src.Type.Enum(messages_schema_TezosContractType);
const TezosContractID = src.Type.Object({
  tag: src.Type.Number(),
  hash: src.Type.Uint8Array()
});
const TezosRevealOp = src.Type.Object({
  source: src.Type.Uint8Array(),
  fee: src.Type.Uint(),
  counter: src.Type.Number(),
  gas_limit: src.Type.Number(),
  storage_limit: src.Type.Number(),
  public_key: src.Type.Uint8Array()
});
const TezosManagerTransfer = src.Type.Object({
  destination: TezosContractID,
  amount: src.Type.Uint()
});
const TezosParametersManager = src.Type.Object({
  set_delegate: src.Type.Optional(src.Type.Uint8Array()),
  cancel_delegate: src.Type.Optional(src.Type.Boolean()),
  transfer: src.Type.Optional(TezosManagerTransfer)
});
const TezosTransactionOp = src.Type.Object({
  source: src.Type.Uint8Array(),
  fee: src.Type.Uint(),
  counter: src.Type.Number(),
  gas_limit: src.Type.Number(),
  storage_limit: src.Type.Number(),
  amount: src.Type.Uint(),
  destination: TezosContractID,
  parameters: src.Type.Optional(src.Type.Array(src.Type.Number())),
  parameters_manager: src.Type.Optional(TezosParametersManager)
});
const TezosOriginationOp = src.Type.Object({
  source: src.Type.Uint8Array(),
  fee: src.Type.Uint(),
  counter: src.Type.Number(),
  gas_limit: src.Type.Number(),
  storage_limit: src.Type.Number(),
  manager_pubkey: src.Type.Optional(src.Type.String()),
  balance: src.Type.Number(),
  spendable: src.Type.Optional(src.Type.Boolean()),
  delegatable: src.Type.Optional(src.Type.Boolean()),
  delegate: src.Type.Optional(src.Type.Uint8Array()),
  script: src.Type.Union([src.Type.String(), src.Type.Array(src.Type.Number())])
});
const TezosDelegationOp = src.Type.Object({
  source: src.Type.Uint8Array(),
  fee: src.Type.Uint(),
  counter: src.Type.Number(),
  gas_limit: src.Type.Number(),
  storage_limit: src.Type.Number(),
  delegate: src.Type.Uint8Array()
});
const TezosProposalOp = src.Type.Object({
  source: src.Type.String(),
  period: src.Type.Number(),
  proposals: src.Type.Array(src.Type.String())
});
let messages_schema_TezosBallotType = /*#__PURE__*/function (TezosBallotType) {
  TezosBallotType[TezosBallotType["Yay"] = 0] = "Yay";
  TezosBallotType[TezosBallotType["Nay"] = 1] = "Nay";
  TezosBallotType[TezosBallotType["Pass"] = 2] = "Pass";
  return TezosBallotType;
}({});
const EnumTezosBallotType = src.Type.Enum(messages_schema_TezosBallotType);
const TezosBallotOp = src.Type.Object({
  source: src.Type.String(),
  period: src.Type.Number(),
  proposal: src.Type.String(),
  ballot: EnumTezosBallotType
});
const TezosSignTx = src.Type.Object({
  address_n: src.Type.Array(src.Type.Number()),
  branch: src.Type.Uint8Array(),
  reveal: src.Type.Optional(TezosRevealOp),
  transaction: src.Type.Optional(TezosTransactionOp),
  origination: src.Type.Optional(TezosOriginationOp),
  delegation: src.Type.Optional(TezosDelegationOp),
  proposal: src.Type.Optional(TezosProposalOp),
  ballot: src.Type.Optional(TezosBallotOp),
  chunkify: src.Type.Optional(src.Type.Boolean())
});
const TezosSignedTx = src.Type.Object({
  signature: src.Type.String(),
  sig_op_contents: src.Type.String(),
  operation_hash: src.Type.String()
});
const MessageType = src.Type.Object({
  BinanceGetAddress,
  BinanceAddress,
  BinanceGetPublicKey,
  BinancePublicKey,
  BinanceSignTx,
  BinanceTxRequest,
  BinanceCoin,
  BinanceInputOutput,
  BinanceTransferMsg,
  BinanceOrderMsg,
  BinanceCancelMsg,
  BinanceSignedTx,
  HDNodeType,
  HDNodePathType,
  MultisigRedeemScriptType,
  GetPublicKey,
  PublicKey,
  GetAddress,
  Address,
  GetOwnershipId,
  OwnershipId,
  SignMessage,
  MessageSignature,
  VerifyMessage,
  CoinJoinRequest,
  SignTx,
  TxRequestDetailsType,
  TxRequestSerializedType,
  TxRequest,
  TxInputType,
  TxOutputBinType,
  TxOutputType,
  PrevTx,
  PrevInput,
  PrevOutput,
  TextMemo,
  RefundMemo,
  CoinPurchaseMemo,
  PaymentRequestMemo,
  TxAckPaymentRequest,
  TxAck,
  TxAckInputWrapper,
  TxAckInput,
  TxAckOutputWrapper,
  TxAckOutput,
  TxAckPrevMeta,
  TxAckPrevInputWrapper,
  TxAckPrevInput,
  TxAckPrevOutputWrapper,
  TxAckPrevOutput,
  TxAckPrevExtraDataWrapper,
  TxAckPrevExtraData,
  GetOwnershipProof,
  OwnershipProof,
  AuthorizeCoinJoin,
  FirmwareErase,
  FirmwareRequest,
  FirmwareUpload,
  ProdTestT1,
  CardanoBlockchainPointerType,
  CardanoNativeScript,
  CardanoGetNativeScriptHash,
  CardanoNativeScriptHash,
  CardanoAddressParametersType,
  CardanoGetAddress,
  CardanoAddress,
  CardanoGetPublicKey,
  CardanoPublicKey,
  CardanoSignTxInit,
  CardanoTxInput,
  CardanoTxOutput,
  CardanoAssetGroup,
  CardanoToken,
  CardanoTxInlineDatumChunk,
  CardanoTxReferenceScriptChunk,
  CardanoPoolOwner,
  CardanoPoolRelayParameters,
  CardanoPoolMetadataType,
  CardanoPoolParametersType,
  CardanoTxCertificate,
  CardanoTxWithdrawal,
  CardanoCVoteRegistrationDelegation,
  CardanoCVoteRegistrationParametersType,
  CardanoTxAuxiliaryData,
  CardanoTxMint,
  CardanoTxCollateralInput,
  CardanoTxRequiredSigner,
  CardanoTxReferenceInput,
  CardanoTxItemAck,
  CardanoTxAuxiliaryDataSupplement,
  CardanoTxWitnessRequest,
  CardanoTxWitnessResponse,
  CardanoTxHostAck,
  CardanoTxBodyHash,
  CardanoSignTxFinished,
  Success,
  Failure,
  ButtonRequest,
  ButtonAck,
  PinMatrixRequest,
  PinMatrixAck,
  PassphraseRequest,
  PassphraseAck,
  Deprecated_PassphraseStateRequest,
  Deprecated_PassphraseStateAck,
  CipherKeyValue,
  CipheredKeyValue,
  IdentityType,
  SignIdentity,
  SignedIdentity,
  GetECDHSessionKey,
  ECDHSessionKey,
  DebugLinkResetDebugEvents,
  EosGetPublicKey,
  EosPublicKey,
  EosTxHeader,
  EosSignTx,
  EosTxActionRequest,
  EosAsset,
  EosPermissionLevel,
  EosAuthorizationKey,
  EosAuthorizationAccount,
  EosAuthorizationWait,
  EosAuthorization,
  EosActionCommon,
  EosActionTransfer,
  EosActionDelegate,
  EosActionUndelegate,
  EosActionRefund,
  EosActionBuyRam,
  EosActionBuyRamBytes,
  EosActionSellRam,
  EosActionVoteProducer,
  EosActionUpdateAuth,
  EosActionDeleteAuth,
  EosActionLinkAuth,
  EosActionUnlinkAuth,
  EosActionNewAccount,
  EosActionUnknown,
  EosTxActionAck,
  EosSignedTx,
  EthereumNetworkInfo,
  EthereumTokenInfo,
  EthereumDefinitions,
  EthereumSignTypedData,
  EthereumTypedDataStructRequest,
  EthereumFieldType,
  EthereumStructMember,
  EthereumTypedDataStructAck,
  EthereumTypedDataValueRequest,
  EthereumTypedDataValueAck,
  EthereumGetPublicKey,
  EthereumPublicKey,
  EthereumGetAddress,
  EthereumAddress,
  EthereumSignTx,
  EthereumAccessList,
  EthereumSignTxEIP1559,
  EthereumTxRequest,
  EthereumTxAck,
  EthereumSignMessage,
  EthereumMessageSignature,
  EthereumVerifyMessage,
  EthereumSignTypedHash,
  EthereumTypedDataSignature,
  Initialize,
  GetFeatures,
  Features,
  LockDevice,
  SetBusy,
  EndSession,
  ApplySettings,
  ChangeLanguage,
  TranslationDataRequest,
  TranslationDataAck,
  ApplyFlags,
  ChangePin,
  ChangeWipeCode,
  SdProtect,
  Ping,
  Cancel,
  GetEntropy,
  Entropy,
  GetFirmwareHash,
  FirmwareHash,
  AuthenticateDevice,
  AuthenticityProof,
  WipeDevice,
  ResetDevice,
  BackupDevice,
  EntropyRequest,
  EntropyAck,
  RecoveryDevice,
  WordRequest,
  WordAck,
  SetU2FCounter,
  GetNextU2FCounter,
  NextU2FCounter,
  DoPreauthorized,
  PreauthorizedRequest,
  CancelAuthorization,
  RebootToBootloader,
  GetNonce,
  Nonce,
  UnlockPath,
  UnlockedPathRequest,
  ShowDeviceTutorial,
  UnlockBootloader,
  NEMGetAddress,
  NEMAddress,
  NEMTransactionCommon,
  NEMMosaic,
  NEMTransfer,
  NEMProvisionNamespace,
  NEMMosaicDefinition,
  NEMMosaicCreation,
  NEMMosaicSupplyChange,
  NEMCosignatoryModification,
  NEMAggregateModification,
  NEMImportanceTransfer,
  NEMSignTx,
  NEMSignedTx,
  NEMDecryptMessage,
  NEMDecryptedMessage,
  experimental_message,
  experimental_field,
  RippleGetAddress,
  RippleAddress,
  RipplePayment,
  RippleSignTx,
  RippleSignedTx,
  SolanaGetPublicKey,
  SolanaPublicKey,
  SolanaGetAddress,
  SolanaAddress,
  SolanaTxTokenAccountInfo,
  SolanaTxAdditionalInfo,
  SolanaSignTx,
  SolanaTxSignature,
  StellarAsset,
  StellarGetAddress,
  StellarAddress,
  StellarSignTx,
  StellarTxOpRequest,
  StellarPaymentOp,
  StellarCreateAccountOp,
  StellarPathPaymentStrictReceiveOp,
  StellarPathPaymentStrictSendOp,
  StellarManageSellOfferOp,
  StellarManageBuyOfferOp,
  StellarCreatePassiveSellOfferOp,
  StellarSetOptionsOp,
  StellarChangeTrustOp,
  StellarAllowTrustOp,
  StellarAccountMergeOp,
  StellarManageDataOp,
  StellarBumpSequenceOp,
  StellarClaimClaimableBalanceOp,
  StellarSignedTx,
  TezosGetAddress,
  TezosAddress,
  TezosGetPublicKey,
  TezosPublicKey,
  TezosContractID,
  TezosRevealOp,
  TezosManagerTransfer,
  TezosParametersManager,
  TezosTransactionOp,
  TezosOriginationOp,
  TezosDelegationOp,
  TezosProposalOp,
  TezosBallotOp,
  TezosSignTx,
  TezosSignedTx
});

// custom type uint32/64 may be represented as string
;// CONCATENATED MODULE: ../protobuf/src/index.ts






// It's problem to reexport enums when they are under MessagesSchema namespace, check packages/connect/src/types/device.ts


/***/ }),

/***/ 3404:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Assert: () => (/* binding */ Assert),
  AssertWeak: () => (/* binding */ AssertWeak),
  Optional: () => (/* reexport */ typebox.Optional),
  Type: () => (/* binding */ Type),
  Validate: () => (/* binding */ Validate)
});

// EXTERNAL MODULE: ../../node_modules/@sinclair/typebox/typebox.js
var typebox = __webpack_require__(624);
// EXTERNAL MODULE: ../../node_modules/@sinclair/typebox/errors/index.js
var typebox_errors = __webpack_require__(6152);
;// CONCATENATED MODULE: ../../node_modules/ts-mixer/dist/esm/index.js
/**
 * Utility function that works like `Object.apply`, but copies getters and setters properly as well.  Additionally gives
 * the option to exclude properties by name.
 */
const copyProps = (dest, src, exclude = []) => {
    const props = Object.getOwnPropertyDescriptors(src);
    for (let prop of exclude)
        delete props[prop];
    Object.defineProperties(dest, props);
};
/**
 * Returns the full chain of prototypes up until Object.prototype given a starting object.  The order of prototypes will
 * be closest to farthest in the chain.
 */
const protoChain = (obj, currentChain = [obj]) => {
    const proto = Object.getPrototypeOf(obj);
    if (proto === null)
        return currentChain;
    return protoChain(proto, [...currentChain, proto]);
};
/**
 * Identifies the nearest ancestor common to all the given objects in their prototype chains.  For most unrelated
 * objects, this function should return Object.prototype.
 */
const nearestCommonProto = (...objs) => {
    if (objs.length === 0)
        return undefined;
    let commonProto = undefined;
    const protoChains = objs.map(obj => protoChain(obj));
    while (protoChains.every(protoChain => protoChain.length > 0)) {
        const protos = protoChains.map(protoChain => protoChain.pop());
        const potentialCommonProto = protos[0];
        if (protos.every(proto => proto === potentialCommonProto))
            commonProto = potentialCommonProto;
        else
            break;
    }
    return commonProto;
};
/**
 * Creates a new prototype object that is a mixture of the given prototypes.  The mixing is achieved by first
 * identifying the nearest common ancestor and using it as the prototype for a new object.  Then all properties/methods
 * downstream of this prototype (ONLY downstream) are copied into the new object.
 *
 * The resulting prototype is more performant than softMixProtos(...), as well as ES5 compatible.  However, it's not as
 * flexible as updates to the source prototypes aren't captured by the mixed result.  See softMixProtos for why you may
 * want to use that instead.
 */
const hardMixProtos = (ingredients, constructor, exclude = []) => {
    var _a;
    const base = (_a = nearestCommonProto(...ingredients)) !== null && _a !== void 0 ? _a : Object.prototype;
    const mixedProto = Object.create(base);
    // Keeps track of prototypes we've already visited to avoid copying the same properties multiple times.  We init the
    // list with the proto chain below the nearest common ancestor because we don't want any of those methods mixed in
    // when they will already be accessible via prototype access.
    const visitedProtos = protoChain(base);
    for (let prototype of ingredients) {
        let protos = protoChain(prototype);
        // Apply the prototype chain in reverse order so that old methods don't override newer ones.
        for (let i = protos.length - 1; i >= 0; i--) {
            let newProto = protos[i];
            if (visitedProtos.indexOf(newProto) === -1) {
                copyProps(mixedProto, newProto, ['constructor', ...exclude]);
                visitedProtos.push(newProto);
            }
        }
    }
    mixedProto.constructor = constructor;
    return mixedProto;
};
const unique = (arr) => arr.filter((e, i) => arr.indexOf(e) == i);

/**
 * Finds the ingredient with the given prop, searching in reverse order and breadth-first if searching ingredient
 * prototypes is required.
 */
const getIngredientWithProp = (prop, ingredients) => {
    const protoChains = ingredients.map(ingredient => protoChain(ingredient));
    // since we search breadth-first, we need to keep track of our depth in the prototype chains
    let protoDepth = 0;
    // not all prototype chains are the same depth, so this remains true as long as at least one of the ingredients'
    // prototype chains has an object at this depth
    let protosAreLeftToSearch = true;
    while (protosAreLeftToSearch) {
        // with the start of each horizontal slice, we assume this is the one that's deeper than any of the proto chains
        protosAreLeftToSearch = false;
        // scan through the ingredients right to left
        for (let i = ingredients.length - 1; i >= 0; i--) {
            const searchTarget = protoChains[i][protoDepth];
            if (searchTarget !== undefined && searchTarget !== null) {
                // if we find something, this is proof that this horizontal slice potentially more objects to search
                protosAreLeftToSearch = true;
                // eureka, we found it
                if (Object.getOwnPropertyDescriptor(searchTarget, prop) != undefined) {
                    return protoChains[i][0];
                }
            }
        }
        protoDepth++;
    }
    return undefined;
};
/**
 * "Mixes" ingredients by wrapping them in a Proxy.  The optional prototype argument allows the mixed object to sit
 * downstream of an existing prototype chain.  Note that "properties" cannot be added, deleted, or modified.
 */
const proxyMix = (ingredients, prototype = Object.prototype) => new Proxy({}, {
    getPrototypeOf() {
        return prototype;
    },
    setPrototypeOf() {
        throw Error('Cannot set prototype of Proxies created by ts-mixer');
    },
    getOwnPropertyDescriptor(_, prop) {
        return Object.getOwnPropertyDescriptor(getIngredientWithProp(prop, ingredients) || {}, prop);
    },
    defineProperty() {
        throw new Error('Cannot define new properties on Proxies created by ts-mixer');
    },
    has(_, prop) {
        return getIngredientWithProp(prop, ingredients) !== undefined || prototype[prop] !== undefined;
    },
    get(_, prop) {
        return (getIngredientWithProp(prop, ingredients) || prototype)[prop];
    },
    set(_, prop, val) {
        const ingredientWithProp = getIngredientWithProp(prop, ingredients);
        if (ingredientWithProp === undefined)
            throw new Error('Cannot set new properties on Proxies created by ts-mixer');
        ingredientWithProp[prop] = val;
        return true;
    },
    deleteProperty() {
        throw new Error('Cannot delete properties on Proxies created by ts-mixer');
    },
    ownKeys() {
        return ingredients
            .map(Object.getOwnPropertyNames)
            .reduce((prev, curr) => curr.concat(prev.filter(key => curr.indexOf(key) < 0)));
    },
});
/**
 * Creates a new proxy-prototype object that is a "soft" mixture of the given prototypes.  The mixing is achieved by
 * proxying all property access to the ingredients.  This is not ES5 compatible and less performant.  However, any
 * changes made to the source prototypes will be reflected in the proxy-prototype, which may be desirable.
 */
const softMixProtos = (ingredients, constructor) => proxyMix([...ingredients, { constructor }]);

const settings = {
    initFunction: null,
    staticsStrategy: 'copy',
    prototypeStrategy: 'copy',
    decoratorInheritance: 'deep',
};

// Keeps track of constituent classes for every mixin class created by ts-mixer.
const mixins = new Map();
const getMixinsForClass = (clazz) => mixins.get(clazz);
const registerMixins = (mixedClass, constituents) => mixins.set(mixedClass, constituents);
const hasMixin = (instance, mixin) => {
    if (instance instanceof mixin)
        return true;
    const constructor = instance.constructor;
    const visited = new Set();
    let frontier = new Set();
    frontier.add(constructor);
    while (frontier.size > 0) {
        // check if the frontier has the mixin we're looking for.  if not, we can say we visited every item in the frontier
        if (frontier.has(mixin))
            return true;
        frontier.forEach(item => visited.add(item));
        // build a new frontier based on the associated mixin classes and prototype chains of each frontier item
        const newFrontier = new Set();
        frontier.forEach(item => {
            var _a;
            const itemConstituents = (_a = mixins.get(item)) !== null && _a !== void 0 ? _a : protoChain(item.prototype).map(proto => proto.constructor).filter(item => item !== null);
            if (itemConstituents)
                itemConstituents.forEach(constituent => {
                    if (!visited.has(constituent) && !frontier.has(constituent))
                        newFrontier.add(constituent);
                });
        });
        // we have a new frontier, now search again
        frontier = newFrontier;
    }
    // if we get here, we couldn't find the mixin anywhere in the prototype chain or associated mixin classes
    return false;
};

const mergeObjectsOfDecorators = (o1, o2) => {
    var _a, _b;
    const allKeys = unique([...Object.getOwnPropertyNames(o1), ...Object.getOwnPropertyNames(o2)]);
    const mergedObject = {};
    for (let key of allKeys)
        mergedObject[key] = unique([...((_a = o1 === null || o1 === void 0 ? void 0 : o1[key]) !== null && _a !== void 0 ? _a : []), ...((_b = o2 === null || o2 === void 0 ? void 0 : o2[key]) !== null && _b !== void 0 ? _b : [])]);
    return mergedObject;
};
const mergePropertyAndMethodDecorators = (d1, d2) => {
    var _a, _b, _c, _d;
    return ({
        property: mergeObjectsOfDecorators((_a = d1 === null || d1 === void 0 ? void 0 : d1.property) !== null && _a !== void 0 ? _a : {}, (_b = d2 === null || d2 === void 0 ? void 0 : d2.property) !== null && _b !== void 0 ? _b : {}),
        method: mergeObjectsOfDecorators((_c = d1 === null || d1 === void 0 ? void 0 : d1.method) !== null && _c !== void 0 ? _c : {}, (_d = d2 === null || d2 === void 0 ? void 0 : d2.method) !== null && _d !== void 0 ? _d : {}),
    });
};
const mergeDecorators = (d1, d2) => {
    var _a, _b, _c, _d, _e, _f;
    return ({
        class: unique([...(_a = d1 === null || d1 === void 0 ? void 0 : d1.class) !== null && _a !== void 0 ? _a : [], ...(_b = d2 === null || d2 === void 0 ? void 0 : d2.class) !== null && _b !== void 0 ? _b : []]),
        static: mergePropertyAndMethodDecorators((_c = d1 === null || d1 === void 0 ? void 0 : d1.static) !== null && _c !== void 0 ? _c : {}, (_d = d2 === null || d2 === void 0 ? void 0 : d2.static) !== null && _d !== void 0 ? _d : {}),
        instance: mergePropertyAndMethodDecorators((_e = d1 === null || d1 === void 0 ? void 0 : d1.instance) !== null && _e !== void 0 ? _e : {}, (_f = d2 === null || d2 === void 0 ? void 0 : d2.instance) !== null && _f !== void 0 ? _f : {}),
    });
};
const decorators = new Map();
const findAllConstituentClasses = (...classes) => {
    var _a;
    const allClasses = new Set();
    const frontier = new Set([...classes]);
    while (frontier.size > 0) {
        for (let clazz of frontier) {
            const protoChainClasses = protoChain(clazz.prototype).map(proto => proto.constructor);
            const mixinClasses = (_a = getMixinsForClass(clazz)) !== null && _a !== void 0 ? _a : [];
            const potentiallyNewClasses = [...protoChainClasses, ...mixinClasses];
            const newClasses = potentiallyNewClasses.filter(c => !allClasses.has(c));
            for (let newClass of newClasses)
                frontier.add(newClass);
            allClasses.add(clazz);
            frontier.delete(clazz);
        }
    }
    return [...allClasses];
};
const deepDecoratorSearch = (...classes) => {
    const decoratorsForClassChain = findAllConstituentClasses(...classes)
        .map(clazz => decorators.get(clazz))
        .filter(decorators => !!decorators);
    if (decoratorsForClassChain.length == 0)
        return {};
    if (decoratorsForClassChain.length == 1)
        return decoratorsForClassChain[0];
    return decoratorsForClassChain.reduce((d1, d2) => mergeDecorators(d1, d2));
};
const directDecoratorSearch = (...classes) => {
    const classDecorators = classes.map(clazz => getDecoratorsForClass(clazz));
    if (classDecorators.length === 0)
        return {};
    if (classDecorators.length === 1)
        return classDecorators[0];
    return classDecorators.reduce((d1, d2) => mergeDecorators(d1, d2));
};
const getDecoratorsForClass = (clazz) => {
    let decoratorsForClass = decorators.get(clazz);
    if (!decoratorsForClass) {
        decoratorsForClass = {};
        decorators.set(clazz, decoratorsForClass);
    }
    return decoratorsForClass;
};
const decorateClass = (decorator) => ((clazz) => {
    const decoratorsForClass = getDecoratorsForClass(clazz);
    let classDecorators = decoratorsForClass.class;
    if (!classDecorators) {
        classDecorators = [];
        decoratorsForClass.class = classDecorators;
    }
    classDecorators.push(decorator);
    return decorator(clazz);
});
const decorateMember = (decorator) => ((object, key, ...otherArgs) => {
    var _a, _b, _c;
    const decoratorTargetType = typeof object === 'function' ? 'static' : 'instance';
    const decoratorType = typeof object[key] === 'function' ? 'method' : 'property';
    const clazz = decoratorTargetType === 'static' ? object : object.constructor;
    const decoratorsForClass = getDecoratorsForClass(clazz);
    const decoratorsForTargetType = (_a = decoratorsForClass === null || decoratorsForClass === void 0 ? void 0 : decoratorsForClass[decoratorTargetType]) !== null && _a !== void 0 ? _a : {};
    decoratorsForClass[decoratorTargetType] = decoratorsForTargetType;
    let decoratorsForType = (_b = decoratorsForTargetType === null || decoratorsForTargetType === void 0 ? void 0 : decoratorsForTargetType[decoratorType]) !== null && _b !== void 0 ? _b : {};
    decoratorsForTargetType[decoratorType] = decoratorsForType;
    let decoratorsForKey = (_c = decoratorsForType === null || decoratorsForType === void 0 ? void 0 : decoratorsForType[key]) !== null && _c !== void 0 ? _c : [];
    decoratorsForType[key] = decoratorsForKey;
    // @ts-ignore: array is type `A[] | B[]` and item is type `A | B`, so technically a type error, but it's fine
    decoratorsForKey.push(decorator);
    // @ts-ignore
    return decorator(object, key, ...otherArgs);
});
const decorate = (decorator) => ((...args) => {
    if (args.length === 1)
        return decorateClass(decorator)(args[0]);
    return decorateMember(decorator)(...args);
});

function Mixin(...constructors) {
    var _a, _b, _c;
    const prototypes = constructors.map(constructor => constructor.prototype);
    // Here we gather up the init functions of the ingredient prototypes, combine them into one init function, and
    // attach it to the mixed class prototype.  The reason we do this is because we want the init functions to mix
    // similarly to constructors -- not methods, which simply override each other.
    const initFunctionName = settings.initFunction;
    if (initFunctionName !== null) {
        const initFunctions = prototypes
            .map(proto => proto[initFunctionName])
            .filter(func => typeof func === 'function');
        const combinedInitFunction = function (...args) {
            for (let initFunction of initFunctions)
                initFunction.apply(this, args);
        };
        const extraProto = { [initFunctionName]: combinedInitFunction };
        prototypes.push(extraProto);
    }
    function MixedClass(...args) {
        for (const constructor of constructors)
            // @ts-ignore: potentially abstract class
            copyProps(this, new constructor(...args));
        if (initFunctionName !== null && typeof this[initFunctionName] === 'function')
            this[initFunctionName].apply(this, args);
    }
    MixedClass.prototype = settings.prototypeStrategy === 'copy'
        ? hardMixProtos(prototypes, MixedClass)
        : softMixProtos(prototypes, MixedClass);
    Object.setPrototypeOf(MixedClass, settings.staticsStrategy === 'copy'
        ? hardMixProtos(constructors, null, ['prototype'])
        : proxyMix(constructors, Function.prototype));
    let DecoratedMixedClass = MixedClass;
    if (settings.decoratorInheritance !== 'none') {
        const classDecorators = settings.decoratorInheritance === 'deep'
            ? deepDecoratorSearch(...constructors)
            : directDecoratorSearch(...constructors);
        for (let decorator of (_a = classDecorators === null || classDecorators === void 0 ? void 0 : classDecorators.class) !== null && _a !== void 0 ? _a : []) {
            const result = decorator(DecoratedMixedClass);
            if (result) {
                DecoratedMixedClass = result;
            }
        }
        applyPropAndMethodDecorators((_b = classDecorators === null || classDecorators === void 0 ? void 0 : classDecorators.static) !== null && _b !== void 0 ? _b : {}, DecoratedMixedClass);
        applyPropAndMethodDecorators((_c = classDecorators === null || classDecorators === void 0 ? void 0 : classDecorators.instance) !== null && _c !== void 0 ? _c : {}, DecoratedMixedClass.prototype);
    }
    registerMixins(DecoratedMixedClass, constructors);
    return DecoratedMixedClass;
}
const applyPropAndMethodDecorators = (propAndMethodDecorators, target) => {
    const propDecorators = propAndMethodDecorators.property;
    const methodDecorators = propAndMethodDecorators.method;
    if (propDecorators)
        for (let key in propDecorators)
            for (let decorator of propDecorators[key])
                decorator(target, key);
    if (methodDecorators)
        for (let key in methodDecorators)
            for (let decorator of methodDecorators[key])
                decorator(target, key, Object.getOwnPropertyDescriptor(target, key));
};
/**
 * A decorator version of the `Mixin` function.  You'll want to use this instead of `Mixin` for mixing generic classes.
 */
const mix = (...ingredients) => decoratedClass => {
    // @ts-ignore
    const mixedClass = Mixin(...ingredients.concat([decoratedClass]));
    Object.defineProperty(mixedClass, 'name', {
        value: decoratedClass.name,
        writable: false,
    });
    return mixedClass;
};



;// CONCATENATED MODULE: ../schema-utils/src/custom-types/array-buffer.ts

typebox.TypeRegistry.Set('ArrayBuffer', (_, value) => value instanceof ArrayBuffer);
class ArrayBufferBuilder extends typebox.JavaScriptTypeBuilder {
  ArrayBuffer(options) {
    return this.Create({
      ...options,
      [typebox.Kind]: 'ArrayBuffer',
      type: 'ArrayBuffer'
    });
  }
}
;// CONCATENATED MODULE: ../schema-utils/src/custom-types/buffer.ts

typebox.TypeRegistry.Set('Buffer', (_, value) => value instanceof Buffer);
class BufferBuilder extends typebox.JavaScriptTypeBuilder {
  Buffer(options) {
    return this.Create({
      ...options,
      [typebox.Kind]: 'Buffer',
      type: 'Buffer'
    });
  }
}
;// CONCATENATED MODULE: ../schema-utils/src/custom-types/keyof-enum.ts


// UnionToIntersection<A | B> = A & B

// LastInUnion<A | B> = B

// Build a tuple for the object
// Strategy - take the last key, add it to the tuple, and recurse on the rest
// Wrap the key in a TLiteral for Typebox

class KeyofEnumBuilder extends typebox.JavaScriptTypeBuilder {
  KeyOfEnum(schema, options) {
    const keys = Object.keys(schema).map(key => this.Literal(key));
    return this.Union(keys, {
      ...options,
      [typebox.Hint]: 'KeyOfEnum'
    });
  }
}
;// CONCATENATED MODULE: ../schema-utils/src/custom-types/uint.ts

typebox.TypeRegistry.Set('Uint', (schema, value) => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return false;
  }
  if (typeof value === 'number' && !Number.isSafeInteger(value) || !/^(?:[1-9]\d*|\d)$/.test(value.toString().replace(/^-/, schema.allowNegative ? '' : '-'))) {
    return false;
  }
  return true;
});
class UintBuilder extends typebox.JavaScriptTypeBuilder {
  Uint(options) {
    return this.Create({
      ...options,
      [typebox.Kind]: 'Uint',
      type: 'Uint'
    });
  }
}
;// CONCATENATED MODULE: ../schema-utils/src/errors.ts
class InvalidParameter extends Error {
  constructor(reason, field, type, value) {
    let message = `Invalid parameter`;
    message += ` "${field.substring(1)}"`;
    message += ` (= ${JSON.stringify(value)})`;
    message += `: ${reason.replace(/'/g, '"')}`;
    super(message);
    this.name = 'InvalidParameter';
    this.field = field;
    this.type = type;
  }
}
;// CONCATENATED MODULE: ../schema-utils/src/utils.ts
/**
 * Sets a value in an object by a path
 * From https://stackoverflow.com/a/53762921
 * @param obj object to set value in
 * @param param path to the value
 * @param value value to set
 */
function setDeepValue(obj, [prop, ...path], value) {
  if (!path.length) {
    obj[prop] = value;
  } else {
    if (!(prop in obj)) obj[prop] = {};
    setDeepValue(obj[prop], path, value);
  }
}
;// CONCATENATED MODULE: ../schema-utils/src/index.ts
/* eslint-disable @typescript-eslint/no-use-before-define */






class CustomTypeBuilder extends Mixin(typebox.JavaScriptTypeBuilder, ArrayBufferBuilder, BufferBuilder, KeyofEnumBuilder, UintBuilder) {}
function Validate(schema, value) {
  try {
    Assert(schema, value);
    return true;
  } catch (e) {
    return false;
  }
}
function FindErrorInUnion(error) {
  const currentValue = error.value;
  const unionMembers = error.schema.anyOf;
  const hasValidMember = unionMembers.find(unionSchema => Validate(unionSchema, currentValue));
  if (!hasValidMember) {
    // Find possible matches by literals
    const possibleMatchesByLiterals = unionMembers.filter(unionSchema => {
      if (unionSchema[typebox.Kind] !== 'Object') return false;
      return !Object.entries(unionSchema.properties).find(([property, propertySchema]) => propertySchema.const && propertySchema.const !== currentValue[property]);
    });
    if (possibleMatchesByLiterals.length === 1) {
      // There is only one possible match
      Assert(possibleMatchesByLiterals[0], currentValue);
    } else if (possibleMatchesByLiterals.length > 1) {
      // Find match with least amount of errors
      const errorsOfPossibleMatches = possibleMatchesByLiterals.map(matchSchema => ({
        schema: matchSchema,
        errors: [...(0,typebox_errors.Errors)(matchSchema, currentValue)]
      }));
      const sortedErrors = errorsOfPossibleMatches.sort((a, b) => a.errors.length - b.errors.length);
      const [bestMatch] = sortedErrors;
      Assert(bestMatch.schema, currentValue);
    }
    throw new InvalidParameter(error.message, error.path, error.type, error.value);
  }
}
function Assert(schema, value) {
  const errors = [...(0,typebox_errors.Errors)(schema, value)];
  let [error] = errors;
  while (error) {
    if (error.path === '/' && errors.length > 1) {
      // This might be a nested error, try to find the root cause
    } else if (error.value == null && error.schema[typebox.Optional] === 'Optional') {
      // Optional can also accept null values
    } else if (error.type === typebox_errors.ValueErrorType.Union) {
      // Drill down into the union
      FindErrorInUnion(error);
    } else if (error.type === typebox_errors.ValueErrorType.Number && typeof error.value === 'string') {
      // String instead of number, try to autocast
      const currentValue = error.value;
      const parsedNumber = Number(currentValue);
      if (!Number.isNaN(parsedNumber) && currentValue === parsedNumber.toString()) {
        // Autocast successful
        const pathParts = error.path.slice(1).split('/');
        setDeepValue(value, pathParts, parsedNumber);
      } else {
        throw new InvalidParameter(error.message, error.path, error.type, error.value);
      }
    } else {
      throw new InvalidParameter(error.message, error.path, error.type, error.value);
    }
    errors.shift();
    [error] = errors;
  }
}
function AssertWeak(schema, value) {
  try {
    Assert(schema, value);
  } catch (e) {
    if (e instanceof InvalidParameter) {
      if (e.type === typebox_errors.ValueErrorType.ObjectRequiredProperty) {
        // We consider this error to be serious
        throw e;
      }
      console.warn('Method params validation failed', e);
    } else {
      throw e;
    }
  }
}
const Type = new CustomTypeBuilder();


/***/ }),

/***/ 316:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   E: () => (/* binding */ createDeferred)
/* harmony export */ });
// unwrap promise response from Deferred

const createDeferred = id => {
  let localResolve = () => {};
  let localReject = () => {};
  const promise = new Promise((resolve, reject) => {
    localResolve = resolve;
    localReject = reject;
  });
  return {
    id,
    resolve: localResolve,
    reject: localReject,
    promise
  };
};

/***/ }),

/***/ 4108:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   a: () => (/* binding */ scheduleAction)
/* harmony export */ });
// Ignored when attempts is AttemptParams[]

const isArray = attempts => Array.isArray(attempts);
const abortedBySignal = () => new Error('Aborted by signal');
const abortedByDeadline = () => new Error('Aborted by deadline');
const abortedByTimeout = () => new Error('Aborted by timeout');
const resolveAfterMs = (ms, clear) => new Promise((resolve, reject) => {
  if (clear.aborted) return reject();
  if (ms === undefined) return resolve();
  const timeout = setTimeout(resolve, ms);
  const onClear = () => {
    clearTimeout(timeout);
    clear.removeEventListener('abort', onClear);
    reject();
  };
  clear.addEventListener('abort', onClear);
});
const rejectAfterMs = (ms, reason, clear) => new Promise((_, reject) => {
  if (clear.aborted) return reject();
  const timeout = ms !== undefined ? setTimeout(() => reject(reason()), ms) : undefined;
  const onClear = () => {
    clearTimeout(timeout);
    clear.removeEventListener('abort', onClear);
    reject();
  };
  clear.addEventListener('abort', onClear);
});
const rejectWhenAborted = (signal, clear) => new Promise((_, reject) => {
  if (clear.aborted) return reject();
  if (signal?.aborted) return reject(abortedBySignal());
  const onAbort = () => reject(abortedBySignal());
  signal?.addEventListener('abort', onAbort);
  const onClear = () => {
    signal?.removeEventListener('abort', onAbort);
    clear.removeEventListener('abort', onClear);
    reject();
  };
  clear.addEventListener('abort', onClear);
});
const resolveAction = async (action, clear) => {
  const aborter = new AbortController();
  const onClear = () => aborter.abort();
  if (clear.aborted) onClear();
  clear.addEventListener('abort', onClear);
  try {
    return await new Promise(resolve => resolve(action(aborter.signal)));
  } finally {
    clear.removeEventListener('abort', onClear);
  }
};
const attemptLoop = async (attempts, attempt, failure, clear) => {
  // Tries only (attempts - 1) times, because the last attempt throws its error
  for (let a = 0; a < attempts - 1; a++) {
    if (clear.aborted) break;
    const aborter = new AbortController();
    const onClear = () => aborter.abort();
    clear.addEventListener('abort', onClear);
    try {
      return await attempt(a, aborter.signal);
    } catch {
      onClear();
      await failure(a);
    } finally {
      clear.removeEventListener('abort', onClear);
    }
  }
  return clear.aborted ? Promise.reject() : attempt(attempts - 1, clear);
};
const scheduleAction = async (action, params) => {
  const {
    signal,
    delay,
    attempts,
    timeout,
    deadline,
    gap
  } = params;
  const deadlineMs = deadline && deadline - Date.now();
  const attemptCount = isArray(attempts) ? attempts.length : attempts ?? (deadline ? Infinity : 1);
  const clearAborter = new AbortController();
  const clear = clearAborter.signal;
  const getParams = isArray(attempts) ? attempt => attempts[attempt] : () => ({
    timeout,
    gap
  });
  try {
    return await Promise.race([rejectWhenAborted(signal, clear), rejectAfterMs(deadlineMs, abortedByDeadline, clear), resolveAfterMs(delay, clear).then(() => attemptLoop(attemptCount, (attempt, abort) => Promise.race([rejectAfterMs(getParams(attempt).timeout, abortedByTimeout, clear), resolveAction(action, abort)]), attempt => resolveAfterMs(getParams(attempt).gap ?? 0, clear), clear))]);
  } finally {
    clearAborter.abort();
  }
};

/***/ }),

/***/ 6932:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   I: () => (/* binding */ TypedEmitter)
/* harmony export */ });
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2928);
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_0__);
/*
Usage example:
type EventMap = {
    obj: { id: string };
    primitive: boolean | number | string | symbol;
    noArgs: undefined;
    multipleArgs: (a: number, b: string, c: boolean) => void;
    [type: `dynamic/${string}`]: boolean;
};
*/


// NOTE: case 1. looks like case 4. but works differently. the order matters

// 4. default

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class TypedEmitter extends events__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
  // implement at least one function
  listenerCount(eventName) {
    return super.listenerCount(eventName);
  }
}

/***/ }),

/***/ 2928:
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ }),

/***/ 2496:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// light library entry point.


module.exports = __webpack_require__(3004);

/***/ }),

/***/ 6040:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Runtime message from/to plain object converters.
 * @namespace
 */
var converter = exports;

var Enum = __webpack_require__(8432),
    util = __webpack_require__(888);

/**
 * Generates a partial value fromObject conveter.
 * @param {Codegen} gen Codegen instance
 * @param {Field} field Reflected field
 * @param {number} fieldIndex Field index
 * @param {string} prop Property reference
 * @returns {Codegen} Codegen instance
 * @ignore
 */
function genValuePartial_fromObject(gen, field, fieldIndex, prop) {
    var defaultAlreadyEmitted = false;
    /* eslint-disable no-unexpected-multiline, block-scoped-var, no-redeclare */
    if (field.resolvedType) {
        if (field.resolvedType instanceof Enum) { gen
            ("switch(d%s){", prop);
            for (var values = field.resolvedType.values, keys = Object.keys(values), i = 0; i < keys.length; ++i) {
                // enum unknown values passthrough
                if (values[keys[i]] === field.typeDefault && !defaultAlreadyEmitted) { gen
                    ("default:")
                        ("if(typeof(d%s)===\"number\"){m%s=d%s;break}", prop, prop, prop);
                    if (!field.repeated) gen // fallback to default value only for
                                             // arrays, to avoid leaving holes.
                        ("break");           // for non-repeated fields, just ignore
                    defaultAlreadyEmitted = true;
                }
                gen
                ("case%j:", keys[i])
                ("case %i:", values[keys[i]])
                    ("m%s=%j", prop, values[keys[i]])
                    ("break");
            } gen
            ("}");
        } else gen
            ("if(typeof d%s!==\"object\")", prop)
                ("throw TypeError(%j)", field.fullName + ": object expected")
            ("m%s=types[%i].fromObject(d%s)", prop, fieldIndex, prop);
    } else {
        var isUnsigned = false;
        switch (field.type) {
            case "double":
            case "float": gen
                ("m%s=Number(d%s)", prop, prop); // also catches "NaN", "Infinity"
                break;
            case "uint32":
            case "fixed32": gen
                ("m%s=d%s>>>0", prop, prop);
                break;
            case "int32":
            case "sint32":
            case "sfixed32": gen
                ("m%s=d%s|0", prop, prop);
                break;
            case "uint64":
                isUnsigned = true;
                // eslint-disable-next-line no-fallthrough
            case "int64":
            case "sint64":
            case "fixed64":
            case "sfixed64": gen
                ("if(util.Long)")
                    ("(m%s=util.Long.fromValue(d%s)).unsigned=%j", prop, prop, isUnsigned)
                ("else if(typeof d%s===\"string\")", prop)
                    ("m%s=parseInt(d%s,10)", prop, prop)
                ("else if(typeof d%s===\"number\")", prop)
                    ("m%s=d%s", prop, prop)
                ("else if(typeof d%s===\"object\")", prop)
                    ("m%s=new util.LongBits(d%s.low>>>0,d%s.high>>>0).toNumber(%s)", prop, prop, prop, isUnsigned ? "true" : "");
                break;
            case "bytes": gen
                ("if(typeof d%s===\"string\")", prop)
                    ("util.base64.decode(d%s,m%s=util.newBuffer(util.base64.length(d%s)),0)", prop, prop, prop)
                ("else if(d%s.length >= 0)", prop)
                    ("m%s=d%s", prop, prop);
                break;
            case "string": gen
                ("m%s=String(d%s)", prop, prop);
                break;
            case "bool": gen
                ("m%s=Boolean(d%s)", prop, prop);
                break;
            /* default: gen
                ("m%s=d%s", prop, prop);
                break; */
        }
    }
    return gen;
    /* eslint-enable no-unexpected-multiline, block-scoped-var, no-redeclare */
}

/**
 * Generates a plain object to runtime message converter specific to the specified message type.
 * @param {Type} mtype Message type
 * @returns {Codegen} Codegen instance
 */
converter.fromObject = function fromObject(mtype) {
    /* eslint-disable no-unexpected-multiline, block-scoped-var, no-redeclare */
    var fields = mtype.fieldsArray;
    var gen = util.codegen(["d"], mtype.name + "$fromObject")
    ("if(d instanceof this.ctor)")
        ("return d");
    if (!fields.length) return gen
    ("return new this.ctor");
    gen
    ("var m=new this.ctor");
    for (var i = 0; i < fields.length; ++i) {
        var field  = fields[i].resolve(),
            prop   = util.safeProp(field.name);

        // Map fields
        if (field.map) { gen
    ("if(d%s){", prop)
        ("if(typeof d%s!==\"object\")", prop)
            ("throw TypeError(%j)", field.fullName + ": object expected")
        ("m%s={}", prop)
        ("for(var ks=Object.keys(d%s),i=0;i<ks.length;++i){", prop);
            genValuePartial_fromObject(gen, field, /* not sorted */ i, prop + "[ks[i]]")
        ("}")
    ("}");

        // Repeated fields
        } else if (field.repeated) { gen
    ("if(d%s){", prop)
        ("if(!Array.isArray(d%s))", prop)
            ("throw TypeError(%j)", field.fullName + ": array expected")
        ("m%s=[]", prop)
        ("for(var i=0;i<d%s.length;++i){", prop);
            genValuePartial_fromObject(gen, field, /* not sorted */ i, prop + "[i]")
        ("}")
    ("}");

        // Non-repeated fields
        } else {
            if (!(field.resolvedType instanceof Enum)) gen // no need to test for null/undefined if an enum (uses switch)
    ("if(d%s!=null){", prop); // !== undefined && !== null
        genValuePartial_fromObject(gen, field, /* not sorted */ i, prop);
            if (!(field.resolvedType instanceof Enum)) gen
    ("}");
        }
    } return gen
    ("return m");
    /* eslint-enable no-unexpected-multiline, block-scoped-var, no-redeclare */
};

/**
 * Generates a partial value toObject converter.
 * @param {Codegen} gen Codegen instance
 * @param {Field} field Reflected field
 * @param {number} fieldIndex Field index
 * @param {string} prop Property reference
 * @returns {Codegen} Codegen instance
 * @ignore
 */
function genValuePartial_toObject(gen, field, fieldIndex, prop) {
    /* eslint-disable no-unexpected-multiline, block-scoped-var, no-redeclare */
    if (field.resolvedType) {
        if (field.resolvedType instanceof Enum) gen
            ("d%s=o.enums===String?(types[%i].values[m%s]===undefined?m%s:types[%i].values[m%s]):m%s", prop, fieldIndex, prop, prop, fieldIndex, prop, prop);
        else gen
            ("d%s=types[%i].toObject(m%s,o)", prop, fieldIndex, prop);
    } else {
        var isUnsigned = false;
        switch (field.type) {
            case "double":
            case "float": gen
            ("d%s=o.json&&!isFinite(m%s)?String(m%s):m%s", prop, prop, prop, prop);
                break;
            case "uint64":
                isUnsigned = true;
                // eslint-disable-next-line no-fallthrough
            case "int64":
            case "sint64":
            case "fixed64":
            case "sfixed64": gen
            ("if(typeof m%s===\"number\")", prop)
                ("d%s=o.longs===String?String(m%s):m%s", prop, prop, prop)
            ("else") // Long-like
                ("d%s=o.longs===String?util.Long.prototype.toString.call(m%s):o.longs===Number?new util.LongBits(m%s.low>>>0,m%s.high>>>0).toNumber(%s):m%s", prop, prop, prop, prop, isUnsigned ? "true": "", prop);
                break;
            case "bytes": gen
            ("d%s=o.bytes===String?util.base64.encode(m%s,0,m%s.length):o.bytes===Array?Array.prototype.slice.call(m%s):m%s", prop, prop, prop, prop, prop);
                break;
            default: gen
            ("d%s=m%s", prop, prop);
                break;
        }
    }
    return gen;
    /* eslint-enable no-unexpected-multiline, block-scoped-var, no-redeclare */
}

/**
 * Generates a runtime message to plain object converter specific to the specified message type.
 * @param {Type} mtype Message type
 * @returns {Codegen} Codegen instance
 */
converter.toObject = function toObject(mtype) {
    /* eslint-disable no-unexpected-multiline, block-scoped-var, no-redeclare */
    var fields = mtype.fieldsArray.slice().sort(util.compareFieldsById);
    if (!fields.length)
        return util.codegen()("return {}");
    var gen = util.codegen(["m", "o"], mtype.name + "$toObject")
    ("if(!o)")
        ("o={}")
    ("var d={}");

    var repeatedFields = [],
        mapFields = [],
        normalFields = [],
        i = 0;
    for (; i < fields.length; ++i)
        if (!fields[i].partOf)
            ( fields[i].resolve().repeated ? repeatedFields
            : fields[i].map ? mapFields
            : normalFields).push(fields[i]);

    if (repeatedFields.length) { gen
    ("if(o.arrays||o.defaults){");
        for (i = 0; i < repeatedFields.length; ++i) gen
        ("d%s=[]", util.safeProp(repeatedFields[i].name));
        gen
    ("}");
    }

    if (mapFields.length) { gen
    ("if(o.objects||o.defaults){");
        for (i = 0; i < mapFields.length; ++i) gen
        ("d%s={}", util.safeProp(mapFields[i].name));
        gen
    ("}");
    }

    if (normalFields.length) { gen
    ("if(o.defaults){");
        for (i = 0; i < normalFields.length; ++i) {
            var field = normalFields[i],
                prop  = util.safeProp(field.name);
            if (field.resolvedType instanceof Enum) gen
        ("d%s=o.enums===String?%j:%j", prop, field.resolvedType.valuesById[field.typeDefault], field.typeDefault);
            else if (field.long) gen
        ("if(util.Long){")
            ("var n=new util.Long(%i,%i,%j)", field.typeDefault.low, field.typeDefault.high, field.typeDefault.unsigned)
            ("d%s=o.longs===String?n.toString():o.longs===Number?n.toNumber():n", prop)
        ("}else")
            ("d%s=o.longs===String?%j:%i", prop, field.typeDefault.toString(), field.typeDefault.toNumber());
            else if (field.bytes) {
                var arrayDefault = "[" + Array.prototype.slice.call(field.typeDefault).join(",") + "]";
                gen
        ("if(o.bytes===String)d%s=%j", prop, String.fromCharCode.apply(String, field.typeDefault))
        ("else{")
            ("d%s=%s", prop, arrayDefault)
            ("if(o.bytes!==Array)d%s=util.newBuffer(d%s)", prop, prop)
        ("}");
            } else gen
        ("d%s=%j", prop, field.typeDefault); // also messages (=null)
        } gen
    ("}");
    }
    var hasKs2 = false;
    for (i = 0; i < fields.length; ++i) {
        var field = fields[i],
            index = mtype._fieldsArray.indexOf(field),
            prop  = util.safeProp(field.name);
        if (field.map) {
            if (!hasKs2) { hasKs2 = true; gen
    ("var ks2");
            } gen
    ("if(m%s&&(ks2=Object.keys(m%s)).length){", prop, prop)
        ("d%s={}", prop)
        ("for(var j=0;j<ks2.length;++j){");
            genValuePartial_toObject(gen, field, /* sorted */ index, prop + "[ks2[j]]")
        ("}");
        } else if (field.repeated) { gen
    ("if(m%s&&m%s.length){", prop, prop)
        ("d%s=[]", prop)
        ("for(var j=0;j<m%s.length;++j){", prop);
            genValuePartial_toObject(gen, field, /* sorted */ index, prop + "[j]")
        ("}");
        } else { gen
    ("if(m%s!=null&&m.hasOwnProperty(%j)){", prop, field.name); // !== undefined && !== null
        genValuePartial_toObject(gen, field, /* sorted */ index, prop);
        if (field.partOf) gen
        ("if(o.oneofs)")
            ("d%s=%j", util.safeProp(field.partOf.name), field.name);
        }
        gen
    ("}");
    }
    return gen
    ("return d");
    /* eslint-enable no-unexpected-multiline, block-scoped-var, no-redeclare */
};


/***/ }),

/***/ 8960:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = decoder;

var Enum    = __webpack_require__(8432),
    types   = __webpack_require__(8443),
    util    = __webpack_require__(888);

function missing(field) {
    return "missing required '" + field.name + "'";
}

/**
 * Generates a decoder specific to the specified message type.
 * @param {Type} mtype Message type
 * @returns {Codegen} Codegen instance
 */
function decoder(mtype) {
    /* eslint-disable no-unexpected-multiline */
    var gen = util.codegen(["r", "l"], mtype.name + "$decode")
    ("if(!(r instanceof Reader))")
        ("r=Reader.create(r)")
    ("var c=l===undefined?r.len:r.pos+l,m=new this.ctor" + (mtype.fieldsArray.filter(function(field) { return field.map; }).length ? ",k,value" : ""))
    ("while(r.pos<c){")
        ("var t=r.uint32()");
    if (mtype.group) gen
        ("if((t&7)===4)")
            ("break");
    gen
        ("switch(t>>>3){");

    var i = 0;
    for (; i < /* initializes */ mtype.fieldsArray.length; ++i) {
        var field = mtype._fieldsArray[i].resolve(),
            type  = field.resolvedType instanceof Enum ? "int32" : field.type,
            ref   = "m" + util.safeProp(field.name); gen
            ("case %i: {", field.id);

        // Map fields
        if (field.map) { gen
                ("if(%s===util.emptyObject)", ref)
                    ("%s={}", ref)
                ("var c2 = r.uint32()+r.pos");

            if (types.defaults[field.keyType] !== undefined) gen
                ("k=%j", types.defaults[field.keyType]);
            else gen
                ("k=null");

            if (types.defaults[type] !== undefined) gen
                ("value=%j", types.defaults[type]);
            else gen
                ("value=null");

            gen
                ("while(r.pos<c2){")
                    ("var tag2=r.uint32()")
                    ("switch(tag2>>>3){")
                        ("case 1: k=r.%s(); break", field.keyType)
                        ("case 2:");

            if (types.basic[type] === undefined) gen
                            ("value=types[%i].decode(r,r.uint32())", i); // can't be groups
            else gen
                            ("value=r.%s()", type);

            gen
                            ("break")
                        ("default:")
                            ("r.skipType(tag2&7)")
                            ("break")
                    ("}")
                ("}");

            if (types.long[field.keyType] !== undefined) gen
                ("%s[typeof k===\"object\"?util.longToHash(k):k]=value", ref);
            else gen
                ("%s[k]=value", ref);

        // Repeated fields
        } else if (field.repeated) { gen

                ("if(!(%s&&%s.length))", ref, ref)
                    ("%s=[]", ref);

            // Packable (always check for forward and backward compatiblity)
            if (types.packed[type] !== undefined) gen
                ("if((t&7)===2){")
                    ("var c2=r.uint32()+r.pos")
                    ("while(r.pos<c2)")
                        ("%s.push(r.%s())", ref, type)
                ("}else");

            // Non-packed
            if (types.basic[type] === undefined) gen(field.resolvedType.group
                    ? "%s.push(types[%i].decode(r))"
                    : "%s.push(types[%i].decode(r,r.uint32()))", ref, i);
            else gen
                    ("%s.push(r.%s())", ref, type);

        // Non-repeated
        } else if (types.basic[type] === undefined) gen(field.resolvedType.group
                ? "%s=types[%i].decode(r)"
                : "%s=types[%i].decode(r,r.uint32())", ref, i);
        else gen
                ("%s=r.%s()", ref, type);
        gen
                ("break")
            ("}");
        // Unknown fields
    } gen
            ("default:")
                ("r.skipType(t&7)")
                ("break")

        ("}")
    ("}");

    // Field presence
    for (i = 0; i < mtype._fieldsArray.length; ++i) {
        var rfield = mtype._fieldsArray[i];
        if (rfield.required) gen
    ("if(!m.hasOwnProperty(%j))", rfield.name)
        ("throw util.ProtocolError(%j,{instance:m})", missing(rfield));
    }

    return gen
    ("return m");
    /* eslint-enable no-unexpected-multiline */
}


/***/ }),

/***/ 1808:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = encoder;

var Enum     = __webpack_require__(8432),
    types    = __webpack_require__(8443),
    util     = __webpack_require__(888);

/**
 * Generates a partial message type encoder.
 * @param {Codegen} gen Codegen instance
 * @param {Field} field Reflected field
 * @param {number} fieldIndex Field index
 * @param {string} ref Variable reference
 * @returns {Codegen} Codegen instance
 * @ignore
 */
function genTypePartial(gen, field, fieldIndex, ref) {
    return field.resolvedType.group
        ? gen("types[%i].encode(%s,w.uint32(%i)).uint32(%i)", fieldIndex, ref, (field.id << 3 | 3) >>> 0, (field.id << 3 | 4) >>> 0)
        : gen("types[%i].encode(%s,w.uint32(%i).fork()).ldelim()", fieldIndex, ref, (field.id << 3 | 2) >>> 0);
}

/**
 * Generates an encoder specific to the specified message type.
 * @param {Type} mtype Message type
 * @returns {Codegen} Codegen instance
 */
function encoder(mtype) {
    /* eslint-disable no-unexpected-multiline, block-scoped-var, no-redeclare */
    var gen = util.codegen(["m", "w"], mtype.name + "$encode")
    ("if(!w)")
        ("w=Writer.create()");

    var i, ref;

    // "when a message is serialized its known fields should be written sequentially by field number"
    var fields = /* initializes */ mtype.fieldsArray.slice().sort(util.compareFieldsById);

    for (var i = 0; i < fields.length; ++i) {
        var field    = fields[i].resolve(),
            index    = mtype._fieldsArray.indexOf(field),
            type     = field.resolvedType instanceof Enum ? "int32" : field.type,
            wireType = types.basic[type];
            ref      = "m" + util.safeProp(field.name);

        // Map fields
        if (field.map) {
            gen
    ("if(%s!=null&&Object.hasOwnProperty.call(m,%j)){", ref, field.name) // !== undefined && !== null
        ("for(var ks=Object.keys(%s),i=0;i<ks.length;++i){", ref)
            ("w.uint32(%i).fork().uint32(%i).%s(ks[i])", (field.id << 3 | 2) >>> 0, 8 | types.mapKey[field.keyType], field.keyType);
            if (wireType === undefined) gen
            ("types[%i].encode(%s[ks[i]],w.uint32(18).fork()).ldelim().ldelim()", index, ref); // can't be groups
            else gen
            (".uint32(%i).%s(%s[ks[i]]).ldelim()", 16 | wireType, type, ref);
            gen
        ("}")
    ("}");

            // Repeated fields
        } else if (field.repeated) { gen
    ("if(%s!=null&&%s.length){", ref, ref); // !== undefined && !== null

            // Packed repeated
            if (field.packed && types.packed[type] !== undefined) { gen

        ("w.uint32(%i).fork()", (field.id << 3 | 2) >>> 0)
        ("for(var i=0;i<%s.length;++i)", ref)
            ("w.%s(%s[i])", type, ref)
        ("w.ldelim()");

            // Non-packed
            } else { gen

        ("for(var i=0;i<%s.length;++i)", ref);
                if (wireType === undefined)
            genTypePartial(gen, field, index, ref + "[i]");
                else gen
            ("w.uint32(%i).%s(%s[i])", (field.id << 3 | wireType) >>> 0, type, ref);

            } gen
    ("}");

        // Non-repeated
        } else {
            if (field.optional) gen
    ("if(%s!=null&&Object.hasOwnProperty.call(m,%j))", ref, field.name); // !== undefined && !== null

            if (wireType === undefined)
        genTypePartial(gen, field, index, ref);
            else gen
        ("w.uint32(%i).%s(%s)", (field.id << 3 | wireType) >>> 0, type, ref);

        }
    }

    return gen
    ("return w");
    /* eslint-enable no-unexpected-multiline, block-scoped-var, no-redeclare */
}


/***/ }),

/***/ 8432:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Enum;

// extends ReflectionObject
var ReflectionObject = __webpack_require__(1348);
((Enum.prototype = Object.create(ReflectionObject.prototype)).constructor = Enum).className = "Enum";

var Namespace = __webpack_require__(5820),
    util = __webpack_require__(888);

/**
 * Constructs a new enum instance.
 * @classdesc Reflected enum.
 * @extends ReflectionObject
 * @constructor
 * @param {string} name Unique name within its namespace
 * @param {Object.<string,number>} [values] Enum values as an object, by name
 * @param {Object.<string,*>} [options] Declared options
 * @param {string} [comment] The comment for this enum
 * @param {Object.<string,string>} [comments] The value comments for this enum
 * @param {Object.<string,Object<string,*>>|undefined} [valuesOptions] The value options for this enum
 */
function Enum(name, values, options, comment, comments, valuesOptions) {
    ReflectionObject.call(this, name, options);

    if (values && typeof values !== "object")
        throw TypeError("values must be an object");

    /**
     * Enum values by id.
     * @type {Object.<number,string>}
     */
    this.valuesById = {};

    /**
     * Enum values by name.
     * @type {Object.<string,number>}
     */
    this.values = Object.create(this.valuesById); // toJSON, marker

    /**
     * Enum comment text.
     * @type {string|null}
     */
    this.comment = comment;

    /**
     * Value comment texts, if any.
     * @type {Object.<string,string>}
     */
    this.comments = comments || {};

    /**
     * Values options, if any
     * @type {Object<string, Object<string, *>>|undefined}
     */
    this.valuesOptions = valuesOptions;

    /**
     * Reserved ranges, if any.
     * @type {Array.<number[]|string>}
     */
    this.reserved = undefined; // toJSON

    // Note that values inherit valuesById on their prototype which makes them a TypeScript-
    // compatible enum. This is used by pbts to write actual enum definitions that work for
    // static and reflection code alike instead of emitting generic object definitions.

    if (values)
        for (var keys = Object.keys(values), i = 0; i < keys.length; ++i)
            if (typeof values[keys[i]] === "number") // use forward entries only
                this.valuesById[ this.values[keys[i]] = values[keys[i]] ] = keys[i];
}

/**
 * Enum descriptor.
 * @interface IEnum
 * @property {Object.<string,number>} values Enum values
 * @property {Object.<string,*>} [options] Enum options
 */

/**
 * Constructs an enum from an enum descriptor.
 * @param {string} name Enum name
 * @param {IEnum} json Enum descriptor
 * @returns {Enum} Created enum
 * @throws {TypeError} If arguments are invalid
 */
Enum.fromJSON = function fromJSON(name, json) {
    var enm = new Enum(name, json.values, json.options, json.comment, json.comments);
    enm.reserved = json.reserved;
    return enm;
};

/**
 * Converts this enum to an enum descriptor.
 * @param {IToJSONOptions} [toJSONOptions] JSON conversion options
 * @returns {IEnum} Enum descriptor
 */
Enum.prototype.toJSON = function toJSON(toJSONOptions) {
    var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
    return util.toObject([
        "options"       , this.options,
        "valuesOptions" , this.valuesOptions,
        "values"        , this.values,
        "reserved"      , this.reserved && this.reserved.length ? this.reserved : undefined,
        "comment"       , keepComments ? this.comment : undefined,
        "comments"      , keepComments ? this.comments : undefined
    ]);
};

/**
 * Adds a value to this enum.
 * @param {string} name Value name
 * @param {number} id Value id
 * @param {string} [comment] Comment, if any
 * @param {Object.<string, *>|undefined} [options] Options, if any
 * @returns {Enum} `this`
 * @throws {TypeError} If arguments are invalid
 * @throws {Error} If there is already a value with this name or id
 */
Enum.prototype.add = function add(name, id, comment, options) {
    // utilized by the parser but not by .fromJSON

    if (!util.isString(name))
        throw TypeError("name must be a string");

    if (!util.isInteger(id))
        throw TypeError("id must be an integer");

    if (this.values[name] !== undefined)
        throw Error("duplicate name '" + name + "' in " + this);

    if (this.isReservedId(id))
        throw Error("id " + id + " is reserved in " + this);

    if (this.isReservedName(name))
        throw Error("name '" + name + "' is reserved in " + this);

    if (this.valuesById[id] !== undefined) {
        if (!(this.options && this.options.allow_alias))
            throw Error("duplicate id " + id + " in " + this);
        this.values[name] = id;
    } else
        this.valuesById[this.values[name] = id] = name;

    if (options) {
        if (this.valuesOptions === undefined)
            this.valuesOptions = {};
        this.valuesOptions[name] = options || null;
    }

    this.comments[name] = comment || null;
    return this;
};

/**
 * Removes a value from this enum
 * @param {string} name Value name
 * @returns {Enum} `this`
 * @throws {TypeError} If arguments are invalid
 * @throws {Error} If `name` is not a name of this enum
 */
Enum.prototype.remove = function remove(name) {

    if (!util.isString(name))
        throw TypeError("name must be a string");

    var val = this.values[name];
    if (val == null)
        throw Error("name '" + name + "' does not exist in " + this);

    delete this.valuesById[val];
    delete this.values[name];
    delete this.comments[name];
    if (this.valuesOptions)
        delete this.valuesOptions[name];

    return this;
};

/**
 * Tests if the specified id is reserved.
 * @param {number} id Id to test
 * @returns {boolean} `true` if reserved, otherwise `false`
 */
Enum.prototype.isReservedId = function isReservedId(id) {
    return Namespace.isReservedId(this.reserved, id);
};

/**
 * Tests if the specified name is reserved.
 * @param {string} name Name to test
 * @returns {boolean} `true` if reserved, otherwise `false`
 */
Enum.prototype.isReservedName = function isReservedName(name) {
    return Namespace.isReservedName(this.reserved, name);
};


/***/ }),

/***/ 1372:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Field;

// extends ReflectionObject
var ReflectionObject = __webpack_require__(1348);
((Field.prototype = Object.create(ReflectionObject.prototype)).constructor = Field).className = "Field";

var Enum  = __webpack_require__(8432),
    types = __webpack_require__(8443),
    util  = __webpack_require__(888);

var Type; // cyclic

var ruleRe = /^required|optional|repeated$/;

/**
 * Constructs a new message field instance. Note that {@link MapField|map fields} have their own class.
 * @name Field
 * @classdesc Reflected message field.
 * @extends FieldBase
 * @constructor
 * @param {string} name Unique name within its namespace
 * @param {number} id Unique id within its namespace
 * @param {string} type Value type
 * @param {string|Object.<string,*>} [rule="optional"] Field rule
 * @param {string|Object.<string,*>} [extend] Extended type if different from parent
 * @param {Object.<string,*>} [options] Declared options
 */

/**
 * Constructs a field from a field descriptor.
 * @param {string} name Field name
 * @param {IField} json Field descriptor
 * @returns {Field} Created field
 * @throws {TypeError} If arguments are invalid
 */
Field.fromJSON = function fromJSON(name, json) {
    return new Field(name, json.id, json.type, json.rule, json.extend, json.options, json.comment);
};

/**
 * Not an actual constructor. Use {@link Field} instead.
 * @classdesc Base class of all reflected message fields. This is not an actual class but here for the sake of having consistent type definitions.
 * @exports FieldBase
 * @extends ReflectionObject
 * @constructor
 * @param {string} name Unique name within its namespace
 * @param {number} id Unique id within its namespace
 * @param {string} type Value type
 * @param {string|Object.<string,*>} [rule="optional"] Field rule
 * @param {string|Object.<string,*>} [extend] Extended type if different from parent
 * @param {Object.<string,*>} [options] Declared options
 * @param {string} [comment] Comment associated with this field
 */
function Field(name, id, type, rule, extend, options, comment) {

    if (util.isObject(rule)) {
        comment = extend;
        options = rule;
        rule = extend = undefined;
    } else if (util.isObject(extend)) {
        comment = options;
        options = extend;
        extend = undefined;
    }

    ReflectionObject.call(this, name, options);

    if (!util.isInteger(id) || id < 0)
        throw TypeError("id must be a non-negative integer");

    if (!util.isString(type))
        throw TypeError("type must be a string");

    if (rule !== undefined && !ruleRe.test(rule = rule.toString().toLowerCase()))
        throw TypeError("rule must be a string rule");

    if (extend !== undefined && !util.isString(extend))
        throw TypeError("extend must be a string");

    /**
     * Field rule, if any.
     * @type {string|undefined}
     */
    if (rule === "proto3_optional") {
        rule = "optional";
    }
    this.rule = rule && rule !== "optional" ? rule : undefined; // toJSON

    /**
     * Field type.
     * @type {string}
     */
    this.type = type; // toJSON

    /**
     * Unique field id.
     * @type {number}
     */
    this.id = id; // toJSON, marker

    /**
     * Extended type if different from parent.
     * @type {string|undefined}
     */
    this.extend = extend || undefined; // toJSON

    /**
     * Whether this field is required.
     * @type {boolean}
     */
    this.required = rule === "required";

    /**
     * Whether this field is optional.
     * @type {boolean}
     */
    this.optional = !this.required;

    /**
     * Whether this field is repeated.
     * @type {boolean}
     */
    this.repeated = rule === "repeated";

    /**
     * Whether this field is a map or not.
     * @type {boolean}
     */
    this.map = false;

    /**
     * Message this field belongs to.
     * @type {Type|null}
     */
    this.message = null;

    /**
     * OneOf this field belongs to, if any,
     * @type {OneOf|null}
     */
    this.partOf = null;

    /**
     * The field type's default value.
     * @type {*}
     */
    this.typeDefault = null;

    /**
     * The field's default value on prototypes.
     * @type {*}
     */
    this.defaultValue = null;

    /**
     * Whether this field's value should be treated as a long.
     * @type {boolean}
     */
    this.long = util.Long ? types.long[type] !== undefined : /* istanbul ignore next */ false;

    /**
     * Whether this field's value is a buffer.
     * @type {boolean}
     */
    this.bytes = type === "bytes";

    /**
     * Resolved type if not a basic type.
     * @type {Type|Enum|null}
     */
    this.resolvedType = null;

    /**
     * Sister-field within the extended type if a declaring extension field.
     * @type {Field|null}
     */
    this.extensionField = null;

    /**
     * Sister-field within the declaring namespace if an extended field.
     * @type {Field|null}
     */
    this.declaringField = null;

    /**
     * Internally remembers whether this field is packed.
     * @type {boolean|null}
     * @private
     */
    this._packed = null;

    /**
     * Comment for this field.
     * @type {string|null}
     */
    this.comment = comment;
}

/**
 * Determines whether this field is packed. Only relevant when repeated and working with proto2.
 * @name Field#packed
 * @type {boolean}
 * @readonly
 */
Object.defineProperty(Field.prototype, "packed", {
    get: function() {
        // defaults to packed=true if not explicity set to false
        if (this._packed === null)
            this._packed = this.getOption("packed") !== false;
        return this._packed;
    }
});

/**
 * @override
 */
Field.prototype.setOption = function setOption(name, value, ifNotSet) {
    if (name === "packed") // clear cached before setting
        this._packed = null;
    return ReflectionObject.prototype.setOption.call(this, name, value, ifNotSet);
};

/**
 * Field descriptor.
 * @interface IField
 * @property {string} [rule="optional"] Field rule
 * @property {string} type Field type
 * @property {number} id Field id
 * @property {Object.<string,*>} [options] Field options
 */

/**
 * Extension field descriptor.
 * @interface IExtensionField
 * @extends IField
 * @property {string} extend Extended type
 */

/**
 * Converts this field to a field descriptor.
 * @param {IToJSONOptions} [toJSONOptions] JSON conversion options
 * @returns {IField} Field descriptor
 */
Field.prototype.toJSON = function toJSON(toJSONOptions) {
    var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
    return util.toObject([
        "rule"    , this.rule !== "optional" && this.rule || undefined,
        "type"    , this.type,
        "id"      , this.id,
        "extend"  , this.extend,
        "options" , this.options,
        "comment" , keepComments ? this.comment : undefined
    ]);
};

/**
 * Resolves this field's type references.
 * @returns {Field} `this`
 * @throws {Error} If any reference cannot be resolved
 */
Field.prototype.resolve = function resolve() {

    if (this.resolved)
        return this;

    if ((this.typeDefault = types.defaults[this.type]) === undefined) { // if not a basic type, resolve it
        this.resolvedType = (this.declaringField ? this.declaringField.parent : this.parent).lookupTypeOrEnum(this.type);
        if (this.resolvedType instanceof Type)
            this.typeDefault = null;
        else // instanceof Enum
            this.typeDefault = this.resolvedType.values[Object.keys(this.resolvedType.values)[0]]; // first defined
    } else if (this.options && this.options.proto3_optional) {
        // proto3 scalar value marked optional; should default to null
        this.typeDefault = null;
    }

    // use explicitly set default value if present
    if (this.options && this.options["default"] != null) {
        this.typeDefault = this.options["default"];
        if (this.resolvedType instanceof Enum && typeof this.typeDefault === "string")
            this.typeDefault = this.resolvedType.values[this.typeDefault];
    }

    // remove unnecessary options
    if (this.options) {
        if (this.options.packed === true || this.options.packed !== undefined && this.resolvedType && !(this.resolvedType instanceof Enum))
            delete this.options.packed;
        if (!Object.keys(this.options).length)
            this.options = undefined;
    }

    // convert to internal data type if necesssary
    if (this.long) {
        this.typeDefault = util.Long.fromNumber(this.typeDefault, this.type.charAt(0) === "u");

        /* istanbul ignore else */
        if (Object.freeze)
            Object.freeze(this.typeDefault); // long instances are meant to be immutable anyway (i.e. use small int cache that even requires it)

    } else if (this.bytes && typeof this.typeDefault === "string") {
        var buf;
        if (util.base64.test(this.typeDefault))
            util.base64.decode(this.typeDefault, buf = util.newBuffer(util.base64.length(this.typeDefault)), 0);
        else
            util.utf8.write(this.typeDefault, buf = util.newBuffer(util.utf8.length(this.typeDefault)), 0);
        this.typeDefault = buf;
    }

    // take special care of maps and repeated fields
    if (this.map)
        this.defaultValue = util.emptyObject;
    else if (this.repeated)
        this.defaultValue = util.emptyArray;
    else
        this.defaultValue = this.typeDefault;

    // ensure proper value on prototype
    if (this.parent instanceof Type)
        this.parent.ctor.prototype[this.name] = this.defaultValue;

    return ReflectionObject.prototype.resolve.call(this);
};

/**
 * Decorator function as returned by {@link Field.d} and {@link MapField.d} (TypeScript).
 * @typedef FieldDecorator
 * @type {function}
 * @param {Object} prototype Target prototype
 * @param {string} fieldName Field name
 * @returns {undefined}
 */

/**
 * Field decorator (TypeScript).
 * @name Field.d
 * @function
 * @param {number} fieldId Field id
 * @param {"double"|"float"|"int32"|"uint32"|"sint32"|"fixed32"|"sfixed32"|"int64"|"uint64"|"sint64"|"fixed64"|"sfixed64"|"string"|"bool"|"bytes"|Object} fieldType Field type
 * @param {"optional"|"required"|"repeated"} [fieldRule="optional"] Field rule
 * @param {T} [defaultValue] Default value
 * @returns {FieldDecorator} Decorator function
 * @template T extends number | number[] | Long | Long[] | string | string[] | boolean | boolean[] | Uint8Array | Uint8Array[] | Buffer | Buffer[]
 */
Field.d = function decorateField(fieldId, fieldType, fieldRule, defaultValue) {

    // submessage: decorate the submessage and use its name as the type
    if (typeof fieldType === "function")
        fieldType = util.decorateType(fieldType).name;

    // enum reference: create a reflected copy of the enum and keep reuseing it
    else if (fieldType && typeof fieldType === "object")
        fieldType = util.decorateEnum(fieldType).name;

    return function fieldDecorator(prototype, fieldName) {
        util.decorateType(prototype.constructor)
            .add(new Field(fieldName, fieldId, fieldType, fieldRule, { "default": defaultValue }));
    };
};

/**
 * Field decorator (TypeScript).
 * @name Field.d
 * @function
 * @param {number} fieldId Field id
 * @param {Constructor<T>|string} fieldType Field type
 * @param {"optional"|"required"|"repeated"} [fieldRule="optional"] Field rule
 * @returns {FieldDecorator} Decorator function
 * @template T extends Message<T>
 * @variation 2
 */
// like Field.d but without a default value

// Sets up cyclic dependencies (called in index-light)
Field._configure = function configure(Type_) {
    Type = Type_;
};


/***/ }),

/***/ 3004:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var protobuf = module.exports = __webpack_require__(2344);

protobuf.build = "light";

/**
 * A node-style callback as used by {@link load} and {@link Root#load}.
 * @typedef LoadCallback
 * @type {function}
 * @param {Error|null} error Error, if any, otherwise `null`
 * @param {Root} [root] Root, if there hasn't been an error
 * @returns {undefined}
 */

/**
 * Loads one or multiple .proto or preprocessed .json files into a common root namespace and calls the callback.
 * @param {string|string[]} filename One or multiple files to load
 * @param {Root} root Root namespace, defaults to create a new one if omitted.
 * @param {LoadCallback} callback Callback function
 * @returns {undefined}
 * @see {@link Root#load}
 */
function load(filename, root, callback) {
    if (typeof root === "function") {
        callback = root;
        root = new protobuf.Root();
    } else if (!root)
        root = new protobuf.Root();
    return root.load(filename, callback);
}

/**
 * Loads one or multiple .proto or preprocessed .json files into a common root namespace and calls the callback.
 * @name load
 * @function
 * @param {string|string[]} filename One or multiple files to load
 * @param {LoadCallback} callback Callback function
 * @returns {undefined}
 * @see {@link Root#load}
 * @variation 2
 */
// function load(filename:string, callback:LoadCallback):undefined

/**
 * Loads one or multiple .proto or preprocessed .json files into a common root namespace and returns a promise.
 * @name load
 * @function
 * @param {string|string[]} filename One or multiple files to load
 * @param {Root} [root] Root namespace, defaults to create a new one if omitted.
 * @returns {Promise<Root>} Promise
 * @see {@link Root#load}
 * @variation 3
 */
// function load(filename:string, [root:Root]):Promise<Root>

protobuf.load = load;

/**
 * Synchronously loads one or multiple .proto or preprocessed .json files into a common root namespace (node only).
 * @param {string|string[]} filename One or multiple files to load
 * @param {Root} [root] Root namespace, defaults to create a new one if omitted.
 * @returns {Root} Root namespace
 * @throws {Error} If synchronous fetching is not supported (i.e. in browsers) or if a file's syntax is invalid
 * @see {@link Root#loadSync}
 */
function loadSync(filename, root) {
    if (!root)
        root = new protobuf.Root();
    return root.loadSync(filename);
}

protobuf.loadSync = loadSync;

// Serialization
protobuf.encoder          = __webpack_require__(1808);
protobuf.decoder          = __webpack_require__(8960);
protobuf.verifier         = __webpack_require__(5496);
protobuf.converter        = __webpack_require__(6040);

// Reflection
protobuf.ReflectionObject = __webpack_require__(1348);
protobuf.Namespace        = __webpack_require__(5820);
protobuf.Root             = __webpack_require__(2645);
protobuf.Enum             = __webpack_require__(8432);
protobuf.Type             = __webpack_require__(6039);
protobuf.Field            = __webpack_require__(1372);
protobuf.OneOf            = __webpack_require__(3704);
protobuf.MapField         = __webpack_require__(8344);
protobuf.Service          = __webpack_require__(5160);
protobuf.Method           = __webpack_require__(2592);

// Runtime
protobuf.Message          = __webpack_require__(2020);
protobuf.wrappers         = __webpack_require__(4224);

// Utility
protobuf.types            = __webpack_require__(8443);
protobuf.util             = __webpack_require__(888);

// Set up possibly cyclic reflection dependencies
protobuf.ReflectionObject._configure(protobuf.Root);
protobuf.Namespace._configure(protobuf.Type, protobuf.Service, protobuf.Enum);
protobuf.Root._configure(protobuf.Type);
protobuf.Field._configure(protobuf.Type);


/***/ }),

/***/ 2344:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var protobuf = exports;

/**
 * Build type, one of `"full"`, `"light"` or `"minimal"`.
 * @name build
 * @type {string}
 * @const
 */
protobuf.build = "minimal";

// Serialization
protobuf.Writer       = __webpack_require__(3720);
protobuf.BufferWriter = __webpack_require__(3448);
protobuf.Reader       = __webpack_require__(196);
protobuf.BufferReader = __webpack_require__(824);

// Utility
protobuf.util         = __webpack_require__(2280);
protobuf.rpc          = __webpack_require__(272);
protobuf.roots        = __webpack_require__(7604);
protobuf.configure    = configure;

/* istanbul ignore next */
/**
 * Reconfigures the library according to the environment.
 * @returns {undefined}
 */
function configure() {
    protobuf.util._configure();
    protobuf.Writer._configure(protobuf.BufferWriter);
    protobuf.Reader._configure(protobuf.BufferReader);
}

// Set up buffer utility according to the environment
configure();


/***/ }),

/***/ 8344:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = MapField;

// extends Field
var Field = __webpack_require__(1372);
((MapField.prototype = Object.create(Field.prototype)).constructor = MapField).className = "MapField";

var types   = __webpack_require__(8443),
    util    = __webpack_require__(888);

/**
 * Constructs a new map field instance.
 * @classdesc Reflected map field.
 * @extends FieldBase
 * @constructor
 * @param {string} name Unique name within its namespace
 * @param {number} id Unique id within its namespace
 * @param {string} keyType Key type
 * @param {string} type Value type
 * @param {Object.<string,*>} [options] Declared options
 * @param {string} [comment] Comment associated with this field
 */
function MapField(name, id, keyType, type, options, comment) {
    Field.call(this, name, id, type, undefined, undefined, options, comment);

    /* istanbul ignore if */
    if (!util.isString(keyType))
        throw TypeError("keyType must be a string");

    /**
     * Key type.
     * @type {string}
     */
    this.keyType = keyType; // toJSON, marker

    /**
     * Resolved key type if not a basic type.
     * @type {ReflectionObject|null}
     */
    this.resolvedKeyType = null;

    // Overrides Field#map
    this.map = true;
}

/**
 * Map field descriptor.
 * @interface IMapField
 * @extends {IField}
 * @property {string} keyType Key type
 */

/**
 * Extension map field descriptor.
 * @interface IExtensionMapField
 * @extends IMapField
 * @property {string} extend Extended type
 */

/**
 * Constructs a map field from a map field descriptor.
 * @param {string} name Field name
 * @param {IMapField} json Map field descriptor
 * @returns {MapField} Created map field
 * @throws {TypeError} If arguments are invalid
 */
MapField.fromJSON = function fromJSON(name, json) {
    return new MapField(name, json.id, json.keyType, json.type, json.options, json.comment);
};

/**
 * Converts this map field to a map field descriptor.
 * @param {IToJSONOptions} [toJSONOptions] JSON conversion options
 * @returns {IMapField} Map field descriptor
 */
MapField.prototype.toJSON = function toJSON(toJSONOptions) {
    var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
    return util.toObject([
        "keyType" , this.keyType,
        "type"    , this.type,
        "id"      , this.id,
        "extend"  , this.extend,
        "options" , this.options,
        "comment" , keepComments ? this.comment : undefined
    ]);
};

/**
 * @override
 */
MapField.prototype.resolve = function resolve() {
    if (this.resolved)
        return this;

    // Besides a value type, map fields have a key type that may be "any scalar type except for floating point types and bytes"
    if (types.mapKey[this.keyType] === undefined)
        throw Error("invalid key type: " + this.keyType);

    return Field.prototype.resolve.call(this);
};

/**
 * Map field decorator (TypeScript).
 * @name MapField.d
 * @function
 * @param {number} fieldId Field id
 * @param {"int32"|"uint32"|"sint32"|"fixed32"|"sfixed32"|"int64"|"uint64"|"sint64"|"fixed64"|"sfixed64"|"bool"|"string"} fieldKeyType Field key type
 * @param {"double"|"float"|"int32"|"uint32"|"sint32"|"fixed32"|"sfixed32"|"int64"|"uint64"|"sint64"|"fixed64"|"sfixed64"|"bool"|"string"|"bytes"|Object|Constructor<{}>} fieldValueType Field value type
 * @returns {FieldDecorator} Decorator function
 * @template T extends { [key: string]: number | Long | string | boolean | Uint8Array | Buffer | number[] | Message<{}> }
 */
MapField.d = function decorateMapField(fieldId, fieldKeyType, fieldValueType) {

    // submessage value: decorate the submessage and use its name as the type
    if (typeof fieldValueType === "function")
        fieldValueType = util.decorateType(fieldValueType).name;

    // enum reference value: create a reflected copy of the enum and keep reuseing it
    else if (fieldValueType && typeof fieldValueType === "object")
        fieldValueType = util.decorateEnum(fieldValueType).name;

    return function mapFieldDecorator(prototype, fieldName) {
        util.decorateType(prototype.constructor)
            .add(new MapField(fieldName, fieldId, fieldKeyType, fieldValueType));
    };
};


/***/ }),

/***/ 2020:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Message;

var util = __webpack_require__(2280);

/**
 * Constructs a new message instance.
 * @classdesc Abstract runtime message.
 * @constructor
 * @param {Properties<T>} [properties] Properties to set
 * @template T extends object = object
 */
function Message(properties) {
    // not used internally
    if (properties)
        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
            this[keys[i]] = properties[keys[i]];
}

/**
 * Reference to the reflected type.
 * @name Message.$type
 * @type {Type}
 * @readonly
 */

/**
 * Reference to the reflected type.
 * @name Message#$type
 * @type {Type}
 * @readonly
 */

/*eslint-disable valid-jsdoc*/

/**
 * Creates a new message of this type using the specified properties.
 * @param {Object.<string,*>} [properties] Properties to set
 * @returns {Message<T>} Message instance
 * @template T extends Message<T>
 * @this Constructor<T>
 */
Message.create = function create(properties) {
    return this.$type.create(properties);
};

/**
 * Encodes a message of this type.
 * @param {T|Object.<string,*>} message Message to encode
 * @param {Writer} [writer] Writer to use
 * @returns {Writer} Writer
 * @template T extends Message<T>
 * @this Constructor<T>
 */
Message.encode = function encode(message, writer) {
    return this.$type.encode(message, writer);
};

/**
 * Encodes a message of this type preceeded by its length as a varint.
 * @param {T|Object.<string,*>} message Message to encode
 * @param {Writer} [writer] Writer to use
 * @returns {Writer} Writer
 * @template T extends Message<T>
 * @this Constructor<T>
 */
Message.encodeDelimited = function encodeDelimited(message, writer) {
    return this.$type.encodeDelimited(message, writer);
};

/**
 * Decodes a message of this type.
 * @name Message.decode
 * @function
 * @param {Reader|Uint8Array} reader Reader or buffer to decode
 * @returns {T} Decoded message
 * @template T extends Message<T>
 * @this Constructor<T>
 */
Message.decode = function decode(reader) {
    return this.$type.decode(reader);
};

/**
 * Decodes a message of this type preceeded by its length as a varint.
 * @name Message.decodeDelimited
 * @function
 * @param {Reader|Uint8Array} reader Reader or buffer to decode
 * @returns {T} Decoded message
 * @template T extends Message<T>
 * @this Constructor<T>
 */
Message.decodeDelimited = function decodeDelimited(reader) {
    return this.$type.decodeDelimited(reader);
};

/**
 * Verifies a message of this type.
 * @name Message.verify
 * @function
 * @param {Object.<string,*>} message Plain object to verify
 * @returns {string|null} `null` if valid, otherwise the reason why it is not
 */
Message.verify = function verify(message) {
    return this.$type.verify(message);
};

/**
 * Creates a new message of this type from a plain object. Also converts values to their respective internal types.
 * @param {Object.<string,*>} object Plain object
 * @returns {T} Message instance
 * @template T extends Message<T>
 * @this Constructor<T>
 */
Message.fromObject = function fromObject(object) {
    return this.$type.fromObject(object);
};

/**
 * Creates a plain object from a message of this type. Also converts values to other types if specified.
 * @param {T} message Message instance
 * @param {IConversionOptions} [options] Conversion options
 * @returns {Object.<string,*>} Plain object
 * @template T extends Message<T>
 * @this Constructor<T>
 */
Message.toObject = function toObject(message, options) {
    return this.$type.toObject(message, options);
};

/**
 * Converts this message to JSON.
 * @returns {Object.<string,*>} JSON object
 */
Message.prototype.toJSON = function toJSON() {
    return this.$type.toObject(this, util.toJSONOptions);
};

/*eslint-enable valid-jsdoc*/

/***/ }),

/***/ 2592:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Method;

// extends ReflectionObject
var ReflectionObject = __webpack_require__(1348);
((Method.prototype = Object.create(ReflectionObject.prototype)).constructor = Method).className = "Method";

var util = __webpack_require__(888);

/**
 * Constructs a new service method instance.
 * @classdesc Reflected service method.
 * @extends ReflectionObject
 * @constructor
 * @param {string} name Method name
 * @param {string|undefined} type Method type, usually `"rpc"`
 * @param {string} requestType Request message type
 * @param {string} responseType Response message type
 * @param {boolean|Object.<string,*>} [requestStream] Whether the request is streamed
 * @param {boolean|Object.<string,*>} [responseStream] Whether the response is streamed
 * @param {Object.<string,*>} [options] Declared options
 * @param {string} [comment] The comment for this method
 * @param {Object.<string,*>} [parsedOptions] Declared options, properly parsed into an object
 */
function Method(name, type, requestType, responseType, requestStream, responseStream, options, comment, parsedOptions) {

    /* istanbul ignore next */
    if (util.isObject(requestStream)) {
        options = requestStream;
        requestStream = responseStream = undefined;
    } else if (util.isObject(responseStream)) {
        options = responseStream;
        responseStream = undefined;
    }

    /* istanbul ignore if */
    if (!(type === undefined || util.isString(type)))
        throw TypeError("type must be a string");

    /* istanbul ignore if */
    if (!util.isString(requestType))
        throw TypeError("requestType must be a string");

    /* istanbul ignore if */
    if (!util.isString(responseType))
        throw TypeError("responseType must be a string");

    ReflectionObject.call(this, name, options);

    /**
     * Method type.
     * @type {string}
     */
    this.type = type || "rpc"; // toJSON

    /**
     * Request type.
     * @type {string}
     */
    this.requestType = requestType; // toJSON, marker

    /**
     * Whether requests are streamed or not.
     * @type {boolean|undefined}
     */
    this.requestStream = requestStream ? true : undefined; // toJSON

    /**
     * Response type.
     * @type {string}
     */
    this.responseType = responseType; // toJSON

    /**
     * Whether responses are streamed or not.
     * @type {boolean|undefined}
     */
    this.responseStream = responseStream ? true : undefined; // toJSON

    /**
     * Resolved request type.
     * @type {Type|null}
     */
    this.resolvedRequestType = null;

    /**
     * Resolved response type.
     * @type {Type|null}
     */
    this.resolvedResponseType = null;

    /**
     * Comment for this method
     * @type {string|null}
     */
    this.comment = comment;

    /**
     * Options properly parsed into an object
     */
    this.parsedOptions = parsedOptions;
}

/**
 * Method descriptor.
 * @interface IMethod
 * @property {string} [type="rpc"] Method type
 * @property {string} requestType Request type
 * @property {string} responseType Response type
 * @property {boolean} [requestStream=false] Whether requests are streamed
 * @property {boolean} [responseStream=false] Whether responses are streamed
 * @property {Object.<string,*>} [options] Method options
 * @property {string} comment Method comments
 * @property {Object.<string,*>} [parsedOptions] Method options properly parsed into an object
 */

/**
 * Constructs a method from a method descriptor.
 * @param {string} name Method name
 * @param {IMethod} json Method descriptor
 * @returns {Method} Created method
 * @throws {TypeError} If arguments are invalid
 */
Method.fromJSON = function fromJSON(name, json) {
    return new Method(name, json.type, json.requestType, json.responseType, json.requestStream, json.responseStream, json.options, json.comment, json.parsedOptions);
};

/**
 * Converts this method to a method descriptor.
 * @param {IToJSONOptions} [toJSONOptions] JSON conversion options
 * @returns {IMethod} Method descriptor
 */
Method.prototype.toJSON = function toJSON(toJSONOptions) {
    var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
    return util.toObject([
        "type"           , this.type !== "rpc" && /* istanbul ignore next */ this.type || undefined,
        "requestType"    , this.requestType,
        "requestStream"  , this.requestStream,
        "responseType"   , this.responseType,
        "responseStream" , this.responseStream,
        "options"        , this.options,
        "comment"        , keepComments ? this.comment : undefined,
        "parsedOptions"  , this.parsedOptions,
    ]);
};

/**
 * @override
 */
Method.prototype.resolve = function resolve() {

    /* istanbul ignore if */
    if (this.resolved)
        return this;

    this.resolvedRequestType = this.parent.lookupType(this.requestType);
    this.resolvedResponseType = this.parent.lookupType(this.responseType);

    return ReflectionObject.prototype.resolve.call(this);
};


/***/ }),

/***/ 5820:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Namespace;

// extends ReflectionObject
var ReflectionObject = __webpack_require__(1348);
((Namespace.prototype = Object.create(ReflectionObject.prototype)).constructor = Namespace).className = "Namespace";

var Field    = __webpack_require__(1372),
    util     = __webpack_require__(888),
    OneOf    = __webpack_require__(3704);

var Type,    // cyclic
    Service,
    Enum;

/**
 * Constructs a new namespace instance.
 * @name Namespace
 * @classdesc Reflected namespace.
 * @extends NamespaceBase
 * @constructor
 * @param {string} name Namespace name
 * @param {Object.<string,*>} [options] Declared options
 */

/**
 * Constructs a namespace from JSON.
 * @memberof Namespace
 * @function
 * @param {string} name Namespace name
 * @param {Object.<string,*>} json JSON object
 * @returns {Namespace} Created namespace
 * @throws {TypeError} If arguments are invalid
 */
Namespace.fromJSON = function fromJSON(name, json) {
    return new Namespace(name, json.options).addJSON(json.nested);
};

/**
 * Converts an array of reflection objects to JSON.
 * @memberof Namespace
 * @param {ReflectionObject[]} array Object array
 * @param {IToJSONOptions} [toJSONOptions] JSON conversion options
 * @returns {Object.<string,*>|undefined} JSON object or `undefined` when array is empty
 */
function arrayToJSON(array, toJSONOptions) {
    if (!(array && array.length))
        return undefined;
    var obj = {};
    for (var i = 0; i < array.length; ++i)
        obj[array[i].name] = array[i].toJSON(toJSONOptions);
    return obj;
}

Namespace.arrayToJSON = arrayToJSON;

/**
 * Tests if the specified id is reserved.
 * @param {Array.<number[]|string>|undefined} reserved Array of reserved ranges and names
 * @param {number} id Id to test
 * @returns {boolean} `true` if reserved, otherwise `false`
 */
Namespace.isReservedId = function isReservedId(reserved, id) {
    if (reserved)
        for (var i = 0; i < reserved.length; ++i)
            if (typeof reserved[i] !== "string" && reserved[i][0] <= id && reserved[i][1] > id)
                return true;
    return false;
};

/**
 * Tests if the specified name is reserved.
 * @param {Array.<number[]|string>|undefined} reserved Array of reserved ranges and names
 * @param {string} name Name to test
 * @returns {boolean} `true` if reserved, otherwise `false`
 */
Namespace.isReservedName = function isReservedName(reserved, name) {
    if (reserved)
        for (var i = 0; i < reserved.length; ++i)
            if (reserved[i] === name)
                return true;
    return false;
};

/**
 * Not an actual constructor. Use {@link Namespace} instead.
 * @classdesc Base class of all reflection objects containing nested objects. This is not an actual class but here for the sake of having consistent type definitions.
 * @exports NamespaceBase
 * @extends ReflectionObject
 * @abstract
 * @constructor
 * @param {string} name Namespace name
 * @param {Object.<string,*>} [options] Declared options
 * @see {@link Namespace}
 */
function Namespace(name, options) {
    ReflectionObject.call(this, name, options);

    /**
     * Nested objects by name.
     * @type {Object.<string,ReflectionObject>|undefined}
     */
    this.nested = undefined; // toJSON

    /**
     * Cached nested objects as an array.
     * @type {ReflectionObject[]|null}
     * @private
     */
    this._nestedArray = null;
}

function clearCache(namespace) {
    namespace._nestedArray = null;
    return namespace;
}

/**
 * Nested objects of this namespace as an array for iteration.
 * @name NamespaceBase#nestedArray
 * @type {ReflectionObject[]}
 * @readonly
 */
Object.defineProperty(Namespace.prototype, "nestedArray", {
    get: function() {
        return this._nestedArray || (this._nestedArray = util.toArray(this.nested));
    }
});

/**
 * Namespace descriptor.
 * @interface INamespace
 * @property {Object.<string,*>} [options] Namespace options
 * @property {Object.<string,AnyNestedObject>} [nested] Nested object descriptors
 */

/**
 * Any extension field descriptor.
 * @typedef AnyExtensionField
 * @type {IExtensionField|IExtensionMapField}
 */

/**
 * Any nested object descriptor.
 * @typedef AnyNestedObject
 * @type {IEnum|IType|IService|AnyExtensionField|INamespace|IOneOf}
 */

/**
 * Converts this namespace to a namespace descriptor.
 * @param {IToJSONOptions} [toJSONOptions] JSON conversion options
 * @returns {INamespace} Namespace descriptor
 */
Namespace.prototype.toJSON = function toJSON(toJSONOptions) {
    return util.toObject([
        "options" , this.options,
        "nested"  , arrayToJSON(this.nestedArray, toJSONOptions)
    ]);
};

/**
 * Adds nested objects to this namespace from nested object descriptors.
 * @param {Object.<string,AnyNestedObject>} nestedJson Any nested object descriptors
 * @returns {Namespace} `this`
 */
Namespace.prototype.addJSON = function addJSON(nestedJson) {
    var ns = this;
    /* istanbul ignore else */
    if (nestedJson) {
        for (var names = Object.keys(nestedJson), i = 0, nested; i < names.length; ++i) {
            nested = nestedJson[names[i]];
            ns.add( // most to least likely
                ( nested.fields !== undefined
                ? Type.fromJSON
                : nested.values !== undefined
                ? Enum.fromJSON
                : nested.methods !== undefined
                ? Service.fromJSON
                : nested.id !== undefined
                ? Field.fromJSON
                : Namespace.fromJSON )(names[i], nested)
            );
        }
    }
    return this;
};

/**
 * Gets the nested object of the specified name.
 * @param {string} name Nested object name
 * @returns {ReflectionObject|null} The reflection object or `null` if it doesn't exist
 */
Namespace.prototype.get = function get(name) {
    return this.nested && this.nested[name]
        || null;
};

/**
 * Gets the values of the nested {@link Enum|enum} of the specified name.
 * This methods differs from {@link Namespace#get|get} in that it returns an enum's values directly and throws instead of returning `null`.
 * @param {string} name Nested enum name
 * @returns {Object.<string,number>} Enum values
 * @throws {Error} If there is no such enum
 */
Namespace.prototype.getEnum = function getEnum(name) {
    if (this.nested && this.nested[name] instanceof Enum)
        return this.nested[name].values;
    throw Error("no such enum: " + name);
};

/**
 * Adds a nested object to this namespace.
 * @param {ReflectionObject} object Nested object to add
 * @returns {Namespace} `this`
 * @throws {TypeError} If arguments are invalid
 * @throws {Error} If there is already a nested object with this name
 */
Namespace.prototype.add = function add(object) {

    if (!(object instanceof Field && object.extend !== undefined || object instanceof Type  || object instanceof OneOf || object instanceof Enum || object instanceof Service || object instanceof Namespace))
        throw TypeError("object must be a valid nested object");

    if (!this.nested)
        this.nested = {};
    else {
        var prev = this.get(object.name);
        if (prev) {
            if (prev instanceof Namespace && object instanceof Namespace && !(prev instanceof Type || prev instanceof Service)) {
                // replace plain namespace but keep existing nested elements and options
                var nested = prev.nestedArray;
                for (var i = 0; i < nested.length; ++i)
                    object.add(nested[i]);
                this.remove(prev);
                if (!this.nested)
                    this.nested = {};
                object.setOptions(prev.options, true);

            } else
                throw Error("duplicate name '" + object.name + "' in " + this);
        }
    }
    this.nested[object.name] = object;
    object.onAdd(this);
    return clearCache(this);
};

/**
 * Removes a nested object from this namespace.
 * @param {ReflectionObject} object Nested object to remove
 * @returns {Namespace} `this`
 * @throws {TypeError} If arguments are invalid
 * @throws {Error} If `object` is not a member of this namespace
 */
Namespace.prototype.remove = function remove(object) {

    if (!(object instanceof ReflectionObject))
        throw TypeError("object must be a ReflectionObject");
    if (object.parent !== this)
        throw Error(object + " is not a member of " + this);

    delete this.nested[object.name];
    if (!Object.keys(this.nested).length)
        this.nested = undefined;

    object.onRemove(this);
    return clearCache(this);
};

/**
 * Defines additial namespaces within this one if not yet existing.
 * @param {string|string[]} path Path to create
 * @param {*} [json] Nested types to create from JSON
 * @returns {Namespace} Pointer to the last namespace created or `this` if path is empty
 */
Namespace.prototype.define = function define(path, json) {

    if (util.isString(path))
        path = path.split(".");
    else if (!Array.isArray(path))
        throw TypeError("illegal path");
    if (path && path.length && path[0] === "")
        throw Error("path must be relative");

    var ptr = this;
    while (path.length > 0) {
        var part = path.shift();
        if (ptr.nested && ptr.nested[part]) {
            ptr = ptr.nested[part];
            if (!(ptr instanceof Namespace))
                throw Error("path conflicts with non-namespace objects");
        } else
            ptr.add(ptr = new Namespace(part));
    }
    if (json)
        ptr.addJSON(json);
    return ptr;
};

/**
 * Resolves this namespace's and all its nested objects' type references. Useful to validate a reflection tree, but comes at a cost.
 * @returns {Namespace} `this`
 */
Namespace.prototype.resolveAll = function resolveAll() {
    var nested = this.nestedArray, i = 0;
    while (i < nested.length)
        if (nested[i] instanceof Namespace)
            nested[i++].resolveAll();
        else
            nested[i++].resolve();
    return this.resolve();
};

/**
 * Recursively looks up the reflection object matching the specified path in the scope of this namespace.
 * @param {string|string[]} path Path to look up
 * @param {*|Array.<*>} filterTypes Filter types, any combination of the constructors of `protobuf.Type`, `protobuf.Enum`, `protobuf.Service` etc.
 * @param {boolean} [parentAlreadyChecked=false] If known, whether the parent has already been checked
 * @returns {ReflectionObject|null} Looked up object or `null` if none could be found
 */
Namespace.prototype.lookup = function lookup(path, filterTypes, parentAlreadyChecked) {

    /* istanbul ignore next */
    if (typeof filterTypes === "boolean") {
        parentAlreadyChecked = filterTypes;
        filterTypes = undefined;
    } else if (filterTypes && !Array.isArray(filterTypes))
        filterTypes = [ filterTypes ];

    if (util.isString(path) && path.length) {
        if (path === ".")
            return this.root;
        path = path.split(".");
    } else if (!path.length)
        return this;

    // Start at root if path is absolute
    if (path[0] === "")
        return this.root.lookup(path.slice(1), filterTypes);

    // Test if the first part matches any nested object, and if so, traverse if path contains more
    var found = this.get(path[0]);
    if (found) {
        if (path.length === 1) {
            if (!filterTypes || filterTypes.indexOf(found.constructor) > -1)
                return found;
        } else if (found instanceof Namespace && (found = found.lookup(path.slice(1), filterTypes, true)))
            return found;

    // Otherwise try each nested namespace
    } else
        for (var i = 0; i < this.nestedArray.length; ++i)
            if (this._nestedArray[i] instanceof Namespace && (found = this._nestedArray[i].lookup(path, filterTypes, true)))
                return found;

    // If there hasn't been a match, try again at the parent
    if (this.parent === null || parentAlreadyChecked)
        return null;
    return this.parent.lookup(path, filterTypes);
};

/**
 * Looks up the reflection object at the specified path, relative to this namespace.
 * @name NamespaceBase#lookup
 * @function
 * @param {string|string[]} path Path to look up
 * @param {boolean} [parentAlreadyChecked=false] Whether the parent has already been checked
 * @returns {ReflectionObject|null} Looked up object or `null` if none could be found
 * @variation 2
 */
// lookup(path: string, [parentAlreadyChecked: boolean])

/**
 * Looks up the {@link Type|type} at the specified path, relative to this namespace.
 * Besides its signature, this methods differs from {@link Namespace#lookup|lookup} in that it throws instead of returning `null`.
 * @param {string|string[]} path Path to look up
 * @returns {Type} Looked up type
 * @throws {Error} If `path` does not point to a type
 */
Namespace.prototype.lookupType = function lookupType(path) {
    var found = this.lookup(path, [ Type ]);
    if (!found)
        throw Error("no such type: " + path);
    return found;
};

/**
 * Looks up the values of the {@link Enum|enum} at the specified path, relative to this namespace.
 * Besides its signature, this methods differs from {@link Namespace#lookup|lookup} in that it throws instead of returning `null`.
 * @param {string|string[]} path Path to look up
 * @returns {Enum} Looked up enum
 * @throws {Error} If `path` does not point to an enum
 */
Namespace.prototype.lookupEnum = function lookupEnum(path) {
    var found = this.lookup(path, [ Enum ]);
    if (!found)
        throw Error("no such Enum '" + path + "' in " + this);
    return found;
};

/**
 * Looks up the {@link Type|type} or {@link Enum|enum} at the specified path, relative to this namespace.
 * Besides its signature, this methods differs from {@link Namespace#lookup|lookup} in that it throws instead of returning `null`.
 * @param {string|string[]} path Path to look up
 * @returns {Type} Looked up type or enum
 * @throws {Error} If `path` does not point to a type or enum
 */
Namespace.prototype.lookupTypeOrEnum = function lookupTypeOrEnum(path) {
    var found = this.lookup(path, [ Type, Enum ]);
    if (!found)
        throw Error("no such Type or Enum '" + path + "' in " + this);
    return found;
};

/**
 * Looks up the {@link Service|service} at the specified path, relative to this namespace.
 * Besides its signature, this methods differs from {@link Namespace#lookup|lookup} in that it throws instead of returning `null`.
 * @param {string|string[]} path Path to look up
 * @returns {Service} Looked up service
 * @throws {Error} If `path` does not point to a service
 */
Namespace.prototype.lookupService = function lookupService(path) {
    var found = this.lookup(path, [ Service ]);
    if (!found)
        throw Error("no such Service '" + path + "' in " + this);
    return found;
};

// Sets up cyclic dependencies (called in index-light)
Namespace._configure = function(Type_, Service_, Enum_) {
    Type    = Type_;
    Service = Service_;
    Enum    = Enum_;
};


/***/ }),

/***/ 1348:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = ReflectionObject;

ReflectionObject.className = "ReflectionObject";

var util = __webpack_require__(888);

var Root; // cyclic

/**
 * Constructs a new reflection object instance.
 * @classdesc Base class of all reflection objects.
 * @constructor
 * @param {string} name Object name
 * @param {Object.<string,*>} [options] Declared options
 * @abstract
 */
function ReflectionObject(name, options) {

    if (!util.isString(name))
        throw TypeError("name must be a string");

    if (options && !util.isObject(options))
        throw TypeError("options must be an object");

    /**
     * Options.
     * @type {Object.<string,*>|undefined}
     */
    this.options = options; // toJSON

    /**
     * Parsed Options.
     * @type {Array.<Object.<string,*>>|undefined}
     */
    this.parsedOptions = null;

    /**
     * Unique name within its namespace.
     * @type {string}
     */
    this.name = name;

    /**
     * Parent namespace.
     * @type {Namespace|null}
     */
    this.parent = null;

    /**
     * Whether already resolved or not.
     * @type {boolean}
     */
    this.resolved = false;

    /**
     * Comment text, if any.
     * @type {string|null}
     */
    this.comment = null;

    /**
     * Defining file name.
     * @type {string|null}
     */
    this.filename = null;
}

Object.defineProperties(ReflectionObject.prototype, {

    /**
     * Reference to the root namespace.
     * @name ReflectionObject#root
     * @type {Root}
     * @readonly
     */
    root: {
        get: function() {
            var ptr = this;
            while (ptr.parent !== null)
                ptr = ptr.parent;
            return ptr;
        }
    },

    /**
     * Full name including leading dot.
     * @name ReflectionObject#fullName
     * @type {string}
     * @readonly
     */
    fullName: {
        get: function() {
            var path = [ this.name ],
                ptr = this.parent;
            while (ptr) {
                path.unshift(ptr.name);
                ptr = ptr.parent;
            }
            return path.join(".");
        }
    }
});

/**
 * Converts this reflection object to its descriptor representation.
 * @returns {Object.<string,*>} Descriptor
 * @abstract
 */
ReflectionObject.prototype.toJSON = /* istanbul ignore next */ function toJSON() {
    throw Error(); // not implemented, shouldn't happen
};

/**
 * Called when this object is added to a parent.
 * @param {ReflectionObject} parent Parent added to
 * @returns {undefined}
 */
ReflectionObject.prototype.onAdd = function onAdd(parent) {
    if (this.parent && this.parent !== parent)
        this.parent.remove(this);
    this.parent = parent;
    this.resolved = false;
    var root = parent.root;
    if (root instanceof Root)
        root._handleAdd(this);
};

/**
 * Called when this object is removed from a parent.
 * @param {ReflectionObject} parent Parent removed from
 * @returns {undefined}
 */
ReflectionObject.prototype.onRemove = function onRemove(parent) {
    var root = parent.root;
    if (root instanceof Root)
        root._handleRemove(this);
    this.parent = null;
    this.resolved = false;
};

/**
 * Resolves this objects type references.
 * @returns {ReflectionObject} `this`
 */
ReflectionObject.prototype.resolve = function resolve() {
    if (this.resolved)
        return this;
    if (this.root instanceof Root)
        this.resolved = true; // only if part of a root
    return this;
};

/**
 * Gets an option value.
 * @param {string} name Option name
 * @returns {*} Option value or `undefined` if not set
 */
ReflectionObject.prototype.getOption = function getOption(name) {
    if (this.options)
        return this.options[name];
    return undefined;
};

/**
 * Sets an option.
 * @param {string} name Option name
 * @param {*} value Option value
 * @param {boolean} [ifNotSet] Sets the option only if it isn't currently set
 * @returns {ReflectionObject} `this`
 */
ReflectionObject.prototype.setOption = function setOption(name, value, ifNotSet) {
    if (!ifNotSet || !this.options || this.options[name] === undefined)
        (this.options || (this.options = {}))[name] = value;
    return this;
};

/**
 * Sets a parsed option.
 * @param {string} name parsed Option name
 * @param {*} value Option value
 * @param {string} propName dot '.' delimited full path of property within the option to set. if undefined\empty, will add a new option with that value
 * @returns {ReflectionObject} `this`
 */
ReflectionObject.prototype.setParsedOption = function setParsedOption(name, value, propName) {
    if (!this.parsedOptions) {
        this.parsedOptions = [];
    }
    var parsedOptions = this.parsedOptions;
    if (propName) {
        // If setting a sub property of an option then try to merge it
        // with an existing option
        var opt = parsedOptions.find(function (opt) {
            return Object.prototype.hasOwnProperty.call(opt, name);
        });
        if (opt) {
            // If we found an existing option - just merge the property value
            var newValue = opt[name];
            util.setProperty(newValue, propName, value);
        } else {
            // otherwise, create a new option, set it's property and add it to the list
            opt = {};
            opt[name] = util.setProperty({}, propName, value);
            parsedOptions.push(opt);
        }
    } else {
        // Always create a new option when setting the value of the option itself
        var newOpt = {};
        newOpt[name] = value;
        parsedOptions.push(newOpt);
    }
    return this;
};

/**
 * Sets multiple options.
 * @param {Object.<string,*>} options Options to set
 * @param {boolean} [ifNotSet] Sets an option only if it isn't currently set
 * @returns {ReflectionObject} `this`
 */
ReflectionObject.prototype.setOptions = function setOptions(options, ifNotSet) {
    if (options)
        for (var keys = Object.keys(options), i = 0; i < keys.length; ++i)
            this.setOption(keys[i], options[keys[i]], ifNotSet);
    return this;
};

/**
 * Converts this instance to its string representation.
 * @returns {string} Class name[, space, full name]
 */
ReflectionObject.prototype.toString = function toString() {
    var className = this.constructor.className,
        fullName  = this.fullName;
    if (fullName.length)
        return className + " " + fullName;
    return className;
};

// Sets up cyclic dependencies (called in index-light)
ReflectionObject._configure = function(Root_) {
    Root = Root_;
};


/***/ }),

/***/ 3704:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = OneOf;

// extends ReflectionObject
var ReflectionObject = __webpack_require__(1348);
((OneOf.prototype = Object.create(ReflectionObject.prototype)).constructor = OneOf).className = "OneOf";

var Field = __webpack_require__(1372),
    util  = __webpack_require__(888);

/**
 * Constructs a new oneof instance.
 * @classdesc Reflected oneof.
 * @extends ReflectionObject
 * @constructor
 * @param {string} name Oneof name
 * @param {string[]|Object.<string,*>} [fieldNames] Field names
 * @param {Object.<string,*>} [options] Declared options
 * @param {string} [comment] Comment associated with this field
 */
function OneOf(name, fieldNames, options, comment) {
    if (!Array.isArray(fieldNames)) {
        options = fieldNames;
        fieldNames = undefined;
    }
    ReflectionObject.call(this, name, options);

    /* istanbul ignore if */
    if (!(fieldNames === undefined || Array.isArray(fieldNames)))
        throw TypeError("fieldNames must be an Array");

    /**
     * Field names that belong to this oneof.
     * @type {string[]}
     */
    this.oneof = fieldNames || []; // toJSON, marker

    /**
     * Fields that belong to this oneof as an array for iteration.
     * @type {Field[]}
     * @readonly
     */
    this.fieldsArray = []; // declared readonly for conformance, possibly not yet added to parent

    /**
     * Comment for this field.
     * @type {string|null}
     */
    this.comment = comment;
}

/**
 * Oneof descriptor.
 * @interface IOneOf
 * @property {Array.<string>} oneof Oneof field names
 * @property {Object.<string,*>} [options] Oneof options
 */

/**
 * Constructs a oneof from a oneof descriptor.
 * @param {string} name Oneof name
 * @param {IOneOf} json Oneof descriptor
 * @returns {OneOf} Created oneof
 * @throws {TypeError} If arguments are invalid
 */
OneOf.fromJSON = function fromJSON(name, json) {
    return new OneOf(name, json.oneof, json.options, json.comment);
};

/**
 * Converts this oneof to a oneof descriptor.
 * @param {IToJSONOptions} [toJSONOptions] JSON conversion options
 * @returns {IOneOf} Oneof descriptor
 */
OneOf.prototype.toJSON = function toJSON(toJSONOptions) {
    var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
    return util.toObject([
        "options" , this.options,
        "oneof"   , this.oneof,
        "comment" , keepComments ? this.comment : undefined
    ]);
};

/**
 * Adds the fields of the specified oneof to the parent if not already done so.
 * @param {OneOf} oneof The oneof
 * @returns {undefined}
 * @inner
 * @ignore
 */
function addFieldsToParent(oneof) {
    if (oneof.parent)
        for (var i = 0; i < oneof.fieldsArray.length; ++i)
            if (!oneof.fieldsArray[i].parent)
                oneof.parent.add(oneof.fieldsArray[i]);
}

/**
 * Adds a field to this oneof and removes it from its current parent, if any.
 * @param {Field} field Field to add
 * @returns {OneOf} `this`
 */
OneOf.prototype.add = function add(field) {

    /* istanbul ignore if */
    if (!(field instanceof Field))
        throw TypeError("field must be a Field");

    if (field.parent && field.parent !== this.parent)
        field.parent.remove(field);
    this.oneof.push(field.name);
    this.fieldsArray.push(field);
    field.partOf = this; // field.parent remains null
    addFieldsToParent(this);
    return this;
};

/**
 * Removes a field from this oneof and puts it back to the oneof's parent.
 * @param {Field} field Field to remove
 * @returns {OneOf} `this`
 */
OneOf.prototype.remove = function remove(field) {

    /* istanbul ignore if */
    if (!(field instanceof Field))
        throw TypeError("field must be a Field");

    var index = this.fieldsArray.indexOf(field);

    /* istanbul ignore if */
    if (index < 0)
        throw Error(field + " is not a member of " + this);

    this.fieldsArray.splice(index, 1);
    index = this.oneof.indexOf(field.name);

    /* istanbul ignore else */
    if (index > -1) // theoretical
        this.oneof.splice(index, 1);

    field.partOf = null;
    return this;
};

/**
 * @override
 */
OneOf.prototype.onAdd = function onAdd(parent) {
    ReflectionObject.prototype.onAdd.call(this, parent);
    var self = this;
    // Collect present fields
    for (var i = 0; i < this.oneof.length; ++i) {
        var field = parent.get(this.oneof[i]);
        if (field && !field.partOf) {
            field.partOf = self;
            self.fieldsArray.push(field);
        }
    }
    // Add not yet present fields
    addFieldsToParent(this);
};

/**
 * @override
 */
OneOf.prototype.onRemove = function onRemove(parent) {
    for (var i = 0, field; i < this.fieldsArray.length; ++i)
        if ((field = this.fieldsArray[i]).parent)
            field.parent.remove(field);
    ReflectionObject.prototype.onRemove.call(this, parent);
};

/**
 * Decorator function as returned by {@link OneOf.d} (TypeScript).
 * @typedef OneOfDecorator
 * @type {function}
 * @param {Object} prototype Target prototype
 * @param {string} oneofName OneOf name
 * @returns {undefined}
 */

/**
 * OneOf decorator (TypeScript).
 * @function
 * @param {...string} fieldNames Field names
 * @returns {OneOfDecorator} Decorator function
 * @template T extends string
 */
OneOf.d = function decorateOneOf() {
    var fieldNames = new Array(arguments.length),
        index = 0;
    while (index < arguments.length)
        fieldNames[index] = arguments[index++];
    return function oneOfDecorator(prototype, oneofName) {
        util.decorateType(prototype.constructor)
            .add(new OneOf(oneofName, fieldNames));
        Object.defineProperty(prototype, oneofName, {
            get: util.oneOfGetter(fieldNames),
            set: util.oneOfSetter(fieldNames)
        });
    };
};


/***/ }),

/***/ 196:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Reader;

var util      = __webpack_require__(2280);

var BufferReader; // cyclic

var LongBits  = util.LongBits,
    utf8      = util.utf8;

/* istanbul ignore next */
function indexOutOfRange(reader, writeLength) {
    return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
}

/**
 * Constructs a new reader instance using the specified buffer.
 * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 * @param {Uint8Array} buffer Buffer to read from
 */
function Reader(buffer) {

    /**
     * Read buffer.
     * @type {Uint8Array}
     */
    this.buf = buffer;

    /**
     * Read buffer position.
     * @type {number}
     */
    this.pos = 0;

    /**
     * Read buffer length.
     * @type {number}
     */
    this.len = buffer.length;
}

var create_array = typeof Uint8Array !== "undefined"
    ? function create_typed_array(buffer) {
        if (buffer instanceof Uint8Array || Array.isArray(buffer))
            return new Reader(buffer);
        throw Error("illegal buffer");
    }
    /* istanbul ignore next */
    : function create_array(buffer) {
        if (Array.isArray(buffer))
            return new Reader(buffer);
        throw Error("illegal buffer");
    };

var create = function create() {
    return util.Buffer
        ? function create_buffer_setup(buffer) {
            return (Reader.create = function create_buffer(buffer) {
                return util.Buffer.isBuffer(buffer)
                    ? new BufferReader(buffer)
                    /* istanbul ignore next */
                    : create_array(buffer);
            })(buffer);
        }
        /* istanbul ignore next */
        : create_array;
};

/**
 * Creates a new reader using the specified buffer.
 * @function
 * @param {Uint8Array|Buffer} buffer Buffer to read from
 * @returns {Reader|BufferReader} A {@link BufferReader} if `buffer` is a Buffer, otherwise a {@link Reader}
 * @throws {Error} If `buffer` is not a valid buffer
 */
Reader.create = create();

Reader.prototype._slice = util.Array.prototype.subarray || /* istanbul ignore next */ util.Array.prototype.slice;

/**
 * Reads a varint as an unsigned 32 bit value.
 * @function
 * @returns {number} Value read
 */
Reader.prototype.uint32 = (function read_uint32_setup() {
    var value = 4294967295; // optimizer type-hint, tends to deopt otherwise (?!)
    return function read_uint32() {
        value = (         this.buf[this.pos] & 127       ) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) <<  7) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] &  15) << 28) >>> 0; if (this.buf[this.pos++] < 128) return value;

        /* istanbul ignore if */
        if ((this.pos += 5) > this.len) {
            this.pos = this.len;
            throw indexOutOfRange(this, 10);
        }
        return value;
    };
})();

/**
 * Reads a varint as a signed 32 bit value.
 * @returns {number} Value read
 */
Reader.prototype.int32 = function read_int32() {
    return this.uint32() | 0;
};

/**
 * Reads a zig-zag encoded varint as a signed 32 bit value.
 * @returns {number} Value read
 */
Reader.prototype.sint32 = function read_sint32() {
    var value = this.uint32();
    return value >>> 1 ^ -(value & 1) | 0;
};

/* eslint-disable no-invalid-this */

function readLongVarint() {
    // tends to deopt with local vars for octet etc.
    var bits = new LongBits(0, 0);
    var i = 0;
    if (this.len - this.pos > 4) { // fast route (lo)
        for (; i < 4; ++i) {
            // 1st..4th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 5th
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >>  4) >>> 0;
        if (this.buf[this.pos++] < 128)
            return bits;
        i = 0;
    } else {
        for (; i < 3; ++i) {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 1st..3th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 4th
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
    }
    if (this.len - this.pos > 4) { // fast route (hi)
        for (; i < 5; ++i) {
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    } else {
        for (; i < 5; ++i) {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    }
    /* istanbul ignore next */
    throw Error("invalid varint encoding");
}

/* eslint-enable no-invalid-this */

/**
 * Reads a varint as a signed 64 bit value.
 * @name Reader#int64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a varint as an unsigned 64 bit value.
 * @name Reader#uint64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a zig-zag encoded varint as a signed 64 bit value.
 * @name Reader#sint64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a varint as a boolean.
 * @returns {boolean} Value read
 */
Reader.prototype.bool = function read_bool() {
    return this.uint32() !== 0;
};

function readFixed32_end(buf, end) { // note that this uses `end`, not `pos`
    return (buf[end - 4]
          | buf[end - 3] << 8
          | buf[end - 2] << 16
          | buf[end - 1] << 24) >>> 0;
}

/**
 * Reads fixed 32 bits as an unsigned 32 bit integer.
 * @returns {number} Value read
 */
Reader.prototype.fixed32 = function read_fixed32() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32_end(this.buf, this.pos += 4);
};

/**
 * Reads fixed 32 bits as a signed 32 bit integer.
 * @returns {number} Value read
 */
Reader.prototype.sfixed32 = function read_sfixed32() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32_end(this.buf, this.pos += 4) | 0;
};

/* eslint-disable no-invalid-this */

function readFixed64(/* this: Reader */) {

    /* istanbul ignore if */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 8);

    return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
}

/* eslint-enable no-invalid-this */

/**
 * Reads fixed 64 bits.
 * @name Reader#fixed64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads zig-zag encoded fixed 64 bits.
 * @name Reader#sfixed64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a float (32 bit) as a number.
 * @function
 * @returns {number} Value read
 */
Reader.prototype.float = function read_float() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    var value = util.float.readFloatLE(this.buf, this.pos);
    this.pos += 4;
    return value;
};

/**
 * Reads a double (64 bit float) as a number.
 * @function
 * @returns {number} Value read
 */
Reader.prototype.double = function read_double() {

    /* istanbul ignore if */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 4);

    var value = util.float.readDoubleLE(this.buf, this.pos);
    this.pos += 8;
    return value;
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @returns {Uint8Array} Value read
 */
Reader.prototype.bytes = function read_bytes() {
    var length = this.uint32(),
        start  = this.pos,
        end    = this.pos + length;

    /* istanbul ignore if */
    if (end > this.len)
        throw indexOutOfRange(this, length);

    this.pos += length;
    if (Array.isArray(this.buf)) // plain array
        return this.buf.slice(start, end);

    if (start === end) { // fix for IE 10/Win8 and others' subarray returning array of size 1
        var nativeBuffer = util.Buffer;
        return nativeBuffer
            ? nativeBuffer.alloc(0)
            : new this.buf.constructor(0);
    }
    return this._slice.call(this.buf, start, end);
};

/**
 * Reads a string preceeded by its byte length as a varint.
 * @returns {string} Value read
 */
Reader.prototype.string = function read_string() {
    var bytes = this.bytes();
    return utf8.read(bytes, 0, bytes.length);
};

/**
 * Skips the specified number of bytes if specified, otherwise skips a varint.
 * @param {number} [length] Length if known, otherwise a varint is assumed
 * @returns {Reader} `this`
 */
Reader.prototype.skip = function skip(length) {
    if (typeof length === "number") {
        /* istanbul ignore if */
        if (this.pos + length > this.len)
            throw indexOutOfRange(this, length);
        this.pos += length;
    } else {
        do {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
        } while (this.buf[this.pos++] & 128);
    }
    return this;
};

/**
 * Skips the next element of the specified wire type.
 * @param {number} wireType Wire type received
 * @returns {Reader} `this`
 */
Reader.prototype.skipType = function(wireType) {
    switch (wireType) {
        case 0:
            this.skip();
            break;
        case 1:
            this.skip(8);
            break;
        case 2:
            this.skip(this.uint32());
            break;
        case 3:
            while ((wireType = this.uint32() & 7) !== 4) {
                this.skipType(wireType);
            }
            break;
        case 5:
            this.skip(4);
            break;

        /* istanbul ignore next */
        default:
            throw Error("invalid wire type " + wireType + " at offset " + this.pos);
    }
    return this;
};

Reader._configure = function(BufferReader_) {
    BufferReader = BufferReader_;
    Reader.create = create();
    BufferReader._configure();

    var fn = util.Long ? "toLong" : /* istanbul ignore next */ "toNumber";
    util.merge(Reader.prototype, {

        int64: function read_int64() {
            return readLongVarint.call(this)[fn](false);
        },

        uint64: function read_uint64() {
            return readLongVarint.call(this)[fn](true);
        },

        sint64: function read_sint64() {
            return readLongVarint.call(this).zzDecode()[fn](false);
        },

        fixed64: function read_fixed64() {
            return readFixed64.call(this)[fn](true);
        },

        sfixed64: function read_sfixed64() {
            return readFixed64.call(this)[fn](false);
        }

    });
};


/***/ }),

/***/ 824:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = BufferReader;

// extends Reader
var Reader = __webpack_require__(196);
(BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;

var util = __webpack_require__(2280);

/**
 * Constructs a new buffer reader instance.
 * @classdesc Wire format reader using node buffers.
 * @extends Reader
 * @constructor
 * @param {Buffer} buffer Buffer to read from
 */
function BufferReader(buffer) {
    Reader.call(this, buffer);

    /**
     * Read buffer.
     * @name BufferReader#buf
     * @type {Buffer}
     */
}

BufferReader._configure = function () {
    /* istanbul ignore else */
    if (util.Buffer)
        BufferReader.prototype._slice = util.Buffer.prototype.slice;
};


/**
 * @override
 */
BufferReader.prototype.string = function read_string_buffer() {
    var len = this.uint32(); // modifies pos
    return this.buf.utf8Slice
        ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len))
        : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @name BufferReader#bytes
 * @function
 * @returns {Buffer} Value read
 */

BufferReader._configure();


/***/ }),

/***/ 2645:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Root;

// extends Namespace
var Namespace = __webpack_require__(5820);
((Root.prototype = Object.create(Namespace.prototype)).constructor = Root).className = "Root";

var Field   = __webpack_require__(1372),
    Enum    = __webpack_require__(8432),
    OneOf   = __webpack_require__(3704),
    util    = __webpack_require__(888);

var Type,   // cyclic
    parse,  // might be excluded
    common; // "

/**
 * Constructs a new root namespace instance.
 * @classdesc Root namespace wrapping all types, enums, services, sub-namespaces etc. that belong together.
 * @extends NamespaceBase
 * @constructor
 * @param {Object.<string,*>} [options] Top level options
 */
function Root(options) {
    Namespace.call(this, "", options);

    /**
     * Deferred extension fields.
     * @type {Field[]}
     */
    this.deferred = [];

    /**
     * Resolved file names of loaded files.
     * @type {string[]}
     */
    this.files = [];
}

/**
 * Loads a namespace descriptor into a root namespace.
 * @param {INamespace} json Nameespace descriptor
 * @param {Root} [root] Root namespace, defaults to create a new one if omitted
 * @returns {Root} Root namespace
 */
Root.fromJSON = function fromJSON(json, root) {
    if (!root)
        root = new Root();
    if (json.options)
        root.setOptions(json.options);
    return root.addJSON(json.nested);
};

/**
 * Resolves the path of an imported file, relative to the importing origin.
 * This method exists so you can override it with your own logic in case your imports are scattered over multiple directories.
 * @function
 * @param {string} origin The file name of the importing file
 * @param {string} target The file name being imported
 * @returns {string|null} Resolved path to `target` or `null` to skip the file
 */
Root.prototype.resolvePath = util.path.resolve;

/**
 * Fetch content from file path or url
 * This method exists so you can override it with your own logic.
 * @function
 * @param {string} path File path or url
 * @param {FetchCallback} callback Callback function
 * @returns {undefined}
 */
Root.prototype.fetch = util.fetch;

// A symbol-like function to safely signal synchronous loading
/* istanbul ignore next */
function SYNC() {} // eslint-disable-line no-empty-function

/**
 * Loads one or multiple .proto or preprocessed .json files into this root namespace and calls the callback.
 * @param {string|string[]} filename Names of one or multiple files to load
 * @param {IParseOptions} options Parse options
 * @param {LoadCallback} callback Callback function
 * @returns {undefined}
 */
Root.prototype.load = function load(filename, options, callback) {
    if (typeof options === "function") {
        callback = options;
        options = undefined;
    }
    var self = this;
    if (!callback)
        return util.asPromise(load, self, filename, options);

    var sync = callback === SYNC; // undocumented

    // Finishes loading by calling the callback (exactly once)
    function finish(err, root) {
        /* istanbul ignore if */
        if (!callback)
            return;
        if (sync)
            throw err;
        var cb = callback;
        callback = null;
        cb(err, root);
    }

    // Bundled definition existence checking
    function getBundledFileName(filename) {
        var idx = filename.lastIndexOf("google/protobuf/");
        if (idx > -1) {
            var altname = filename.substring(idx);
            if (altname in common) return altname;
        }
        return null;
    }

    // Processes a single file
    function process(filename, source) {
        try {
            if (util.isString(source) && source.charAt(0) === "{")
                source = JSON.parse(source);
            if (!util.isString(source))
                self.setOptions(source.options).addJSON(source.nested);
            else {
                parse.filename = filename;
                var parsed = parse(source, self, options),
                    resolved,
                    i = 0;
                if (parsed.imports)
                    for (; i < parsed.imports.length; ++i)
                        if (resolved = getBundledFileName(parsed.imports[i]) || self.resolvePath(filename, parsed.imports[i]))
                            fetch(resolved);
                if (parsed.weakImports)
                    for (i = 0; i < parsed.weakImports.length; ++i)
                        if (resolved = getBundledFileName(parsed.weakImports[i]) || self.resolvePath(filename, parsed.weakImports[i]))
                            fetch(resolved, true);
            }
        } catch (err) {
            finish(err);
        }
        if (!sync && !queued)
            finish(null, self); // only once anyway
    }

    // Fetches a single file
    function fetch(filename, weak) {
        filename = getBundledFileName(filename) || filename;

        // Skip if already loaded / attempted
        if (self.files.indexOf(filename) > -1)
            return;
        self.files.push(filename);

        // Shortcut bundled definitions
        if (filename in common) {
            if (sync)
                process(filename, common[filename]);
            else {
                ++queued;
                setTimeout(function() {
                    --queued;
                    process(filename, common[filename]);
                });
            }
            return;
        }

        // Otherwise fetch from disk or network
        if (sync) {
            var source;
            try {
                source = util.fs.readFileSync(filename).toString("utf8");
            } catch (err) {
                if (!weak)
                    finish(err);
                return;
            }
            process(filename, source);
        } else {
            ++queued;
            self.fetch(filename, function(err, source) {
                --queued;
                /* istanbul ignore if */
                if (!callback)
                    return; // terminated meanwhile
                if (err) {
                    /* istanbul ignore else */
                    if (!weak)
                        finish(err);
                    else if (!queued) // can't be covered reliably
                        finish(null, self);
                    return;
                }
                process(filename, source);
            });
        }
    }
    var queued = 0;

    // Assembling the root namespace doesn't require working type
    // references anymore, so we can load everything in parallel
    if (util.isString(filename))
        filename = [ filename ];
    for (var i = 0, resolved; i < filename.length; ++i)
        if (resolved = self.resolvePath("", filename[i]))
            fetch(resolved);

    if (sync)
        return self;
    if (!queued)
        finish(null, self);
    return undefined;
};
// function load(filename:string, options:IParseOptions, callback:LoadCallback):undefined

/**
 * Loads one or multiple .proto or preprocessed .json files into this root namespace and calls the callback.
 * @function Root#load
 * @param {string|string[]} filename Names of one or multiple files to load
 * @param {LoadCallback} callback Callback function
 * @returns {undefined}
 * @variation 2
 */
// function load(filename:string, callback:LoadCallback):undefined

/**
 * Loads one or multiple .proto or preprocessed .json files into this root namespace and returns a promise.
 * @function Root#load
 * @param {string|string[]} filename Names of one or multiple files to load
 * @param {IParseOptions} [options] Parse options. Defaults to {@link parse.defaults} when omitted.
 * @returns {Promise<Root>} Promise
 * @variation 3
 */
// function load(filename:string, [options:IParseOptions]):Promise<Root>

/**
 * Synchronously loads one or multiple .proto or preprocessed .json files into this root namespace (node only).
 * @function Root#loadSync
 * @param {string|string[]} filename Names of one or multiple files to load
 * @param {IParseOptions} [options] Parse options. Defaults to {@link parse.defaults} when omitted.
 * @returns {Root} Root namespace
 * @throws {Error} If synchronous fetching is not supported (i.e. in browsers) or if a file's syntax is invalid
 */
Root.prototype.loadSync = function loadSync(filename, options) {
    if (!util.isNode)
        throw Error("not supported");
    return this.load(filename, options, SYNC);
};

/**
 * @override
 */
Root.prototype.resolveAll = function resolveAll() {
    if (this.deferred.length)
        throw Error("unresolvable extensions: " + this.deferred.map(function(field) {
            return "'extend " + field.extend + "' in " + field.parent.fullName;
        }).join(", "));
    return Namespace.prototype.resolveAll.call(this);
};

// only uppercased (and thus conflict-free) children are exposed, see below
var exposeRe = /^[A-Z]/;

/**
 * Handles a deferred declaring extension field by creating a sister field to represent it within its extended type.
 * @param {Root} root Root instance
 * @param {Field} field Declaring extension field witin the declaring type
 * @returns {boolean} `true` if successfully added to the extended type, `false` otherwise
 * @inner
 * @ignore
 */
function tryHandleExtension(root, field) {
    var extendedType = field.parent.lookup(field.extend);
    if (extendedType) {
        var sisterField = new Field(field.fullName, field.id, field.type, field.rule, undefined, field.options);
        //do not allow to extend same field twice to prevent the error
        if (extendedType.get(sisterField.name)) {
            return true;
        }
        sisterField.declaringField = field;
        field.extensionField = sisterField;
        extendedType.add(sisterField);
        return true;
    }
    return false;
}

/**
 * Called when any object is added to this root or its sub-namespaces.
 * @param {ReflectionObject} object Object added
 * @returns {undefined}
 * @private
 */
Root.prototype._handleAdd = function _handleAdd(object) {
    if (object instanceof Field) {

        if (/* an extension field (implies not part of a oneof) */ object.extend !== undefined && /* not already handled */ !object.extensionField)
            if (!tryHandleExtension(this, object))
                this.deferred.push(object);

    } else if (object instanceof Enum) {

        if (exposeRe.test(object.name))
            object.parent[object.name] = object.values; // expose enum values as property of its parent

    } else if (!(object instanceof OneOf)) /* everything else is a namespace */ {

        if (object instanceof Type) // Try to handle any deferred extensions
            for (var i = 0; i < this.deferred.length;)
                if (tryHandleExtension(this, this.deferred[i]))
                    this.deferred.splice(i, 1);
                else
                    ++i;
        for (var j = 0; j < /* initializes */ object.nestedArray.length; ++j) // recurse into the namespace
            this._handleAdd(object._nestedArray[j]);
        if (exposeRe.test(object.name))
            object.parent[object.name] = object; // expose namespace as property of its parent
    }

    // The above also adds uppercased (and thus conflict-free) nested types, services and enums as
    // properties of namespaces just like static code does. This allows using a .d.ts generated for
    // a static module with reflection-based solutions where the condition is met.
};

/**
 * Called when any object is removed from this root or its sub-namespaces.
 * @param {ReflectionObject} object Object removed
 * @returns {undefined}
 * @private
 */
Root.prototype._handleRemove = function _handleRemove(object) {
    if (object instanceof Field) {

        if (/* an extension field */ object.extend !== undefined) {
            if (/* already handled */ object.extensionField) { // remove its sister field
                object.extensionField.parent.remove(object.extensionField);
                object.extensionField = null;
            } else { // cancel the extension
                var index = this.deferred.indexOf(object);
                /* istanbul ignore else */
                if (index > -1)
                    this.deferred.splice(index, 1);
            }
        }

    } else if (object instanceof Enum) {

        if (exposeRe.test(object.name))
            delete object.parent[object.name]; // unexpose enum values

    } else if (object instanceof Namespace) {

        for (var i = 0; i < /* initializes */ object.nestedArray.length; ++i) // recurse into the namespace
            this._handleRemove(object._nestedArray[i]);

        if (exposeRe.test(object.name))
            delete object.parent[object.name]; // unexpose namespaces

    }
};

// Sets up cyclic dependencies (called in index-light)
Root._configure = function(Type_, parse_, common_) {
    Type   = Type_;
    parse  = parse_;
    common = common_;
};


/***/ }),

/***/ 7604:
/***/ ((module) => {

"use strict";

module.exports = {};

/**
 * Named roots.
 * This is where pbjs stores generated structures (the option `-r, --root` specifies a name).
 * Can also be used manually to make roots available across modules.
 * @name roots
 * @type {Object.<string,Root>}
 * @example
 * // pbjs -r myroot -o compiled.js ...
 *
 * // in another module:
 * require("./compiled.js");
 *
 * // in any subsequent module:
 * var root = protobuf.roots["myroot"];
 */


/***/ }),

/***/ 272:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


/**
 * Streaming RPC helpers.
 * @namespace
 */
var rpc = exports;

/**
 * RPC implementation passed to {@link Service#create} performing a service request on network level, i.e. by utilizing http requests or websockets.
 * @typedef RPCImpl
 * @type {function}
 * @param {Method|rpc.ServiceMethod<Message<{}>,Message<{}>>} method Reflected or static method being called
 * @param {Uint8Array} requestData Request data
 * @param {RPCImplCallback} callback Callback function
 * @returns {undefined}
 * @example
 * function rpcImpl(method, requestData, callback) {
 *     if (protobuf.util.lcFirst(method.name) !== "myMethod") // compatible with static code
 *         throw Error("no such method");
 *     asynchronouslyObtainAResponse(requestData, function(err, responseData) {
 *         callback(err, responseData);
 *     });
 * }
 */

/**
 * Node-style callback as used by {@link RPCImpl}.
 * @typedef RPCImplCallback
 * @type {function}
 * @param {Error|null} error Error, if any, otherwise `null`
 * @param {Uint8Array|null} [response] Response data or `null` to signal end of stream, if there hasn't been an error
 * @returns {undefined}
 */

rpc.Service = __webpack_require__(7368);


/***/ }),

/***/ 7368:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Service;

var util = __webpack_require__(2280);

// Extends EventEmitter
(Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;

/**
 * A service method callback as used by {@link rpc.ServiceMethod|ServiceMethod}.
 *
 * Differs from {@link RPCImplCallback} in that it is an actual callback of a service method which may not return `response = null`.
 * @typedef rpc.ServiceMethodCallback
 * @template TRes extends Message<TRes>
 * @type {function}
 * @param {Error|null} error Error, if any
 * @param {TRes} [response] Response message
 * @returns {undefined}
 */

/**
 * A service method part of a {@link rpc.Service} as created by {@link Service.create}.
 * @typedef rpc.ServiceMethod
 * @template TReq extends Message<TReq>
 * @template TRes extends Message<TRes>
 * @type {function}
 * @param {TReq|Properties<TReq>} request Request message or plain object
 * @param {rpc.ServiceMethodCallback<TRes>} [callback] Node-style callback called with the error, if any, and the response message
 * @returns {Promise<Message<TRes>>} Promise if `callback` has been omitted, otherwise `undefined`
 */

/**
 * Constructs a new RPC service instance.
 * @classdesc An RPC service as returned by {@link Service#create}.
 * @exports rpc.Service
 * @extends util.EventEmitter
 * @constructor
 * @param {RPCImpl} rpcImpl RPC implementation
 * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
 * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
 */
function Service(rpcImpl, requestDelimited, responseDelimited) {

    if (typeof rpcImpl !== "function")
        throw TypeError("rpcImpl must be a function");

    util.EventEmitter.call(this);

    /**
     * RPC implementation. Becomes `null` once the service is ended.
     * @type {RPCImpl|null}
     */
    this.rpcImpl = rpcImpl;

    /**
     * Whether requests are length-delimited.
     * @type {boolean}
     */
    this.requestDelimited = Boolean(requestDelimited);

    /**
     * Whether responses are length-delimited.
     * @type {boolean}
     */
    this.responseDelimited = Boolean(responseDelimited);
}

/**
 * Calls a service method through {@link rpc.Service#rpcImpl|rpcImpl}.
 * @param {Method|rpc.ServiceMethod<TReq,TRes>} method Reflected or static method
 * @param {Constructor<TReq>} requestCtor Request constructor
 * @param {Constructor<TRes>} responseCtor Response constructor
 * @param {TReq|Properties<TReq>} request Request message or plain object
 * @param {rpc.ServiceMethodCallback<TRes>} callback Service callback
 * @returns {undefined}
 * @template TReq extends Message<TReq>
 * @template TRes extends Message<TRes>
 */
Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {

    if (!request)
        throw TypeError("request must be specified");

    var self = this;
    if (!callback)
        return util.asPromise(rpcCall, self, method, requestCtor, responseCtor, request);

    if (!self.rpcImpl) {
        setTimeout(function() { callback(Error("already ended")); }, 0);
        return undefined;
    }

    try {
        return self.rpcImpl(
            method,
            requestCtor[self.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
            function rpcCallback(err, response) {

                if (err) {
                    self.emit("error", err, method);
                    return callback(err);
                }

                if (response === null) {
                    self.end(/* endedByRPC */ true);
                    return undefined;
                }

                if (!(response instanceof responseCtor)) {
                    try {
                        response = responseCtor[self.responseDelimited ? "decodeDelimited" : "decode"](response);
                    } catch (err) {
                        self.emit("error", err, method);
                        return callback(err);
                    }
                }

                self.emit("data", response, method);
                return callback(null, response);
            }
        );
    } catch (err) {
        self.emit("error", err, method);
        setTimeout(function() { callback(err); }, 0);
        return undefined;
    }
};

/**
 * Ends this service and emits the `end` event.
 * @param {boolean} [endedByRPC=false] Whether the service has been ended by the RPC implementation.
 * @returns {rpc.Service} `this`
 */
Service.prototype.end = function end(endedByRPC) {
    if (this.rpcImpl) {
        if (!endedByRPC) // signal end to rpcImpl
            this.rpcImpl(null, null, null);
        this.rpcImpl = null;
        this.emit("end").off();
    }
    return this;
};


/***/ }),

/***/ 5160:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Service;

// extends Namespace
var Namespace = __webpack_require__(5820);
((Service.prototype = Object.create(Namespace.prototype)).constructor = Service).className = "Service";

var Method = __webpack_require__(2592),
    util   = __webpack_require__(888),
    rpc    = __webpack_require__(272);

/**
 * Constructs a new service instance.
 * @classdesc Reflected service.
 * @extends NamespaceBase
 * @constructor
 * @param {string} name Service name
 * @param {Object.<string,*>} [options] Service options
 * @throws {TypeError} If arguments are invalid
 */
function Service(name, options) {
    Namespace.call(this, name, options);

    /**
     * Service methods.
     * @type {Object.<string,Method>}
     */
    this.methods = {}; // toJSON, marker

    /**
     * Cached methods as an array.
     * @type {Method[]|null}
     * @private
     */
    this._methodsArray = null;
}

/**
 * Service descriptor.
 * @interface IService
 * @extends INamespace
 * @property {Object.<string,IMethod>} methods Method descriptors
 */

/**
 * Constructs a service from a service descriptor.
 * @param {string} name Service name
 * @param {IService} json Service descriptor
 * @returns {Service} Created service
 * @throws {TypeError} If arguments are invalid
 */
Service.fromJSON = function fromJSON(name, json) {
    var service = new Service(name, json.options);
    /* istanbul ignore else */
    if (json.methods)
        for (var names = Object.keys(json.methods), i = 0; i < names.length; ++i)
            service.add(Method.fromJSON(names[i], json.methods[names[i]]));
    if (json.nested)
        service.addJSON(json.nested);
    service.comment = json.comment;
    return service;
};

/**
 * Converts this service to a service descriptor.
 * @param {IToJSONOptions} [toJSONOptions] JSON conversion options
 * @returns {IService} Service descriptor
 */
Service.prototype.toJSON = function toJSON(toJSONOptions) {
    var inherited = Namespace.prototype.toJSON.call(this, toJSONOptions);
    var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
    return util.toObject([
        "options" , inherited && inherited.options || undefined,
        "methods" , Namespace.arrayToJSON(this.methodsArray, toJSONOptions) || /* istanbul ignore next */ {},
        "nested"  , inherited && inherited.nested || undefined,
        "comment" , keepComments ? this.comment : undefined
    ]);
};

/**
 * Methods of this service as an array for iteration.
 * @name Service#methodsArray
 * @type {Method[]}
 * @readonly
 */
Object.defineProperty(Service.prototype, "methodsArray", {
    get: function() {
        return this._methodsArray || (this._methodsArray = util.toArray(this.methods));
    }
});

function clearCache(service) {
    service._methodsArray = null;
    return service;
}

/**
 * @override
 */
Service.prototype.get = function get(name) {
    return this.methods[name]
        || Namespace.prototype.get.call(this, name);
};

/**
 * @override
 */
Service.prototype.resolveAll = function resolveAll() {
    var methods = this.methodsArray;
    for (var i = 0; i < methods.length; ++i)
        methods[i].resolve();
    return Namespace.prototype.resolve.call(this);
};

/**
 * @override
 */
Service.prototype.add = function add(object) {

    /* istanbul ignore if */
    if (this.get(object.name))
        throw Error("duplicate name '" + object.name + "' in " + this);

    if (object instanceof Method) {
        this.methods[object.name] = object;
        object.parent = this;
        return clearCache(this);
    }
    return Namespace.prototype.add.call(this, object);
};

/**
 * @override
 */
Service.prototype.remove = function remove(object) {
    if (object instanceof Method) {

        /* istanbul ignore if */
        if (this.methods[object.name] !== object)
            throw Error(object + " is not a member of " + this);

        delete this.methods[object.name];
        object.parent = null;
        return clearCache(this);
    }
    return Namespace.prototype.remove.call(this, object);
};

/**
 * Creates a runtime service using the specified rpc implementation.
 * @param {RPCImpl} rpcImpl RPC implementation
 * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
 * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
 * @returns {rpc.Service} RPC service. Useful where requests and/or responses are streamed.
 */
Service.prototype.create = function create(rpcImpl, requestDelimited, responseDelimited) {
    var rpcService = new rpc.Service(rpcImpl, requestDelimited, responseDelimited);
    for (var i = 0, method; i < /* initializes */ this.methodsArray.length; ++i) {
        var methodName = util.lcFirst((method = this._methodsArray[i]).resolve().name).replace(/[^$\w_]/g, "");
        rpcService[methodName] = util.codegen(["r","c"], util.isReserved(methodName) ? methodName + "_" : methodName)("return this.rpcCall(m,q,s,r,c)")({
            m: method,
            q: method.resolvedRequestType.ctor,
            s: method.resolvedResponseType.ctor
        });
    }
    return rpcService;
};


/***/ }),

/***/ 6039:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Type;

// extends Namespace
var Namespace = __webpack_require__(5820);
((Type.prototype = Object.create(Namespace.prototype)).constructor = Type).className = "Type";

var Enum      = __webpack_require__(8432),
    OneOf     = __webpack_require__(3704),
    Field     = __webpack_require__(1372),
    MapField  = __webpack_require__(8344),
    Service   = __webpack_require__(5160),
    Message   = __webpack_require__(2020),
    Reader    = __webpack_require__(196),
    Writer    = __webpack_require__(3720),
    util      = __webpack_require__(888),
    encoder   = __webpack_require__(1808),
    decoder   = __webpack_require__(8960),
    verifier  = __webpack_require__(5496),
    converter = __webpack_require__(6040),
    wrappers  = __webpack_require__(4224);

/**
 * Constructs a new reflected message type instance.
 * @classdesc Reflected message type.
 * @extends NamespaceBase
 * @constructor
 * @param {string} name Message name
 * @param {Object.<string,*>} [options] Declared options
 */
function Type(name, options) {
    Namespace.call(this, name, options);

    /**
     * Message fields.
     * @type {Object.<string,Field>}
     */
    this.fields = {};  // toJSON, marker

    /**
     * Oneofs declared within this namespace, if any.
     * @type {Object.<string,OneOf>}
     */
    this.oneofs = undefined; // toJSON

    /**
     * Extension ranges, if any.
     * @type {number[][]}
     */
    this.extensions = undefined; // toJSON

    /**
     * Reserved ranges, if any.
     * @type {Array.<number[]|string>}
     */
    this.reserved = undefined; // toJSON

    /*?
     * Whether this type is a legacy group.
     * @type {boolean|undefined}
     */
    this.group = undefined; // toJSON

    /**
     * Cached fields by id.
     * @type {Object.<number,Field>|null}
     * @private
     */
    this._fieldsById = null;

    /**
     * Cached fields as an array.
     * @type {Field[]|null}
     * @private
     */
    this._fieldsArray = null;

    /**
     * Cached oneofs as an array.
     * @type {OneOf[]|null}
     * @private
     */
    this._oneofsArray = null;

    /**
     * Cached constructor.
     * @type {Constructor<{}>}
     * @private
     */
    this._ctor = null;
}

Object.defineProperties(Type.prototype, {

    /**
     * Message fields by id.
     * @name Type#fieldsById
     * @type {Object.<number,Field>}
     * @readonly
     */
    fieldsById: {
        get: function() {

            /* istanbul ignore if */
            if (this._fieldsById)
                return this._fieldsById;

            this._fieldsById = {};
            for (var names = Object.keys(this.fields), i = 0; i < names.length; ++i) {
                var field = this.fields[names[i]],
                    id = field.id;

                /* istanbul ignore if */
                if (this._fieldsById[id])
                    throw Error("duplicate id " + id + " in " + this);

                this._fieldsById[id] = field;
            }
            return this._fieldsById;
        }
    },

    /**
     * Fields of this message as an array for iteration.
     * @name Type#fieldsArray
     * @type {Field[]}
     * @readonly
     */
    fieldsArray: {
        get: function() {
            return this._fieldsArray || (this._fieldsArray = util.toArray(this.fields));
        }
    },

    /**
     * Oneofs of this message as an array for iteration.
     * @name Type#oneofsArray
     * @type {OneOf[]}
     * @readonly
     */
    oneofsArray: {
        get: function() {
            return this._oneofsArray || (this._oneofsArray = util.toArray(this.oneofs));
        }
    },

    /**
     * The registered constructor, if any registered, otherwise a generic constructor.
     * Assigning a function replaces the internal constructor. If the function does not extend {@link Message} yet, its prototype will be setup accordingly and static methods will be populated. If it already extends {@link Message}, it will just replace the internal constructor.
     * @name Type#ctor
     * @type {Constructor<{}>}
     */
    ctor: {
        get: function() {
            return this._ctor || (this.ctor = Type.generateConstructor(this)());
        },
        set: function(ctor) {

            // Ensure proper prototype
            var prototype = ctor.prototype;
            if (!(prototype instanceof Message)) {
                (ctor.prototype = new Message()).constructor = ctor;
                util.merge(ctor.prototype, prototype);
            }

            // Classes and messages reference their reflected type
            ctor.$type = ctor.prototype.$type = this;

            // Mix in static methods
            util.merge(ctor, Message, true);

            this._ctor = ctor;

            // Messages have non-enumerable default values on their prototype
            var i = 0;
            for (; i < /* initializes */ this.fieldsArray.length; ++i)
                this._fieldsArray[i].resolve(); // ensures a proper value

            // Messages have non-enumerable getters and setters for each virtual oneof field
            var ctorProperties = {};
            for (i = 0; i < /* initializes */ this.oneofsArray.length; ++i)
                ctorProperties[this._oneofsArray[i].resolve().name] = {
                    get: util.oneOfGetter(this._oneofsArray[i].oneof),
                    set: util.oneOfSetter(this._oneofsArray[i].oneof)
                };
            if (i)
                Object.defineProperties(ctor.prototype, ctorProperties);
        }
    }
});

/**
 * Generates a constructor function for the specified type.
 * @param {Type} mtype Message type
 * @returns {Codegen} Codegen instance
 */
Type.generateConstructor = function generateConstructor(mtype) {
    /* eslint-disable no-unexpected-multiline */
    var gen = util.codegen(["p"], mtype.name);
    // explicitly initialize mutable object/array fields so that these aren't just inherited from the prototype
    for (var i = 0, field; i < mtype.fieldsArray.length; ++i)
        if ((field = mtype._fieldsArray[i]).map) gen
            ("this%s={}", util.safeProp(field.name));
        else if (field.repeated) gen
            ("this%s=[]", util.safeProp(field.name));
    return gen
    ("if(p)for(var ks=Object.keys(p),i=0;i<ks.length;++i)if(p[ks[i]]!=null)") // omit undefined or null
        ("this[ks[i]]=p[ks[i]]");
    /* eslint-enable no-unexpected-multiline */
};

function clearCache(type) {
    type._fieldsById = type._fieldsArray = type._oneofsArray = null;
    delete type.encode;
    delete type.decode;
    delete type.verify;
    return type;
}

/**
 * Message type descriptor.
 * @interface IType
 * @extends INamespace
 * @property {Object.<string,IOneOf>} [oneofs] Oneof descriptors
 * @property {Object.<string,IField>} fields Field descriptors
 * @property {number[][]} [extensions] Extension ranges
 * @property {number[][]} [reserved] Reserved ranges
 * @property {boolean} [group=false] Whether a legacy group or not
 */

/**
 * Creates a message type from a message type descriptor.
 * @param {string} name Message name
 * @param {IType} json Message type descriptor
 * @returns {Type} Created message type
 */
Type.fromJSON = function fromJSON(name, json) {
    var type = new Type(name, json.options);
    type.extensions = json.extensions;
    type.reserved = json.reserved;
    var names = Object.keys(json.fields),
        i = 0;
    for (; i < names.length; ++i)
        type.add(
            ( typeof json.fields[names[i]].keyType !== "undefined"
            ? MapField.fromJSON
            : Field.fromJSON )(names[i], json.fields[names[i]])
        );
    if (json.oneofs)
        for (names = Object.keys(json.oneofs), i = 0; i < names.length; ++i)
            type.add(OneOf.fromJSON(names[i], json.oneofs[names[i]]));
    if (json.nested)
        for (names = Object.keys(json.nested), i = 0; i < names.length; ++i) {
            var nested = json.nested[names[i]];
            type.add( // most to least likely
                ( nested.id !== undefined
                ? Field.fromJSON
                : nested.fields !== undefined
                ? Type.fromJSON
                : nested.values !== undefined
                ? Enum.fromJSON
                : nested.methods !== undefined
                ? Service.fromJSON
                : Namespace.fromJSON )(names[i], nested)
            );
        }
    if (json.extensions && json.extensions.length)
        type.extensions = json.extensions;
    if (json.reserved && json.reserved.length)
        type.reserved = json.reserved;
    if (json.group)
        type.group = true;
    if (json.comment)
        type.comment = json.comment;
    return type;
};

/**
 * Converts this message type to a message type descriptor.
 * @param {IToJSONOptions} [toJSONOptions] JSON conversion options
 * @returns {IType} Message type descriptor
 */
Type.prototype.toJSON = function toJSON(toJSONOptions) {
    var inherited = Namespace.prototype.toJSON.call(this, toJSONOptions);
    var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
    return util.toObject([
        "options"    , inherited && inherited.options || undefined,
        "oneofs"     , Namespace.arrayToJSON(this.oneofsArray, toJSONOptions),
        "fields"     , Namespace.arrayToJSON(this.fieldsArray.filter(function(obj) { return !obj.declaringField; }), toJSONOptions) || {},
        "extensions" , this.extensions && this.extensions.length ? this.extensions : undefined,
        "reserved"   , this.reserved && this.reserved.length ? this.reserved : undefined,
        "group"      , this.group || undefined,
        "nested"     , inherited && inherited.nested || undefined,
        "comment"    , keepComments ? this.comment : undefined
    ]);
};

/**
 * @override
 */
Type.prototype.resolveAll = function resolveAll() {
    var fields = this.fieldsArray, i = 0;
    while (i < fields.length)
        fields[i++].resolve();
    var oneofs = this.oneofsArray; i = 0;
    while (i < oneofs.length)
        oneofs[i++].resolve();
    return Namespace.prototype.resolveAll.call(this);
};

/**
 * @override
 */
Type.prototype.get = function get(name) {
    return this.fields[name]
        || this.oneofs && this.oneofs[name]
        || this.nested && this.nested[name]
        || null;
};

/**
 * Adds a nested object to this type.
 * @param {ReflectionObject} object Nested object to add
 * @returns {Type} `this`
 * @throws {TypeError} If arguments are invalid
 * @throws {Error} If there is already a nested object with this name or, if a field, when there is already a field with this id
 */
Type.prototype.add = function add(object) {

    if (this.get(object.name))
        throw Error("duplicate name '" + object.name + "' in " + this);

    if (object instanceof Field && object.extend === undefined) {
        // NOTE: Extension fields aren't actual fields on the declaring type, but nested objects.
        // The root object takes care of adding distinct sister-fields to the respective extended
        // type instead.

        // avoids calling the getter if not absolutely necessary because it's called quite frequently
        if (this._fieldsById ? /* istanbul ignore next */ this._fieldsById[object.id] : this.fieldsById[object.id])
            throw Error("duplicate id " + object.id + " in " + this);
        if (this.isReservedId(object.id))
            throw Error("id " + object.id + " is reserved in " + this);
        if (this.isReservedName(object.name))
            throw Error("name '" + object.name + "' is reserved in " + this);

        if (object.parent)
            object.parent.remove(object);
        this.fields[object.name] = object;
        object.message = this;
        object.onAdd(this);
        return clearCache(this);
    }
    if (object instanceof OneOf) {
        if (!this.oneofs)
            this.oneofs = {};
        this.oneofs[object.name] = object;
        object.onAdd(this);
        return clearCache(this);
    }
    return Namespace.prototype.add.call(this, object);
};

/**
 * Removes a nested object from this type.
 * @param {ReflectionObject} object Nested object to remove
 * @returns {Type} `this`
 * @throws {TypeError} If arguments are invalid
 * @throws {Error} If `object` is not a member of this type
 */
Type.prototype.remove = function remove(object) {
    if (object instanceof Field && object.extend === undefined) {
        // See Type#add for the reason why extension fields are excluded here.

        /* istanbul ignore if */
        if (!this.fields || this.fields[object.name] !== object)
            throw Error(object + " is not a member of " + this);

        delete this.fields[object.name];
        object.parent = null;
        object.onRemove(this);
        return clearCache(this);
    }
    if (object instanceof OneOf) {

        /* istanbul ignore if */
        if (!this.oneofs || this.oneofs[object.name] !== object)
            throw Error(object + " is not a member of " + this);

        delete this.oneofs[object.name];
        object.parent = null;
        object.onRemove(this);
        return clearCache(this);
    }
    return Namespace.prototype.remove.call(this, object);
};

/**
 * Tests if the specified id is reserved.
 * @param {number} id Id to test
 * @returns {boolean} `true` if reserved, otherwise `false`
 */
Type.prototype.isReservedId = function isReservedId(id) {
    return Namespace.isReservedId(this.reserved, id);
};

/**
 * Tests if the specified name is reserved.
 * @param {string} name Name to test
 * @returns {boolean} `true` if reserved, otherwise `false`
 */
Type.prototype.isReservedName = function isReservedName(name) {
    return Namespace.isReservedName(this.reserved, name);
};

/**
 * Creates a new message of this type using the specified properties.
 * @param {Object.<string,*>} [properties] Properties to set
 * @returns {Message<{}>} Message instance
 */
Type.prototype.create = function create(properties) {
    return new this.ctor(properties);
};

/**
 * Sets up {@link Type#encode|encode}, {@link Type#decode|decode} and {@link Type#verify|verify}.
 * @returns {Type} `this`
 */
Type.prototype.setup = function setup() {
    // Sets up everything at once so that the prototype chain does not have to be re-evaluated
    // multiple times (V8, soft-deopt prototype-check).

    var fullName = this.fullName,
        types    = [];
    for (var i = 0; i < /* initializes */ this.fieldsArray.length; ++i)
        types.push(this._fieldsArray[i].resolve().resolvedType);

    // Replace setup methods with type-specific generated functions
    this.encode = encoder(this)({
        Writer : Writer,
        types  : types,
        util   : util
    });
    this.decode = decoder(this)({
        Reader : Reader,
        types  : types,
        util   : util
    });
    this.verify = verifier(this)({
        types : types,
        util  : util
    });
    this.fromObject = converter.fromObject(this)({
        types : types,
        util  : util
    });
    this.toObject = converter.toObject(this)({
        types : types,
        util  : util
    });

    // Inject custom wrappers for common types
    var wrapper = wrappers[fullName];
    if (wrapper) {
        var originalThis = Object.create(this);
        // if (wrapper.fromObject) {
            originalThis.fromObject = this.fromObject;
            this.fromObject = wrapper.fromObject.bind(originalThis);
        // }
        // if (wrapper.toObject) {
            originalThis.toObject = this.toObject;
            this.toObject = wrapper.toObject.bind(originalThis);
        // }
    }

    return this;
};

/**
 * Encodes a message of this type. Does not implicitly {@link Type#verify|verify} messages.
 * @param {Message<{}>|Object.<string,*>} message Message instance or plain object
 * @param {Writer} [writer] Writer to encode to
 * @returns {Writer} writer
 */
Type.prototype.encode = function encode_setup(message, writer) {
    return this.setup().encode(message, writer); // overrides this method
};

/**
 * Encodes a message of this type preceeded by its byte length as a varint. Does not implicitly {@link Type#verify|verify} messages.
 * @param {Message<{}>|Object.<string,*>} message Message instance or plain object
 * @param {Writer} [writer] Writer to encode to
 * @returns {Writer} writer
 */
Type.prototype.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
};

/**
 * Decodes a message of this type.
 * @param {Reader|Uint8Array} reader Reader or buffer to decode from
 * @param {number} [length] Length of the message, if known beforehand
 * @returns {Message<{}>} Decoded message
 * @throws {Error} If the payload is not a reader or valid buffer
 * @throws {util.ProtocolError<{}>} If required fields are missing
 */
Type.prototype.decode = function decode_setup(reader, length) {
    return this.setup().decode(reader, length); // overrides this method
};

/**
 * Decodes a message of this type preceeded by its byte length as a varint.
 * @param {Reader|Uint8Array} reader Reader or buffer to decode from
 * @returns {Message<{}>} Decoded message
 * @throws {Error} If the payload is not a reader or valid buffer
 * @throws {util.ProtocolError} If required fields are missing
 */
Type.prototype.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof Reader))
        reader = Reader.create(reader);
    return this.decode(reader, reader.uint32());
};

/**
 * Verifies that field values are valid and that required fields are present.
 * @param {Object.<string,*>} message Plain object to verify
 * @returns {null|string} `null` if valid, otherwise the reason why it is not
 */
Type.prototype.verify = function verify_setup(message) {
    return this.setup().verify(message); // overrides this method
};

/**
 * Creates a new message of this type from a plain object. Also converts values to their respective internal types.
 * @param {Object.<string,*>} object Plain object to convert
 * @returns {Message<{}>} Message instance
 */
Type.prototype.fromObject = function fromObject(object) {
    return this.setup().fromObject(object);
};

/**
 * Conversion options as used by {@link Type#toObject} and {@link Message.toObject}.
 * @interface IConversionOptions
 * @property {Function} [longs] Long conversion type.
 * Valid values are `String` and `Number` (the global types).
 * Defaults to copy the present value, which is a possibly unsafe number without and a {@link Long} with a long library.
 * @property {Function} [enums] Enum value conversion type.
 * Only valid value is `String` (the global type).
 * Defaults to copy the present value, which is the numeric id.
 * @property {Function} [bytes] Bytes value conversion type.
 * Valid values are `Array` and (a base64 encoded) `String` (the global types).
 * Defaults to copy the present value, which usually is a Buffer under node and an Uint8Array in the browser.
 * @property {boolean} [defaults=false] Also sets default values on the resulting object
 * @property {boolean} [arrays=false] Sets empty arrays for missing repeated fields even if `defaults=false`
 * @property {boolean} [objects=false] Sets empty objects for missing map fields even if `defaults=false`
 * @property {boolean} [oneofs=false] Includes virtual oneof properties set to the present field's name, if any
 * @property {boolean} [json=false] Performs additional JSON compatibility conversions, i.e. NaN and Infinity to strings
 */

/**
 * Creates a plain object from a message of this type. Also converts values to other types if specified.
 * @param {Message<{}>} message Message instance
 * @param {IConversionOptions} [options] Conversion options
 * @returns {Object.<string,*>} Plain object
 */
Type.prototype.toObject = function toObject(message, options) {
    return this.setup().toObject(message, options);
};

/**
 * Decorator function as returned by {@link Type.d} (TypeScript).
 * @typedef TypeDecorator
 * @type {function}
 * @param {Constructor<T>} target Target constructor
 * @returns {undefined}
 * @template T extends Message<T>
 */

/**
 * Type decorator (TypeScript).
 * @param {string} [typeName] Type name, defaults to the constructor's name
 * @returns {TypeDecorator<T>} Decorator function
 * @template T extends Message<T>
 */
Type.d = function decorateType(typeName) {
    return function typeDecorator(target) {
        util.decorateType(target, typeName);
    };
};


/***/ }),

/***/ 8443:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


/**
 * Common type constants.
 * @namespace
 */
var types = exports;

var util = __webpack_require__(888);

var s = [
    "double",   // 0
    "float",    // 1
    "int32",    // 2
    "uint32",   // 3
    "sint32",   // 4
    "fixed32",  // 5
    "sfixed32", // 6
    "int64",    // 7
    "uint64",   // 8
    "sint64",   // 9
    "fixed64",  // 10
    "sfixed64", // 11
    "bool",     // 12
    "string",   // 13
    "bytes"     // 14
];

function bake(values, offset) {
    var i = 0, o = {};
    offset |= 0;
    while (i < values.length) o[s[i + offset]] = values[i++];
    return o;
}

/**
 * Basic type wire types.
 * @type {Object.<string,number>}
 * @const
 * @property {number} double=1 Fixed64 wire type
 * @property {number} float=5 Fixed32 wire type
 * @property {number} int32=0 Varint wire type
 * @property {number} uint32=0 Varint wire type
 * @property {number} sint32=0 Varint wire type
 * @property {number} fixed32=5 Fixed32 wire type
 * @property {number} sfixed32=5 Fixed32 wire type
 * @property {number} int64=0 Varint wire type
 * @property {number} uint64=0 Varint wire type
 * @property {number} sint64=0 Varint wire type
 * @property {number} fixed64=1 Fixed64 wire type
 * @property {number} sfixed64=1 Fixed64 wire type
 * @property {number} bool=0 Varint wire type
 * @property {number} string=2 Ldelim wire type
 * @property {number} bytes=2 Ldelim wire type
 */
types.basic = bake([
    /* double   */ 1,
    /* float    */ 5,
    /* int32    */ 0,
    /* uint32   */ 0,
    /* sint32   */ 0,
    /* fixed32  */ 5,
    /* sfixed32 */ 5,
    /* int64    */ 0,
    /* uint64   */ 0,
    /* sint64   */ 0,
    /* fixed64  */ 1,
    /* sfixed64 */ 1,
    /* bool     */ 0,
    /* string   */ 2,
    /* bytes    */ 2
]);

/**
 * Basic type defaults.
 * @type {Object.<string,*>}
 * @const
 * @property {number} double=0 Double default
 * @property {number} float=0 Float default
 * @property {number} int32=0 Int32 default
 * @property {number} uint32=0 Uint32 default
 * @property {number} sint32=0 Sint32 default
 * @property {number} fixed32=0 Fixed32 default
 * @property {number} sfixed32=0 Sfixed32 default
 * @property {number} int64=0 Int64 default
 * @property {number} uint64=0 Uint64 default
 * @property {number} sint64=0 Sint32 default
 * @property {number} fixed64=0 Fixed64 default
 * @property {number} sfixed64=0 Sfixed64 default
 * @property {boolean} bool=false Bool default
 * @property {string} string="" String default
 * @property {Array.<number>} bytes=Array(0) Bytes default
 * @property {null} message=null Message default
 */
types.defaults = bake([
    /* double   */ 0,
    /* float    */ 0,
    /* int32    */ 0,
    /* uint32   */ 0,
    /* sint32   */ 0,
    /* fixed32  */ 0,
    /* sfixed32 */ 0,
    /* int64    */ 0,
    /* uint64   */ 0,
    /* sint64   */ 0,
    /* fixed64  */ 0,
    /* sfixed64 */ 0,
    /* bool     */ false,
    /* string   */ "",
    /* bytes    */ util.emptyArray,
    /* message  */ null
]);

/**
 * Basic long type wire types.
 * @type {Object.<string,number>}
 * @const
 * @property {number} int64=0 Varint wire type
 * @property {number} uint64=0 Varint wire type
 * @property {number} sint64=0 Varint wire type
 * @property {number} fixed64=1 Fixed64 wire type
 * @property {number} sfixed64=1 Fixed64 wire type
 */
types.long = bake([
    /* int64    */ 0,
    /* uint64   */ 0,
    /* sint64   */ 0,
    /* fixed64  */ 1,
    /* sfixed64 */ 1
], 7);

/**
 * Allowed types for map keys with their associated wire type.
 * @type {Object.<string,number>}
 * @const
 * @property {number} int32=0 Varint wire type
 * @property {number} uint32=0 Varint wire type
 * @property {number} sint32=0 Varint wire type
 * @property {number} fixed32=5 Fixed32 wire type
 * @property {number} sfixed32=5 Fixed32 wire type
 * @property {number} int64=0 Varint wire type
 * @property {number} uint64=0 Varint wire type
 * @property {number} sint64=0 Varint wire type
 * @property {number} fixed64=1 Fixed64 wire type
 * @property {number} sfixed64=1 Fixed64 wire type
 * @property {number} bool=0 Varint wire type
 * @property {number} string=2 Ldelim wire type
 */
types.mapKey = bake([
    /* int32    */ 0,
    /* uint32   */ 0,
    /* sint32   */ 0,
    /* fixed32  */ 5,
    /* sfixed32 */ 5,
    /* int64    */ 0,
    /* uint64   */ 0,
    /* sint64   */ 0,
    /* fixed64  */ 1,
    /* sfixed64 */ 1,
    /* bool     */ 0,
    /* string   */ 2
], 2);

/**
 * Allowed types for packed repeated fields with their associated wire type.
 * @type {Object.<string,number>}
 * @const
 * @property {number} double=1 Fixed64 wire type
 * @property {number} float=5 Fixed32 wire type
 * @property {number} int32=0 Varint wire type
 * @property {number} uint32=0 Varint wire type
 * @property {number} sint32=0 Varint wire type
 * @property {number} fixed32=5 Fixed32 wire type
 * @property {number} sfixed32=5 Fixed32 wire type
 * @property {number} int64=0 Varint wire type
 * @property {number} uint64=0 Varint wire type
 * @property {number} sint64=0 Varint wire type
 * @property {number} fixed64=1 Fixed64 wire type
 * @property {number} sfixed64=1 Fixed64 wire type
 * @property {number} bool=0 Varint wire type
 */
types.packed = bake([
    /* double   */ 1,
    /* float    */ 5,
    /* int32    */ 0,
    /* uint32   */ 0,
    /* sint32   */ 0,
    /* fixed32  */ 5,
    /* sfixed32 */ 5,
    /* int64    */ 0,
    /* uint64   */ 0,
    /* sint64   */ 0,
    /* fixed64  */ 1,
    /* sfixed64 */ 1,
    /* bool     */ 0
]);


/***/ }),

/***/ 888:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/**
 * Various utility functions.
 * @namespace
 */
var util = module.exports = __webpack_require__(2280);

var roots = __webpack_require__(7604);

var Type, // cyclic
    Enum;

util.codegen = __webpack_require__(9596);
util.fetch   = __webpack_require__(4916);
util.path    = __webpack_require__(8304);

/**
 * Node's fs module if available.
 * @type {Object.<string,*>}
 */
util.fs = util.inquire("fs");

/**
 * Converts an object's values to an array.
 * @param {Object.<string,*>} object Object to convert
 * @returns {Array.<*>} Converted array
 */
util.toArray = function toArray(object) {
    if (object) {
        var keys  = Object.keys(object),
            array = new Array(keys.length),
            index = 0;
        while (index < keys.length)
            array[index] = object[keys[index++]];
        return array;
    }
    return [];
};

/**
 * Converts an array of keys immediately followed by their respective value to an object, omitting undefined values.
 * @param {Array.<*>} array Array to convert
 * @returns {Object.<string,*>} Converted object
 */
util.toObject = function toObject(array) {
    var object = {},
        index  = 0;
    while (index < array.length) {
        var key = array[index++],
            val = array[index++];
        if (val !== undefined)
            object[key] = val;
    }
    return object;
};

var safePropBackslashRe = /\\/g,
    safePropQuoteRe     = /"/g;

/**
 * Tests whether the specified name is a reserved word in JS.
 * @param {string} name Name to test
 * @returns {boolean} `true` if reserved, otherwise `false`
 */
util.isReserved = function isReserved(name) {
    return /^(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/.test(name);
};

/**
 * Returns a safe property accessor for the specified property name.
 * @param {string} prop Property name
 * @returns {string} Safe accessor
 */
util.safeProp = function safeProp(prop) {
    if (!/^[$\w_]+$/.test(prop) || util.isReserved(prop))
        return "[\"" + prop.replace(safePropBackslashRe, "\\\\").replace(safePropQuoteRe, "\\\"") + "\"]";
    return "." + prop;
};

/**
 * Converts the first character of a string to upper case.
 * @param {string} str String to convert
 * @returns {string} Converted string
 */
util.ucFirst = function ucFirst(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
};

var camelCaseRe = /_([a-z])/g;

/**
 * Converts a string to camel case.
 * @param {string} str String to convert
 * @returns {string} Converted string
 */
util.camelCase = function camelCase(str) {
    return str.substring(0, 1)
         + str.substring(1)
               .replace(camelCaseRe, function($0, $1) { return $1.toUpperCase(); });
};

/**
 * Compares reflected fields by id.
 * @param {Field} a First field
 * @param {Field} b Second field
 * @returns {number} Comparison value
 */
util.compareFieldsById = function compareFieldsById(a, b) {
    return a.id - b.id;
};

/**
 * Decorator helper for types (TypeScript).
 * @param {Constructor<T>} ctor Constructor function
 * @param {string} [typeName] Type name, defaults to the constructor's name
 * @returns {Type} Reflected type
 * @template T extends Message<T>
 * @property {Root} root Decorators root
 */
util.decorateType = function decorateType(ctor, typeName) {

    /* istanbul ignore if */
    if (ctor.$type) {
        if (typeName && ctor.$type.name !== typeName) {
            util.decorateRoot.remove(ctor.$type);
            ctor.$type.name = typeName;
            util.decorateRoot.add(ctor.$type);
        }
        return ctor.$type;
    }

    /* istanbul ignore next */
    if (!Type)
        Type = __webpack_require__(6039);

    var type = new Type(typeName || ctor.name);
    util.decorateRoot.add(type);
    type.ctor = ctor; // sets up .encode, .decode etc.
    Object.defineProperty(ctor, "$type", { value: type, enumerable: false });
    Object.defineProperty(ctor.prototype, "$type", { value: type, enumerable: false });
    return type;
};

var decorateEnumIndex = 0;

/**
 * Decorator helper for enums (TypeScript).
 * @param {Object} object Enum object
 * @returns {Enum} Reflected enum
 */
util.decorateEnum = function decorateEnum(object) {

    /* istanbul ignore if */
    if (object.$type)
        return object.$type;

    /* istanbul ignore next */
    if (!Enum)
        Enum = __webpack_require__(8432);

    var enm = new Enum("Enum" + decorateEnumIndex++, object);
    util.decorateRoot.add(enm);
    Object.defineProperty(object, "$type", { value: enm, enumerable: false });
    return enm;
};


/**
 * Sets the value of a property by property path. If a value already exists, it is turned to an array
 * @param {Object.<string,*>} dst Destination object
 * @param {string} path dot '.' delimited path of the property to set
 * @param {Object} value the value to set
 * @returns {Object.<string,*>} Destination object
 */
util.setProperty = function setProperty(dst, path, value) {
    function setProp(dst, path, value) {
        var part = path.shift();
        if (part === "__proto__" || part === "prototype") {
          return dst;
        }
        if (path.length > 0) {
            dst[part] = setProp(dst[part] || {}, path, value);
        } else {
            var prevValue = dst[part];
            if (prevValue)
                value = [].concat(prevValue).concat(value);
            dst[part] = value;
        }
        return dst;
    }

    if (typeof dst !== "object")
        throw TypeError("dst must be an object");
    if (!path)
        throw TypeError("path must be specified");

    path = path.split(".");
    return setProp(dst, path, value);
};

/**
 * Decorator root (TypeScript).
 * @name util.decorateRoot
 * @type {Root}
 * @readonly
 */
Object.defineProperty(util, "decorateRoot", {
    get: function() {
        return roots["decorated"] || (roots["decorated"] = new (__webpack_require__(2645))());
    }
});


/***/ }),

/***/ 3024:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = LongBits;

var util = __webpack_require__(2280);

/**
 * Constructs new long bits.
 * @classdesc Helper class for working with the low and high bits of a 64 bit value.
 * @memberof util
 * @constructor
 * @param {number} lo Low 32 bits, unsigned
 * @param {number} hi High 32 bits, unsigned
 */
function LongBits(lo, hi) {

    // note that the casts below are theoretically unnecessary as of today, but older statically
    // generated converter code might still call the ctor with signed 32bits. kept for compat.

    /**
     * Low bits.
     * @type {number}
     */
    this.lo = lo >>> 0;

    /**
     * High bits.
     * @type {number}
     */
    this.hi = hi >>> 0;
}

/**
 * Zero bits.
 * @memberof util.LongBits
 * @type {util.LongBits}
 */
var zero = LongBits.zero = new LongBits(0, 0);

zero.toNumber = function() { return 0; };
zero.zzEncode = zero.zzDecode = function() { return this; };
zero.length = function() { return 1; };

/**
 * Zero hash.
 * @memberof util.LongBits
 * @type {string}
 */
var zeroHash = LongBits.zeroHash = "\0\0\0\0\0\0\0\0";

/**
 * Constructs new long bits from the specified number.
 * @param {number} value Value
 * @returns {util.LongBits} Instance
 */
LongBits.fromNumber = function fromNumber(value) {
    if (value === 0)
        return zero;
    var sign = value < 0;
    if (sign)
        value = -value;
    var lo = value >>> 0,
        hi = (value - lo) / 4294967296 >>> 0;
    if (sign) {
        hi = ~hi >>> 0;
        lo = ~lo >>> 0;
        if (++lo > 4294967295) {
            lo = 0;
            if (++hi > 4294967295)
                hi = 0;
        }
    }
    return new LongBits(lo, hi);
};

/**
 * Constructs new long bits from a number, long or string.
 * @param {Long|number|string} value Value
 * @returns {util.LongBits} Instance
 */
LongBits.from = function from(value) {
    if (typeof value === "number")
        return LongBits.fromNumber(value);
    if (util.isString(value)) {
        /* istanbul ignore else */
        if (util.Long)
            value = util.Long.fromString(value);
        else
            return LongBits.fromNumber(parseInt(value, 10));
    }
    return value.low || value.high ? new LongBits(value.low >>> 0, value.high >>> 0) : zero;
};

/**
 * Converts this long bits to a possibly unsafe JavaScript number.
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {number} Possibly unsafe number
 */
LongBits.prototype.toNumber = function toNumber(unsigned) {
    if (!unsigned && this.hi >>> 31) {
        var lo = ~this.lo + 1 >>> 0,
            hi = ~this.hi     >>> 0;
        if (!lo)
            hi = hi + 1 >>> 0;
        return -(lo + hi * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
};

/**
 * Converts this long bits to a long.
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {Long} Long
 */
LongBits.prototype.toLong = function toLong(unsigned) {
    return util.Long
        ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned))
        /* istanbul ignore next */
        : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
};

var charCodeAt = String.prototype.charCodeAt;

/**
 * Constructs new long bits from the specified 8 characters long hash.
 * @param {string} hash Hash
 * @returns {util.LongBits} Bits
 */
LongBits.fromHash = function fromHash(hash) {
    if (hash === zeroHash)
        return zero;
    return new LongBits(
        ( charCodeAt.call(hash, 0)
        | charCodeAt.call(hash, 1) << 8
        | charCodeAt.call(hash, 2) << 16
        | charCodeAt.call(hash, 3) << 24) >>> 0
    ,
        ( charCodeAt.call(hash, 4)
        | charCodeAt.call(hash, 5) << 8
        | charCodeAt.call(hash, 6) << 16
        | charCodeAt.call(hash, 7) << 24) >>> 0
    );
};

/**
 * Converts this long bits to a 8 characters long hash.
 * @returns {string} Hash
 */
LongBits.prototype.toHash = function toHash() {
    return String.fromCharCode(
        this.lo        & 255,
        this.lo >>> 8  & 255,
        this.lo >>> 16 & 255,
        this.lo >>> 24      ,
        this.hi        & 255,
        this.hi >>> 8  & 255,
        this.hi >>> 16 & 255,
        this.hi >>> 24
    );
};

/**
 * Zig-zag encodes this long bits.
 * @returns {util.LongBits} `this`
 */
LongBits.prototype.zzEncode = function zzEncode() {
    var mask =   this.hi >> 31;
    this.hi  = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
    this.lo  = ( this.lo << 1                   ^ mask) >>> 0;
    return this;
};

/**
 * Zig-zag decodes this long bits.
 * @returns {util.LongBits} `this`
 */
LongBits.prototype.zzDecode = function zzDecode() {
    var mask = -(this.lo & 1);
    this.lo  = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
    this.hi  = ( this.hi >>> 1                  ^ mask) >>> 0;
    return this;
};

/**
 * Calculates the length of this longbits when encoded as a varint.
 * @returns {number} Length
 */
LongBits.prototype.length = function length() {
    var part0 =  this.lo,
        part1 = (this.lo >>> 28 | this.hi << 4) >>> 0,
        part2 =  this.hi >>> 24;
    return part2 === 0
         ? part1 === 0
           ? part0 < 16384
             ? part0 < 128 ? 1 : 2
             : part0 < 2097152 ? 3 : 4
           : part1 < 16384
             ? part1 < 128 ? 5 : 6
             : part1 < 2097152 ? 7 : 8
         : part2 < 128 ? 9 : 10;
};


/***/ }),

/***/ 2280:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var util = exports;

// used to return a Promise where callback is omitted
util.asPromise = __webpack_require__(2324);

// converts to / from base64 encoded strings
util.base64 = __webpack_require__(5844);

// base class of rpc.Service
util.EventEmitter = __webpack_require__(5760);

// float handling accross browsers
util.float = __webpack_require__(2336);

// requires modules optionally and hides the call from bundlers
util.inquire = __webpack_require__(5872);

// converts to / from utf8 encoded strings
util.utf8 = __webpack_require__(2560);

// provides a node-like buffer pool in the browser
util.pool = __webpack_require__(8856);

// utility to work with the low and high bits of a 64 bit value
util.LongBits = __webpack_require__(3024);

/**
 * Whether running within node or not.
 * @memberof util
 * @type {boolean}
 */
util.isNode = Boolean(typeof __webpack_require__.g !== "undefined"
                   && __webpack_require__.g
                   && __webpack_require__.g.process
                   && __webpack_require__.g.process.versions
                   && __webpack_require__.g.process.versions.node);

/**
 * Global object reference.
 * @memberof util
 * @type {Object}
 */
util.global = util.isNode && __webpack_require__.g
           || typeof window !== "undefined" && window
           || typeof self   !== "undefined" && self
           || this; // eslint-disable-line no-invalid-this

/**
 * An immuable empty array.
 * @memberof util
 * @type {Array.<*>}
 * @const
 */
util.emptyArray = Object.freeze ? Object.freeze([]) : /* istanbul ignore next */ []; // used on prototypes

/**
 * An immutable empty object.
 * @type {Object}
 * @const
 */
util.emptyObject = Object.freeze ? Object.freeze({}) : /* istanbul ignore next */ {}; // used on prototypes

/**
 * Tests if the specified value is an integer.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an integer
 */
util.isInteger = Number.isInteger || /* istanbul ignore next */ function isInteger(value) {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
};

/**
 * Tests if the specified value is a string.
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is a string
 */
util.isString = function isString(value) {
    return typeof value === "string" || value instanceof String;
};

/**
 * Tests if the specified value is a non-null object.
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is a non-null object
 */
util.isObject = function isObject(value) {
    return value && typeof value === "object";
};

/**
 * Checks if a property on a message is considered to be present.
 * This is an alias of {@link util.isSet}.
 * @function
 * @param {Object} obj Plain object or message instance
 * @param {string} prop Property name
 * @returns {boolean} `true` if considered to be present, otherwise `false`
 */
util.isset =

/**
 * Checks if a property on a message is considered to be present.
 * @param {Object} obj Plain object or message instance
 * @param {string} prop Property name
 * @returns {boolean} `true` if considered to be present, otherwise `false`
 */
util.isSet = function isSet(obj, prop) {
    var value = obj[prop];
    if (value != null && obj.hasOwnProperty(prop)) // eslint-disable-line eqeqeq, no-prototype-builtins
        return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
    return false;
};

/**
 * Any compatible Buffer instance.
 * This is a minimal stand-alone definition of a Buffer instance. The actual type is that exported by node's typings.
 * @interface Buffer
 * @extends Uint8Array
 */

/**
 * Node's Buffer class if available.
 * @type {Constructor<Buffer>}
 */
util.Buffer = (function() {
    try {
        var Buffer = util.inquire("buffer").Buffer;
        // refuse to use non-node buffers if not explicitly assigned (perf reasons):
        return Buffer.prototype.utf8Write ? Buffer : /* istanbul ignore next */ null;
    } catch (e) {
        /* istanbul ignore next */
        return null;
    }
})();

// Internal alias of or polyfull for Buffer.from.
util._Buffer_from = null;

// Internal alias of or polyfill for Buffer.allocUnsafe.
util._Buffer_allocUnsafe = null;

/**
 * Creates a new buffer of whatever type supported by the environment.
 * @param {number|number[]} [sizeOrArray=0] Buffer size or number array
 * @returns {Uint8Array|Buffer} Buffer
 */
util.newBuffer = function newBuffer(sizeOrArray) {
    /* istanbul ignore next */
    return typeof sizeOrArray === "number"
        ? util.Buffer
            ? util._Buffer_allocUnsafe(sizeOrArray)
            : new util.Array(sizeOrArray)
        : util.Buffer
            ? util._Buffer_from(sizeOrArray)
            : typeof Uint8Array === "undefined"
                ? sizeOrArray
                : new Uint8Array(sizeOrArray);
};

/**
 * Array implementation used in the browser. `Uint8Array` if supported, otherwise `Array`.
 * @type {Constructor<Uint8Array>}
 */
util.Array = typeof Uint8Array !== "undefined" ? Uint8Array /* istanbul ignore next */ : Array;

/**
 * Any compatible Long instance.
 * This is a minimal stand-alone definition of a Long instance. The actual type is that exported by long.js.
 * @interface Long
 * @property {number} low Low bits
 * @property {number} high High bits
 * @property {boolean} unsigned Whether unsigned or not
 */

/**
 * Long.js's Long class if available.
 * @type {Constructor<Long>}
 */
util.Long = /* istanbul ignore next */ util.global.dcodeIO && /* istanbul ignore next */ util.global.dcodeIO.Long
         || /* istanbul ignore next */ util.global.Long
         || util.inquire("long");

/**
 * Regular expression used to verify 2 bit (`bool`) map keys.
 * @type {RegExp}
 * @const
 */
util.key2Re = /^true|false|0|1$/;

/**
 * Regular expression used to verify 32 bit (`int32` etc.) map keys.
 * @type {RegExp}
 * @const
 */
util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;

/**
 * Regular expression used to verify 64 bit (`int64` etc.) map keys.
 * @type {RegExp}
 * @const
 */
util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;

/**
 * Converts a number or long to an 8 characters long hash string.
 * @param {Long|number} value Value to convert
 * @returns {string} Hash
 */
util.longToHash = function longToHash(value) {
    return value
        ? util.LongBits.from(value).toHash()
        : util.LongBits.zeroHash;
};

/**
 * Converts an 8 characters long hash string to a long or number.
 * @param {string} hash Hash
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {Long|number} Original value
 */
util.longFromHash = function longFromHash(hash, unsigned) {
    var bits = util.LongBits.fromHash(hash);
    if (util.Long)
        return util.Long.fromBits(bits.lo, bits.hi, unsigned);
    return bits.toNumber(Boolean(unsigned));
};

/**
 * Merges the properties of the source object into the destination object.
 * @memberof util
 * @param {Object.<string,*>} dst Destination object
 * @param {Object.<string,*>} src Source object
 * @param {boolean} [ifNotSet=false] Merges only if the key is not already set
 * @returns {Object.<string,*>} Destination object
 */
function merge(dst, src, ifNotSet) { // used by converters
    for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
        if (dst[keys[i]] === undefined || !ifNotSet)
            dst[keys[i]] = src[keys[i]];
    return dst;
}

util.merge = merge;

/**
 * Converts the first character of a string to lower case.
 * @param {string} str String to convert
 * @returns {string} Converted string
 */
util.lcFirst = function lcFirst(str) {
    return str.charAt(0).toLowerCase() + str.substring(1);
};

/**
 * Creates a custom error constructor.
 * @memberof util
 * @param {string} name Error name
 * @returns {Constructor<Error>} Custom error constructor
 */
function newError(name) {

    function CustomError(message, properties) {

        if (!(this instanceof CustomError))
            return new CustomError(message, properties);

        // Error.call(this, message);
        // ^ just returns a new error instance because the ctor can be called as a function

        Object.defineProperty(this, "message", { get: function() { return message; } });

        /* istanbul ignore next */
        if (Error.captureStackTrace) // node
            Error.captureStackTrace(this, CustomError);
        else
            Object.defineProperty(this, "stack", { value: new Error().stack || "" });

        if (properties)
            merge(this, properties);
    }

    CustomError.prototype = Object.create(Error.prototype, {
        constructor: {
            value: CustomError,
            writable: true,
            enumerable: false,
            configurable: true,
        },
        name: {
            get: function get() { return name; },
            set: undefined,
            enumerable: false,
            // configurable: false would accurately preserve the behavior of
            // the original, but I'm guessing that was not intentional.
            // For an actual error subclass, this property would
            // be configurable.
            configurable: true,
        },
        toString: {
            value: function value() { return this.name + ": " + this.message; },
            writable: true,
            enumerable: false,
            configurable: true,
        },
    });

    return CustomError;
}

util.newError = newError;

/**
 * Constructs a new protocol error.
 * @classdesc Error subclass indicating a protocol specifc error.
 * @memberof util
 * @extends Error
 * @template T extends Message<T>
 * @constructor
 * @param {string} message Error message
 * @param {Object.<string,*>} [properties] Additional properties
 * @example
 * try {
 *     MyMessage.decode(someBuffer); // throws if required fields are missing
 * } catch (e) {
 *     if (e instanceof ProtocolError && e.instance)
 *         console.log("decoded so far: " + JSON.stringify(e.instance));
 * }
 */
util.ProtocolError = newError("ProtocolError");

/**
 * So far decoded message instance.
 * @name util.ProtocolError#instance
 * @type {Message<T>}
 */

/**
 * A OneOf getter as returned by {@link util.oneOfGetter}.
 * @typedef OneOfGetter
 * @type {function}
 * @returns {string|undefined} Set field name, if any
 */

/**
 * Builds a getter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfGetter} Unbound getter
 */
util.oneOfGetter = function getOneOf(fieldNames) {
    var fieldMap = {};
    for (var i = 0; i < fieldNames.length; ++i)
        fieldMap[fieldNames[i]] = 1;

    /**
     * @returns {string|undefined} Set field name, if any
     * @this Object
     * @ignore
     */
    return function() { // eslint-disable-line consistent-return
        for (var keys = Object.keys(this), i = keys.length - 1; i > -1; --i)
            if (fieldMap[keys[i]] === 1 && this[keys[i]] !== undefined && this[keys[i]] !== null)
                return keys[i];
    };
};

/**
 * A OneOf setter as returned by {@link util.oneOfSetter}.
 * @typedef OneOfSetter
 * @type {function}
 * @param {string|undefined} value Field name
 * @returns {undefined}
 */

/**
 * Builds a setter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfSetter} Unbound setter
 */
util.oneOfSetter = function setOneOf(fieldNames) {

    /**
     * @param {string} name Field name
     * @returns {undefined}
     * @this Object
     * @ignore
     */
    return function(name) {
        for (var i = 0; i < fieldNames.length; ++i)
            if (fieldNames[i] !== name)
                delete this[fieldNames[i]];
    };
};

/**
 * Default conversion options used for {@link Message#toJSON} implementations.
 *
 * These options are close to proto3's JSON mapping with the exception that internal types like Any are handled just like messages. More precisely:
 *
 * - Longs become strings
 * - Enums become string keys
 * - Bytes become base64 encoded strings
 * - (Sub-)Messages become plain objects
 * - Maps become plain objects with all string keys
 * - Repeated fields become arrays
 * - NaN and Infinity for float and double fields become strings
 *
 * @type {IConversionOptions}
 * @see https://developers.google.com/protocol-buffers/docs/proto3?hl=en#json
 */
util.toJSONOptions = {
    longs: String,
    enums: String,
    bytes: String,
    json: true
};

// Sets up buffer utility according to the environment (called in index-minimal)
util._configure = function() {
    var Buffer = util.Buffer;
    /* istanbul ignore if */
    if (!Buffer) {
        util._Buffer_from = util._Buffer_allocUnsafe = null;
        return;
    }
    // because node 4.x buffers are incompatible & immutable
    // see: https://github.com/dcodeIO/protobuf.js/pull/665
    util._Buffer_from = Buffer.from !== Uint8Array.from && Buffer.from ||
        /* istanbul ignore next */
        function Buffer_from(value, encoding) {
            return new Buffer(value, encoding);
        };
    util._Buffer_allocUnsafe = Buffer.allocUnsafe ||
        /* istanbul ignore next */
        function Buffer_allocUnsafe(size) {
            return new Buffer(size);
        };
};


/***/ }),

/***/ 5496:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = verifier;

var Enum      = __webpack_require__(8432),
    util      = __webpack_require__(888);

function invalid(field, expected) {
    return field.name + ": " + expected + (field.repeated && expected !== "array" ? "[]" : field.map && expected !== "object" ? "{k:"+field.keyType+"}" : "") + " expected";
}

/**
 * Generates a partial value verifier.
 * @param {Codegen} gen Codegen instance
 * @param {Field} field Reflected field
 * @param {number} fieldIndex Field index
 * @param {string} ref Variable reference
 * @returns {Codegen} Codegen instance
 * @ignore
 */
function genVerifyValue(gen, field, fieldIndex, ref) {
    /* eslint-disable no-unexpected-multiline */
    if (field.resolvedType) {
        if (field.resolvedType instanceof Enum) { gen
            ("switch(%s){", ref)
                ("default:")
                    ("return%j", invalid(field, "enum value"));
            for (var keys = Object.keys(field.resolvedType.values), j = 0; j < keys.length; ++j) gen
                ("case %i:", field.resolvedType.values[keys[j]]);
            gen
                    ("break")
            ("}");
        } else {
            gen
            ("{")
                ("var e=types[%i].verify(%s);", fieldIndex, ref)
                ("if(e)")
                    ("return%j+e", field.name + ".")
            ("}");
        }
    } else {
        switch (field.type) {
            case "int32":
            case "uint32":
            case "sint32":
            case "fixed32":
            case "sfixed32": gen
                ("if(!util.isInteger(%s))", ref)
                    ("return%j", invalid(field, "integer"));
                break;
            case "int64":
            case "uint64":
            case "sint64":
            case "fixed64":
            case "sfixed64": gen
                ("if(!util.isInteger(%s)&&!(%s&&util.isInteger(%s.low)&&util.isInteger(%s.high)))", ref, ref, ref, ref)
                    ("return%j", invalid(field, "integer|Long"));
                break;
            case "float":
            case "double": gen
                ("if(typeof %s!==\"number\")", ref)
                    ("return%j", invalid(field, "number"));
                break;
            case "bool": gen
                ("if(typeof %s!==\"boolean\")", ref)
                    ("return%j", invalid(field, "boolean"));
                break;
            case "string": gen
                ("if(!util.isString(%s))", ref)
                    ("return%j", invalid(field, "string"));
                break;
            case "bytes": gen
                ("if(!(%s&&typeof %s.length===\"number\"||util.isString(%s)))", ref, ref, ref)
                    ("return%j", invalid(field, "buffer"));
                break;
        }
    }
    return gen;
    /* eslint-enable no-unexpected-multiline */
}

/**
 * Generates a partial key verifier.
 * @param {Codegen} gen Codegen instance
 * @param {Field} field Reflected field
 * @param {string} ref Variable reference
 * @returns {Codegen} Codegen instance
 * @ignore
 */
function genVerifyKey(gen, field, ref) {
    /* eslint-disable no-unexpected-multiline */
    switch (field.keyType) {
        case "int32":
        case "uint32":
        case "sint32":
        case "fixed32":
        case "sfixed32": gen
            ("if(!util.key32Re.test(%s))", ref)
                ("return%j", invalid(field, "integer key"));
            break;
        case "int64":
        case "uint64":
        case "sint64":
        case "fixed64":
        case "sfixed64": gen
            ("if(!util.key64Re.test(%s))", ref) // see comment above: x is ok, d is not
                ("return%j", invalid(field, "integer|Long key"));
            break;
        case "bool": gen
            ("if(!util.key2Re.test(%s))", ref)
                ("return%j", invalid(field, "boolean key"));
            break;
    }
    return gen;
    /* eslint-enable no-unexpected-multiline */
}

/**
 * Generates a verifier specific to the specified message type.
 * @param {Type} mtype Message type
 * @returns {Codegen} Codegen instance
 */
function verifier(mtype) {
    /* eslint-disable no-unexpected-multiline */

    var gen = util.codegen(["m"], mtype.name + "$verify")
    ("if(typeof m!==\"object\"||m===null)")
        ("return%j", "object expected");
    var oneofs = mtype.oneofsArray,
        seenFirstField = {};
    if (oneofs.length) gen
    ("var p={}");

    for (var i = 0; i < /* initializes */ mtype.fieldsArray.length; ++i) {
        var field = mtype._fieldsArray[i].resolve(),
            ref   = "m" + util.safeProp(field.name);

        if (field.optional) gen
        ("if(%s!=null&&m.hasOwnProperty(%j)){", ref, field.name); // !== undefined && !== null

        // map fields
        if (field.map) { gen
            ("if(!util.isObject(%s))", ref)
                ("return%j", invalid(field, "object"))
            ("var k=Object.keys(%s)", ref)
            ("for(var i=0;i<k.length;++i){");
                genVerifyKey(gen, field, "k[i]");
                genVerifyValue(gen, field, i, ref + "[k[i]]")
            ("}");

        // repeated fields
        } else if (field.repeated) { gen
            ("if(!Array.isArray(%s))", ref)
                ("return%j", invalid(field, "array"))
            ("for(var i=0;i<%s.length;++i){", ref);
                genVerifyValue(gen, field, i, ref + "[i]")
            ("}");

        // required or present fields
        } else {
            if (field.partOf) {
                var oneofProp = util.safeProp(field.partOf.name);
                if (seenFirstField[field.partOf.name] === 1) gen
            ("if(p%s===1)", oneofProp)
                ("return%j", field.partOf.name + ": multiple values");
                seenFirstField[field.partOf.name] = 1;
                gen
            ("p%s=1", oneofProp);
            }
            genVerifyValue(gen, field, i, ref);
        }
        if (field.optional) gen
        ("}");
    }
    return gen
    ("return null");
    /* eslint-enable no-unexpected-multiline */
}

/***/ }),

/***/ 4224:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


/**
 * Wrappers for common types.
 * @type {Object.<string,IWrapper>}
 * @const
 */
var wrappers = exports;

var Message = __webpack_require__(2020);

/**
 * From object converter part of an {@link IWrapper}.
 * @typedef WrapperFromObjectConverter
 * @type {function}
 * @param {Object.<string,*>} object Plain object
 * @returns {Message<{}>} Message instance
 * @this Type
 */

/**
 * To object converter part of an {@link IWrapper}.
 * @typedef WrapperToObjectConverter
 * @type {function}
 * @param {Message<{}>} message Message instance
 * @param {IConversionOptions} [options] Conversion options
 * @returns {Object.<string,*>} Plain object
 * @this Type
 */

/**
 * Common type wrapper part of {@link wrappers}.
 * @interface IWrapper
 * @property {WrapperFromObjectConverter} [fromObject] From object converter
 * @property {WrapperToObjectConverter} [toObject] To object converter
 */

// Custom wrapper for Any
wrappers[".google.protobuf.Any"] = {

    fromObject: function(object) {

        // unwrap value type if mapped
        if (object && object["@type"]) {
             // Only use fully qualified type name after the last '/'
            var name = object["@type"].substring(object["@type"].lastIndexOf("/") + 1);
            var type = this.lookup(name);
            /* istanbul ignore else */
            if (type) {
                // type_url does not accept leading "."
                var type_url = object["@type"].charAt(0) === "." ?
                    object["@type"].slice(1) : object["@type"];
                // type_url prefix is optional, but path seperator is required
                if (type_url.indexOf("/") === -1) {
                    type_url = "/" + type_url;
                }
                return this.create({
                    type_url: type_url,
                    value: type.encode(type.fromObject(object)).finish()
                });
            }
        }

        return this.fromObject(object);
    },

    toObject: function(message, options) {

        // Default prefix
        var googleApi = "type.googleapis.com/";
        var prefix = "";
        var name = "";

        // decode value if requested and unmapped
        if (options && options.json && message.type_url && message.value) {
            // Only use fully qualified type name after the last '/'
            name = message.type_url.substring(message.type_url.lastIndexOf("/") + 1);
            // Separate the prefix used
            prefix = message.type_url.substring(0, message.type_url.lastIndexOf("/") + 1);
            var type = this.lookup(name);
            /* istanbul ignore else */
            if (type)
                message = type.decode(message.value);
        }

        // wrap value if unmapped
        if (!(message instanceof this.ctor) && message instanceof Message) {
            var object = message.$type.toObject(message, options);
            var messageName = message.$type.fullName[0] === "." ?
                message.$type.fullName.slice(1) : message.$type.fullName;
            // Default to type.googleapis.com prefix if no prefix is used
            if (prefix === "") {
                prefix = googleApi;
            }
            name = prefix + messageName;
            object["@type"] = name;
            return object;
        }

        return this.toObject(message, options);
    }
};


/***/ }),

/***/ 3720:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Writer;

var util      = __webpack_require__(2280);

var BufferWriter; // cyclic

var LongBits  = util.LongBits,
    base64    = util.base64,
    utf8      = util.utf8;

/**
 * Constructs a new writer operation instance.
 * @classdesc Scheduled writer operation.
 * @constructor
 * @param {function(*, Uint8Array, number)} fn Function to call
 * @param {number} len Value byte length
 * @param {*} val Value to write
 * @ignore
 */
function Op(fn, len, val) {

    /**
     * Function to call.
     * @type {function(Uint8Array, number, *)}
     */
    this.fn = fn;

    /**
     * Value byte length.
     * @type {number}
     */
    this.len = len;

    /**
     * Next operation.
     * @type {Writer.Op|undefined}
     */
    this.next = undefined;

    /**
     * Value to write.
     * @type {*}
     */
    this.val = val; // type varies
}

/* istanbul ignore next */
function noop() {} // eslint-disable-line no-empty-function

/**
 * Constructs a new writer state instance.
 * @classdesc Copied writer state.
 * @memberof Writer
 * @constructor
 * @param {Writer} writer Writer to copy state from
 * @ignore
 */
function State(writer) {

    /**
     * Current head.
     * @type {Writer.Op}
     */
    this.head = writer.head;

    /**
     * Current tail.
     * @type {Writer.Op}
     */
    this.tail = writer.tail;

    /**
     * Current buffer length.
     * @type {number}
     */
    this.len = writer.len;

    /**
     * Next state.
     * @type {State|null}
     */
    this.next = writer.states;
}

/**
 * Constructs a new writer instance.
 * @classdesc Wire format writer using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 */
function Writer() {

    /**
     * Current length.
     * @type {number}
     */
    this.len = 0;

    /**
     * Operations head.
     * @type {Object}
     */
    this.head = new Op(noop, 0, 0);

    /**
     * Operations tail
     * @type {Object}
     */
    this.tail = this.head;

    /**
     * Linked forked states.
     * @type {Object|null}
     */
    this.states = null;

    // When a value is written, the writer calculates its byte length and puts it into a linked
    // list of operations to perform when finish() is called. This both allows us to allocate
    // buffers of the exact required size and reduces the amount of work we have to do compared
    // to first calculating over objects and then encoding over objects. In our case, the encoding
    // part is just a linked list walk calling operations with already prepared values.
}

var create = function create() {
    return util.Buffer
        ? function create_buffer_setup() {
            return (Writer.create = function create_buffer() {
                return new BufferWriter();
            })();
        }
        /* istanbul ignore next */
        : function create_array() {
            return new Writer();
        };
};

/**
 * Creates a new writer.
 * @function
 * @returns {BufferWriter|Writer} A {@link BufferWriter} when Buffers are supported, otherwise a {@link Writer}
 */
Writer.create = create();

/**
 * Allocates a buffer of the specified size.
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */
Writer.alloc = function alloc(size) {
    return new util.Array(size);
};

// Use Uint8Array buffer pool in the browser, just like node does with buffers
/* istanbul ignore else */
if (util.Array !== Array)
    Writer.alloc = util.pool(Writer.alloc, util.Array.prototype.subarray);

/**
 * Pushes a new operation to the queue.
 * @param {function(Uint8Array, number, *)} fn Function to call
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @returns {Writer} `this`
 * @private
 */
Writer.prototype._push = function push(fn, len, val) {
    this.tail = this.tail.next = new Op(fn, len, val);
    this.len += len;
    return this;
};

function writeByte(val, buf, pos) {
    buf[pos] = val & 255;
}

function writeVarint32(val, buf, pos) {
    while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
    }
    buf[pos] = val;
}

/**
 * Constructs a new varint writer operation instance.
 * @classdesc Scheduled varint writer operation.
 * @extends Op
 * @constructor
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @ignore
 */
function VarintOp(len, val) {
    this.len = len;
    this.next = undefined;
    this.val = val;
}

VarintOp.prototype = Object.create(Op.prototype);
VarintOp.prototype.fn = writeVarint32;

/**
 * Writes an unsigned 32 bit value as a varint.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.uint32 = function write_uint32(value) {
    // here, the call to this.push has been inlined and a varint specific Op subclass is used.
    // uint32 is by far the most frequently used operation and benefits significantly from this.
    this.len += (this.tail = this.tail.next = new VarintOp(
        (value = value >>> 0)
                < 128       ? 1
        : value < 16384     ? 2
        : value < 2097152   ? 3
        : value < 268435456 ? 4
        :                     5,
    value)).len;
    return this;
};

/**
 * Writes a signed 32 bit value as a varint.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.int32 = function write_int32(value) {
    return value < 0
        ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) // 10 bytes per spec
        : this.uint32(value);
};

/**
 * Writes a 32 bit value as a varint, zig-zag encoded.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.sint32 = function write_sint32(value) {
    return this.uint32((value << 1 ^ value >> 31) >>> 0);
};

function writeVarint64(val, buf, pos) {
    while (val.hi) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
    }
    while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
    }
    buf[pos++] = val.lo;
}

/**
 * Writes an unsigned 64 bit value as a varint.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.uint64 = function write_uint64(value) {
    var bits = LongBits.from(value);
    return this._push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a signed 64 bit value as a varint.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.int64 = Writer.prototype.uint64;

/**
 * Writes a signed 64 bit value as a varint, zig-zag encoded.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.sint64 = function write_sint64(value) {
    var bits = LongBits.from(value).zzEncode();
    return this._push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a boolish value as a varint.
 * @param {boolean} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.bool = function write_bool(value) {
    return this._push(writeByte, 1, value ? 1 : 0);
};

function writeFixed32(val, buf, pos) {
    buf[pos    ] =  val         & 255;
    buf[pos + 1] =  val >>> 8   & 255;
    buf[pos + 2] =  val >>> 16  & 255;
    buf[pos + 3] =  val >>> 24;
}

/**
 * Writes an unsigned 32 bit value as fixed 32 bits.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.fixed32 = function write_fixed32(value) {
    return this._push(writeFixed32, 4, value >>> 0);
};

/**
 * Writes a signed 32 bit value as fixed 32 bits.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.sfixed32 = Writer.prototype.fixed32;

/**
 * Writes an unsigned 64 bit value as fixed 64 bits.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.fixed64 = function write_fixed64(value) {
    var bits = LongBits.from(value);
    return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
};

/**
 * Writes a signed 64 bit value as fixed 64 bits.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.sfixed64 = Writer.prototype.fixed64;

/**
 * Writes a float (32 bit).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.float = function write_float(value) {
    return this._push(util.float.writeFloatLE, 4, value);
};

/**
 * Writes a double (64 bit float).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.double = function write_double(value) {
    return this._push(util.float.writeDoubleLE, 8, value);
};

var writeBytes = util.Array.prototype.set
    ? function writeBytes_set(val, buf, pos) {
        buf.set(val, pos); // also works for plain array values
    }
    /* istanbul ignore next */
    : function writeBytes_for(val, buf, pos) {
        for (var i = 0; i < val.length; ++i)
            buf[pos + i] = val[i];
    };

/**
 * Writes a sequence of bytes.
 * @param {Uint8Array|string} value Buffer or base64 encoded string to write
 * @returns {Writer} `this`
 */
Writer.prototype.bytes = function write_bytes(value) {
    var len = value.length >>> 0;
    if (!len)
        return this._push(writeByte, 1, 0);
    if (util.isString(value)) {
        var buf = Writer.alloc(len = base64.length(value));
        base64.decode(value, buf, 0);
        value = buf;
    }
    return this.uint32(len)._push(writeBytes, len, value);
};

/**
 * Writes a string.
 * @param {string} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.string = function write_string(value) {
    var len = utf8.length(value);
    return len
        ? this.uint32(len)._push(utf8.write, len, value)
        : this._push(writeByte, 1, 0);
};

/**
 * Forks this writer's state by pushing it to a stack.
 * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
 * @returns {Writer} `this`
 */
Writer.prototype.fork = function fork() {
    this.states = new State(this);
    this.head = this.tail = new Op(noop, 0, 0);
    this.len = 0;
    return this;
};

/**
 * Resets this instance to the last state.
 * @returns {Writer} `this`
 */
Writer.prototype.reset = function reset() {
    if (this.states) {
        this.head   = this.states.head;
        this.tail   = this.states.tail;
        this.len    = this.states.len;
        this.states = this.states.next;
    } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len  = 0;
    }
    return this;
};

/**
 * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
 * @returns {Writer} `this`
 */
Writer.prototype.ldelim = function ldelim() {
    var head = this.head,
        tail = this.tail,
        len  = this.len;
    this.reset().uint32(len);
    if (len) {
        this.tail.next = head.next; // skip noop
        this.tail = tail;
        this.len += len;
    }
    return this;
};

/**
 * Finishes the write operation.
 * @returns {Uint8Array} Finished buffer
 */
Writer.prototype.finish = function finish() {
    var head = this.head.next, // skip noop
        buf  = this.constructor.alloc(this.len),
        pos  = 0;
    while (head) {
        head.fn(head.val, buf, pos);
        pos += head.len;
        head = head.next;
    }
    // this.head = this.tail = null;
    return buf;
};

Writer._configure = function(BufferWriter_) {
    BufferWriter = BufferWriter_;
    Writer.create = create();
    BufferWriter._configure();
};


/***/ }),

/***/ 3448:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = BufferWriter;

// extends Writer
var Writer = __webpack_require__(3720);
(BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;

var util = __webpack_require__(2280);

/**
 * Constructs a new buffer writer instance.
 * @classdesc Wire format writer using node buffers.
 * @extends Writer
 * @constructor
 */
function BufferWriter() {
    Writer.call(this);
}

BufferWriter._configure = function () {
    /**
     * Allocates a buffer of the specified size.
     * @function
     * @param {number} size Buffer size
     * @returns {Buffer} Buffer
     */
    BufferWriter.alloc = util._Buffer_allocUnsafe;

    BufferWriter.writeBytesBuffer = util.Buffer && util.Buffer.prototype instanceof Uint8Array && util.Buffer.prototype.set.name === "set"
        ? function writeBytesBuffer_set(val, buf, pos) {
          buf.set(val, pos); // faster than copy (requires node >= 4 where Buffers extend Uint8Array and set is properly inherited)
          // also works for plain array values
        }
        /* istanbul ignore next */
        : function writeBytesBuffer_copy(val, buf, pos) {
          if (val.copy) // Buffer values
            val.copy(buf, pos, 0, val.length);
          else for (var i = 0; i < val.length;) // plain array values
            buf[pos++] = val[i++];
        };
};


/**
 * @override
 */
BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
    if (util.isString(value))
        value = util._Buffer_from(value, "base64");
    var len = value.length >>> 0;
    this.uint32(len);
    if (len)
        this._push(BufferWriter.writeBytesBuffer, len, value);
    return this;
};

function writeStringBuffer(val, buf, pos) {
    if (val.length < 40) // plain js is faster for short strings (probably due to redundant assertions)
        util.utf8.write(val, buf, pos);
    else if (buf.utf8Write)
        buf.utf8Write(val, pos);
    else
        buf.write(val, pos);
}

/**
 * @override
 */
BufferWriter.prototype.string = function write_string_buffer(value) {
    var len = util.Buffer.byteLength(value);
    this.uint32(len);
    if (len)
        this._push(writeStringBuffer, len, value);
    return this;
};


/**
 * Finishes the write operation.
 * @name BufferWriter#finish
 * @function
 * @returns {Buffer} Finished buffer
 */

BufferWriter._configure();


/***/ }),

/***/ 1332:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/////////////////////////////////////////////////////////////////////////////////
/* UAParser.js v1.0.37
   Copyright © 2012-2021 Faisal Salman <f@faisalman.com>
   MIT License *//*
   Detect Browser, Engine, OS, CPU, and Device type/model from User-Agent data.
   Supports browser & node.js environment. 
   Demo   : https://faisalman.github.io/ua-parser-js
   Source : https://github.com/faisalman/ua-parser-js */
/////////////////////////////////////////////////////////////////////////////////

(function (window, undefined) {

    'use strict';

    //////////////
    // Constants
    /////////////


    var LIBVERSION  = '1.0.37',
        EMPTY       = '',
        UNKNOWN     = '?',
        FUNC_TYPE   = 'function',
        UNDEF_TYPE  = 'undefined',
        OBJ_TYPE    = 'object',
        STR_TYPE    = 'string',
        MAJOR       = 'major',
        MODEL       = 'model',
        NAME        = 'name',
        TYPE        = 'type',
        VENDOR      = 'vendor',
        VERSION     = 'version',
        ARCHITECTURE= 'architecture',
        CONSOLE     = 'console',
        MOBILE      = 'mobile',
        TABLET      = 'tablet',
        SMARTTV     = 'smarttv',
        WEARABLE    = 'wearable',
        EMBEDDED    = 'embedded',
        UA_MAX_LENGTH = 500;

    var AMAZON  = 'Amazon',
        APPLE   = 'Apple',
        ASUS    = 'ASUS',
        BLACKBERRY = 'BlackBerry',
        BROWSER = 'Browser',
        CHROME  = 'Chrome',
        EDGE    = 'Edge',
        FIREFOX = 'Firefox',
        GOOGLE  = 'Google',
        HUAWEI  = 'Huawei',
        LG      = 'LG',
        MICROSOFT = 'Microsoft',
        MOTOROLA  = 'Motorola',
        OPERA   = 'Opera',
        SAMSUNG = 'Samsung',
        SHARP   = 'Sharp',
        SONY    = 'Sony',
        XIAOMI  = 'Xiaomi',
        ZEBRA   = 'Zebra',
        FACEBOOK    = 'Facebook',
        CHROMIUM_OS = 'Chromium OS',
        MAC_OS  = 'Mac OS';

    ///////////
    // Helper
    //////////

    var extend = function (regexes, extensions) {
            var mergedRegexes = {};
            for (var i in regexes) {
                if (extensions[i] && extensions[i].length % 2 === 0) {
                    mergedRegexes[i] = extensions[i].concat(regexes[i]);
                } else {
                    mergedRegexes[i] = regexes[i];
                }
            }
            return mergedRegexes;
        },
        enumerize = function (arr) {
            var enums = {};
            for (var i=0; i<arr.length; i++) {
                enums[arr[i].toUpperCase()] = arr[i];
            }
            return enums;
        },
        has = function (str1, str2) {
            return typeof str1 === STR_TYPE ? lowerize(str2).indexOf(lowerize(str1)) !== -1 : false;
        },
        lowerize = function (str) {
            return str.toLowerCase();
        },
        majorize = function (version) {
            return typeof(version) === STR_TYPE ? version.replace(/[^\d\.]/g, EMPTY).split('.')[0] : undefined;
        },
        trim = function (str, len) {
            if (typeof(str) === STR_TYPE) {
                str = str.replace(/^\s\s*/, EMPTY);
                return typeof(len) === UNDEF_TYPE ? str : str.substring(0, UA_MAX_LENGTH);
            }
    };

    ///////////////
    // Map helper
    //////////////

    var rgxMapper = function (ua, arrays) {

            var i = 0, j, k, p, q, matches, match;

            // loop through all regexes maps
            while (i < arrays.length && !matches) {

                var regex = arrays[i],       // even sequence (0,2,4,..)
                    props = arrays[i + 1];   // odd sequence (1,3,5,..)
                j = k = 0;

                // try matching uastring with regexes
                while (j < regex.length && !matches) {

                    if (!regex[j]) { break; }
                    matches = regex[j++].exec(ua);

                    if (!!matches) {
                        for (p = 0; p < props.length; p++) {
                            match = matches[++k];
                            q = props[p];
                            // check if given property is actually array
                            if (typeof q === OBJ_TYPE && q.length > 0) {
                                if (q.length === 2) {
                                    if (typeof q[1] == FUNC_TYPE) {
                                        // assign modified match
                                        this[q[0]] = q[1].call(this, match);
                                    } else {
                                        // assign given value, ignore regex match
                                        this[q[0]] = q[1];
                                    }
                                } else if (q.length === 3) {
                                    // check whether function or regex
                                    if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                        // call function (usually string mapper)
                                        this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                                    } else {
                                        // sanitize match using given regex
                                        this[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                                    }
                                } else if (q.length === 4) {
                                        this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                                }
                            } else {
                                this[q] = match ? match : undefined;
                            }
                        }
                    }
                }
                i += 2;
            }
        },

        strMapper = function (str, map) {

            for (var i in map) {
                // check if current value is array
                if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
                    for (var j = 0; j < map[i].length; j++) {
                        if (has(map[i][j], str)) {
                            return (i === UNKNOWN) ? undefined : i;
                        }
                    }
                } else if (has(map[i], str)) {
                    return (i === UNKNOWN) ? undefined : i;
                }
            }
            return str;
    };

    ///////////////
    // String map
    //////////////

    // Safari < 3.0
    var oldSafariMap = {
            '1.0'   : '/8',
            '1.2'   : '/1',
            '1.3'   : '/3',
            '2.0'   : '/412',
            '2.0.2' : '/416',
            '2.0.3' : '/417',
            '2.0.4' : '/419',
            '?'     : '/'
        },
        windowsVersionMap = {
            'ME'        : '4.90',
            'NT 3.11'   : 'NT3.51',
            'NT 4.0'    : 'NT4.0',
            '2000'      : 'NT 5.0',
            'XP'        : ['NT 5.1', 'NT 5.2'],
            'Vista'     : 'NT 6.0',
            '7'         : 'NT 6.1',
            '8'         : 'NT 6.2',
            '8.1'       : 'NT 6.3',
            '10'        : ['NT 6.4', 'NT 10.0'],
            'RT'        : 'ARM'
    };

    //////////////
    // Regex map
    /////////////

    var regexes = {

        browser : [[

            /\b(?:crmo|crios)\/([\w\.]+)/i                                      // Chrome for Android/iOS
            ], [VERSION, [NAME, 'Chrome']], [
            /edg(?:e|ios|a)?\/([\w\.]+)/i                                       // Microsoft Edge
            ], [VERSION, [NAME, 'Edge']], [

            // Presto based
            /(opera mini)\/([-\w\.]+)/i,                                        // Opera Mini
            /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,                 // Opera Mobi/Tablet
            /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i                           // Opera
            ], [NAME, VERSION], [
            /opios[\/ ]+([\w\.]+)/i                                             // Opera mini on iphone >= 8.0
            ], [VERSION, [NAME, OPERA+' Mini']], [
            /\bopr\/([\w\.]+)/i                                                 // Opera Webkit
            ], [VERSION, [NAME, OPERA]], [

            // Mixed
            /\bb[ai]*d(?:uhd|[ub]*[aekoprswx]{5,6})[\/ ]?([\w\.]+)/i            // Baidu
            ], [VERSION, [NAME, 'Baidu']], [
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i,      // Lunascape/Maxthon/Netfront/Jasmine/Blazer
            // Trident based
            /(avant|iemobile|slim)\s?(?:browser)?[\/ ]?([\w\.]*)/i,             // Avant/IEMobile/SlimBrowser
            /(?:ms|\()(ie) ([\w\.]+)/i,                                         // Internet Explorer

            // Webkit/KHTML based                                               // Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
            /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i,
                                                                                // Rekonq/Puffin/Brave/Whale/QQBrowserLite/QQ, aka ShouQ
            /(heytap|ovi)browser\/([\d\.]+)/i,                                  // Heytap/Ovi
            /(weibo)__([\d\.]+)/i                                               // Weibo
            ], [NAME, VERSION], [
            /(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i                 // UCBrowser
            ], [VERSION, [NAME, 'UC'+BROWSER]], [
            /microm.+\bqbcore\/([\w\.]+)/i,                                     // WeChat Desktop for Windows Built-in Browser
            /\bqbcore\/([\w\.]+).+microm/i,
            /micromessenger\/([\w\.]+)/i                                        // WeChat
            ], [VERSION, [NAME, 'WeChat']], [
            /konqueror\/([\w\.]+)/i                                             // Konqueror
            ], [VERSION, [NAME, 'Konqueror']], [
            /trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i                       // IE11
            ], [VERSION, [NAME, 'IE']], [
            /ya(?:search)?browser\/([\w\.]+)/i                                  // Yandex
            ], [VERSION, [NAME, 'Yandex']], [
            /slbrowser\/([\w\.]+)/i                                             // Smart Lenovo Browser
            ], [VERSION, [NAME, 'Smart Lenovo '+BROWSER]], [
            /(avast|avg)\/([\w\.]+)/i                                           // Avast/AVG Secure Browser
            ], [[NAME, /(.+)/, '$1 Secure '+BROWSER], VERSION], [
            /\bfocus\/([\w\.]+)/i                                               // Firefox Focus
            ], [VERSION, [NAME, FIREFOX+' Focus']], [
            /\bopt\/([\w\.]+)/i                                                 // Opera Touch
            ], [VERSION, [NAME, OPERA+' Touch']], [
            /coc_coc\w+\/([\w\.]+)/i                                            // Coc Coc Browser
            ], [VERSION, [NAME, 'Coc Coc']], [
            /dolfin\/([\w\.]+)/i                                                // Dolphin
            ], [VERSION, [NAME, 'Dolphin']], [
            /coast\/([\w\.]+)/i                                                 // Opera Coast
            ], [VERSION, [NAME, OPERA+' Coast']], [
            /miuibrowser\/([\w\.]+)/i                                           // MIUI Browser
            ], [VERSION, [NAME, 'MIUI '+BROWSER]], [
            /fxios\/([-\w\.]+)/i                                                // Firefox for iOS
            ], [VERSION, [NAME, FIREFOX]], [
            /\bqihu|(qi?ho?o?|360)browser/i                                     // 360
            ], [[NAME, '360 ' + BROWSER]], [
            /(oculus|sailfish|huawei|vivo)browser\/([\w\.]+)/i
            ], [[NAME, /(.+)/, '$1 ' + BROWSER], VERSION], [                    // Oculus/Sailfish/HuaweiBrowser/VivoBrowser
            /samsungbrowser\/([\w\.]+)/i                                        // Samsung Internet
            ], [VERSION, [NAME, SAMSUNG + ' Internet']], [
            /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
            ], [[NAME, /_/g, ' '], VERSION], [
            /metasr[\/ ]?([\d\.]+)/i                                            // Sogou Explorer
            ], [VERSION, [NAME, 'Sogou Explorer']], [
            /(sogou)mo\w+\/([\d\.]+)/i                                          // Sogou Mobile
            ], [[NAME, 'Sogou Mobile'], VERSION], [
            /(electron)\/([\w\.]+) safari/i,                                    // Electron-based App
            /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,                   // Tesla
            /m?(qqbrowser|2345Explorer)[\/ ]?([\w\.]+)/i                        // QQBrowser/2345 Browser
            ], [NAME, VERSION], [
            /(lbbrowser)/i,                                                     // LieBao Browser
            /\[(linkedin)app\]/i                                                // LinkedIn App for iOS & Android
            ], [NAME], [

            // WebView
            /((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i       // Facebook App for iOS & Android
            ], [[NAME, FACEBOOK], VERSION], [
            /(Klarna)\/([\w\.]+)/i,                                             // Klarna Shopping Browser for iOS & Android
            /(kakao(?:talk|story))[\/ ]([\w\.]+)/i,                             // Kakao App
            /(naver)\(.*?(\d+\.[\w\.]+).*\)/i,                                  // Naver InApp
            /safari (line)\/([\w\.]+)/i,                                        // Line App for iOS
            /\b(line)\/([\w\.]+)\/iab/i,                                        // Line App for Android
            /(alipay)client\/([\w\.]+)/i,                                       // Alipay
            /(chromium|instagram|snapchat)[\/ ]([-\w\.]+)/i                     // Chromium/Instagram/Snapchat
            ], [NAME, VERSION], [
            /\bgsa\/([\w\.]+) .*safari\//i                                      // Google Search Appliance on iOS
            ], [VERSION, [NAME, 'GSA']], [
            /musical_ly(?:.+app_?version\/|_)([\w\.]+)/i                        // TikTok
            ], [VERSION, [NAME, 'TikTok']], [

            /headlesschrome(?:\/([\w\.]+)| )/i                                  // Chrome Headless
            ], [VERSION, [NAME, CHROME+' Headless']], [

            / wv\).+(chrome)\/([\w\.]+)/i                                       // Chrome WebView
            ], [[NAME, CHROME+' WebView'], VERSION], [

            /droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i           // Android Browser
            ], [VERSION, [NAME, 'Android '+BROWSER]], [

            /(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i       // Chrome/OmniWeb/Arora/Tizen/Nokia
            ], [NAME, VERSION], [

            /version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i                      // Mobile Safari
            ], [VERSION, [NAME, 'Mobile Safari']], [
            /version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i                // Safari & Safari Mobile
            ], [VERSION, NAME], [
            /webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i                      // Safari < 3.0
            ], [NAME, [VERSION, strMapper, oldSafariMap]], [

            /(webkit|khtml)\/([\w\.]+)/i
            ], [NAME, VERSION], [

            // Gecko based
            /(navigator|netscape\d?)\/([-\w\.]+)/i                              // Netscape
            ], [[NAME, 'Netscape'], VERSION], [
            /mobile vr; rv:([\w\.]+)\).+firefox/i                               // Firefox Reality
            ], [VERSION, [NAME, FIREFOX+' Reality']], [
            /ekiohf.+(flow)\/([\w\.]+)/i,                                       // Flow
            /(swiftfox)/i,                                                      // Swiftfox
            /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i,
                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror/Klar
            /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
            /(firefox)\/([\w\.]+)/i,                                            // Other Firefox-based
            /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,                         // Mozilla

            // Other
            /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
                                                                                // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir/Obigo/Mosaic/Go/ICE/UP.Browser
            /(links) \(([\w\.]+)/i,                                             // Links
            /panasonic;(viera)/i                                                // Panasonic Viera
            ], [NAME, VERSION], [
            
            /(cobalt)\/([\w\.]+)/i                                              // Cobalt
            ], [NAME, [VERSION, /master.|lts./, ""]]
        ],

        cpu : [[

            /(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i                     // AMD64 (x64)
            ], [[ARCHITECTURE, 'amd64']], [

            /(ia32(?=;))/i                                                      // IA32 (quicktime)
            ], [[ARCHITECTURE, lowerize]], [

            /((?:i[346]|x)86)[;\)]/i                                            // IA32 (x86)
            ], [[ARCHITECTURE, 'ia32']], [

            /\b(aarch64|arm(v?8e?l?|_?64))\b/i                                 // ARM64
            ], [[ARCHITECTURE, 'arm64']], [

            /\b(arm(?:v[67])?ht?n?[fl]p?)\b/i                                   // ARMHF
            ], [[ARCHITECTURE, 'armhf']], [

            // PocketPC mistakenly identified as PowerPC
            /windows (ce|mobile); ppc;/i
            ], [[ARCHITECTURE, 'arm']], [

            /((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i                            // PowerPC
            ], [[ARCHITECTURE, /ower/, EMPTY, lowerize]], [

            /(sun4\w)[;\)]/i                                                    // SPARC
            ], [[ARCHITECTURE, 'sparc']], [

            /((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i
                                                                                // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
            ], [[ARCHITECTURE, lowerize]]
        ],

        device : [[

            //////////////////////////
            // MOBILES & TABLETS
            /////////////////////////

            // Samsung
            /\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i
            ], [MODEL, [VENDOR, SAMSUNG], [TYPE, TABLET]], [
            /\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,
            /samsung[- ]([-\w]+)/i,
            /sec-(sgh\w+)/i
            ], [MODEL, [VENDOR, SAMSUNG], [TYPE, MOBILE]], [

            // Apple
            /(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i                          // iPod/iPhone
            ], [MODEL, [VENDOR, APPLE], [TYPE, MOBILE]], [
            /\((ipad);[-\w\),; ]+apple/i,                                       // iPad
            /applecoremedia\/[\w\.]+ \((ipad)/i,
            /\b(ipad)\d\d?,\d\d?[;\]].+ios/i
            ], [MODEL, [VENDOR, APPLE], [TYPE, TABLET]], [
            /(macintosh);/i
            ], [MODEL, [VENDOR, APPLE]], [

            // Sharp
            /\b(sh-?[altvz]?\d\d[a-ekm]?)/i
            ], [MODEL, [VENDOR, SHARP], [TYPE, MOBILE]], [

            // Huawei
            /\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i
            ], [MODEL, [VENDOR, HUAWEI], [TYPE, TABLET]], [
            /(?:huawei|honor)([-\w ]+)[;\)]/i,
            /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i
            ], [MODEL, [VENDOR, HUAWEI], [TYPE, MOBILE]], [

            // Xiaomi
            /\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,                  // Xiaomi POCO
            /\b; (\w+) build\/hm\1/i,                                           // Xiaomi Hongmi 'numeric' models
            /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,                             // Xiaomi Hongmi
            /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,                   // Xiaomi Redmi
            /oid[^\)]+; (m?[12][0-389][01]\w{3,6}[c-y])( bui|; wv|\))/i,        // Xiaomi Redmi 'numeric' models
            /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i // Xiaomi Mi
            ], [[MODEL, /_/g, ' '], [VENDOR, XIAOMI], [TYPE, MOBILE]], [
            /oid[^\)]+; (2\d{4}(283|rpbf)[cgl])( bui|\))/i,                     // Redmi Pad
            /\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i                        // Mi Pad tablets
            ],[[MODEL, /_/g, ' '], [VENDOR, XIAOMI], [TYPE, TABLET]], [

            // OPPO
            /; (\w+) bui.+ oppo/i,
            /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i
            ], [MODEL, [VENDOR, 'OPPO'], [TYPE, MOBILE]], [

            // Vivo
            /vivo (\w+)(?: bui|\))/i,
            /\b(v[12]\d{3}\w?[at])(?: bui|;)/i
            ], [MODEL, [VENDOR, 'Vivo'], [TYPE, MOBILE]], [

            // Realme
            /\b(rmx[1-3]\d{3})(?: bui|;|\))/i
            ], [MODEL, [VENDOR, 'Realme'], [TYPE, MOBILE]], [

            // Motorola
            /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
            /\bmot(?:orola)?[- ](\w*)/i,
            /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i
            ], [MODEL, [VENDOR, MOTOROLA], [TYPE, MOBILE]], [
            /\b(mz60\d|xoom[2 ]{0,2}) build\//i
            ], [MODEL, [VENDOR, MOTOROLA], [TYPE, TABLET]], [

            // LG
            /((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i
            ], [MODEL, [VENDOR, LG], [TYPE, TABLET]], [
            /(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
            /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,
            /\blg-?([\d\w]+) bui/i
            ], [MODEL, [VENDOR, LG], [TYPE, MOBILE]], [

            // Lenovo
            /(ideatab[-\w ]+)/i,
            /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i
            ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [

            // Nokia
            /(?:maemo|nokia).*(n900|lumia \d+)/i,
            /nokia[-_ ]?([-\w\.]*)/i
            ], [[MODEL, /_/g, ' '], [VENDOR, 'Nokia'], [TYPE, MOBILE]], [

            // Google
            /(pixel c)\b/i                                                      // Google Pixel C
            ], [MODEL, [VENDOR, GOOGLE], [TYPE, TABLET]], [
            /droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i                         // Google Pixel
            ], [MODEL, [VENDOR, GOOGLE], [TYPE, MOBILE]], [

            // Sony
            /droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i
            ], [MODEL, [VENDOR, SONY], [TYPE, MOBILE]], [
            /sony tablet [ps]/i,
            /\b(?:sony)?sgp\w+(?: bui|\))/i
            ], [[MODEL, 'Xperia Tablet'], [VENDOR, SONY], [TYPE, TABLET]], [

            // OnePlus
            / (kb2005|in20[12]5|be20[12][59])\b/i,
            /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i
            ], [MODEL, [VENDOR, 'OnePlus'], [TYPE, MOBILE]], [

            // Amazon
            /(alexa)webm/i,
            /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i,                             // Kindle Fire without Silk / Echo Show
            /(kf[a-z]+)( bui|\)).+silk\//i                                      // Kindle Fire HD
            ], [MODEL, [VENDOR, AMAZON], [TYPE, TABLET]], [
            /((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i                     // Fire Phone
            ], [[MODEL, /(.+)/g, 'Fire Phone $1'], [VENDOR, AMAZON], [TYPE, MOBILE]], [

            // BlackBerry
            /(playbook);[-\w\),; ]+(rim)/i                                      // BlackBerry PlayBook
            ], [MODEL, VENDOR, [TYPE, TABLET]], [
            /\b((?:bb[a-f]|st[hv])100-\d)/i,
            /\(bb10; (\w+)/i                                                    // BlackBerry 10
            ], [MODEL, [VENDOR, BLACKBERRY], [TYPE, MOBILE]], [

            // Asus
            /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i
            ], [MODEL, [VENDOR, ASUS], [TYPE, TABLET]], [
            / (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i
            ], [MODEL, [VENDOR, ASUS], [TYPE, MOBILE]], [

            // HTC
            /(nexus 9)/i                                                        // HTC Nexus 9
            ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [
            /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,                         // HTC

            // ZTE
            /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
            /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i         // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
            ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

            // Acer
            /droid.+; ([ab][1-7]-?[0178a]\d\d?)/i
            ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [

            // Meizu
            /droid.+; (m[1-5] note) bui/i,
            /\bmz-([-\w]{2,})/i
            ], [MODEL, [VENDOR, 'Meizu'], [TYPE, MOBILE]], [
                
            // Ulefone
            /; ((?:power )?armor(?:[\w ]{0,8}))(?: bui|\))/i
            ], [MODEL, [VENDOR, 'Ulefone'], [TYPE, MOBILE]], [

            // MIXED
            /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron|infinix|tecno)[-_ ]?([-\w]*)/i,
                                                                                // BlackBerry/BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
            /(hp) ([\w ]+\w)/i,                                                 // HP iPAQ
            /(asus)-?(\w+)/i,                                                   // Asus
            /(microsoft); (lumia[\w ]+)/i,                                      // Microsoft Lumia
            /(lenovo)[-_ ]?([-\w]+)/i,                                          // Lenovo
            /(jolla)/i,                                                         // Jolla
            /(oppo) ?([\w ]+) bui/i                                             // OPPO
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [

            /(kobo)\s(ereader|touch)/i,                                         // Kobo
            /(archos) (gamepad2?)/i,                                            // Archos
            /(hp).+(touchpad(?!.+tablet)|tablet)/i,                             // HP TouchPad
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /(nook)[\w ]+build\/(\w+)/i,                                        // Nook
            /(dell) (strea[kpr\d ]*[\dko])/i,                                   // Dell Streak
            /(le[- ]+pan)[- ]+(\w{1,9}) bui/i,                                  // Le Pan Tablets
            /(trinity)[- ]*(t\d{3}) bui/i,                                      // Trinity Tablets
            /(gigaset)[- ]+(q\w{1,9}) bui/i,                                    // Gigaset Tablets
            /(vodafone) ([\w ]+)(?:\)| bui)/i                                   // Vodafone
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /(surface duo)/i                                                    // Surface Duo
            ], [MODEL, [VENDOR, MICROSOFT], [TYPE, TABLET]], [
            /droid [\d\.]+; (fp\du?)(?: b|\))/i                                 // Fairphone
            ], [MODEL, [VENDOR, 'Fairphone'], [TYPE, MOBILE]], [
            /(u304aa)/i                                                         // AT&T
            ], [MODEL, [VENDOR, 'AT&T'], [TYPE, MOBILE]], [
            /\bsie-(\w*)/i                                                      // Siemens
            ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [
            /\b(rct\w+) b/i                                                     // RCA Tablets
            ], [MODEL, [VENDOR, 'RCA'], [TYPE, TABLET]], [
            /\b(venue[\d ]{2,7}) b/i                                            // Dell Venue Tablets
            ], [MODEL, [VENDOR, 'Dell'], [TYPE, TABLET]], [
            /\b(q(?:mv|ta)\w+) b/i                                              // Verizon Tablet
            ], [MODEL, [VENDOR, 'Verizon'], [TYPE, TABLET]], [
            /\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i                       // Barnes & Noble Tablet
            ], [MODEL, [VENDOR, 'Barnes & Noble'], [TYPE, TABLET]], [
            /\b(tm\d{3}\w+) b/i
            ], [MODEL, [VENDOR, 'NuVision'], [TYPE, TABLET]], [
            /\b(k88) b/i                                                        // ZTE K Series Tablet
            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, TABLET]], [
            /\b(nx\d{3}j) b/i                                                   // ZTE Nubia
            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, MOBILE]], [
            /\b(gen\d{3}) b.+49h/i                                              // Swiss GEN Mobile
            ], [MODEL, [VENDOR, 'Swiss'], [TYPE, MOBILE]], [
            /\b(zur\d{3}) b/i                                                   // Swiss ZUR Tablet
            ], [MODEL, [VENDOR, 'Swiss'], [TYPE, TABLET]], [
            /\b((zeki)?tb.*\b) b/i                                              // Zeki Tablets
            ], [MODEL, [VENDOR, 'Zeki'], [TYPE, TABLET]], [
            /\b([yr]\d{2}) b/i,
            /\b(dragon[- ]+touch |dt)(\w{5}) b/i                                // Dragon Touch Tablet
            ], [[VENDOR, 'Dragon Touch'], MODEL, [TYPE, TABLET]], [
            /\b(ns-?\w{0,9}) b/i                                                // Insignia Tablets
            ], [MODEL, [VENDOR, 'Insignia'], [TYPE, TABLET]], [
            /\b((nxa|next)-?\w{0,9}) b/i                                        // NextBook Tablets
            ], [MODEL, [VENDOR, 'NextBook'], [TYPE, TABLET]], [
            /\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i                  // Voice Xtreme Phones
            ], [[VENDOR, 'Voice'], MODEL, [TYPE, MOBILE]], [
            /\b(lvtel\-)?(v1[12]) b/i                                           // LvTel Phones
            ], [[VENDOR, 'LvTel'], MODEL, [TYPE, MOBILE]], [
            /\b(ph-1) /i                                                        // Essential PH-1
            ], [MODEL, [VENDOR, 'Essential'], [TYPE, MOBILE]], [
            /\b(v(100md|700na|7011|917g).*\b) b/i                               // Envizen Tablets
            ], [MODEL, [VENDOR, 'Envizen'], [TYPE, TABLET]], [
            /\b(trio[-\w\. ]+) b/i                                              // MachSpeed Tablets
            ], [MODEL, [VENDOR, 'MachSpeed'], [TYPE, TABLET]], [
            /\btu_(1491) b/i                                                    // Rotor Tablets
            ], [MODEL, [VENDOR, 'Rotor'], [TYPE, TABLET]], [
            /(shield[\w ]+) b/i                                                 // Nvidia Shield Tablets
            ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, TABLET]], [
            /(sprint) (\w+)/i                                                   // Sprint Phones
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /(kin\.[onetw]{3})/i                                                // Microsoft Kin
            ], [[MODEL, /\./g, ' '], [VENDOR, MICROSOFT], [TYPE, MOBILE]], [
            /droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i             // Zebra
            ], [MODEL, [VENDOR, ZEBRA], [TYPE, TABLET]], [
            /droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i
            ], [MODEL, [VENDOR, ZEBRA], [TYPE, MOBILE]], [

            ///////////////////
            // SMARTTVS
            ///////////////////

            /smart-tv.+(samsung)/i                                              // Samsung
            ], [VENDOR, [TYPE, SMARTTV]], [
            /hbbtv.+maple;(\d+)/i
            ], [[MODEL, /^/, 'SmartTV'], [VENDOR, SAMSUNG], [TYPE, SMARTTV]], [
            /(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i        // LG SmartTV
            ], [[VENDOR, LG], [TYPE, SMARTTV]], [
            /(apple) ?tv/i                                                      // Apple TV
            ], [VENDOR, [MODEL, APPLE+' TV'], [TYPE, SMARTTV]], [
            /crkey/i                                                            // Google Chromecast
            ], [[MODEL, CHROME+'cast'], [VENDOR, GOOGLE], [TYPE, SMARTTV]], [
            /droid.+aft(\w+)( bui|\))/i                                         // Fire TV
            ], [MODEL, [VENDOR, AMAZON], [TYPE, SMARTTV]], [
            /\(dtv[\);].+(aquos)/i,
            /(aquos-tv[\w ]+)\)/i                                               // Sharp
            ], [MODEL, [VENDOR, SHARP], [TYPE, SMARTTV]],[
            /(bravia[\w ]+)( bui|\))/i                                              // Sony
            ], [MODEL, [VENDOR, SONY], [TYPE, SMARTTV]], [
            /(mitv-\w{5}) bui/i                                                 // Xiaomi
            ], [MODEL, [VENDOR, XIAOMI], [TYPE, SMARTTV]], [
            /Hbbtv.*(technisat) (.*);/i                                         // TechniSAT
            ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
            /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,                          // Roku
            /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i         // HbbTV devices
            ], [[VENDOR, trim], [MODEL, trim], [TYPE, SMARTTV]], [
            /\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i                   // SmartTV from Unidentified Vendors
            ], [[TYPE, SMARTTV]], [

            ///////////////////
            // CONSOLES
            ///////////////////

            /(ouya)/i,                                                          // Ouya
            /(nintendo) ([wids3utch]+)/i                                        // Nintendo
            ], [VENDOR, MODEL, [TYPE, CONSOLE]], [
            /droid.+; (shield) bui/i                                            // Nvidia
            ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [
            /(playstation [345portablevi]+)/i                                   // Playstation
            ], [MODEL, [VENDOR, SONY], [TYPE, CONSOLE]], [
            /\b(xbox(?: one)?(?!; xbox))[\); ]/i                                // Microsoft Xbox
            ], [MODEL, [VENDOR, MICROSOFT], [TYPE, CONSOLE]], [

            ///////////////////
            // WEARABLES
            ///////////////////

            /((pebble))app/i                                                    // Pebble
            ], [VENDOR, MODEL, [TYPE, WEARABLE]], [
            /(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i                              // Apple Watch
            ], [MODEL, [VENDOR, APPLE], [TYPE, WEARABLE]], [
            /droid.+; (glass) \d/i                                              // Google Glass
            ], [MODEL, [VENDOR, GOOGLE], [TYPE, WEARABLE]], [
            /droid.+; (wt63?0{2,3})\)/i
            ], [MODEL, [VENDOR, ZEBRA], [TYPE, WEARABLE]], [
            /(quest( 2| pro)?)/i                                                // Oculus Quest
            ], [MODEL, [VENDOR, FACEBOOK], [TYPE, WEARABLE]], [

            ///////////////////
            // EMBEDDED
            ///////////////////

            /(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i                              // Tesla
            ], [VENDOR, [TYPE, EMBEDDED]], [
            /(aeobc)\b/i                                                        // Echo Dot
            ], [MODEL, [VENDOR, AMAZON], [TYPE, EMBEDDED]], [

            ////////////////////
            // MIXED (GENERIC)
            ///////////////////

            /droid .+?; ([^;]+?)(?: bui|; wv\)|\) applew).+? mobile safari/i    // Android Phones from Unidentified Vendors
            ], [MODEL, [TYPE, MOBILE]], [
            /droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i       // Android Tablets from Unidentified Vendors
            ], [MODEL, [TYPE, TABLET]], [
            /\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i                      // Unidentifiable Tablet
            ], [[TYPE, TABLET]], [
            /(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i    // Unidentifiable Mobile
            ], [[TYPE, MOBILE]], [
            /(android[-\w\. ]{0,9});.+buil/i                                    // Generic Android Device
            ], [MODEL, [VENDOR, 'Generic']]
        ],

        engine : [[

            /windows.+ edge\/([\w\.]+)/i                                       // EdgeHTML
            ], [VERSION, [NAME, EDGE+'HTML']], [

            /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i                         // Blink
            ], [VERSION, [NAME, 'Blink']], [

            /(presto)\/([\w\.]+)/i,                                             // Presto
            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna
            /ekioh(flow)\/([\w\.]+)/i,                                          // Flow
            /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,                           // KHTML/Tasman/Links
            /(icab)[\/ ]([23]\.[\d\.]+)/i,                                      // iCab
            /\b(libweb)/i
            ], [NAME, VERSION], [

            /rv\:([\w\.]{1,9})\b.+(gecko)/i                                     // Gecko
            ], [VERSION, NAME]
        ],

        os : [[

            // Windows
            /microsoft (windows) (vista|xp)/i                                   // Windows (iTunes)
            ], [NAME, VERSION], [
            /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i             // Windows Phone
            ], [NAME, [VERSION, strMapper, windowsVersionMap]], [
            /windows nt 6\.2; (arm)/i,                                        // Windows RT
            /windows[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i,
            /(?:win(?=3|9|n)|win 9x )([nt\d\.]+)/i
            ], [[VERSION, strMapper, windowsVersionMap], [NAME, 'Windows']], [

            // iOS/macOS
            /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,              // iOS
            /(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,
            /cfnetwork\/.+darwin/i
            ], [[VERSION, /_/g, '.'], [NAME, 'iOS']], [
            /(mac os x) ?([\w\. ]*)/i,
            /(macintosh|mac_powerpc\b)(?!.+haiku)/i                             // Mac OS
            ], [[NAME, MAC_OS], [VERSION, /_/g, '.']], [

            // Mobile OSes
            /droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i                    // Android-x86/HarmonyOS
            ], [VERSION, NAME], [                                               // Android/WebOS/QNX/Bada/RIM/Maemo/MeeGo/Sailfish OS
            /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,
            /(blackberry)\w*\/([\w\.]*)/i,                                      // Blackberry
            /(tizen|kaios)[\/ ]([\w\.]+)/i,                                     // Tizen/KaiOS
            /\((series40);/i                                                    // Series 40
            ], [NAME, VERSION], [
            /\(bb(10);/i                                                        // BlackBerry 10
            ], [VERSION, [NAME, BLACKBERRY]], [
            /(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i         // Symbian
            ], [VERSION, [NAME, 'Symbian']], [
            /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i // Firefox OS
            ], [VERSION, [NAME, FIREFOX+' OS']], [
            /web0s;.+rt(tv)/i,
            /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i                              // WebOS
            ], [VERSION, [NAME, 'webOS']], [
            /watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i                              // watchOS
            ], [VERSION, [NAME, 'watchOS']], [

            // Google Chromecast
            /crkey\/([\d\.]+)/i                                                 // Google Chromecast
            ], [VERSION, [NAME, CHROME+'cast']], [
            /(cros) [\w]+(?:\)| ([\w\.]+)\b)/i                                  // Chromium OS
            ], [[NAME, CHROMIUM_OS], VERSION],[

            // Smart TVs
            /panasonic;(viera)/i,                                               // Panasonic Viera
            /(netrange)mmh/i,                                                   // Netrange
            /(nettv)\/(\d+\.[\w\.]+)/i,                                         // NetTV

            // Console
            /(nintendo|playstation) ([wids345portablevuch]+)/i,                 // Nintendo/Playstation
            /(xbox); +xbox ([^\);]+)/i,                                         // Microsoft Xbox (360, One, X, S, Series X, Series S)

            // Other
            /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,                            // Joli/Palm
            /(mint)[\/\(\) ]?(\w*)/i,                                           // Mint
            /(mageia|vectorlinux)[; ]/i,                                        // Mageia/VectorLinux
            /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
                                                                                // Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus/Raspbian/Plan9/Minix/RISCOS/Contiki/Deepin/Manjaro/elementary/Sabayon/Linspire
            /(hurd|linux) ?([\w\.]*)/i,                                         // Hurd/Linux
            /(gnu) ?([\w\.]*)/i,                                                // GNU
            /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, // FreeBSD/NetBSD/OpenBSD/PC-BSD/GhostBSD/DragonFly
            /(haiku) (\w+)/i                                                    // Haiku
            ], [NAME, VERSION], [
            /(sunos) ?([\w\.\d]*)/i                                             // Solaris
            ], [[NAME, 'Solaris'], VERSION], [
            /((?:open)?solaris)[-\/ ]?([\w\.]*)/i,                              // Solaris
            /(aix) ((\d)(?=\.|\)| )[\w\.])*/i,                                  // AIX
            /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, // BeOS/OS2/AmigaOS/MorphOS/OpenVMS/Fuchsia/HP-UX/SerenityOS
            /(unix) ?([\w\.]*)/i                                                // UNIX
            ], [NAME, VERSION]
        ]
    };

    /////////////////
    // Constructor
    ////////////////

    var UAParser = function (ua, extensions) {

        if (typeof ua === OBJ_TYPE) {
            extensions = ua;
            ua = undefined;
        }

        if (!(this instanceof UAParser)) {
            return new UAParser(ua, extensions).getResult();
        }

        var _navigator = (typeof window !== UNDEF_TYPE && window.navigator) ? window.navigator : undefined;
        var _ua = ua || ((_navigator && _navigator.userAgent) ? _navigator.userAgent : EMPTY);
        var _uach = (_navigator && _navigator.userAgentData) ? _navigator.userAgentData : undefined;
        var _rgxmap = extensions ? extend(regexes, extensions) : regexes;
        var _isSelfNav = _navigator && _navigator.userAgent == _ua;

        this.getBrowser = function () {
            var _browser = {};
            _browser[NAME] = undefined;
            _browser[VERSION] = undefined;
            rgxMapper.call(_browser, _ua, _rgxmap.browser);
            _browser[MAJOR] = majorize(_browser[VERSION]);
            // Brave-specific detection
            if (_isSelfNav && _navigator && _navigator.brave && typeof _navigator.brave.isBrave == FUNC_TYPE) {
                _browser[NAME] = 'Brave';
            }
            return _browser;
        };
        this.getCPU = function () {
            var _cpu = {};
            _cpu[ARCHITECTURE] = undefined;
            rgxMapper.call(_cpu, _ua, _rgxmap.cpu);
            return _cpu;
        };
        this.getDevice = function () {
            var _device = {};
            _device[VENDOR] = undefined;
            _device[MODEL] = undefined;
            _device[TYPE] = undefined;
            rgxMapper.call(_device, _ua, _rgxmap.device);
            if (_isSelfNav && !_device[TYPE] && _uach && _uach.mobile) {
                _device[TYPE] = MOBILE;
            }
            // iPadOS-specific detection: identified as Mac, but has some iOS-only properties
            if (_isSelfNav && _device[MODEL] == 'Macintosh' && _navigator && typeof _navigator.standalone !== UNDEF_TYPE && _navigator.maxTouchPoints && _navigator.maxTouchPoints > 2) {
                _device[MODEL] = 'iPad';
                _device[TYPE] = TABLET;
            }
            return _device;
        };
        this.getEngine = function () {
            var _engine = {};
            _engine[NAME] = undefined;
            _engine[VERSION] = undefined;
            rgxMapper.call(_engine, _ua, _rgxmap.engine);
            return _engine;
        };
        this.getOS = function () {
            var _os = {};
            _os[NAME] = undefined;
            _os[VERSION] = undefined;
            rgxMapper.call(_os, _ua, _rgxmap.os);
            if (_isSelfNav && !_os[NAME] && _uach && _uach.platform != 'Unknown') {
                _os[NAME] = _uach.platform  
                                    .replace(/chrome os/i, CHROMIUM_OS)
                                    .replace(/macos/i, MAC_OS);           // backward compatibility
            }
            return _os;
        };
        this.getResult = function () {
            return {
                ua      : this.getUA(),
                browser : this.getBrowser(),
                engine  : this.getEngine(),
                os      : this.getOS(),
                device  : this.getDevice(),
                cpu     : this.getCPU()
            };
        };
        this.getUA = function () {
            return _ua;
        };
        this.setUA = function (ua) {
            _ua = (typeof ua === STR_TYPE && ua.length > UA_MAX_LENGTH) ? trim(ua, UA_MAX_LENGTH) : ua;
            return this;
        };
        this.setUA(_ua);
        return this;
    };

    UAParser.VERSION = LIBVERSION;
    UAParser.BROWSER =  enumerize([NAME, VERSION, MAJOR]);
    UAParser.CPU = enumerize([ARCHITECTURE]);
    UAParser.DEVICE = enumerize([MODEL, VENDOR, TYPE, CONSOLE, MOBILE, SMARTTV, TABLET, WEARABLE, EMBEDDED]);
    UAParser.ENGINE = UAParser.OS = enumerize([NAME, VERSION]);

    ///////////
    // Export
    //////////

    // check js environment
    if (typeof(exports) !== UNDEF_TYPE) {
        // nodejs env
        if ("object" !== UNDEF_TYPE && module.exports) {
            exports = module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else {
        // requirejs env (optional)
        if ("function" === FUNC_TYPE && __webpack_require__.amdO) {
            !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
                return UAParser;
            }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
        } else if (typeof window !== UNDEF_TYPE) {
            // browser env
            window.UAParser = UAParser;
        }
    }

    // jQuery/Zepto specific (optional)
    // Note:
    //   In AMD env the global scope should be kept clean, but jQuery is an exception.
    //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
    //   and we should catch that.
    var $ = typeof window !== UNDEF_TYPE && (window.jQuery || window.Zepto);
    if ($ && !$.ua) {
        var parser = new UAParser();
        $.ua = parser.getResult();
        $.ua.get = function () {
            return parser.getUA();
        };
        $.ua.set = function (ua) {
            parser.setUA(ua);
            var result = parser.getResult();
            for (var prop in result) {
                $.ua[prop] = result[prop];
            }
        };
    }

})(typeof window === 'object' ? window : this);


/***/ }),

/***/ 2376:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __addDisposableResource: () => (/* binding */ __addDisposableResource),
/* harmony export */   __assign: () => (/* binding */ __assign),
/* harmony export */   __asyncDelegator: () => (/* binding */ __asyncDelegator),
/* harmony export */   __asyncGenerator: () => (/* binding */ __asyncGenerator),
/* harmony export */   __asyncValues: () => (/* binding */ __asyncValues),
/* harmony export */   __await: () => (/* binding */ __await),
/* harmony export */   __awaiter: () => (/* binding */ __awaiter),
/* harmony export */   __classPrivateFieldGet: () => (/* binding */ __classPrivateFieldGet),
/* harmony export */   __classPrivateFieldIn: () => (/* binding */ __classPrivateFieldIn),
/* harmony export */   __classPrivateFieldSet: () => (/* binding */ __classPrivateFieldSet),
/* harmony export */   __createBinding: () => (/* binding */ __createBinding),
/* harmony export */   __decorate: () => (/* binding */ __decorate),
/* harmony export */   __disposeResources: () => (/* binding */ __disposeResources),
/* harmony export */   __esDecorate: () => (/* binding */ __esDecorate),
/* harmony export */   __exportStar: () => (/* binding */ __exportStar),
/* harmony export */   __extends: () => (/* binding */ __extends),
/* harmony export */   __generator: () => (/* binding */ __generator),
/* harmony export */   __importDefault: () => (/* binding */ __importDefault),
/* harmony export */   __importStar: () => (/* binding */ __importStar),
/* harmony export */   __makeTemplateObject: () => (/* binding */ __makeTemplateObject),
/* harmony export */   __metadata: () => (/* binding */ __metadata),
/* harmony export */   __param: () => (/* binding */ __param),
/* harmony export */   __propKey: () => (/* binding */ __propKey),
/* harmony export */   __read: () => (/* binding */ __read),
/* harmony export */   __rest: () => (/* binding */ __rest),
/* harmony export */   __runInitializers: () => (/* binding */ __runInitializers),
/* harmony export */   __setFunctionName: () => (/* binding */ __setFunctionName),
/* harmony export */   __spread: () => (/* binding */ __spread),
/* harmony export */   __spreadArray: () => (/* binding */ __spreadArray),
/* harmony export */   __spreadArrays: () => (/* binding */ __spreadArrays),
/* harmony export */   __values: () => (/* binding */ __values),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */

var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
  __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
  }
  return __assign.apply(this, arguments);
}

function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
}

function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
  return function (target, key) { decorator(target, key, paramIndex); }
}

function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
          if (result === void 0) continue;
          if (result === null || typeof result !== "object") throw new TypeError("Object expected");
          if (_ = accept(result.get)) descriptor.get = _;
          if (_ = accept(result.set)) descriptor.set = _;
          if (_ = accept(result.init)) initializers.unshift(_);
      }
      else if (_ = accept(result)) {
          if (kind === "field") initializers.unshift(_);
          else descriptor[key] = _;
      }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};

function __runInitializers(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};

function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x);
};

function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};

function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
              case 0: case 1: t = op; break;
              case 4: _.label++; return { value: op[1], done: false };
              case 5: _.label++; y = op[1]; op = [0]; continue;
              case 7: op = _.ops.pop(); _.trys.pop(); continue;
              default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                  if (t[2]) _.ops.pop();
                  _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
  }
  Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

function __exportStar(m, o) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
      next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
      }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  }
  catch (error) { e = { error: error }; }
  finally {
      try {
          if (r && !r.done && (m = i["return"])) m.call(i);
      }
      finally { if (e) throw e.error; }
  }
  return ar;
}

/** @deprecated */
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
  return ar;
}

/** @deprecated */
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
  return r;
}

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
      }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
  function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
  function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
  function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
  function fulfill(value) { resume("next", value); }
  function reject(value) { resume("throw", value); }
  function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
  function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
  return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
  o["default"] = v;
};

function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
}

function __importDefault(mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof state === "function" ? receiver === state : state.has(receiver);
}

function __addDisposableResource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose;
    if (async) {
        if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
        dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
        if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
        dispose = value[Symbol.dispose];
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    env.stack.push({ value: value, dispose: dispose, async: async });
  }
  else if (async) {
    env.stack.push({ async: true });
  }
  return value;
}

var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
    env.hasError = true;
  }
  function next() {
    while (env.stack.length) {
      var rec = env.stack.pop();
      try {
        var result = rec.dispose && rec.dispose.call(rec.value);
        if (rec.async) return Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
      }
      catch (e) {
          fail(e);
      }
    }
    if (env.hasError) throw env.error;
  }
  return next();
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __extends,
  __assign,
  __rest,
  __decorate,
  __param,
  __metadata,
  __awaiter,
  __generator,
  __createBinding,
  __exportStar,
  __values,
  __read,
  __spread,
  __spreadArrays,
  __spreadArray,
  __await,
  __asyncGenerator,
  __asyncDelegator,
  __asyncValues,
  __makeTemplateObject,
  __importStar,
  __importDefault,
  __classPrivateFieldGet,
  __classPrivateFieldSet,
  __classPrivateFieldIn,
  __addDisposableResource,
  __disposeResources,
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/amd options */
/******/ 	(() => {
/******/ 		__webpack_require__.amdO = {};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2928);
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1396);
/* harmony import */ var _trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _trezor_connect_lib_factory__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7464);
/* harmony import */ var _trezor_connect_web_lib_channels_window_serviceworker__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7312);


// NOTE: @trezor/connect part is intentionally not imported from the index



const eventEmitter = new (events__WEBPACK_IMPORTED_MODULE_0___default())();
let _channel;
const manifest = data => {
  if (_channel) {
    _channel.postMessage({
      type: _trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__.POPUP.INIT,
      payload: {
        settings: {
          manifest: data
        }
      }
    });
  }
  return Promise.resolve(undefined);
};
const dispose = () => {
  eventEmitter.removeAllListeners();
  return Promise.resolve(undefined);
};
const cancel = () => {
  if (_channel) {
    _channel.clear();
  }
};
const init = (settings = {}) => {
  if (!_channel) {
    _channel = new _trezor_connect_web_lib_channels_window_serviceworker__WEBPACK_IMPORTED_MODULE_2__/* .WindowServiceWorkerChannel */ .E({
      name: 'trezor-connect-proxy',
      channel: {
        here: '@trezor/connect-foreground-proxy',
        peer: '@trezor/connect-service-worker-proxy'
      }
    });
  }
  _channel.port.onMessage.addListener(message => {
    if (message.type === _trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__.WEBEXTENSION.CHANNEL_HANDSHAKE_CONFIRM) {
      eventEmitter.emit(_trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__.WEBEXTENSION.CHANNEL_HANDSHAKE_CONFIRM, message);
    }
  });
  return _channel.init().then(() => _channel.postMessage({
    type: _trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__.POPUP.INIT,
    payload: {
      settings
    }
  }, {
    usePromise: false
  }));
};
const call = async params => {
  try {
    const response = await _channel.postMessage({
      type: _trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__.IFRAME.CALL,
      payload: params
    });
    if (response) {
      return response;
    }
    return (0,_trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__.createErrorMessage)(_trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__.ERRORS.TypedError('Method_NoResponse'));
  } catch (error) {
    _channel.clear();
    return (0,_trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__.createErrorMessage)(error);
  }
};
const uiResponse = () => {
  // Not needed here.
  throw _trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__.ERRORS.TypedError('Method_InvalidPackage');
};
const renderWebUSBButton = () => {
  // Not needed here - webUSB pairing happens in popup.
  throw _trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__.ERRORS.TypedError('Method_InvalidPackage');
};
const requestLogin = () => {
  // Not needed here - Not used here.
  throw _trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__.ERRORS.TypedError('Method_InvalidPackage');
};
const disableWebUSB = () => {
  // Not needed here - webUSB pairing happens in popup.
  throw _trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__.ERRORS.TypedError('Method_InvalidPackage');
};
const requestWebUSBDevice = () => {
  // Not needed here - webUSB pairing happens in popup.
  throw _trezor_connect_lib_exports__WEBPACK_IMPORTED_MODULE_1__.ERRORS.TypedError('Method_InvalidPackage');
};
const TrezorConnect = (0,_trezor_connect_lib_factory__WEBPACK_IMPORTED_MODULE_3__/* .factory */ .i)({
  eventEmitter,
  manifest,
  init,
  call,
  requestLogin,
  uiResponse,
  renderWebUSBButton,
  disableWebUSB,
  requestWebUSBDevice,
  cancel,
  dispose
});

// eslint-disable-next-line import/no-default-export
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TrezorConnect);

})();

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});