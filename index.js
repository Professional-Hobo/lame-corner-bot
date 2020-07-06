'use strict'

require('dotenv').config() // Loads local .env file if it exists

const path = require('path')
const { Client } = require('discord.js-commando')
const logger = require('./lib/logger')

const client = new Client({
  owner: process.env.OWNER_ID,
  commandPrefix: process.env.PREFIX,
})

client.registry
  .registerGroups([
    { id: 'misc', name: 'Miscellaneous' },
  ])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'))

client.once('ready', () => {
  logger.info(`[${client.user.tag}]: Logged in`)
})

// client.on('message', async msg => {
//   try {
//     // TODO Register listeners for non-command stuff here
//   } catch (err) {
//     console.error(err)
//     await msg.channel.send(brokenCmdMsg)
//   }
// })

client
  .login(process.env.DISCORD_TOKEN)
  .catch(err => {
    logger.error('Failed to login.', err)
    process.exit(1)
  })
