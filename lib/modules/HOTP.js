"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var jsSHA = require('./sha_dev');

var Hotp, Totp;

Totp =
/*#__PURE__*/
function () {
  // pass in the secret, code dom element, ticker dom element
  function Totp() {
    var expiry = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30;
    var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6;

    _classCallCheck(this, Totp);

    this.expiry = expiry;
    this.length = length; // validate input

    if (this.length > 8 || this.length < 6) {
      throw "Error: invalid code length";
    }
  }

  _createClass(Totp, [{
    key: "dec2hex",
    value: function dec2hex(s) {
      return (s < 15.5 ? "0" : "") + Math.round(s).toString(16);
    }
  }, {
    key: "hex2dec",
    value: function hex2dec(s) {
      return parseInt(s, 16);
    }
  }, {
    key: "base32tohex",
    value: function base32tohex(base32) {
      var base32chars, bits, chunk, hex, i, val;
      base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
      bits = "";
      hex = "";
      i = 0;

      while (i < base32.length) {
        val = base32chars.indexOf(base32.charAt(i).toUpperCase());
        bits += this.leftpad(val.toString(2), 5, "0");
        i++;
      }

      i = 0;

      while (i + 4 <= bits.length) {
        chunk = bits.substr(i, 4);
        hex = hex + parseInt(chunk, 2).toString(16);
        i += 4;
      }

      return hex;
    }
  }, {
    key: "leftpad",
    value: function leftpad(str, len, pad) {
      if (len + 1 >= str.length) {
        str = Array(len + 1 - str.length).join(pad) + str;
      }

      return str;
    }
  }, {
    key: "getOtp",
    value: function getOtp(secret) {
      var now = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Date().getTime();
      var epoch, hmac, key, offset, otp, shaObj, time;
      key = this.base32tohex(secret);
      epoch = Math.round(now / 1000.0);
      time = this.leftpad(this.dec2hex(Math.floor(epoch / this.expiry)), 16, "0");
      shaObj = new jsSHA("SHA-1", "HEX");
      shaObj.setHMACKey(key, "HEX");
      shaObj.update(time);
      hmac = shaObj.getHMAC("HEX"); // hmacObj = new jsSHA(time, "HEX")  # Dependency on sha.js
      // hmac = hmacObj.getHMAC(key, "HEX", "SHA-1", "HEX")

      if (hmac === "KEY MUST BE IN BYTE INCREMENTS") {
        throw "Error: hex key must be in byte increments";
      } else {
        // return null
        offset = this.hex2dec(hmac.substring(hmac.length - 1));
      }

      otp = (this.hex2dec(hmac.substr(offset * 2, 8)) & this.hex2dec("7fffffff")) + "";

      if (otp.length > this.length) {
        otp = otp.substr(otp.length - this.length, this.length);
      } else {
        otp = this.leftpad(otp, this.length, "0");
      }

      return otp;
    }
  }]);

  return Totp;
}();

Hotp =
/*#__PURE__*/
function () {
  function Hotp() {
    var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 6;

    _classCallCheck(this, Hotp);

    this.length = length; // validate input

    if (this.length > 8 || this.length < 6) {
      throw "Error: invalid code length";
    }
  } // stuck on this for a long time. Use JSON.stringify to inspect uintToString output!!


  _createClass(Hotp, [{
    key: "uintToString",
    value: function uintToString(uintArray) {
      var decodedString, encodedString;
      encodedString = String.fromCharCode.apply(null, uintArray); // decodedString = decodeURIComponent(escape(encodedString));

      return encodedString;
    }
  }, {
    key: "getOtp",
    value: function getOtp(key, counter) {
      var digest, h, offset, shaObj, v;
      shaObj = new jsSHA("SHA-1", "BYTES");
      shaObj.setHMACKey(key, "TEXT");
      shaObj.update(this.uintToString(new Uint8Array(this.intToBytes(counter))));
      digest = shaObj.getHMAC("HEX"); // Get byte array

      h = this.hexToBytes(digest); // Truncate

      offset = h[19] & 0xf;
      v = (h[offset] & 0x7f) << 24 | (h[offset + 1] & 0xff) << 16 | (h[offset + 2] & 0xff) << 8 | h[offset + 3] & 0xff;
      v = v + '';
      return v.substr(v.length - this.length, this.length);
    }
  }, {
    key: "intToBytes",
    value: function intToBytes(num) {
      var bytes, i;
      bytes = [];
      i = 7;

      while (i >= 0) {
        bytes[i] = num & 255;
        num = num >> 8;
        --i;
      }

      return bytes;
    }
  }, {
    key: "hexToBytes",
    value: function hexToBytes(hex) {
      var C, bytes, c;
      bytes = [];
      c = 0;
      C = hex.length;

      while (c < C) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
        c += 2;
      }

      return bytes;
    }
  }]);

  return Hotp;
}();

module.exports.totp = Totp;
module.exports.hotp = Hotp;