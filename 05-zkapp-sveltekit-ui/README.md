# zkApp SvelteKit UI with Add contract example

An example on how to setup and build a zkApp UI using SvelteKit. 

**Why ?** 

- Currently most tutorials and examples for MINA zkApps UI are using React, and had trouble finding examples with Svelte and SvelteKit.
- At the time of this writing (2023-06-20) a project created fro SvelteKit using `zk project ...` will not build.

It demonstrates how to: 

1. **Load Snarky, init the zkApp instance, and compile the contract**
2. **Connect the Auro wallet**
3. **Call a method on the contract and send a transaction with fees payed with the wallet**

Look at the code in:

- [src/lib/contracts/helpers](./src/lib/contracts/helpers.ts)
- [src/routes/+page.svelte](./src/routes/+page.svelte).

Notes:

- It corrects config params for `vite.config.js`,`svelte.config.json`, and `tsconfig.json`. At the time of this writing (2023-06-20) a project created using `zk project ...` will not build.
- It is tested using the `static` adapter, so currently it can only be deployed as a static site or an SPA.
- The example contract is based on the MINA Protocol zkApp tutorial/example contract which adds 2 to the current state. 
- A running build of the Smart contract can be found in [NPM @mazito/zkapp-contracts-add](https://www.npmjs.com/package/@mazito/zkapp-contracts-add)
- Uses: Typescript, Node 19+, SvelteKit, Sveltestrap

## Credits

**BIG THANKS** to Coby `Discord @45930` from the MINA Community, who helped a lot to make it work. 

I also used some of his code from the [canvas-zk-app](https://github.com/45930/canvas-zk-app).

## Install

Clone this repo, remove `package-lock.json`, an install:
~~~
  npm i 
~~~

Just in case, install the Add contract from NPM:
~~~
  npm i @mazito/zkapp-contracts-add
~~~

## Developing

Once you've created a project and installed dependencies with `npm install`:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.
