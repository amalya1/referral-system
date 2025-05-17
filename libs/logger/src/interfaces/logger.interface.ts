export interface LogContext {
  timestamp?: Date;
  correlationId?: string;
  userId?: string;
  service?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: string;
  message: string;
  context?: LogContext;
  error?: Error;
}

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
}
