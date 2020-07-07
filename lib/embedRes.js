'use strict'

const { MessageEmbed } = require('discord.js')

/**
 * Constructs a MessageEmbed with the warning color scheme.
 *
 * @param {string} title Title of the warning message.
 * @param {string} description Description of the warning message.
 * @returns {MessageEmbed}
 */
function warn(title, description) {
  return new MessageEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor('#ffcc00')
}

/**
 * Constructs a MessageEmbed with the error color scheme.
 *
 * @param {string} title Title of the error message.
 * @param {string} description Description of the error message.
 * @returns {MessageEmbed}
 */
function error(title, description) {
  return new MessageEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor('#dc3e3e')
}

module.exports = {
  warn,
  error,
}
