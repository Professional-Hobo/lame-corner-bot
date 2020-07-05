'use strict'

require('dotenv').config() // Loads local .env file if it exists

const { Client, MessageEmbed } = require('discord.js')

const client = new Client()
const brokenCmdMsg = new MessageEmbed()
  .setTitle('Command Broken :tools:')
  .setDescription('This command is broken right now :sob:.\nPlease let an admin know so they can fix it.')
  .setColor('#dc3e3e')

client.once('ready', () => {
  console.log(`[${client.user.tag}]: Logged in`)
})

client.on('message', async msg => {
  try {
    // TODO Check for bot commands and other continuously running tasks
  } catch (err) {
    console.error(err)
    await msg.channel.send(brokenCmdMsg)
  }
})

client
  .login(process.env.DISCORD_TOKEN)
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
