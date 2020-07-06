'use strict'

const winston = require('winston')
const logLevel = process.env.NODE_ENV !== 'production' ? 'debug' : 'info'

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.json(),
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      // winston.format.printf(({ level, message, label, ...args }) =>
      //   `${label ? `${label} ` : ''}${level}: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`), // eslint-disable-line max-len
    ),
  }))
}

winston.loggers.add('general', logger)

module.exports = logger