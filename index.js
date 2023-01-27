#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'

import cac from 'cac'
import decompress from 'decompress'
import got from 'got'
import kleur from 'kleur'
import ora from 'ora'
import prompts from 'prompts'

const templates = [
  {
    name: 'elaina-template-admin-arco',
    description: 'Elaina Admin Template with Arco Design',
    repository: 'lemoe-technology/elaina-template-admin-arco',
  },
  {
    name: 'elaina-template-admin-naive',
    description: 'Elaina Admin Template with Naive UI',
    repository: null,
  },
  {
    name: 'elaina-template-admin-element',
    description: 'Elaina Admin Template with Element Plus',
    repository: null,
  },
  {
    name: 'elaina-template-admin-ant',
    description: 'Elaina Admin Template with Ant Deisgn',
    repository: null,
  },
  {
    name: 'elaina-template-api-laravel',
    description: 'Elaina Api Template with Laravel',
    repository: null,
  },
]

// Elaina.js - The Elegant Admin Framework
console.log()
console.log(
  '\x1B[38;5;228mE\x1B[39m\x1B[38;5;228ml\x1B[39m\x1B[38;5;228ma\x1B[39m\x1B[38;5;228mi\x1B[39m\x1B[38;5;228mn\x1B[39m\x1B[38;5;228ma\x1B[39m\x1B[38;5;228m.\x1B[39m\x1B[38;5;227mj\x1B[39m\x1B[38;5;227ms\x1B[39m \x1B[38;5;227m-\x1B[39m \x1B[38;5;221mT\x1B[39m\x1B[38;5;221mh\x1B[39m\x1B[38;5;221me\x1B[39m \x1B[38;5;221mE\x1B[39m\x1B[38;5;221ml\x1B[39m\x1B[38;5;221me\x1B[39m\x1B[38;5;221mg\x1B[39m\x1B[38;5;220ma\x1B[39m\x1B[38;5;220mn\x1B[39m\x1B[38;5;220mt\x1B[39m \x1B[38;5;220mA\x1B[39m\x1B[38;5;220md\x1B[39m\x1B[38;5;220mm\x1B[39m\x1B[38;5;220mi\x1B[39m\x1B[38;5;184mn\x1B[39m \x1B[38;5;184mF\x1B[39m\x1B[38;5;191mr\x1B[39m\x1B[38;5;191ma\x1B[39m\x1B[38;5;191mm\x1B[39m\x1B[38;5;191me\x1B[39m\x1B[38;5;155mw\x1B[39m\x1B[38;5;155mo\x1B[39m\x1B[38;5;155mr\x1B[39m\x1B[38;5;155mk\x1B[39m'
)
console.log()

const cli = cac()
cli
  .command('[template-name] [project-name]')
  .option('-f, --force', 'force overwriting')
  .allowUnknownOptions()
  .action((templateName, projectName, options) => {
    const answers = {}
    const template = templates.find((template) => template.name === templateName)
    if (template) {
      answers.template = template
      answers.projectName = projectName
    }
    if (options.force === true) {
      answers.overwrite = true
    }
    prompts.override(answers)
  })
cli.parse()

const { template, projectName } = await prompts(
  [
    {
      type: 'select',
      name: 'template',
      message: 'Template:',
      choices: templates.map((template) => ({
        title: template.name,
        description: template.description,
        disabled: template.repository === null,
        value: template,
      })),
    },
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'elaina-project',
    },
    {
      type: (prev) => (fs.existsSync(prev) ? 'confirm' : null),
      name: 'overwrite',
      message: (prev) => `Target directory "${prev}" is not empty. Remove existing files and continue?`,
    },
    {
      name: 'overwriteChecker',
      type: (prev) => {
        if (prev === false) {
          console.log(`${kleur.red('✖')} Canceled.`)
          process.exit(1)
        }
        return null
      },
    },
  ],
  {
    onCancel: () => {
      console.log(`${kleur.red('✖')} Abort.`)
      process.exit(1)
    },
  }
)

const directory = path.join(process.cwd(), projectName)
if (fs.existsSync(directory)) {
  fs.rmSync(directory, { recursive: true, force: true })
}
fs.mkdirSync(directory)

const spinner = ora('Downloading...').start()
const url = `https://codeload.github.com/${template.repository}/zip/refs/heads/master`
const buffer = await got.get(url).buffer()
spinner.text = 'Decompressing...'
await decompress(buffer, directory, { strip: 1 })
spinner.succeed('Done.')
