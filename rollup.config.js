import typescript from "@rollup/plugin-typescript"
import AutoImport from "unplugin-auto-import/rollup"

import { defineConfig } from "rollup"
export default defineConfig({
  treeshake: {
    propertyReadSideEffects: false,
  },
  input: "src/main.ts",
  output: {
    file: "dist/bundle.ts",
  },
  plugins: [
    typescript(),
    AutoImport({
      // targets to transform
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
      ],
      imports: [
        {
          from: "src/types",
          // TODO
          imports: ["Response_GM_XMLHttpRequest"],
          type: true,
        },
      ],

      // Array of strings of regexes that contains imports meant to be filtered out.
      ignore: ["useMouse", "useFetch"],

      dirs: [
        "./src/utils",
        "./src/types",
        // './composables' // only root modules
        // './composables/**', // all nested modules
      ],
    }),
  ],
})
