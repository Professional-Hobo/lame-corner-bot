'use strict'

const Command = require('../../lib/Command')
const { Message, MessageCollector } = require('discord.js')
const logger = require('../../lib/logger')

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
      description: 'Creates/updates/gets message data',
      examples: [
        'msg create #channel-name',
        'msg get #channel-name 1234343234',
        'msg update #channel-name 1234343234',
      ],
      argsPromptLimit: 0,
      args: [{
        key: 'op',
        label: 'operation',
        prompt: '',
        type: 'string',
        oneOf: ['create', 'get', 'update'],
      }, {
        key: 'channel',
        prompt: '',
        type: 'channel',
      }, {
        key: 'messageId',
        prompt: '',
        type: 'string', // Can't use type message since message can be from any channel in the guild
        default: '',
      }],
    })
  }

  async run(msg, args) {
    if (args.op !== 'create' && !args.messageId) {
      return msg.say(`<@${msg.author.id}>, Invalid command usage. The \`messageId\` is only optional \
for the \`create\` operation.`)
    }

    const message = args.op === 'create' ?
      new Message(this.client, {}, args.channel) :
      await args.channel.messages.fetch(args.messageId)

    // TODO There's a problem when the response is greater than 2000 characters. Give response in attachment instead?
    if (args.op === 'get') {
      // console.log(message)
      // console.log(JSON.stringify({ content: message.content, embeds: message.embeds }, null, 2))
      return msg.say(`\`\`\`\n${JSON.stringify({ content: message.content, embeds: message.embeds }, null, 2)}\n\`\`\``)
    }

    // Prompt for message data
    // await msg.channel.send('Data for the message? Must be a JSON body.')
    // const collector = new MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 30000 })

    // const data = await new Promise((resolve, reject) => {
    //   collector.on('collect', res => {
    //     try {
    //       console.log(res.content)
    //       resolve(JSON.parse(res.content))
    //     } catch (err) {
    //       reject(err)
    //     }
    //   })
    // })

    // await message.edit({
    //   content: data.content,
    //   embed: data.embed,
    // })

    if (args.op === 'create') {
      args.channel.send(message)
    }
  }
}

module.exports = MsgCommand