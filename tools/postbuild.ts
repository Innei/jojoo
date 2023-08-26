import path from 'path'
import fse from 'fs-extra'

import { getEntries } from './get-entries.js'

const rootDir = process.cwd()
const distDir = path.resolve(rootDir, 'dist')

const copyAndCreateFiles = () => {
  return Promise.all([
    fse.copyFile(
      path.resolve(rootDir, 'LICENSE'),
      path.resolve(distDir, 'LICENSE'),
    ),
    fse.copyFile(
      path.resolve(rootDir, 'README.md'),
      path.resolve(distDir, 'README.md'),
    ),
    fse.createFile(
      path.resolve(distDir, 'ts_version_4.8_and_above_is_required.d.ts'),
    ),
  ])
}

const createPackageJson = async (entries: Record<string, string>) => {
  const packageJsonCopy = (await fse.readJson(
    path.resolve(rootDir, 'package.json'),
  )) as Partial<typeof import('../package.json')> & {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- infer type from json file
    exports: any
    typeVersions: any
  }

  delete packageJsonCopy.devDependencies
  delete packageJsonCopy.private
  delete packageJsonCopy.scripts

  packageJsonCopy.typeVersions = {
    '>=4.8': {
      '*': ['*'],
    },
    '*': {
      '*': ['ts_version_4.8_and_above_is_required.d.ts'],
    },
  }

  packageJsonCopy.exports = {
    './package.json': './package.json',
  }

  Object.keys(entries).forEach((entryName) => {
    const nextEntryName = entryName === '.' ? '.' : `./${entryName}`
    packageJsonCopy.exports[nextEntryName] = {
      types: `${nextEntryName}/index.d.ts`,
      import: {
        types: `${nextEntryName}/index.d.ts`,
        default: `${nextEntryName}/index.mjs`,
      },
      require: `${nextEntryName}/index.cjs`,
      default: `${nextEntryName}/index.js`,
    }
  })

  await fse.writeFile(
    path.resolve(distDir, 'package.json'),
    JSON.stringify(packageJsonCopy, null, 2),
  )
}

;(async () => {
  const entriesPromise = getEntries()

  await Promise.all([
    copyAndCreateFiles(),
    createPackageJson(await entriesPromise),
  ])
})()
