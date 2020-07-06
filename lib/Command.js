'use strict'

const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const logger = require('./logger')

const brokenCmdMsg = new MessageEmbed()
  .setTitle('Command Broken :tools:')
  .setDescription('This command is broken right now :sob:.\nPlease let an admin know so they can fix it.')
  .setColor('#dc3e3e')

/**
 * Override default command error handling behavior
 */
class BaseCommand extends Command {
  constructor() {
    super(...arguments)
  }

  async onError(err, msg) {
    logger.error(msg.toString(), err)
    await msg.channel.send(brokenCmdMsg)
  }
}

module.exports = BaseCommand
