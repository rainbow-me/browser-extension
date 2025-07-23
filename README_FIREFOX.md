# Rainbow Extension for Firefox

## Prerequisites

- [yarn](https://classic.yarnpkg.com/en/docs/install)
- [nvm](https://github.com/nvm-sh/nvm)

## Getting started on Firefox

### 1. Set up Node

Use node v22 (22.17.0) or if you use nvm follow the instructions below

```bash
nvm install && nvm use
corepack enable
```

### 2. Install project dependencies

```bash
yarn install
yarn setup
```


### 3. Build the extension

```bash
yarn firefox:build && yarn update-manifest:prod
```

### 4. Generate bundle

```bash
yarn zip && yarn firefox:zip
```

You should find a xpi file named `rainbowbx.xpi` in the root folder of this repository