# Lit Privacy SDKs

This monorepo is used for the development of `lit-privacy-sdk`, developed in the context of this grant: 
https://github.com/LIT-Protocol/LitGrants/issues/35

### Packages
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo
- [`lit-privacy-sdk`](https://github.com/Curve-Labs/lit-privacy/tree/main/packages/lit-privacy-sdk#readme): package that will be used to implement lit procotol for a privacy-enabled processing.
- [`lit-actions`](https://github.com/Curve-Labs/lit-privacy/tree/main/packages/lit-actions#readme): package for the development of lit-actions
- [`contracts`](https://github.com/Curve-Labs/lit-privacy/tree/main/packages/contracts#readme): package for the development of contracts required for the package to work

###  Architecture
![lit-privacy-sdk architcture](https://camo.githubusercontent.com/0813cab56a8f2d5677831256dc1de82b3502f216824cc1477db16064ab821d39/68747470733a2f2f692e696d6775722e636f6d2f383257516b73332e6a7067 "Architecture")

### Utilities

This turborepo has some additional tools already setup:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
yarn run build
```

## Getting Started

Clone the repository

Using SSH

```
git clone git@github.com:Curve-Labs/ie-bacalhau.git
```

Using HTTPS

```
git clone https://github.com/Curve-Labs/ie-bacalhau.git
```

## Prerequisites

### Global

- NodeJS [(Install NodeJS)](https://nodejs.org/en/download/)
- Yarn [(Install Yarn)](https://classic.yarnpkg.com/en/docs/install)

### Package specific

For more information on what prerequisites are required for each package, please refer to the README.md file in the corresponding package.

## Installation

To install the dependencies for this project, please run the command yarn install in your terminal. This command will install all the necessary packages required to run the application.

```
yarn
```

## Develop

To develop all apps and packages, run the following command:

```
yarn run dev
```

## Usage

**For guidance on how to use the individual packages, please refer to the README.md file within each package.**

### Run any command from within root

```
yarn workspace <workspaceName> <commandName> ...
```

### List workplaces

```
yarn workspaces list
```

## Development

### Things to keep in mind

- When making code changes, it is important to consider the scope of the changes. Changes that are relevant to a specific workspace should be made within that workspace.
- If you want to add scripts, linting rules, or hooks that should apply to the entire repo, they should be added in the root directory.
- The `./package.json` file in the root directory manages the entire monorepo, whereas the `./packages/{WORKSPACE}/package.json` file manages only that specific workspace. Any changes made in this file will only affect that workspace.
- All dependencies are installed globally and there should not be any node_modules folder within the workspace directory.
- Linting rules and scripts should also be global, therefore added in the root directory.
- Environment variables are not shared across workspaces and are specific to each one.
- When importing files from different workspaces, be sure to use the proper path.

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
