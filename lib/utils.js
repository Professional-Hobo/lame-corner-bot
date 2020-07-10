'use strict'

const { Message, MessageCollector } = require('discord.js')

const CANCELLED = Symbol.for('cancelled')

/**
 * Extracts emoji id number from Discord emoji syntax
 *
 * @param {string} emoji Raw emoji syntax
 * @returns {number} Emoji id number or -1 if reggie fails
 */
function parseEmojiId(emoji) {
  const matches = emoji.match(/^(?:<a?:([a-zA-Z0-9_]+):)?([0-9]+)>?$/)
  return matches && matches[2] || -1
}

/**
 * Extracts role id number from Discord role syntax
 *
 * @param {string} role Raw role syntax
 * @returns {number} Role id number or -1 if reggie fails
 */
function parseRoleId(role) {
  const matches = role.match(/^(?:<@&)?([0-9]+)>?$/)
  return matches && matches[1] || -1
}

/**
 * Responds to a message with a prompt and returns the answer.
 *
 * @param {Message} msg Message to respond to
 * @param {boolean} [sameAuthor] Whether the answer should be from the same author as the initial message
 * being prompting from
 * @returns {Promise}
 */
async function prompt(msg, sameAuthor = true) {
  const collector = new MessageCollector(msg.channel, m => {
    if (sameAuthor) {
      return m.author.id === msg.author.id
    }

    return true
  }, { max: 1 })

  const data = await new Promise(resolve => {
    collector.on('collect', async res => {
      if (res.content.toLowerCase() === 'cancel') {
        return resolve(CANCELLED)
      }

      resolve(res)
    })
  })

  return data
}

module.exports = {
  parseEmojiId,
  parseRoleId,
  prompt,
}
