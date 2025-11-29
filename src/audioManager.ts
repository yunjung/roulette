// Import audio files so Parcel bundles them
import jingle1Url from 'url:../assets/sounds/jingle1.mp3';
import jingle2Url from 'url:../assets/sounds/jingle2.mp3';
import jingle3Url from 'url:../assets/sounds/jingle3.mp3';
import bellImpactUrl from 'url:../assets/sounds/bell-impact.mp3';
import christmasFanfareUrl from 'url:../assets/sounds/christmas-fanfare.mp3';
import sleighBellsUrl from 'url:../assets/sounds/sleigh-bells.mp3';
import backgroundMusicUrl from 'url:../assets/sounds/background-music.mp4';

export type SoundType = 'collision' | 'impact' | 'winner' | 'start' | 'background';

export class AudioManager {
  private sounds: Map<SoundType, HTMLAudioElement[]> = new Map();
  private backgroundMusic: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.7;
  private musicVolume: number = 0.3;

  async init() {
    // Load all sound effects
    await this._loadSounds();
  }

  private async _loadSounds() {
    // Load each sound type independently so one failure doesn't break all audio

    // Collision sounds (pool of 3 for variety)
    const collisionSounds = await this._loadAudioSafe([
      jingle1Url,
      jingle2Url,
      jingle3Url,
    ]);
    if (collisionSounds.length > 0) {
      this.sounds.set('collision', collisionSounds);
    }

    // Impact/skill sound
    const impactSounds = await this._loadAudioSafe([bellImpactUrl]);
    if (impactSounds.length > 0) {
      this.sounds.set('impact', impactSounds);
    }

    // Winner fanfare
    const winnerSounds = await this._loadAudioSafe([christmasFanfareUrl]);
    if (winnerSounds.length > 0) {
      this.sounds.set('winner', winnerSounds);
    }

    // Start sound
    const startSounds = await this._loadAudioSafe([sleighBellsUrl]);
    if (startSounds.length > 0) {
      this.sounds.set('start', startSounds);
    }

    // Background music (looping)
    try {
      this.backgroundMusic = await this._loadAudio(backgroundMusicUrl);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = this.musicVolume;
    } catch (error) {
      console.warn('Background music not found:', error);
    }
  }

  private async _loadAudioSafe(urls: string[]): Promise<HTMLAudioElement[]> {
    const results: HTMLAudioElement[] = [];
    for (const url of urls) {
      try {
        const audio = await this._loadAudio(url);
        results.push(audio);
      } catch (error) {
        console.warn(`Failed to load audio: ${url}`, error);
      }
    }
    return results;
  }

  private async _loadAudio(url: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.addEventListener('canplaythrough', () => resolve(audio), {
        once: true,
      });
      audio.addEventListener('error', reject, { once: true });
      audio.src = url;
      audio.load();
    });
  }

  play(type: SoundType) {
    if (this.isMuted) return;

    const soundPool = this.sounds.get(type);
    if (!soundPool || soundPool.length === 0) return;

    // Pick random from pool for variety
    const sound = soundPool[Math.floor(Math.random() * soundPool.length)];

    // Clone for overlapping sounds
    const clone = sound.cloneNode() as HTMLAudioElement;
    clone.volume = this.volume;
    clone.play().catch((err) => console.warn('Audio play failed:', err));
  }

  startBackgroundMusic() {
    if (this.isMuted || !this.backgroundMusic) return;

    this.backgroundMusic.currentTime = 0;
    this.backgroundMusic
      .play()
      .catch((err) => console.warn('Music play failed:', err));
  }

  stopBackgroundMusic() {
    if (!this.backgroundMusic) return;
    this.backgroundMusic.pause();
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.musicVolume;
    }
  }
}
