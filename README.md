# 🌈 Browser Extension

> the Ethereum wallet that lives in your browser!

👉 [Available on the Chrome Web Store](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

🐦️ [Follow us on Twitter](https://twitter.com/rainbowdotme)

## Prerequisites

- [Yarn](https://classic.yarnpkg.com/en/docs/install)
- [nvm](https://github.com/nvm-sh/nvm)

## Getting started

### 1. Set up Node

Use node v16 or if you use nvm follow the instructions below

```bash
nvm install
# or
nvm use
```

### 2. Install project dependencies

```bash
yarn setup
```

### 3. Set up your .env file

Run `touch .env`, head to the `browser-extension-env` repository, and copy + paste the variables into your `.env`

### 4. Install the ["Extensions Reloader" extension](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid?hl=en)

This extension will force reload the extension (webpack should do this automatically, but you can use this extension as a last resort).

## Importing the extension

### 1. Build the extension

```bash
yarn build
```

### 2. Enable Developer Mode in Chrome

Go to `chrome://extensions/` and enable `Developer mode`.

### 3. Import the extension

Click on `Load unpacked` and select the `build` folder.

## Development

### 1. Start the development build

Run `yarn dev` to build your changes in "watch" mode.

### 2. Make changes to the code

Any changes to your code will trigger an update to the extension.

> Tip: You can press Option + Shift + R to reload the extension (on Mac) or Ctrl + Shift + R (on Windows) - This is done via the extension reloader chrome extension from the step 4 of the setup scenario.

## Playgrounds

You can run a development build as a "playground". The following playgrounds are available:

- `yarn playground` **(Default)**: A generic playground to test out stuff.
- `yarn playground:ds` **(Design System)**: A playground to view & demo Design System components.

## Testing

### 1. Install foundry

Run `curl -L https://foundry.paradigm.xyz | bash` to install foundry.
You'll need to restart the terminal.

### 2. Run the tests

To run the Browser Extension test suites:

- `yarn e2e` – runs end-to-end tests against Chrome & Brave browsers.
- `yarn test` – runs unit/integration tests.
  - `yarn test:watch` – run tests in watch mode.
