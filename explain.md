srcDir

Define the source directory of your Nuxt application.

If a relative path is specified, it will be relative to the rootDir.

Type: string

Default: "app" (Nuxt 4), "." (Nuxt 3 with compatibilityMode: 3)

Example:

export default {

  srcDir: 'app/'

}

This expects the following folder structure:

-| app/

---| assets/

---| components/

---| layouts/

---| middleware/

---| pages/

---| plugins/

---| app.config.ts

---| app.vue

---| error.vue

-| server/

-| public/

-| modules/

-| nuxt.config.js

-| package.json

ssr

Whether to enable rendering of HTML - either dynamically (in server mode) or at generate time. If set to false generated pages will have no content.

Type: boolean

Default: true

telemetry

Manually disable nuxt telemetry.

See: Nuxt Telemetry for more information.

test

Whether your app is being unit tested.

Type: boolean

Default: false

theme

Extend project from a local or remote source.

Value should be a string pointing to source directory or config path relative to current config. You can use github:, gitlab:, bitbucket: or https:// to extend from a remote git repository.

Type: string

typescript

Configuration for Nuxt's TypeScript integration.

builder

Which builder types to include for your project.

By default Nuxt infers this based on your builder option (defaulting to 'vite') but you can either turn off builder environment types (with false) to handle this fully yourself, or opt for a 'shared' option. The 'shared' option is advised for module authors, who will want to support multiple possible builders.

Default: null

hoist

Modules to generate deep aliases for within compilerOptions.paths. This does not yet support subpaths. It may be necessary when using Nuxt within a pnpm monorepo with shamefully-hoist=false.

Type: array

Default

[

  "nitropack/types",

  "nitropack/runtime",

  "nitropack",

  "defu",

  "h3",

  "consola",

  "ofetch",

  "@unhead/vue",

  "@nuxt/devtools",

  "vue",

  "@vue/runtime-core",

  "@vue/compiler-sfc",

  "vue-router",

  "vue-router/auto-routes",

  "unplugin-vue-router/client",

  "@nuxt/schema",

  "nuxt"

]

includeWorkspace

Include parent workspace in the Nuxt project. Mostly useful for themes and module authors.

Type: boolean

Default: false

shim

Generate a *.vue shim.

We recommend instead letting the official Vue extension generate accurate types for your components. Note that you may wish to set this to true if you are using other libraries, such as ESLint, that are unable to understand the type of .vue files.

Type: boolean

Default: false

strict

TypeScript comes with certain checks to give you more safety and analysis of your program. Once you’ve converted your codebase to TypeScript, you can start enabling these checks for greater safety. Read More

Type: boolean

Default: true

tsConfig

You can extend the generated TypeScript configurations (.nuxt/tsconfig.app.json, .nuxt/tsconfig.server.json, etc.) using this option.

typeCheck

Enable build-time type checking.

If set to true, this will type check in development. You can restrict this to build-time type checking by setting it to build. Requires to install typescript and vue-tsc as dev dependencies.

Type: boolean

Default: false

See: Nuxt TypeScript docs

unhead

An object that allows us to configure the unhead nuxt module.

legacy

Enable the legacy compatibility mode for unhead module. This applies the following changes: - Disables Capo.js sorting - Adds the DeprecationsPlugin: supports hid, vmid, children, body - Adds the PromisesPlugin: supports promises as input

Type: boolean

Default: false

See: unhead migration documentation

Example:

