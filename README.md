# 🎰 Decentralized Slot Machine

> A decentralized slot machine with juicy rewards! 🚀

🧪 The decentralized slot machine is a DApp that allows people to bet their cryptocurrencies and multiply them by 30 with a Return to Player (RTP) of 93%. You can find how the mathematical model was built in the [RTP Model Excel File.](https://github.com/csacanam/decentralized-slot-machine/blob/master/DOCS/rtp_model.xlsx):

# 🏄‍♂️ Quick Start

Prerequisites: [Node (v18 LTS)](https://nodejs.org/en/download/) plus [Yarn (v1.x)](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

🚨 If you are using a version < v18 you will need to remove `openssl-legacy-provider` from the `start` script in `package.json`

> 1️⃣ clone/fork 🎰 decentralized-slot-machine:

```bash
git clone https://github.com/csacanam/decentralized-slot-machine.git
```

> 2️⃣ install and start your 👷‍ Hardhat chain:

```bash
cd decentralized-slot-machine
yarn install
yarn chain
```

> 3️⃣ in a second terminal window, start your 📱 frontend:

🚨 if your contracts are not deployed to localhost, you will need to update the default network in `App.jsx` to match your default network in `hardhat-config.js`.

```bash
cd decentralized-slot-machine
yarn start
```

> 4️⃣ in a third terminal window, 🛰 deploy your contract:

🚨 if you are not deploying to localhost, you will need to run `yarn generate` (using node v16.x) first and then fund the deployer account. To view account balances, run `yarn account`. You will aslo need to update `hardhat-config.js` with the correct default network.

👀 Side Quest: we need to update this process to use node v18.x 🪄

```bash
cd decentralized-slot-machine
yarn deploy
```

🔏 Edit the smart contract `SlotMachine.sol` in `packages/hardhat/contracts`

📝 Edit the frontend `App.jsx` in `packages/react-app/src`

💼 Edit the deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

🚨📡 To deploy to a public domain, use `yarn surge`. You will need to have a surge account and have the surge CLI installed. There is also the option to deploy to IPFS using `yarn ipfs` and `yarn s3` to deploy to an AWS bucket 🪣 There are scripts in the `packages/react-app/src/scripts` folder to help with this.`

# 💌 P.S.

🌍 You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

📣 Make sure you update the `InfuraID` before you go to production. Huge thanks to [Infura](https://infura.io/) for our special account that fields 7m req/day!
