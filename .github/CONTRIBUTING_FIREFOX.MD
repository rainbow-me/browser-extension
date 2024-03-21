# Rainbow Extension for Firefox

## Prerequisites

- [yarn](https://classic.yarnpkg.com/en/docs/install)
- [nvm](https://github.com/nvm-sh/nvm)

## Getting started on Firefox

### 1. Set up Node

Use node v18 (18.18) or if you use nvm follow the instructions below

```bash
nvm install 18.18
# or
nvm use 18.18
```

### 2. Install project dependencies

```bash
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