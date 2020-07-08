'use strict'

class MissingImplementation extends Error {
  constructor(constructorName, fnName) {
    super(`${constructorName} doesn't have a ${fnName}() method`)

    this.name = 'MissingImplementation'
    this.missingFn = fnName
    Error.captureStackTrace(this, MissingImplementation)
  }
}

module.exports = MissingImplementation
