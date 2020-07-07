'use strict'

const { Command } = require('discord.js-commando')
const logger = require('./logger')
const embedRes = require('./embedRes')
const { Message } = require('discord.js')

const brokenCmdMsg = embedRes.error('Command Broken :tools:', 'This command is broken right now :sob:.\n\
Please let an admin know so they can fix it.')

/**
 * Override default command error handling behavior
 */
class BaseCommand extends Command {
  constructor() {
    super(...arguments)
  }

  /**
   * Logs any errors that occur when executing a command. If error does not have a response associated with it,
   * will return the default broken error message.
   *
   * @param {Error} err Error thrown by command
   * @param {Message} msg Message that triggered the command
   */
  async onError(err, msg) {
    logger.error(msg.toString(), err)
    await msg.channel.send(err.res || brokenCmdMsg)
  }

  run(msg) {
    logger.info(`[COMMAND][@${msg.author.username}] ${msg.command.name}${msg.argString}`)
  }
}

module.exports = BaseCommand