export default defineNuxtConfig({

 unhead: {

  legacy: true

})

renderSSRHeadOptions

An object that will be passed to renderSSRHead to customize the output.

Type: object

Default

{

  "omitLineBreaks": false

}

Example:

export default defineNuxtConfig({

 unhead: {

  renderSSRHeadOptions: {

   omitLineBreaks: true

  }

})

vite

Configuration that will be passed directly to Vite.

See: Vite configuration docs for more information. Please note that not all vite options are supported in Nuxt.

build

assetsDir

Type: string

Default: "_nuxt/"

emptyOutDir

Type: boolean

Default: false

cacheDir

Type: string

Default: "/<rootDir>/node_modules/.cache/vite"

clearScreen

Type: boolean

Default: true

define

Type: object

Default

{

  "__VUE_PROD_HYDRATION_MISMATCH_DETAILS__": false,

  "process.dev": false,

  "import.meta.dev": false,

  "process.test": false,

  "import.meta.test": false

}

esbuild

Type: object

Default

{

  "target": "esnext",

  "jsxFactory": "h",

  "jsxFragment": "Fragment",

  "tsconfigRaw": {}

}

mode

Type: string

Default: "production"

optimizeDeps

esbuildOptions

Type: object

Default

{

  "target": "esnext",

  "jsxFactory": "h",

  "jsxFragment": "Fragment",

  "tsconfigRaw": {}

}

exclude

Type: array

Default

[

  "vue-demi"

]

publicDir

resolve

extensions

Type: array

Default

[

  ".mjs",

  ".js",

  ".ts",

  ".jsx",

  ".tsx",

  ".json",

  ".vue"

]

root

Type: string

Default: "/<srcDir>"

server

fs

allow

Type: array

Default

[

  "/<rootDir>/.nuxt",

  "/<srcDir>",

  "/<rootDir>",

  "/<workspaceDir>"

]

vue

features

propsDestructure

Type: boolean

Default: true

isProduction

Type: boolean

Default: true

script

hoistStatic

template

compilerOptions

Type: object

transformAssetUrls

Type: object

Default

{

  "video": [

    "src",

    "poster"

  ],

  "source": [

    "src"

  ],

  "img": [

    "src"

  ],

  "image": [

    "xlink:href",

    "href"

  ],

  "use": [

    "xlink:href",

    "href"

  ]

}

vueJsx

Type: object

Default

{

  "isCustomElement": {

    "$schema": {

      "title": "",

      "description": "",

      "tags": []

    }

  }

}

vue

Vue.js config

compilerOptions

Options for the Vue compiler that will be passed at build time.

See: Vue documentation

config

It is possible to pass configure the Vue app globally. Only serializable options may be set in your nuxt.config. All other options should be set at runtime in a Nuxt plugin..

See: Vue app config documentation

propsDestructure

Enable reactive destructure for defineProps

Type: boolean

Default: true

runtimeCompiler

Include Vue compiler in runtime bundle.

Type: boolean

Default: false

transformAssetUrls

image

Type: array

Default

[

  "xlink:href",

  "href"

]

img

Type: array

Default

[

  "src"

]

source

Type: array

Default

[

  "src"

]

use

Type: array

Default

[

  "xlink:href",

  "href"

]

video

Type: array

Default

[

  "src",

  "poster"

]

watch

The watch property lets you define patterns that will restart the Nuxt dev server when changed.

It is an array of strings or regular expressions. Strings should be either absolute paths or relative to the srcDir (and the srcDir of any layers). Regular expressions will be matched against the path relative to the project srcDir (and the srcDir of any layers).

Type: array

watchers

The watchers property lets you overwrite watchers configuration in your nuxt.config.

chokidar

Options to pass directly to chokidar.

See: chokidar

ignoreInitial

Type: boolean

Default: true

ignorePermissionErrors

Type: boolean

Default: true

rewatchOnRawEvents

An array of event types, which, when received, will cause the watcher to restart.

webpack

watchOptions to pass directly to webpack.

See: webpack@4 watch options.

aggregateTimeout

Type: number

Default: 1000

webpack

aggressiveCodeRemoval

Hard-replaces typeof process, typeof window and typeof document to tree-shake bundle.

Type: boolean

Default: false

analyze

Nuxt uses webpack-bundle-analyzer to visualize your bundles and how to optimize them.

Set to true to enable bundle analysis, or pass an object with options: for webpack or for vite.

Type: object

Default

{

  "template": "treemap",

  "projectRoot": "/<rootDir>",

  "filename": "/<rootDir>/.nuxt/analyze/{name}.html"

}

Example:

analyze: {

  analyzerMode: 'static'

}

cssSourceMap

Enables CSS source map support (defaults to true in development).

Type: boolean

Default: false

devMiddleware

See webpack-dev-middleware for available options.

stats

Type: string

Default: "none"

experiments

Configure webpack experiments

extractCSS

Enables Common CSS Extraction.

Using mini-css-extract-plugin under the hood, your CSS will be extracted into separate files, usually one per component. This allows caching your CSS and JavaScript separately.

Type: boolean

Default: true

Example:

export default {

  webpack: {

    extractCSS: true,

    // or

    extractCSS: {

      ignoreOrder: true

    }

  }

}

If you want to extract all your CSS to a single file, there is a workaround for this. However, note that it is not recommended to extract everything into a single file. Extracting into multiple CSS files is better for caching and preload isolation. It can also improve page performance by downloading and resolving only those resources that are needed.

Example:

export default {

  webpack: {

    extractCSS: true,

    optimization: {

      splitChunks: {

        cacheGroups: {

          styles: {

            name: 'styles',

            test: /\.(css|vue)$/,

            chunks: 'all',

            enforce: true

          }

        }

      }

    }

  }

}

filenames

Customize bundle filenames.

To understand a bit more about the use of manifests, take a look at webpack documentation.

Note: Be careful when using non-hashed based filenames in production as most browsers will cache the asset and not detect the changes on first load.

This example changes fancy chunk names to numerical ids:

Example:

filenames: {

  chunk: ({ isDev }) => (isDev ? '[name].js' : '[id].[contenthash].js')

}

app

Type: function

chunk

Type: function

css

Type: function

font

Type: function

img

Type: function

video

Type: function

friendlyErrors

Set to false to disable the overlay provided by FriendlyErrorsWebpackPlugin.

Type: boolean

Default: true

hotMiddleware

See webpack-hot-middleware for available options.

loaders

Customize the options of Nuxt's integrated webpack loaders.

css

See css-loader for available options.

esModule

Type: boolean

Default: false

importLoaders

Type: number

Default: 0

url

filter

Type: function

cssModules

See css-loader for available options.

esModule

Type: boolean

Default: false

importLoaders

Type: number

Default: 0

modules

localIdentName

Type: string

Default: "[local]_[hash:base64:5]"

url

filter

Type: function

esbuild

Type: object

Default

{

  "target": "esnext",

  "jsxFactory": "h",

  "jsxFragment": "Fragment",

  "tsconfigRaw": {}

}

See: esbuild loader

file

See: file-loader Options

Default:

{ esModule: false }

esModule

Type: boolean

Default: false

limit

Type: number

Default: 1000

fontUrl

See: file-loader Options

Default:

{ esModule: false }

esModule

Type: boolean

Default: false

limit

Type: number

Default: 1000

imgUrl

See: file-loader Options

Default:

{ esModule: false }

esModule

Type: boolean

Default: false

limit

Type: number

Default: 1000

less

Default

{

  "sourceMap": false

}

See: less-loader Options

pugPlain

See: pug options

sass

See: sass-loader Options

Default:

{

  sassOptions: {

    indentedSyntax: true

  }

}

sassOptions

indentedSyntax

Type: boolean

Default: true

scss

Default

{

  "sourceMap": false

}

See: sass-loader Options

stylus

Default

{

  "sourceMap": false

}

See: stylus-loader Options

vue

See vue-loader for available options.

compilerOptions

Type: object

propsDestructure

Type: boolean

Default: true

transformAssetUrls

Type: object

Default

{

  "video": [

    "src",

    "poster"

  ],

  "source": [

    "src"

  ],

  "img": [

    "src"

  ],

  "image": [

    "xlink:href",

    "href"

  ],

  "use": [

    "xlink:href",

    "href"

  ]

}

vueStyle

Default

{

  "sourceMap": false

}

optimization

Configure webpack optimization.

minimize

Set minimize to false to disable all minimizers. (It is disabled in development by default).

Type: boolean

Default: true

minimizer

You can set minimizer to a customized array of plugins.

runtimeChunk

Type: string

Default: "single"

splitChunks

automaticNameDelimiter

Type: string

Default: "/"

cacheGroups

chunks

Type: string

Default: "all"

optimizeCSS

OptimizeCSSAssets plugin options.

Defaults to true when extractCSS is enabled.

Type: boolean

Default: false

See: css-minimizer-webpack-plugin documentation.

plugins

Add webpack plugins.

Type: array

Example:

import webpack from 'webpack'

import { version } from './package.json'

// ...

plugins: [

  new webpack.DefinePlugin({

    'process.VERSION': version

  })

]

postcss

Customize PostCSS Loader. same options as postcss-loader options

postcssOptions

plugins

Type: object

Default

{

  "autoprefixer": {},

  "cssnano": {}

}

profile

Enable the profiler in webpackbar.

It is normally enabled by CLI argument --profile.

Type: boolean

Default: false

See: webpackbar.

serverURLPolyfill

The polyfill library to load to provide URL and URLSearchParams.

Defaults to 'url' (see package).

Type: string

Default: "url"

warningIgnoreFilters

Filters to hide build warnings.

Type: array

workspaceDir

Define the workspace directory of your application.

Often this is used when in a monorepo setup. Nuxt will attempt to detect your workspace directory automatically, but you can override it here. It is normally not needed to configure this option.

Type: string

Default: "/<workspaceDir>" اريد منك شرحه بطريقة  واضحة، موجزة، ومصاغة بلغة سهلة الفهم دون الإخلال بعمق الفكرة