export interface LogEntry {
  timestamp: string;
  source: string;
  message: string;
  state: any;
}

class DiagnosticsLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private listeners: Set<() => void> = new Set();
  
  // Test toggle: Disable standby audio element to see if it fixes iOS lock screen
  public disableStandbyAudio: boolean = false;

  public log(source: string, message: string, state: any = {}) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString().split('T')[1].replace('Z', ''),
      source,
      message,
      state
    };
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    
    // Broadcast update
    this.listeners.forEach(listener => listener());
  }

  public getLogs(): LogEntry[] {
    return this.logs;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public toggleStandbyAudio() {
    this.disableStandbyAudio = !this.disableStandbyAudio;
    this.log('Diagnostics', `Toggled standbyAudio to: ${!this.disableStandbyAudio}`);
    this.listeners.forEach(listener => listener());
  }
}

export const diagnostics = new DiagnosticsLogger();
