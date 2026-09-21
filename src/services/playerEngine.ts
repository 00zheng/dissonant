export type PlayerStateCallback = (isPlaying: boolean) => void;
export type TimeUpdateCallback = (currentTime: number) => void;
export type DurationCallback = (duration: number) => void;
export type EndedCallback = () => void;
export type ErrorCallback = (error: any) => void;
export type LoopStateCallback = (loopA: number | null, loopB: number | null, isLoopActive: boolean) => void;
export type PlaybackRateCallback = (rate: number) => void;

export class AudioPlayerEngine {
  private audio: HTMLAudioElement;
  private isPlayingState: boolean = false;
  private volumeState: number = 0.8;
  private isMutedState: boolean = false;
  private playbackRateState: number = 1.0;

  private loopAState: number | null = null;
  private loopBState: number | null = null;
  private isLoopActiveState: boolean = false;

  private currentTimeState: number = 0;
  private durationState: number = 0;
  private currentSrc: string = '';

  // Web Audio Graph
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private eqBands: BiquadFilterNode[] = [];
  private normGainNode: GainNode | null = null;
  private limiterNode: DynamicsCompressorNode | null = null;
  private isAudioGraphInitialized: boolean = false;
  private webAudioGraphFailed: boolean = false;

  private stateListeners: Set<PlayerStateCallback> = new Set();
  private timeListeners: Set<TimeUpdateCallback> = new Set();
  private durationListeners: Set<DurationCallback> = new Set();
  private endedListeners: Set<EndedCallback> = new Set();
  private errorListeners: Set<ErrorCallback> = new Set();
  private loopListeners: Set<LoopStateCallback> = new Set();
  private rateListeners: Set<PlaybackRateCallback> = new Set();

  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous'; // Important for Firebase Storage / Blob URLs
    this.audio.volume = this.volumeState;
    this.setupEventListeners();
  }

  // ---------------------------------------------------------------------------
  // Web Audio Graph (Safe Initialization)
  // ---------------------------------------------------------------------------

  private initWebAudio() {
    if (this.isAudioGraphInitialized || this.webAudioGraphFailed) return;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('[Player] Web Audio API not supported. Falling back to native audio.');
      this.webAudioGraphFailed = true;
      return;
    }

    try {
      this.audioCtx = new AudioContextClass();
      
      // ONLY CREATE SOURCE NODE ONCE
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);

      // Create 6-band EQ
      const freqs = [60, 150, 400, 1000, 2400, 15000];
      const types: BiquadFilterType[] = ['lowshelf', 'peaking', 'peaking', 'peaking', 'peaking', 'highshelf'];
      
      for (let i = 0; i < 6; i++) {
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = types[i];
        filter.frequency.value = freqs[i];
        if (types[i] === 'peaking') {
          filter.Q.value = 1.0;
        }
        filter.gain.value = 0; // Default flat
        this.eqBands.push(filter);
      }

      // Normalization Gain
      this.normGainNode = this.audioCtx.createGain();
      this.normGainNode.gain.value = 1.0;

      // Limiter (Dynamics Compressor)
      this.limiterNode = this.audioCtx.createDynamicsCompressor();
      this.limiterNode.threshold.value = -1.0; // ceiling
      this.limiterNode.knee.value = 0.0;
      this.limiterNode.ratio.value = 20.0;
      this.limiterNode.attack.value = 0.005;
      this.limiterNode.release.value = 0.050;

      // Connect graph
      // Source -> EQ0 -> ... -> EQ5 -> NormGain -> Limiter -> Destination
      this.sourceNode.connect(this.eqBands[0]);
      for (let i = 0; i < 5; i++) {
        this.eqBands[i].connect(this.eqBands[i+1]);
      }
      this.eqBands[5].connect(this.normGainNode);
      this.normGainNode.connect(this.limiterNode);
      this.limiterNode.connect(this.audioCtx.destination);

      this.isAudioGraphInitialized = true;
      console.log('[Player] Web Audio graph initialized successfully.');
    } catch (err) {
      console.error('[Player] Web Audio initialization failed:', err);
      this.webAudioGraphFailed = true;
      
      // Attempt safe teardown if partially initialized
      try {
        if (this.sourceNode) this.sourceNode.disconnect();
        // Since we cannot "undo" createMediaElementSource easily in some browsers,
        // if it fails midway, we just log it. The fallback is to just let the audio element play.
      } catch (e) {}
    }
  }

  // Exposed for Audio Settings to apply EQ and Normalization smoothly
  public applyAudioProcessing(
    eqEnabled: boolean, 
    eqGains: number[], 
    normalizeEnabled: boolean, 
    normalizationGainDb: number = 0
  ) {
    if (!this.isAudioGraphInitialized) {
      // Lazy init on first processing request if not already done
      this.initWebAudio();
    }
    
    if (this.webAudioGraphFailed || !this.audioCtx) return;

    const time = this.audioCtx.currentTime + 0.05; // small delay for smoothness

    // 1. Apply EQ
    for (let i = 0; i < 6; i++) {
      const targetGain = eqEnabled ? (eqGains[i] || 0) : 0;
      // Clamp between -12 and +12
      const clampedGain = Math.max(-12, Math.min(12, targetGain));
      this.eqBands[i].gain.setTargetAtTime(clampedGain, time, 0.05);
    }

    // 2. Apply Normalization
    // Convert dB to linear multiplier: 10^(dB/20)
    const normDb = normalizeEnabled ? normalizationGainDb : 0;
    const clampedNormDb = Math.max(-12, Math.min(8, normDb)); // Safety clamp
    const linearGain = Math.pow(10, clampedNormDb / 20);
    
    if (this.normGainNode) {
      this.normGainNode.gain.setTargetAtTime(linearGain, time, 0.05);
    }
  }

  public getAudioContextState() {
    return this.audioCtx?.state;
  }


  // ---------------------------------------------------------------------------
  // Event Listeners
  // ---------------------------------------------------------------------------

  private setupEventListeners() {
    this.audio.addEventListener('timeupdate', () => {
      const time = this.audio.currentTime || 0;
      this.currentTimeState = time;

      if (this.isLoopActiveState && this.loopAState !== null && this.loopBState !== null && this.loopAState < this.loopBState) {
        if (time >= this.loopBState || time < this.loopAState) {
          this.audio.currentTime = this.loopAState;
          this.timeListeners.forEach((cb) => cb(this.loopAState!));
          return;
        }
      }

      this.timeListeners.forEach((cb) => cb(time));
    });

    this.audio.addEventListener('durationchange', () => {
      const dur = this.audio.duration;
      if (dur && !isNaN(dur)) {
        this.durationState = dur;
        if (this.loopBState !== null && this.loopBState > dur) {
          this.loopBState = dur;
          this.notifyLoopChange();
        }
        this.durationListeners.forEach((cb) => cb(dur));
        this.syncMediaSessionPosition();
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
      if (this.isLoopActiveState && this.loopAState !== null && this.loopBState !== null && this.loopAState < this.loopBState) {
        this.audio.currentTime = this.loopAState;
        this.play();
        return;
      }
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
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = this.isPlayingState ? 'playing' : 'paused';
    }
    if (this.isPlayingState) {
      this.syncMediaSessionPosition();
    }
  }

  private notifyLoopChange() {
    this.loopListeners.forEach((cb) =>
      cb(this.loopAState, this.loopBState, this.isLoopActiveState)
    );
  }

  public syncMediaSessionPosition() {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      try {
        const dur = this.getDuration();
        const curr = this.getCurrentTime();
        if (dur && !isNaN(dur) && isFinite(dur) && curr >= 0 && curr <= dur) {
          navigator.mediaSession.setPositionState({
            duration: dur,
            playbackRate: this.playbackRateState,
            position: curr,
          });
        }
      } catch (e) {
        // Ignore errors if values are somehow invalid for the API
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Public Playback Methods
  // ---------------------------------------------------------------------------

  public async loadAndPlay(src: string, startTime: number = 0): Promise<void> {
    if (this.currentSrc !== src) {
      this.clearLoop();
      this.currentSrc = src;
      this.currentTimeState = startTime;
      this.audio.src = src;
    }

    this.audio.pause();
    this.isPlayingState = false;

    this.audio.currentTime = startTime;
    await this.play();
  }

  public async play(): Promise<void> {
    if (!this.audio.src) return;

    this.audio.playbackRate = this.playbackRateState;

    // Preserve pitch when changing playback speed
    if ('preservesPitch' in this.audio) {
      (this.audio as any).preservesPitch = true;
    }

    this.audio.volume = this.isMutedState ? 0 : this.volumeState;

    try {
      // Lazy init Audio Graph if not yet created on first play
      if (!this.isAudioGraphInitialized && !this.webAudioGraphFailed) {
        this.initWebAudio();
      }
      
      // Resume AudioContext if suspended (required for iOS/Safari autoplay policy)
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume().catch(e => console.warn('[Player] AudioContext resume failed:', e));
      }

      await this.audio.play();
    } catch (err) {
      console.warn('[Player] audio.play() error:', err);
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
    const dur = this.getDuration() || seconds;
    let targetTime = Math.min(seconds, dur);

    if (this.isLoopActiveState && this.loopAState !== null && this.loopBState !== null) {
      if (targetTime < this.loopAState || targetTime > this.loopBState) {
        targetTime = this.loopAState;
      }
    }

    this.currentTimeState = targetTime;
    this.audio.currentTime = targetTime;
    this.timeListeners.forEach((cb) => cb(targetTime));
    this.syncMediaSessionPosition();
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volumeState = clamped;
    if (clamped > 0 && this.isMutedState) {
      this.isMutedState = false;
    }
    this.audio.volume = this.isMutedState ? 0 : clamped;
  }

  public setMuted(muted: boolean): void {
    this.isMutedState = muted;
    this.audio.volume = muted ? 0 : this.volumeState;
  }

  public toggleMute(): void {
    this.setMuted(!this.isMutedState);
  }

  public setPlaybackRate(rate: number): void {
    const normalizedRate = Math.round((rate + Number.EPSILON) * 100) / 100;
    const clamped = Math.max(0.5, Math.min(2.0, normalizedRate));
    this.playbackRateState = clamped;
    this.audio.playbackRate = clamped;
    this.rateListeners.forEach((cb) => cb(clamped));
    this.syncMediaSessionPosition();
  }

  public getPlaybackRate(): number {
    return this.playbackRateState;
  }

  public getCurrentTime(): number {
    return this.currentTimeState;
  }

  public getDuration(): number {
    return this.durationState;
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

  // --- A-B Looping Methods ---

  public setLoopA(time?: number): void {
    const dur = this.getDuration();
    let val = time !== undefined ? time : this.getCurrentTime();
    val = Math.max(0, Math.min(dur || val, val));

    if (this.loopBState !== null && val >= this.loopBState) {
      this.loopBState = Math.min(dur || val + 5, val + 2);
    }

    this.loopAState = val;
    this.notifyLoopChange();
  }

  public setLoopB(time?: number): void {
    const dur = this.getDuration();
    let val = time !== undefined ? time : this.getCurrentTime();
    if (dur && val > dur) {
      val = dur;
    }
    val = Math.max(0, val);

    if (this.loopAState !== null && val <= this.loopAState) {
      this.loopAState = Math.max(0, val - 2);
    }

    this.loopBState = val;
    this.notifyLoopChange();
  }

  public toggleLoopActive(): void {
    this.isLoopActiveState = !this.isLoopActiveState;

    if (this.isLoopActiveState) {
      const dur = this.getDuration();
      if (this.loopAState === null) {
        this.loopAState = 0;
      }
      if (this.loopBState === null) {
        this.loopBState = dur || 10;
      }
      const curr = this.getCurrentTime();
      if (curr < this.loopAState || curr > this.loopBState) {
        this.seek(this.loopAState);
      }
    }

    this.notifyLoopChange();
  }

  public clearLoop(): void {
    this.loopAState = null;
    this.loopBState = null;
    this.isLoopActiveState = false;
    this.notifyLoopChange();
  }

  public getLoopState(): { loopA: number | null; loopB: number | null; isLoopActive: boolean } {
    return {
      loopA: this.loopAState,
      loopB: this.loopBState,
      isLoopActive: this.isLoopActiveState,
    };
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

  public onLoopChange(cb: LoopStateCallback): () => void {
    this.loopListeners.add(cb);
    return () => this.loopListeners.delete(cb);
  }

  public onPlaybackRateChange(cb: PlaybackRateCallback): () => void {
    this.rateListeners.add(cb);
    return () => this.rateListeners.delete(cb);
  }

  public getMediaElement(): HTMLAudioElement {
    return this.audio;
  }
}

export const playerEngine = new AudioPlayerEngine();

export class AudioPreloader {
  private standbyAudio: HTMLAudioElement;
  private currentTrackId: string | null = null;
  private currentUrl: string | null = null;

  constructor() {
    this.standbyAudio = new Audio();
    this.standbyAudio.preload = 'auto';
    this.standbyAudio.volume = 0; // Ensure it never makes sound
  }

  public preload(trackId: string, url: string) {
    if (this.currentTrackId === trackId && this.currentUrl === url) {
      return; // Already preloading this
    }
    
    console.log(`[Preloader] Preloading track ${trackId}`);
    this.currentTrackId = trackId;
    this.currentUrl = url;
    
    this.standbyAudio.src = url;
    this.standbyAudio.load(); // Request the browser to fetch media data
  }
  
  public clear() {
    if (this.currentTrackId === null) return;
    
    console.log(`[Preloader] Clearing prefetch`);
    this.currentTrackId = null;
    this.currentUrl = null;
    this.standbyAudio.removeAttribute('src');
    this.standbyAudio.load();
  }
}

export const audioPreloader = new AudioPreloader();
