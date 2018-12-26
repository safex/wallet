# SAFEX CASH WALLET

Official repository for consolidated lightweight Safex Cash wallet.

## Releases

You can download [CASH Wallet](https://github.com/safex/wallet/releases) on the github release page.

Available for Mac, Windows (64, 32) and Linux.

## Development

Electron app consists of main (backend) and renderer (frontend) processes. Frontend is based on [create-react-app](https://github.com/facebook/create-react-app). You'll want to start both in development mode at the same time.

#### Backend:

To start project backend, run this:

#### Windows

Run Command Prompt as Administrator

```
$ npm install --global --production windows-build-tools
$ npm install
$ npm run dev
```

#### Linux

```
$ npm install
$ npm run dev
```

#### MacOS

```
$ npm install
$ ./node_modules/.bin/electron-rebuild
$ npm run dev
```

## Build:

Run

```
npm run make-all-installers
```

to make all installer. This will work only on Mac because of Mac.

You can also run

```
npm run make-win-installer
npm run make-mac-installer
npm run make-linux-installer
```

separately.

For linux builds, you will need to have `rpmbuild` available on system (`apt-get install rpm`).

## License

MIT License

Copyright (c) 2018 Safex Developers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
