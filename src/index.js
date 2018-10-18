const fs = require('fs');
const argv = process.argv;
argv.splice(0,2);
const COUNTER = 60;
const OFFSET = -30;
if(argv.length === 1){
    const nKey = argv[0];
    fs.writeFileSync('data/key', nKey.trim());
}
const nKey = fs.readFileSync('data/key').toString();
if(!nKey){
    console.log(`Usage: hotp-gen [key]\n\nOutputs RFC4662 OTP\nIf <Key> is present the secret Key will be set.`)
    return;
}
const jsOTP = require('./modules/HOTP');
var hotp = new jsOTP.hotp();
try{
    const time = Math.round(((new Date().getTime() / (1000.0))+ OFFSET)/COUNTER);
    const hmacCode = hotp.getOtp(nKey, time);
    const remainingTime =  COUNTER - Math.round(new Date().getTime() /1000.0)%60;
    console.log(hmacCode);
    console.log(`Remaining Time: ${remainingTime}secs`)
}catch(e) {
    console.log("Invalid Key");
}