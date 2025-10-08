import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  deviceInfo: {
    platform: string;
    version: string;
    model?: string;
  };
  resolved: boolean;
}

export interface ErrorReport {
  totalErrors: number;
  errorsByLevel: Record<string, number>;
  recentErrors: ErrorLog[];
  mostCommonErrors: Array<{
    message: string;
    count: number;
  }>;
  errorTrends: Array<{
    date: string;
    count: number;
  }>;
}

export class ErrorService {
  private static instance: ErrorService;
  private static readonly ERROR_LOG_KEY = 'error_logs';
  private static readonly MAX_LOG_ENTRIES = 1000;

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Set up global error handlers
      this.setupGlobalErrorHandlers();
      
      // Log app initialization
      await this.log('info', 'App initialized', {
        platform: Platform.OS,
        version: Platform.Version,
      });
    } catch (error) {
      console.error('Failed to initialize error service:', error);
    }
  }

  async log(
    level: ErrorLog['level'],
    message: string,
    context?: Record<string, any>,
    userId?: string
  ): Promise<string> {
    try {
      const errorLog: ErrorLog = {
        id: this.generateId(),
        timestamp: new Date(),
        level,
        message,
        context,
        userId,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version.toString(),
        },
        resolved: false,
      };

      await this.saveErrorLog(errorLog);
      
      // Also log to console in development
      if (__DEV__) {
        console.log(`[${level.toUpperCase()}] ${message}`, context);
      }

      return errorLog.id;
    } catch (error) {
      console.error('Failed to log error:', error);
      return '';
    }
  }

  async logError(
    error: Error,
    context?: Record<string, any>,
    userId?: string
  ): Promise<string> {
    return this.log('error', error.message, {
      ...context,
      stack: error.stack,
      name: error.name,
    }, userId);
  }

  async logWarning(
    message: string,
    context?: Record<string, any>,
    userId?: string
  ): Promise<string> {
    return this.log('warn', message, context, userId);
  }

  async logInfo(
    message: string,
    context?: Record<string, any>,
    userId?: string
  ): Promise<string> {
    return this.log('info', message, context, userId);
  }

  async logDebug(
    message: string,
    context?: Record<string, any>,
    userId?: string
  ): Promise<string> {
    return this.log('debug', message, context, userId);
  }

  async getErrorLogs(
    limit: number = 50,
    level?: ErrorLog['level'],
    userId?: string
  ): Promise<ErrorLog[]> {
    try {
      const stored = await AsyncStorage.getItem(ErrorService.ERROR_LOG_KEY);
      if (!stored) return [];

      const logs: ErrorLog[] = JSON.parse(stored).map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));

      let filteredLogs = logs;

      if (level) {
        filteredLogs = filteredLogs.filter(log => log.level === level);
      }

      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }

      return filteredLogs
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get error logs:', error);
      return [];
    }
  }

  async getErrorReport(userId?: string): Promise<ErrorReport> {
    try {
      const logs = await this.getErrorLogs(1000, undefined, userId);
      
      const errorsByLevel = logs.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const messageCounts = logs.reduce((acc, log) => {
        acc[log.message] = (acc[log.message] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonErrors = Object.entries(messageCounts)
        .map(([message, count]) => ({ message, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Group errors by date
      const errorTrends = logs.reduce((acc, log) => {
        const date = log.timestamp.toISOString().split('T')[0];
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      }, [] as Array<{ date: string; count: number }>);

      return {
        totalErrors: logs.length,
        errorsByLevel,
        recentErrors: logs.slice(0, 20),
        mostCommonErrors,
        errorTrends: errorTrends.sort((a, b) => a.date.localeCompare(b.date)),
      };
    } catch (error) {
      console.error('Failed to generate error report:', error);
      return {
        totalErrors: 0,
        errorsByLevel: {},
        recentErrors: [],
        mostCommonErrors: [],
        errorTrends: [],
      };
    }
  }

  async resolveError(errorId: string): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(ErrorService.ERROR_LOG_KEY);
      if (!stored) return false;

      const logs: ErrorLog[] = JSON.parse(stored).map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));

      const logIndex = logs.findIndex(log => log.id === errorId);
      if (logIndex === -1) return false;

      logs[logIndex].resolved = true;
      await AsyncStorage.setItem(ErrorService.ERROR_LOG_KEY, JSON.stringify(logs));
      
      return true;
    } catch (error) {
      console.error('Failed to resolve error:', error);
      return false;
    }
  }

  async clearErrorLogs(olderThan?: Date): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(ErrorService.ERROR_LOG_KEY);
      if (!stored) return;

      let logs: ErrorLog[] = JSON.parse(stored).map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));

      if (olderThan) {
        logs = logs.filter(log => log.timestamp >= olderThan);
      }

      // Keep only the most recent entries
      logs = logs
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, ErrorService.MAX_LOG_ENTRIES);

      await AsyncStorage.setItem(ErrorService.ERROR_LOG_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to clear error logs:', error);
    }
  }

  async exportErrorLogs(): Promise<string> {
    try {
      const logs = await this.getErrorLogs(1000);
      const report = await this.getErrorReport();
      
      const exportData = {
        timestamp: new Date().toISOString(),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
        report,
        logs,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export error logs:', error);
      throw new Error('Failed to export error logs');
    }
  }

  private async saveErrorLog(errorLog: ErrorLog): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(ErrorService.ERROR_LOG_KEY);
      let logs: ErrorLog[] = stored ? JSON.parse(stored) : [];

      logs.unshift(errorLog);

      // Keep only the most recent entries
      if (logs.length > ErrorService.MAX_LOG_ENTRIES) {
        logs = logs.slice(0, ErrorService.MAX_LOG_ENTRIES);
      }

      await AsyncStorage.setItem(ErrorService.ERROR_LOG_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save error log:', error);
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Global error handler for unhandled promise rejections
    const originalHandler = global.ErrorUtils?.getGlobalHandler();
    
    if (originalHandler) {
      global.ErrorUtils.setGlobalHandler((error, isFatal) => {
        this.logError(error, { isFatal, type: 'global' });
        originalHandler(error, isFatal);
      });
    }

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: any) => {
      this.logError(new Error(event.reason), { type: 'unhandled_promise_rejection' });
    };

    // Add event listener for unhandled promise rejections
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  // Utility methods for common error scenarios
  async logNetworkError(
    url: string,
    method: string,
    status?: number,
    response?: string,
    userId?: string
  ): Promise<string> {
    return this.logError(
      new Error(`Network request failed: ${method} ${url}`),
      {
        url,
        method,
        status,
        response,
        type: 'network',
      },
      userId
    );
  }

  async logStorageError(
    operation: string,
    key: string,
    error: Error,
    userId?: string
  ): Promise<string> {
    return this.logError(
      new Error(`Storage operation failed: ${operation}`),
      {
        operation,
        key,
        originalError: error.message,
        type: 'storage',
      },
      userId
    );
  }

  async logValidationError(
    field: string,
    value: any,
    rule: string,
    userId?: string
  ): Promise<string> {
    return this.logError(
      new Error(`Validation failed: ${field}`),
      {
        field,
        value,
        rule,
        type: 'validation',
      },
      userId
    );
  }

  async logBusinessLogicError(
    operation: string,
    reason: string,
    context?: Record<string, any>,
    userId?: string
  ): Promise<string> {
    return this.logError(
      new Error(`Business logic error: ${operation}`),
      {
        operation,
        reason,
        type: 'business_logic',
        ...context,
      },
      userId
    );
  }
}

export const errorService = ErrorService.getInstance();


