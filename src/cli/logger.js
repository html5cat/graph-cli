let chalk = require('chalk')
let winston = require('winston')

module.exports = class Logger {
  constructor(steps, options) {
    this.steps = steps
    this.currentStep = 0
    this.options = options || {}
    this.prefix = this.options.prefix
    let shortFormat = winston.format.printf(info => info.message)
    this.logger = winston.createLogger({
      level: this.options.verbosity || 'info',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.splat(),
            winston.format.colorize(),
            shortFormat
          ),
        }),
      ],
    })
  }

  info(...msg) {
    this.logger.log('info', ...msg)
  }

  step(subject, ...msg) {
    if (this.prefix === undefined) {
      this.logger.log(
        'verbose',
        '\n%d/%d %s %s',
        ++this.currentStep,
        this.steps,
        chalk.green(subject),
        msg.join(' ')
      )
    } else {
      this.logger.log(
        'verbose',
        '%s\n%s %d/%d %s %s',
        this.prefix,
        this.prefix,
        ++this.currentStep,
        this.steps,
        chalk.green(subject),
        msg.join(' ')
      )
    }
  }

  note(subject, ...msg) {
    if (this.prefix === undefined) {
      this.logger.log('debug', '%s %s', chalk.gray(subject), msg.join(' '))
    } else {
      this.logger.log(
        'debug',
        '%s %s %s',
        this.prefix,
        chalk.gray(subject),
        msg.join(' ')
      )
    }
  }

  status(subject, ...msg) {
    if (this.prefix === undefined) {
      if ((this.options.verbosity || 'info') !== 'info') {
        this.logger.log('info', '\n%s %s', chalk.magenta(subject), msg.join(' '))
      } else {
        this.logger.log('info', '%s %s', chalk.magenta(subject), msg.join(' '))
      }
    } else {
      if ((this.options.verbosity || 'info') !== 'info') {
        this.logger.log(
          'info',
          '\n%s %s %s',
          this.prefix,
          chalk.gray(subject),
          msg.join(' ')
        )
      } else {
        this.logger.log(
          'info',
          '%s %s %s',
          this.prefix,
          chalk.gray(subject),
          msg.join(' ')
        )
      }
    }
  }

  fatal(subject, ...msg) {
    if (this.prefix === undefined) {
      this.logger.log('error', '%s %s', chalk.red(subject), msg.join(' '))
    } else {
      this.logger.log('error', '%s %s %s', this.prefix, chalk.red(subject), msg.join(' '))
    }
  }

  error(subject, e) {
    if (e instanceof Error) {
      if (e.hasOwnProperty('message')) {
        this.fatal(e.message)
      } else {
        this.fatal(e)
      }
      if (e.hasOwnProperty('stack')) {
        this.note(
          e.stack
            .split('\n')
            .slice(1)
            .join('\n')
        )
      }
    } else {
      this.fatal('Failed to compile subgraph', e)
    }
  }
}
