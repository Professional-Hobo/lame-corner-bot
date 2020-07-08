'use strict'

const { Client } = require('discord.js')
const MissingParam = require('../errors/MissingParam')
const MissingImplementation = require('../errors/MissingImplementation')

class Job {
  constructor(name) {
    if (!name) {
      throw new MissingParam('name')
    }

    this.name = name
  }

  /**
   * Wrap job execution with logging. Not meant to be overridden.
   */
  async _run() {
    await this.run(...arguments)
    console.log('Job Registered', { name: this.name })
  }

  /**
   * Wrap job execution with logging. Not meant to be overridden.
   */
  async _stop() {
    await this.stop(...arguments)
    console.log('Job Stopped', { name: this.name })
  }

  /**
   * Runs a job for a discord.js compatible client
   *
   * @param {Client} client Client to run this job for
   */
  async run(client) { // eslint-disable-line no-unused-vars
    throw new MissingImplementation(this.constructor.name, this.run.name)
  }

  /**
   * Stops a running job for a discord.js compatible client
   *
   * @param {Client} client Client to stop this job for
   */
  stop(client) { // eslint-disable-line no-unused-vars
    throw new MissingImplementation(this.constructor.name, this.stop.name)
  }
}

module.exports = Job
