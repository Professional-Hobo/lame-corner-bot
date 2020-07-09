'use strict'

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

module.exports = {
  parseEmojiId,
  parseRoleId,
}
