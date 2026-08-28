export type PlayerStateCallback = (isPlaying: boolean) => void;
export type TimeUpdateCallback = (currentTime: number) => void;
export type DurationCallback = (duration: number) => void;
export type EndedCallback = () => void;
export type ErrorCallback = (error: any) => void;

export class AudioPlayerEngine {
  private audio: HTMLAudioElement;
  private isPlayingState: boolean = false;
  private volumeState: number = 0.8;
  private isMutedState: boolean = false;

  private stateListeners: Set<PlayerStateCallback> = new Set();
  private timeListeners: Set<TimeUpdateCallback> = new Set();
  private durationListeners: Set<DurationCallback> = new Set();
  private endedListeners: Set<EndedCallback> = new Set();
  private errorListeners: Set<ErrorCallback> = new Set();

  constructor() {
    this.audio = new Audio();
    this.audio.volume = this.volumeState;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.audio.addEventListener('timeupdate', () => {
      const time = this.audio.currentTime || 0;
      this.timeListeners.forEach((cb) => cb(time));
    });

    this.audio.addEventListener('durationchange', () => {
      const dur = this.audio.duration;
      if (dur && !isNaN(dur)) {
        this.durationListeners.forEach((cb) => cb(dur));
      }
    });

    this.audio.addEventListener('play', () => {
      this.isPlayingState = true;
      this.notifyStateChange();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlayingState = false;
      this.notifyStateChange();
    });

    this.audio.addEventListener('ended', () => {
      this.isPlayingState = false;
      this.notifyStateChange();
      this.endedListeners.forEach((cb) => cb());
    });

    this.audio.addEventListener('error', (e) => {
      this.isPlayingState = false;
      this.notifyStateChange();
      this.errorListeners.forEach((cb) => cb(e));
    });
  }

  private notifyStateChange() {
    this.stateListeners.forEach((cb) => cb(this.isPlayingState));
  }

  public async loadAndPlay(src: string, startTime: number = 0): Promise<void> {
    if (this.audio.src !== src) {
      this.audio.src = src;
      this.audio.currentTime = startTime;
    }
    try {
      await this.audio.play();
      this.isPlayingState = true;
      this.notifyStateChange();
    } catch (err) {
      console.warn('Playback request interrupted or restricted by browser:', err);
      this.isPlayingState = false;
      this.notifyStateChange();
    }
  }

  public async play(): Promise<void> {
    if (!this.audio.src) return;
    try {
      await this.audio.play();
      this.isPlayingState = true;
      this.notifyStateChange();
    } catch (err) {
      console.warn('Playback error:', err);
    }
  }

  public pause(): void {
    this.audio.pause();
    this.isPlayingState = false;
    this.notifyStateChange();
  }

  public togglePlay(): void {
    if (this.isPlayingState) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number): void {
    if (isNaN(seconds) || seconds < 0) return;
    const targetTime = Math.min(seconds, this.audio.duration || seconds);
    this.audio.currentTime = targetTime;
    this.timeListeners.forEach((cb) => cb(targetTime));
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volumeState = clamped;
    if (clamped > 0 && this.isMutedState) {
      this.isMutedState = false;
    }
    this.audio.volume = this.isMutedState ? 0 : this.volumeState;
  }

  public setMuted(muted: boolean): void {
    this.isMutedState = muted;
    this.audio.volume = this.isMutedState ? 0 : this.volumeState;
  }

  public toggleMute(): void {
    this.setMuted(!this.isMutedState);
  }

  public getCurrentTime(): number {
    return this.audio.currentTime || 0;
  }

  public getDuration(): number {
    return this.audio.duration || 0;
  }

  public getVolume(): number {
    return this.volumeState;
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  public isPlaying(): boolean {
    return this.isPlayingState;
  }

  // --- Subscriptions ---

  public onStateChange(cb: PlayerStateCallback): () => void {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  public onTimeUpdate(cb: TimeUpdateCallback): () => void {
    this.timeListeners.add(cb);
    return () => this.timeListeners.delete(cb);
  }

  public onDurationChange(cb: DurationCallback): () => void {
    this.durationListeners.add(cb);
    return () => this.durationListeners.delete(cb);
  }

  public onEnded(cb: EndedCallback): () => void {
    this.endedListeners.add(cb);
    return () => this.endedListeners.delete(cb);
  }

  public onError(cb: ErrorCallback): () => void {
    this.errorListeners.add(cb);
    return () => this.errorListeners.delete(cb);
  }
}

// Export singleton instance of player engine
export const playerEngine = new AudioPlayerEngine();
