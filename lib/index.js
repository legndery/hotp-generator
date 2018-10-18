"use strict";

var fs = require('fs');

var path = require('path');

var argv = process.argv;
argv.splice(0, 2);
var COUNTER = 60;
var OFFSET = -30;
var onlyOTP = false;

if (argv.length === 1) {
  var _nKey = argv[0];

  if (_nKey === '-o') {
    onlyOTP = true;
  } else fs.writeFileSync(path.resolve(__dirname, '../data/key'), _nKey.trim());
}

var nKey = fs.readFileSync(path.resolve(__dirname, '../data/key')).toString();

if (!nKey) {
  console.log("Usage: hotp-gen [key]\n\nOutputs RFC4662 OTP\nIf <Key> is present the secret Key will be set.");
  process.exit(0);
}

var jsOTP = require('./modules/HOTP');

var hotp = new jsOTP.hotp();

try {
  var time = Math.round((new Date().getTime() / 1000.0 + OFFSET) / COUNTER);
  var hmacCode = hotp.getOtp(nKey, time);
  var remainingTime = COUNTER - Math.round(new Date().getTime() / 1000.0) % 60;
  process.stdout.write(hmacCode);
  !onlyOTP && console.log("\nRemaining Time: ".concat(remainingTime, "secs"));
} catch (e) {
  console.log("Invalid Key");
}