'use strict'

require('dotenv').config() // Loads local .env file if it exists

const path = require('path')
const { Client } = require('discord.js-commando')
const jobs = require('./jobs')

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
  client.user.setActivity(process.env.ACTIVITY)
  console.log(`[${client.user.tag}]: Logged in`)
})

/**
 * Entrypoint for the bot.
 */
async function start() {
  try {
    await client.login(process.env.DISCORD_TOKEN)
    await jobs.register(client)
  } catch (err) {
    if (err.code === 'TOKEN_INVALID') {
      console.error('Failed to login')
    }

    console.error(err)
    process.exit(1)
  }
}

start()
