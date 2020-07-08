'use strict'

const fs = require('fs')
const path = require('path')
const { Client } = require('discord.js')

// Load all jobs at startup
const jobs = fs.readdirSync(__dirname, { withFileTypes: true })
  .filter(file => /(?<!index)\.js$/.test(file.name) && !file.isDirectory())
  .map(file => new (require(path.join(__dirname, file.name)))())

/**
 * Starts all jobs for the provided Client
 *
 * @param {Client} client Client to use as context for jobs
 */
async function register(client) {
  for (let i = 0; i < jobs.length; ++i) {
    try {
      await jobs[i]._run(client)
    } catch (err) {
      console.error('Job Failed to Register', { job: jobs[i].name })
      throw err
    }
  }
}

module.exports = {
  register,
  list: jobs,
}
