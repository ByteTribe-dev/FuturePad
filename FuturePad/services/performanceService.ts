import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { errorService } from './errorService';

export interface PerformanceMetric {
  id: string;
  name: string;
  timestamp: Date;
  duration: number;
  type: 'navigation' | 'api' | 'operation' | 'render' | 'user_interaction';
  metadata?: Record<string, any>;
  userId?: string;
}

export interface PerformanceReport {
  averageResponseTime: number;
  slowestOperations: PerformanceMetric[];
  operationCounts: Record<string, number>;
  performanceTrends: Array<{
    date: string;
    averageDuration: number;
    operationCount: number;
  }>;
  slowOperations: Array<{
    name: string;
    averageDuration: number;
    count: number;
    maxDuration: number;
  }>;
}

export class PerformanceService {
  private static instance: PerformanceService;
  private static readonly PERFORMANCE_KEY = 'performance_metrics';
  private static readonly MAX_METRICS = 500;
  private static readonly SLOW_OPERATION_THRESHOLD = 1000; // 1 second

  private activeTimers: Map<string, number> = new Map();
  private metrics: PerformanceMetric[] = [];

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.loadStoredMetrics();
      await this.startPerformanceMonitoring();
      
      await errorService.logInfo('Performance monitoring initialized', {
        platform: Platform.OS,
        maxMetrics: PerformanceService.MAX_METRICS,
      });
    } catch (error) {
      await errorService.logError(error as Error, { context: 'performance_service_init' });
    }
  }

  startTimer(name: string, type: PerformanceMetric['type'] = 'operation'): string {
    const id = this.generateId();
    const startTime = Date.now();
    
    this.activeTimers.set(id, startTime);
    
    return id;
  }

  endTimer(
    id: string,
    metadata?: Record<string, any>,
    userId?: string
  ): PerformanceMetric | null {
    const startTime = this.activeTimers.get(id);
    if (!startTime) {
      console.warn(`Timer ${id} not found`);
      return null;
    }

    const duration = Date.now() - startTime;
    this.activeTimers.delete(id);

    const metric: PerformanceMetric = {
      id,
      name: metadata?.name || 'Unknown Operation',
      timestamp: new Date(),
      duration,
      type: metadata?.type || 'operation',
      metadata,
      userId,
    };

    this.recordMetric(metric);
    return metric;
  }

  async measureOperation<T>(
    name: string,
    operation: () => Promise<T>,
    type: PerformanceMetric['type'] = 'operation',
    metadata?: Record<string, any>,
    userId?: string
  ): Promise<T> {
    const timerId = this.startTimer(name, type);
    
    try {
      const result = await operation();
      this.endTimer(timerId, { ...metadata, success: true }, userId);
      return result;
    } catch (error) {
      this.endTimer(timerId, { ...metadata, success: false, error: error.message }, userId);
      throw error;
    }
  }

  measureSyncOperation<T>(
    name: string,
    operation: () => T,
    type: PerformanceMetric['type'] = 'operation',
    metadata?: Record<string, any>,
    userId?: string
  ): T {
    const timerId = this.startTimer(name, type);
    
    try {
      const result = operation();
      this.endTimer(timerId, { ...metadata, success: true }, userId);
      return result;
    } catch (error) {
      this.endTimer(timerId, { ...metadata, success: false, error: error.message }, userId);
      throw error;
    }
  }

  recordMetric(metric: PerformanceMetric): void {
    try {
      this.metrics.push(metric);
      
      // Keep only recent metrics in memory
      if (this.metrics.length > PerformanceService.MAX_METRICS) {
        this.metrics = this.metrics.slice(-PerformanceService.MAX_METRICS);
      }

      // Log slow operations
      if (metric.duration > PerformanceService.SLOW_OPERATION_THRESHOLD) {
        errorService.logWarning(
          `Slow operation detected: ${metric.name}`,
          {
            duration: metric.duration,
            type: metric.type,
            threshold: PerformanceService.SLOW_OPERATION_THRESHOLD,
          },
          metric.userId
        );
      }

      // Persist metrics periodically
      if (this.metrics.length % 10 === 0) {
        this.persistMetrics();
      }
    } catch (error) {
      errorService.logError(error as Error, { context: 'record_metric' });
    }
  }

  async getMetrics(
    limit: number = 100,
    type?: PerformanceMetric['type'],
    userId?: string
  ): Promise<PerformanceMetric[]> {
    try {
      let filteredMetrics = [...this.metrics];

      if (type) {
        filteredMetrics = filteredMetrics.filter(metric => metric.type === type);
      }

      if (userId) {
        filteredMetrics = filteredMetrics.filter(metric => metric.userId === userId);
      }

      return filteredMetrics
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      await errorService.logError(error as Error, { context: 'get_metrics' });
      return [];
    }
  }

  async getPerformanceReport(userId?: string): Promise<PerformanceReport> {
    try {
      const metrics = await this.getMetrics(1000, undefined, userId);
      
      if (metrics.length === 0) {
        return {
          averageResponseTime: 0,
          slowestOperations: [],
          operationCounts: {},
          performanceTrends: [],
          slowOperations: [],
        };
      }

      // Calculate average response time
      const totalDuration = metrics.reduce((sum, metric) => sum + metric.duration, 0);
      const averageResponseTime = totalDuration / metrics.length;

      // Get slowest operations
      const slowestOperations = [...metrics]
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10);

      // Count operations by type
      const operationCounts = metrics.reduce((acc, metric) => {
        acc[metric.type] = (acc[metric.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Group by date for trends
      const performanceTrends = metrics.reduce((acc, metric) => {
        const date = metric.timestamp.toISOString().split('T')[0];
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.averageDuration = (existing.averageDuration * existing.operationCount + metric.duration) / (existing.operationCount + 1);
          existing.operationCount++;
        } else {
          acc.push({ date, averageDuration: metric.duration, operationCount: 1 });
        }
        return acc;
      }, [] as Array<{ date: string; averageDuration: number; operationCount: number }>);

      // Analyze slow operations
      const slowOperationsMap = metrics
        .filter(metric => metric.duration > PerformanceService.SLOW_OPERATION_THRESHOLD)
        .reduce((acc, metric) => {
          if (!acc[metric.name]) {
            acc[metric.name] = {
              totalDuration: 0,
              count: 0,
              maxDuration: 0,
            };
          }
          acc[metric.name].totalDuration += metric.duration;
          acc[metric.name].count++;
          acc[metric.name].maxDuration = Math.max(acc[metric.name].maxDuration, metric.duration);
          return acc;
        }, {} as Record<string, { totalDuration: number; count: number; maxDuration: number }>);

      const slowOperations = Object.entries(slowOperationsMap).map(([name, data]) => ({
        name,
        averageDuration: data.totalDuration / data.count,
        count: data.count,
        maxDuration: data.maxDuration,
      }));

      return {
        averageResponseTime,
        slowestOperations,
        operationCounts,
        performanceTrends: performanceTrends.sort((a, b) => a.date.localeCompare(b.date)),
        slowOperations: slowOperations.sort((a, b) => b.averageDuration - a.averageDuration),
      };
    } catch (error) {
      await errorService.logError(error as Error, { context: 'performance_report' });
      return {
        averageResponseTime: 0,
        slowestOperations: [],
        operationCounts: {},
        performanceTrends: [],
        slowOperations: [],
      };
    }
  }

  async clearMetrics(olderThan?: Date): Promise<void> {
    try {
      if (olderThan) {
        this.metrics = this.metrics.filter(metric => metric.timestamp >= olderThan);
      } else {
        this.metrics = [];
      }
      
      await this.persistMetrics();
    } catch (error) {
      await errorService.logError(error as Error, { context: 'clear_metrics' });
    }
  }

  async exportMetrics(): Promise<string> {
    try {
      const report = await this.getPerformanceReport();
      const metrics = await this.getMetrics(1000);
      
      const exportData = {
        timestamp: new Date().toISOString(),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
        report,
        metrics,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      await errorService.logError(error as Error, { context: 'export_metrics' });
      throw new Error('Failed to export performance metrics');
    }
  }

  private async loadStoredMetrics(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(PerformanceService.PERFORMANCE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.metrics = data.map((metric: any) => ({
          ...metric,
          timestamp: new Date(metric.timestamp),
        }));
      }
    } catch (error) {
      await errorService.logError(error as Error, { context: 'load_stored_metrics' });
    }
  }

  private async persistMetrics(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        PerformanceService.PERFORMANCE_KEY,
        JSON.stringify(this.metrics)
      );
    } catch (error) {
      await errorService.logError(error as Error, { context: 'persist_metrics' });
    }
  }

  private async startPerformanceMonitoring(): Promise<void> {
    // Monitor memory usage
    setInterval(async () => {
      try {
        // This is a simplified memory monitoring
        // In a real app, you might use more sophisticated monitoring
        const memoryInfo = {
          activeTimers: this.activeTimers.size,
          metricsCount: this.metrics.length,
        };

        if (memoryInfo.metricsCount > PerformanceService.MAX_METRICS * 0.9) {
          await errorService.logWarning('Performance metrics approaching limit', memoryInfo);
        }
      } catch (error) {
        // Don't log monitoring errors to avoid recursion
        console.error('Performance monitoring error:', error);
      }
    }, 60000); // Check every minute
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  // Utility methods for common performance measurements
  async measureNavigation(
    screenName: string,
    navigationTime: number,
    userId?: string
  ): Promise<void> {
    this.recordMetric({
      id: this.generateId(),
      name: `Navigate to ${screenName}`,
      timestamp: new Date(),
      duration: navigationTime,
      type: 'navigation',
      metadata: { screenName },
      userId,
    });
  }

  async measureAPI(
    endpoint: string,
    method: string,
    duration: number,
    statusCode?: number,
    userId?: string
  ): Promise<void> {
    this.recordMetric({
      id: this.generateId(),
      name: `API ${method} ${endpoint}`,
      timestamp: new Date(),
      duration,
      type: 'api',
      metadata: { endpoint, method, statusCode },
      userId,
    });
  }

  async measureUserInteraction(
    action: string,
    duration: number,
    userId?: string
  ): Promise<void> {
    this.recordMetric({
      id: this.generateId(),
      name: `User Action: ${action}`,
      timestamp: new Date(),
      duration,
      type: 'user_interaction',
      metadata: { action },
      userId,
    });
  }

  async measureRender(
    componentName: string,
    duration: number,
    userId?: string
  ): Promise<void> {
    this.recordMetric({
      id: this.generateId(),
      name: `Render ${componentName}`,
      timestamp: new Date(),
      duration,
      type: 'render',
      metadata: { componentName },
      userId,
    });
  }
}

export const performanceService = PerformanceService.getInstance();


