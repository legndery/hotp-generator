const fs = require('fs');
const path = require('path');
const argv = process.argv;
argv.splice(0,2);
const COUNTER = 60;
const OFFSET = -30;
let onlyOTP = false;
if(argv.length === 1){
    const nKey = argv[0];
    if(nKey === '-o'){
        onlyOTP = true;
    }else
        fs.writeFileSync(path.resolve(__dirname , '../data/key'), nKey.trim());
}
const nKey = fs.readFileSync(path.resolve(__dirname , '../data/key')).toString().trim();
if(!nKey){
    console.log(`Usage: hotp-gen [key]\n\nOutputs RFC4662 OTP\nIf <Key> is present the secret Key will be set.`)
    process.exit(0);
}
const jsOTP = require('./modules/HOTP');
var hotp = new jsOTP.hotp();
try{
    const time = Math.round(((new Date().getTime() / (1000.0))+ OFFSET)/COUNTER);
    const hmacCode = hotp.getOtp(nKey, time);
    const remainingTime =  COUNTER - Math.round(new Date().getTime() /1000.0)%60;
    process.stdout.write(hmacCode);
    !onlyOTP && console.log(`\nRemaining Time: ${remainingTime}secs`)
}catch(e) {
    console.log("Invalid Key");
}
