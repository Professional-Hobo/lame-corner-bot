'use strict'

const { Message, MessageEmbed } = require('discord.js')
const emojiRegex = require('emoji-regex')()
const Command = require('../../lib/Command')
const embedRes = require('../../lib/embedRes')
const { parseEmojiId, parseRoleId } = require('../../lib/utils')
const ZERO_WIDTH = '​' // <=== Invisible character, NOT empty string

class RolesMsgCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rolesmsg',
      group: 'mod',
      memberName: 'rolesmsg',
      /**
       * Not sure if user has correct perms in one channel will allow them to edit messages in any other channel.
       * Needs to be tested.
       */
      userPermissions: ['MANAGE_MESSAGES'],
      clientPermissions: ['MANAGE_MESSAGES'],
      guildOnly: true,
      description: 'Add/edit/delete/reorder games and associated roles in the roles channel message',
      examples: [
        'rolesmsg add :emoji: GameName @role',
        'rolesmsg add :emoji: Game name with spaces in it @role',
        'rolesmsg edit roleId :emoji: GameName @role',
        'rolesmsg delete roleId',
        'rolesmsg reorder roleId1 roleId2',
        'rolesmsg reorder roleIds',
      ],
      argsPromptLimit: 0,
      args: [{
        key: 'op',
        label: 'operation',
        prompt: '',
        type: 'string',
        oneOf: ['add', 'edit', 'set', 'delete', 'remove', 'reorder', 'swap'],
      }, {
        default: '',
        infinite: true,
        key: 'args',
        prompt: '',
        type: 'string',
      }],
    })
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

    try {
      if (!this.channel) {
        this.channel = await this.client.channels.fetch(process.env.ROLES_CHANNEL_ID)
      }

      this.roleMsg = await this.channel.messages.fetch(process.env.ROLES_MSG_ID)
      this.fields = this.roleMsg.embeds[0].fields

      // Determine if last field is a placeholder
      this.placeholder = this.fields.length && this.fields[this.fields.length - 1].name === ZERO_WIDTH

      switch (args.op) {
      case 'add':
        await this.addRole(msg, args.args)
        break

      case 'edit':
      case 'set':
        await this.editRole(msg, args.args)
        break

      case 'delete':
      case 'remove':
        await this.deleteRole(msg, args.args)
        break

      case 'reorder':
      case 'swap':
        await this.reorderRole(msg, args.args)
        break
      }

    } catch (err) {
      if (!err.res) {
        switch (err.code) {
        case 10003:
          err.res = embedRes.error('Unknown Roles Channel',
            `Roles channel id [${process.env.ROLES_CHANNEL_ID}] does not exist.`)
          break

        case 10008:
          err.res = embedRes.error('Unknown Roles Message',
            `Roles message id [${process.env.ROLES_MSG_ID}] does not exist.`)
          break
        }
      }

      throw err
    }
  }

  /**
   * Add a new role to the role message
   *
   * @param {Message} msg Message containing the command
   * @param {string[]} args Contains command arguments
   * @returns {Promise}
   */
  async addRole(msg, args) {
    if (args.length < 3) {
      return msg.embed(embedRes.warn('Missing parameters :warning:', 'An emoji, name, and role must be supplied.'))
    }

    const emoji = args[0]
    const name = args.slice(1, -1).join(' ')
    const role = args.slice(-1)[0]
    const invalid = []

    const guildEmoji = await this.channel.guild.emojis.resolveIdentifier(parseEmojiId(emoji))
    const guildRole = await this.channel.guild.roles.fetch(parseRoleId(role))

    if (!guildEmoji && !emojiRegex.test(emoji)) {
      invalid.push('emoji')
    }

    if (!guildRole) {
      invalid.push('role')
    }

    if (invalid.length) {
      return msg.embed(embedRes.error('Invalid parameters :x:', `Invalid ${invalid.join(' & ')} supplied.`))
    }

    // Remove placeholder before adding field
    if (this.placeholder) {
      this.fields.splice(this.fields.length - 1, 1)
      this.placeholder = false
    }

    this.fields.push({
      name: `${emoji} ${name}`,
      value: role,
      inline: true,
    })

    // Two items on last row, add placeholder
    if ((this.roleCount() - 2) % 3 === 0) {
      this.placeholder = true
      this.fields.push({
        name: ZERO_WIDTH,
        value: ZERO_WIDTH,
        inline: true,
      })
    }

    this.roleMsg.edit(new MessageEmbed(this.roleMsg.embeds[0]))
    return msg.embed(embedRes.success('Role added successfully :white_check_mark:',
      `Added "${emoji} ${name} @${guildRole.name}" as id **${this.roleCount()}**.`))
  }

  /**
   * Modify a role in the role message
   *
   * @param {Message} msg Message containing the command
   * @param {string[]} args Contains command arguments
   * @returns {Promise}
   */
  async editRole(msg, args) {
    if (this.roleCount() === 0) {
      return msg.embed(embedRes.warn('No roles available :warning:',
        'No roles are available for editing - go add some.'))

    } else if (args.length < 4) {
      return msg.embed(embedRes.warn('Missing parameters :warning:', 'An id, emoji, name, and role must be supplied.'))
    }

    const id = +args[0]
    const emoji = args[1]
    const name = args.slice(2, -1).join(' ')
    const role = args.slice(-1)[0]
    const invalid = []

    const guildEmoji = await this.channel.guild.emojis.resolveIdentifier(parseEmojiId(emoji))
    const guildRole = await this.channel.guild.roles.fetch(parseRoleId(role))

    if (!this.validId(id)) {
      invalid.push('id')
    }

    if (!guildEmoji && !emojiRegex.test(emoji)) {
      invalid.push('emoji')
    }

    if (!guildRole) {
      invalid.push('role')
    }

    if (invalid.length) {

      let errorMsg = `Invalid ${invalid[0]}`
      if (invalid.length === 2) {
        errorMsg += ` & ${invalid[1]}`

      } else if (invalid.length === 3) {
        errorMsg += `, ${invalid[1]}, and ${invalid[2]}`
      }

      errorMsg += ' supplied'

      if (invalid.indexOf('id') !== -1) {
        errorMsg += `\n\nId value must be between 1 - ${this.roleCount()}.`
      }

      return msg.embed(embedRes.error('Invalid parameters :x:', errorMsg))
    }

    this.fields[id - 1].name = `${emoji} ${name}`
    this.fields[id - 1].value = role

    this.roleMsg.edit(new MessageEmbed(this.roleMsg.embeds[0]))
    return msg.embed(embedRes.success('Updated role successfully :white_check_mark:',
      `Updated ${emoji} ${name} @${guildRole.name} [id: **${id}**].`))
  }

  /**
   * Remove a role from the role message
   *
   * @param {Message} msg Message containing the command
   * @param {string[]} args Contains command arguments
   * @returns {Promise}
   */
  async deleteRole(msg, args) {
    if (this.roleCount() === 0) {
      return msg.embed(embedRes.warn('No roles available :warning:',
        'No roles are available for deletion - go add some.'))

    } else if (args.length !== 1) {
      return msg.embed(embedRes.warn('Missing parameters :warning:', 'An id must be supplied.'))
    }

    const id = +args[0]

    if (!this.validId(id)) {
      return msg.embed(embedRes.error('Invalid parameter :x:',
        `Invalid id supplied, value must be ${this.roleCount() === 1 ? '1' : 'between 1 - ' + this.roleCount()}.`))
    }

    const { name, value } = this.fields.splice(id - 1, 1)[0]
    const guildRole = await this.channel.guild.roles.fetch(parseRoleId(value))

    // Two items on last row, add placeholder
    if ((this.roleCount() - 2) % 3 === 0) {
      this.placeholder = true
      this.fields.push({
        name: ZERO_WIDTH,
        value: ZERO_WIDTH,
        inline: true,
      })

    // Remove placeholder if set and 1 item in last row
    } else if (this.placeholder && (this.roleCount() - 1) % 3 === 0) {
      this.placeholder = false
      this.fields.splice(this.fields.length - 1, 1)
    }

    this.roleMsg.edit(new MessageEmbed(this.roleMsg.embeds[0]))
    return msg.embed(embedRes.success('Removed role successfully :white_check_mark:',
      `Removed ${name} @${guildRole.name} [id: **${id}**].`))
  }

  /**
   * Reorder roles in the role message
   *
   * @param {Message} msg Message containing the command
   * @param {string[]} args Contains command arguments
   * @returns {Promise}
   */
  async reorderRole(msg, args) {
    if (this.roleCount() < 2) {
      return msg.embed(embedRes.warn('Too few roles available :warning:',
        'At least 2 roles must be available for reordering - go add some.'))

    } else if (args.length < 2) {
      return msg.embed(embedRes.warn('Missing parameters :warning:', 'At least 2 role ids must be supplied.'))

    } else if (args.length !== 2 && (args.length > this.roleCount() || args.length < this.roleCount())) {
      const amt = args.length > this.roleCount() ? 'many' : 'few'
      return msg.embed(embedRes.warn(`Too ${amt} role ids provided :warning:`,
        `Must supply exactly 2 or ${this.roleCount()} role ids.`))
    }

    let ids = args.map(Number)

    // Has invalid or duplicate ids
    if (!ids.every(this.validId.bind(this)) || new Set(ids).size !== ids.length) {
      return msg.embed(embedRes.warn('Invalid ids :warning:',
        `Invalid or duplicate ids provided. Must submit unique ids ranging from 1 to ${this.roleCount()}`))
    }

    // Convert to indices since we don't need position anymore
    ids = ids.map(i => i - 1)

    // Swap if only 2 roles
    if (ids.length === 2) {
      [this.fields[ids[0]], this.fields[ids[1]]] = [this.fields[ids[1]], this.fields[ids[0]]]

    // Reorder whole array for all roles
    } else {
      this.roleMsg.embeds[0].fields = ids.map(i => this.fields[i])
    }

    this.roleMsg.edit(new MessageEmbed(this.roleMsg.embeds[0]))
    return msg.embed(embedRes.success('Reordered roles successfully :white_check_mark:',
      ids.length === 2 ?
        `Swapped ${this.fields[1].name} and ${this.fields[0].name} successfully.` :
        'Updated role order successfully.'))
  }

  /**
   * Determine if provided id is a valid number within range of available roles
   *
   * @param {number} id position of role in roleMsg
   * @returns {number}
   */
  validId(id) {
    return Number.isInteger(id) && id >= 1 && id <= this.roleCount()
  }

  /**
   * Calculate valid roleCount depending on if there is a placeholder
   *
   * @returns {number}
   */
  roleCount() {
    return this.fields.length - (this.placeholder ? 1 : 0)
  }
}

module.exports = RolesMsgCommand
