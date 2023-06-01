# Mina zkApp: Actions Reducer

A more complex reducer, where `actionType` is based on a composite `Struct`.

~~~typescript
  class Composite extends Struct({
    isIncrement: Bool,
    otherData: Field,
    // we use this fillers to test if we 
    // can have a big composite struct
    filler0: Field,
    filler1: Field,
    filler2: Field,
    filler3: Field,
    filler4: Field,
    filler5: Field,
    filler6: Field,
    filler7: Field,
    filler8: Field,
    filler9: Field,
  }) {}

  reducer = Reducer({ actionType: Composite });
~~~

This example is based on [snarkyjs/src/examples/zkapps
/reducer](https://github.com/o1-labs/snarkyjs/tree/main/src/examples/zkapps/reducer)

Enviro:

- Uses TypeScript. 
- Uses `node 19` (via `nvm use stable`)
- Tested with `snarkyjs 0.10`
- Was created using `zk client`.
- Output of `zk system`:
  ~~~
  System:
    OS: Linux 5.15 Linux Mint 21.1 (Vera)
    CPU: (32) x64 AMD Ryzen 9 5950X 16-Core Processor
  Binaries:
    Node: 19.0.0 - ~/.nvm/versions/node/v19.0.0/bin/node
    Yarn: 1.22.19 - /usr/bin/yarn
    npm: 9.6.6 - ~/.nvm/versions/node/v19.0.0/bin/npm
  npmPackages:
    snarkyjs: 0.10.1
  npmGlobalPackages:
    zkapp-cli: 0.
  ~~~

## How to build
```sh
npm run build
```

## How to run 
```sh
node build/src/main-composite-reducer.js
```
