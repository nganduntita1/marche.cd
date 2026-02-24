// Performance Monitoring Service for Guidance System
// Tracks render times, storage operations, and provides performance insights

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

interface PerformanceReport {
  totalMetrics: number;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  p95Duration: number;
  violations: number; // Count of operations exceeding threshold
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: Map<string, number> = new Map([
    ['tooltip_render', 100], // 100ms target for tooltip rendering
    ['tour_render', 100],
    ['state_load', 50], // 50ms target for state loading
    ['state_save', 100],
    ['content_load', 50],
  ]);

  /**
   * Start timing an operation
   */
  startTiming(operationName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(operationName, duration);
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    // Keep only last 100 metrics per operation to prevent memory bloat
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Check threshold violation
    const threshold = this.thresholds.get(name);
    if (threshold && duration > threshold) {
      console.warn(
        `Performance threshold exceeded for ${name}: ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }
  }

  /**
   * Get performance report for an operation
   */
  getReport(operationName: string): PerformanceReport | null {
    const metrics = this.metrics.get(operationName);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const total = durations.reduce((sum, d) => sum + d, 0);
    const threshold = this.thresholds.get(operationName) || Infinity;

    return {
      totalMetrics: durations.length,
      averageDuration: total / durations.length,
      maxDuration: durations[durations.length - 1],
      minDuration: durations[0],
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      violations: durations.filter(d => d > threshold).length,
    };
  }

  /**
   * Get all performance reports
   */
  getAllReports(): Map<string, PerformanceReport> {
    const reports = new Map<string, PerformanceReport>();
    
    for (const [name] of this.metrics) {
      const report = this.getReport(name);
      if (report) {
        reports.set(name, report);
      }
    }

    return reports;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Clear metrics for a specific operation
   */
  clearMetricsFor(operationName: string): void {
    this.metrics.delete(operationName);
  }

  /**
   * Set custom threshold for an operation
   */
  setThreshold(operationName: string, thresholdMs: number): void {
    this.thresholds.set(operationName, thresholdMs);
  }

  /**
   * Log performance summary
   */
  logSummary(): void {
    console.log('=== Guidance System Performance Summary ===');
    
    const reports = this.getAllReports();
    if (reports.size === 0) {
      console.log('No performance metrics recorded yet.');
      return;
    }

    for (const [name, report] of reports) {
      const threshold = this.thresholds.get(name);
      const status = threshold && report.p95Duration > threshold ? '⚠️' : '✅';
      
      console.log(`\n${status} ${name}:`);
      console.log(`  Average: ${report.averageDuration.toFixed(2)}ms`);
      console.log(`  P95: ${report.p95Duration.toFixed(2)}ms`);
      console.log(`  Max: ${report.maxDuration.toFixed(2)}ms`);
      console.log(`  Samples: ${report.totalMetrics}`);
      
      if (threshold) {
        console.log(`  Threshold: ${threshold}ms`);
        console.log(`  Violations: ${report.violations} (${((report.violations / report.totalMetrics) * 100).toFixed(1)}%)`);
      }
    }
    
    console.log('\n==========================================');
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export utility function for easy timing
export function measurePerformance<T>(
  operationName: string,
  operation: () => T
): T {
  const endTiming = performanceMonitor.startTiming(operationName);
  try {
    const result = operation();
    endTiming();
    return result;
  } catch (error) {
    endTiming();
    throw error;
  }
}

// Export async utility function
export async function measurePerformanceAsync<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  const endTiming = performanceMonitor.startTiming(operationName);
  try {
    const result = await operation();
    endTiming();
    return result;
  } catch (error) {
    endTiming();
    throw error;
  }
}

export default performanceMonitor;
