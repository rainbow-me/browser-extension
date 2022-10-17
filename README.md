# 🌈  Browser Extension


> the Ethereum wallet that lives in your browser!

📲️ [Available on the iOS App Store.](https://apps.apple.com/us/app/rainbow-ethereum-wallet/id1457119021)

🤖 [Android Beta available on Google Play Store](https://play.google.com/store/apps/details?id=me.rainbow)

🐦️ [Follow us on Twitter](https://twitter.com/rainbowdotme)

## General

The extension is built using [React](https://reactjs.org/) and [Typescript](https://www.typescriptlang.org/) and is bundled using [Webpack](https://webpack.js.org/), then secured using [LavaMoat Browserify](https://github.com/LavaMoat/lavamoat).

## Setup

1. Run `nvm use 14` to force Node.js v14.

2. Install all project dependencies with `yarn setup`


3. Set up your .env file, use our env.example as a guide.

   **_Note that some features are currently not accessible, we are working with our Data Providers in order to provide open source API Keys!_**

   Here are some resources to generate your own API keys:

   - Etherscan: https://etherscan.io/apis
   - Infura: https://infura.io/
   - ETH Gas Station: https://docs.ethgasstation.info/
   - Imgix: https://www.imgix.com/

4. Install this chrome extension https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid?hl=en

### Running the extension


1. Build the extension with `yarn build`

2. Go to `chrome://extensions/` and enable `Developer mode`

3. Click on `Load unpacked` and select the `build` folder


### Development 
   

1. Do steps 1 to 3 from the `Running the extension` section
2. Run `yarn dev` to start the development server
3. Make changes to the code, the build will be automatically updated
4. Hit Option + Shift + R to reload the extension (on Mac) or Ctrl + Shift + R (on Windows) - This is done via the extension reloader chrome extension from the step 4 of the setup scenario.


### Testing
TBD
