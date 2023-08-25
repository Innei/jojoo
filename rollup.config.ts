import { rmSync } from 'fs'
import browserslist from 'browserslist'
import { defineConfig } from 'rollup'
import dtsExports from 'rollup-plugin-dts'
import { preserveUseDirective, swc } from 'rollup-plugin-swc3'

import pkgJson from './package.json'
import { getEntries } from './tools/get-entries.js'

// @ts-expect-error -- rollup-plugin-dts has incorrect types
const dts = dtsExports.default as typeof dtsExports

const externalModules = Object.keys(pkgJson.dependencies || {})
  .concat(Object.keys(pkgJson.peerDependencies))
  .concat(['react-router-dom', 'next'])
const external = (id: string) => {
  return externalModules.some(
    (name) => id === name || id.startsWith(`${name}/`),
  )
}

// Same target as Next.js 13
const targets = browserslist([
  'chrome 64',
  'edge 79',
  'firefox 67',
  'opera 51',
  'safari 12',
])

export default async function () {
  rmSync('dist', { recursive: true, force: true })

  const input = await getEntries()

  return defineConfig([
    {
      input,
      output: [
        {
          dir: 'dist',
          format: 'commonjs',
          entryFileNames: '[name]/index.cjs',
        },
        {
          dir: 'dist',
          format: 'commonjs',
          entryFileNames: '[name]/index.js',
        },
        {
          dir: 'dist',
          format: 'esm',
          entryFileNames: '[name]/index.mjs',
        },
      ],
      plugins: [
        swc({
          isModule: true,
          jsc: {
            target: undefined,
            transform: {
              react: {
                runtime: 'automatic',
              },
            },
            minify: {
              compress: {
                passes: 2,
              },
              mangle: {},
              module: true,
            },
          },
          minify: true,
          env: {
            targets,
          },
        }),
        preserveUseDirective(),
      ],
      external,
      cache: true,
    },
    {
      input,
      output: {
        dir: 'dist',
        format: 'commonjs',
        entryFileNames: '[name]/index.d.ts',
      },
      plugins: [dts()],
    },
  ])
}
