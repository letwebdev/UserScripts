# UserScripts for TamperMonkey

- [Bundled scripts](https://github.com/letwebdev/UserScripts/tree/main/dist)
- [Source scripts](https://github.com/letwebdev/UserScripts/tree/main/src)
  - [Util scripts](https://github.com/letwebdev/UserScripts/tree/main/src/utils)

## Commands

```sh
# Build `src/*.ts`
npm run build
```

```sh
# Build specified scripts
npm run compileIntoSingleFile src/script1.ts src/script2.ts
```

```sh
# install specified scripts
npm run installScript src/script1.ts dist/script2_bundled.user.js
```

