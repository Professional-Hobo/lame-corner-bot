'use strict'

class MissingParam extends Error {
  constructor(param) {
    super(`[${param}] is required`)

    this.name = 'MissingParam'
    Error.captureStackTrace(this, MissingParam)
  }
}

module.exports = MissingParam
