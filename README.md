## HOTP-Generator

This is a simple wrapper to generate HOTP or RFC4662 OTP using current time and given private key.  
The actual HOTP and SHA implementation is taken from [JS-OTP](https://github.com/jiangts/JS-OTP)

### Installing as NPM global package
1. NPM install from Git
    ```bash
    $ npm i -g legndery/hotp-generator.git
    ```
2. Run the package
    ```bash
    $ hotp-gen
    OR
    $ hotp-gen -o | pbcopy #to directly copy the OTP
    ```