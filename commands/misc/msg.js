'use strict'

const Command = require('../../lib/Command')
const { MessageCollector, MessageAttachment, MessageEmbed, Channel, Message } = require('discord.js')
const axios = require('axios')
const embedRes = require('../../lib/embedRes')

class MsgCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'msg',
      group: 'misc',
      memberName: 'msg',
      /**
       * Not sure if user has correct perms in one channel will allow them to edit messages in any other channel.
       * Needs to be tested.
       */
      userPermissions: ['MANAGE_MESSAGES'],
      clientPermissions: ['MANAGE_MESSAGES'],
      guildOnly: true,
      description: 'Message data manipulation (content and embeds both). Supports add/get/set operations.',
      details: 'If using embed info, https://discohook.org/ is very helpful in constructing the relevant JSON. \
If a message string isn\'t provided, you will be prompted for message data in JSON form. Should look like:\n\n\
```javascript\n\
{\n\
  "content": "message string here",\n\
  "embeds": []\n\
}\n\
```',
      examples: [
        'msg add #channel-name',
        'msg add #channel-name "message string here"',
        'msg get #channel-name <messageId>',
        'msg get #channel-name 1234343234',
        'msg set #channel-name 1234343234',
        'msg set #channel-name 1234343234 "message string here"',
      ],
      argsPromptLimit: 0,
      args: [{
        key: 'op',
        label: 'operation',
        prompt: '',
        type: 'string',
        oneOf: ['add', 'get', 'set'],
      }, {
        key: 'channel',
        prompt: '',
        type: 'channel',
      }, {
        key: 'messageId',
        label: 'messageId/content',
        prompt: '',
        type: 'string', // Can't use message type since the target message can be from any channel in the guild
        default: '',
      }, {
        key: 'content',
        label: '',
        prompt: '',
        type: 'string',
        default: '',
      }],
    })
  }

  /**
   * Get a message from a specified channel
   *
   * @param {Message} msg Message containing the command
   * @param {Channel} channel Channel to create the message in
   * @param {string} messageId Id of the message to retrieve. Must be exist within the provided channel.
   * @returns {Promise}
   */
  async getMsg(msg, channel, messageId) {
    const srcMsg = await channel.messages.fetch(messageId)
    const payload = JSON.stringify({ content: srcMsg.content, embeds: srcMsg.embeds }, null, 2)

    if (payload.length > 2000) {
      return msg.channel.send('Contents were larger than 2000 chars, so it\'s attached as a file instead',
        new MessageAttachment(Buffer.from(payload), 'content.json'))
    } else {
      return msg.say(`\`\`\`\n${payload}\n\`\`\``)
    }
  }

  /**
   * Prompts command author for message data. Must be in the form of JSON.
   *
   * @param {Message} msg Message containing the command
   * @returns {Promise}
   */
  async askForMsgData(msg) {
    await msg.channel.send('Data for the message? Must be valid JSON. Can be an attachment as well.')
    const collector = new MessageCollector(msg.channel, m => m.author.id === msg.author.id, { max: 1 })

    const data = await new Promise((resolve, reject) => {
      collector.on('collect', async res => {
        try {
          // Check if there's an attachment to use. If so, it will override any provided content.
          if (res.attachments.size > 0) {
            const { url } = res.attachments.first()
            const { data: fileData } = await axios.get(url, { responseType: 'arraybuffer' })

            res.content = Buffer.from(fileData, 'binary').toString()
          }

          res.content = (res.content.match(/^```(.*?)```$/s) || [])[1] || res.content
          resolve(JSON.parse(res.content))
        } catch (err) {
          reject(err)
        }
      })
    })

    data.embeds = (data.embeds || []).map(embedData => new MessageEmbed(embedData))
    return data
  }

  /**
   * Creates a message in a specified channel.
   *
   * @param {Message} msg Message containing the command
   * @param {Channel} channel Channel to create the message in
   * @param {string} [content] Shortform. If not included, command author is prompted for message json body.
   * @returns {Promise}
   */
  async addMsg(msg, channel, content) {
    if (content) {
      return channel.send(content)
    }

    const data = await this.askForMsgData(msg)
    return channel.send(data.content, data.embeds)
  }

  /**
   * Sets an existing messages contents in a specified channel.
   *
   * @param {Message} msg Message containing the command
   * @param {Channel} channel Channel the message in
   * @param {string} messageId Id of the message to set the contents of. Must be exist within the provided channel.
   * @param {string} [content] Shortform. If not included, command author is prompted for message json body.
   * @returns {Promise}
   */
  async setMsg(msg, channel, messageId, content) {
    const srcMsg = await channel.messages.fetch(messageId)

    if (content) {
      return srcMsg.edit(content)
    }

    const data = await this.askForMsgData(msg)

    await srcMsg.edit(data)
    for (let i = 0; i < data.embeds.length; ++i) {
      await srcMsg.edit(data.embeds[i])
    }
  }

  /**
   * Command executor function
   *
   * @param {Message} msg Message containing the command
   * @param {object} args Contains command arguments
   * @returns {Promise}
   */
  async run(msg, args) {
    super.run(msg, args)

    if (args.op !== 'add' && !args.messageId) {
      return msg.say(`<@${msg.author.id}>, Invalid command usage. The \`messageId\` is required \
for non-\`add\` operations.`)
    }

    try {
      switch (args.op) {
      case 'add':
        await this.addMsg(msg, args.channel, args.messageId)
        break
      case 'get':
        await this.getMsg(msg, args.channel, args.messageId)
        break
      case 'set':
        await this.setMsg(msg, args.channel, args.messageId, args.content)
        break
      }
    } catch (err) {
      if (err.name === 'DiscordAPIError' && err.code === 50005) {
        err.res = embedRes.warn('Do not have permissions to edit!', 'Can only edit messages authored by this bot.')
      }

      if (err.name === 'DiscordAPIError' && err.code === 50035) {
        err.res = embedRes.warn('Message not Found!', `Message id [${msg.id}] does not exist \
within <#${args.channel.id}>`)
      }

      throw err
    }
  }
}

module.exports = MsgCommand