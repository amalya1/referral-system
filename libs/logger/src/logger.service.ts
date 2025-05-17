import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { ILogger, LogContext, LogEntry } from './interfaces/logger.interface';

@Injectable()
export class LoggerService implements ILogger {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    this.logger = winston.createLogger({
      level: configService.get('LOG_LEVEL') || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        // Консольный транспорт
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        // Файловый транспорт для всех логов
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
        // Отдельный файл для ошибок
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
      ],
    });
  }

  private formatMessage(entry: LogEntry): any {
    return {
      timestamp: new Date().toISOString(),
      level: entry.level,
      message: entry.message,
      ...(entry.context || {}),
      ...(entry.error ? {
        error: {
          message: entry.error.message,
          stack: entry.error.stack,
        },
      } : {}),
    };
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, this.formatMessage({ level: 'debug', message, context }));
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, this.formatMessage({ level: 'info', message, context }));
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, this.formatMessage({ level: 'warn', message, context }));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logger.error(
      message,
      this.formatMessage({ level: 'error', message, error, context }),
    );
  }
}
