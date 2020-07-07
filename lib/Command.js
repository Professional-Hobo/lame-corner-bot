'use strict'

const { Command } = require('discord.js-commando')
const embedRes = require('./embedRes')
const { Message, Channel } = require('discord.js')

const brokenCmdMsg = embedRes.error('Command Broken :tools:', 'This command is broken right now :sob:.\n\
Please let an admin know so they can fix it.')

const cancelledCmdMsg = embedRes.error('Command Cancelled :x:', '')

/**
 * Override default command error handling behavior
 */
class BaseCommand extends Command {
  constructor(client, info) {
    super(client, info)
    console.log('Command Registered', { cmd: info.name, group: info.group, memberName: info.memberName })
  }

  /**
   * Logs any errors that occur when executing a command. If error does not have a response associated with it,
   * will return the default broken error message.
   *
   * @param {Error} err Error thrown by command
   * @param {Message} msg Message that triggered the command
   */
  async onError(err, msg) {
    console.error('Command Errored', {
      msg: msg.toString(),
      err,
    })

    await msg.channel.send(err.res || brokenCmdMsg)
  }

  /**
   * Sends a command cancelled message to the provided channel.
   *
   * @param {Channel} channel Channel to send command cancelled message to.
   * @returns {Promise}
   */
  async cancelMsg(channel) {
    return channel.send(cancelledCmdMsg)
  }

  run(msg, args) {
    console.log('Command Executed', {
      cmd: msg.command.name,
      op: args.op,
      argString: msg.argString,
      author: {
        tag: msg.author.tag,
        id: msg.author.id,
      },
    })
  }
}

module.exports = BaseCommand
