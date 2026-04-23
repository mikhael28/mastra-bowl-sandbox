import { useCallback, useEffect, useRef, useState } from 'react';
import {
  VoiceSpeaker,
  listVoiceSpeakers,
  speakText,
  transcribeAudio,
} from '../lib/mastraClient';

// VAD is loaded lazily from CDN on first Live activation — same pattern as the
// sandbox page. Keeps the bundle lean and avoids an npm dep for an optional
// feature.
const VAD_BASE = 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.24/dist/';
const ORT_BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';
const FRAME_MS = 96;
const SPEECH_THRESHOLD = 0.5;
const SILENCE_MS = 700;

declare global {
  interface Window {
    vad?: any;
  }
}

export type VoiceState =
  | 'idle'
  | 'listening'
  | 'recording'
  | 'transcribing'
  | 'thinking'
  | 'speaking';

interface Props {
  agentId: string;
  streaming: boolean;
  onTranscript: (text: string) => void;
  /** Latest finished assistant reply to speak; null if nothing new. */
  pendingSpeak: { id: string; text: string } | null;
}

let vadLoadPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('failed to load ' + src));
    document.head.appendChild(s);
  });
}

function ensureVadLoaded(): Promise<void> {
  if (window.vad) return Promise.resolve();
  if (!vadLoadPromise) {
    vadLoadPromise = loadScript(ORT_BASE + 'ort.js').then(() =>
      loadScript(VAD_BASE + 'bundle.min.js'),
    );
  }
  return vadLoadPromise;
}

function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * bytesPerSample, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

export function VoiceControls({
  agentId,
  streaming,
  onTranscript,
  pendingSpeak,
}: Props) {
  const [liveOn, setLiveOn] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [speakerId, setSpeakerId] = useState('');
  const [speakers, setSpeakers] = useState<VoiceSpeaker[]>([]);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [meter, setMeter] = useState(0);
  const [pttActive, setPttActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vadRef = useRef<any>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordStreamRef = useRef<MediaStream | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  // Seed with the pendingSpeak id at mount-time so we don't speak a stale reply
  // when the component remounts (e.g. agent switch).
  const lastSpokenIdRef = useRef<string | null>(pendingSpeak?.id ?? null);
  const generationRef = useRef(0);
  const liveOnRef = useRef(liveOn);
  const speakRepliesRef = useRef(speakReplies);
  const speakerIdRef = useRef(speakerId);
  const voiceStateRef = useRef(voiceState);
  const prevStreamingRef = useRef(streaming);

  useEffect(() => { liveOnRef.current = liveOn; }, [liveOn]);
  useEffect(() => { speakRepliesRef.current = speakReplies; }, [speakReplies]);
  useEffect(() => { speakerIdRef.current = speakerId; }, [speakerId]);
  useEffect(() => { voiceStateRef.current = voiceState; }, [voiceState]);

  const setState = useCallback((s: VoiceState) => {
    voiceStateRef.current = s;
    setVoiceState(s);
  }, []);

  // Fetch speakers whenever the agent changes.
  useEffect(() => {
    let alive = true;
    setSpeakers([]);
    setSpeakerId('');
    if (!agentId) return;
    listVoiceSpeakers(agentId).then((s) => {
      if (!alive) return;
      setSpeakers(s);
    });
    return () => {
      alive = false;
    };
  }, [agentId]);

  // streaming flipping true → 'thinking'. streaming flipping false is handled
  // by the pendingSpeak effect (which will either start speaking or drop back
  // to listening/idle).
  useEffect(() => {
    const was = prevStreamingRef.current;
    prevStreamingRef.current = streaming;
    if (!was && streaming) {
      const s = voiceStateRef.current;
      if (s !== 'recording' && s !== 'speaking') setState('thinking');
    } else if (was && !streaming) {
      // Safety reset in case no pendingSpeak arrives (error / tripwire / abort).
      // The pendingSpeak effect runs in the same tick and will override if present.
      const tid = window.setTimeout(() => {
        if (voiceStateRef.current === 'thinking') {
          setState(liveOnRef.current ? 'listening' : 'idle');
        }
      }, 200);
      return () => window.clearTimeout(tid);
    }
  }, [streaming, setState]);

  // When a new finished reply arrives, speak it if enabled; otherwise reset.
  useEffect(() => {
    if (!pendingSpeak) return;
    if (lastSpokenIdRef.current === pendingSpeak.id) return;
    lastSpokenIdRef.current = pendingSpeak.id;
    if (!speakRepliesRef.current || !pendingSpeak.text.trim()) {
      setState(liveOnRef.current ? 'listening' : 'idle');
      return;
    }
    void speakReply(pendingSpeak.text);
    // speakReply reads refs; we intentionally do not depend on speakReplies/liveOn here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSpeak?.id]);

  async function speakReply(text: string) {
    const gen = generationRef.current;
    setState('speaking');
    try {
      const blob = await speakText(agentId, text, speakerIdRef.current || undefined);
      if (gen !== generationRef.current) return;
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      let audio = audioElRef.current;
      if (!audio) {
        audio = new Audio();
        audioElRef.current = audio;
      }
      audio.src = url;
      await new Promise<void>((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          resolve();
        };
        audio!.onended = finish;
        audio!.onerror = finish;
        audio!.onpause = finish; // barge-in triggers pause → resolves
        audio!.play().catch(finish);
      });
      if (gen === generationRef.current && voiceStateRef.current === 'speaking') {
        setState(liveOnRef.current ? 'listening' : 'idle');
      }
    } catch (err) {
      console.warn('[VoiceControls] speak:', err);
      if (gen === generationRef.current && voiceStateRef.current === 'speaking') {
        setState(liveOnRef.current ? 'listening' : 'idle');
      }
    }
  }

  // ── Live (always-on / VAD) ────────────────────────────

  async function toggleLive() {
    if (liveOn) await stopLive();
    else await startLive();
  }

  async function startLive() {
    setError(null);
    try {
      await ensureVadLoaded();
    } catch (err: any) {
      setError('VAD load failed: ' + err.message);
      return;
    }
    try {
      const vad = await window.vad.MicVAD.new({
        baseAssetPath: VAD_BASE,
        onnxWASMBasePath: ORT_BASE,
        positiveSpeechThreshold: SPEECH_THRESHOLD,
        negativeSpeechThreshold: Math.max(0.1, SPEECH_THRESHOLD - 0.15),
        redemptionFrames: Math.max(3, Math.round(SILENCE_MS / FRAME_MS)),
        minSpeechFrames: 3,
        preSpeechPadFrames: 1,
        onSpeechStart: handleSpeechStart,
        onSpeechEnd: handleSpeechEnd,
        onVADMisfire: () => {
          if (voiceStateRef.current === 'recording') setState('listening');
        },
        onFrameProcessed: (probs: { isSpeech: number }) => {
          if (voiceStateRef.current === 'idle') return;
          setMeter(Math.min(100, probs.isSpeech * 100));
        },
      });
      vadRef.current = vad;
      vad.start();
      setLiveOn(true);
      liveOnRef.current = true;
      setState('listening');
    } catch (err: any) {
      setError('VAD init failed: ' + err.message);
    }
  }

  async function stopLive() {
    generationRef.current++;
    if (vadRef.current) {
      try { vadRef.current.pause(); } catch {}
      try { vadRef.current.destroy(); } catch {}
      vadRef.current = null;
    }
    pauseAudio();
    setLiveOn(false);
    liveOnRef.current = false;
    setMeter(0);
    setState('idle');
  }

  function pauseAudio() {
    if (audioElRef.current && !audioElRef.current.paused) {
      try { audioElRef.current.pause(); } catch {}
    }
  }

  function handleSpeechStart() {
    const s = voiceStateRef.current;
    if (s === 'speaking') {
      // Barge-in: pause TTS so the user can take the floor.
      generationRef.current++;
      pauseAudio();
      setState('recording');
    } else if (s === 'listening') {
      setState('recording');
    }
    // During transcribing/thinking, ignore (we're already busy).
  }

  async function handleSpeechEnd(audio: Float32Array) {
    if (voiceStateRef.current !== 'recording') return;
    if (!audio || audio.length === 0) {
      setState(liveOnRef.current ? 'listening' : 'idle');
      return;
    }
    const gen = generationRef.current;
    setState('transcribing');
    const blob = encodeWAV(audio, 16000);
    let text = '';
    try {
      text = await transcribeAudio(agentId, blob, 'wav');
    } catch (err) {
      console.warn('[VoiceControls] transcribe:', err);
      if (gen === generationRef.current) {
        setState(liveOnRef.current ? 'listening' : 'idle');
      }
      return;
    }
    if (gen !== generationRef.current) return;
    if (!text) {
      setState(liveOnRef.current ? 'listening' : 'idle');
      return;
    }
    onTranscript(text);
    // The parent will flip `streaming` → true; our effect will move us to 'thinking'.
  }

  // ── Push-to-talk (MediaRecorder) ──────────────────────

  async function startPtt() {
    if (pttActive) return;
    // If streaming or already busy elsewhere, ignore.
    if (streaming) return;
    const s = voiceStateRef.current;
    if (s === 'transcribing' || s === 'thinking') return;

    setError(null);

    // If Live is on, pause VAD so we don't double-capture.
    if (vadRef.current) {
      try { vadRef.current.pause(); } catch {}
    }

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError('Recording not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordStreamRef.current = stream;
      recordChunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.addEventListener('dataavailable', (e) => {
        if (e.data && e.data.size > 0) recordChunksRef.current.push(e.data);
      });
      recorder.addEventListener('stop', handleRecorderStop);
      // Barge-in via PTT: pause any ongoing TTS.
      pauseAudio();
      recorder.start();
      setPttActive(true);
      setState('recording');
    } catch (err: any) {
      setError(err.message || 'mic denied');
      if (vadRef.current) { try { vadRef.current.start(); } catch {} }
    }
  }

  async function handleRecorderStop() {
    const recorder = recorderRef.current;
    const chunks = recordChunksRef.current;
    recordChunksRef.current = [];
    if (recordStreamRef.current) {
      recordStreamRef.current.getTracks().forEach((t) => t.stop());
      recordStreamRef.current = null;
    }
    recorderRef.current = null;
    setPttActive(false);

    // Resume VAD if Live is still on.
    if (liveOnRef.current && vadRef.current) {
      try { vadRef.current.start(); } catch {}
    }

    const mime = recorder?.mimeType || 'audio/webm';
    const blob = new Blob(chunks, { type: mime });
    if (blob.size === 0) {
      setState(liveOnRef.current ? 'listening' : 'idle');
      return;
    }

    const gen = generationRef.current;
    setState('transcribing');
    let text = '';
    try {
      const ext: 'webm' | 'mp4' | 'ogg' | 'wav' =
        mime.includes('mp4') ? 'mp4'
          : mime.includes('ogg') ? 'ogg'
            : mime.includes('wav') ? 'wav'
              : 'webm';
      text = await transcribeAudio(agentId, blob, ext);
    } catch (err) {
      console.warn('[VoiceControls] PTT transcribe:', err);
      if (gen === generationRef.current) {
        setState(liveOnRef.current ? 'listening' : 'idle');
      }
      return;
    }
    if (gen !== generationRef.current) return;
    if (!text) {
      setState(liveOnRef.current ? 'listening' : 'idle');
      return;
    }
    onTranscript(text);
  }

  function stopPtt() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  }

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      generationRef.current++;
      if (vadRef.current) {
        try { vadRef.current.pause(); } catch {}
        try { vadRef.current.destroy(); } catch {}
        vadRef.current = null;
      }
      if (recordStreamRef.current) {
        recordStreamRef.current.getTracks().forEach((t) => t.stop());
        recordStreamRef.current = null;
      }
      if (audioElRef.current && !audioElRef.current.paused) {
        try { audioElRef.current.pause(); } catch {}
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  // Reset / stop when agent changes.
  useEffect(() => {
    return () => {
      // When agentId changes, cleanup effect runs before the new mount effect.
      if (liveOnRef.current) {
        void stopLive();
      }
      stopPtt();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const stateDot: Record<VoiceState, string> = {
    idle: 'bg-slate-600',
    listening: 'bg-emerald-500',
    recording: 'bg-amber-500 animate-pulse',
    transcribing: 'bg-amber-400',
    thinking: 'bg-indigo-500',
    speaking: 'bg-teal-400 animate-pulse',
  };

  const pttDisabled =
    streaming ||
    voiceState === 'transcribing' ||
    voiceState === 'thinking' ||
    (voiceState === 'recording' && !pttActive);

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
      <button
        type="button"
        onMouseDown={startPtt}
        onMouseUp={stopPtt}
        onMouseLeave={stopPtt}
        onTouchStart={(e) => { e.preventDefault(); void startPtt(); }}
        onTouchEnd={stopPtt}
        onTouchCancel={stopPtt}
        disabled={pttDisabled}
        title="Hold to talk"
        className={`px-2 py-1 rounded border text-xs font-medium select-none ${
          pttActive
            ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        🎤 Hold
      </button>

      <button
        type="button"
        onClick={toggleLive}
        title={liveOn ? 'Stop always-on listening' : 'Start always-on listening'}
        className={`px-2 py-1 rounded border text-xs font-medium ${
          liveOn
            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-100'
            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
        }`}
      >
        {liveOn ? '🔴 Live' : '🎙 Live'}
      </button>

      <div className="flex items-center gap-1.5">
        <span className={`inline-block w-2 h-2 rounded-full ${stateDot[voiceState]}`} />
        <span className="text-slate-400">{voiceState}</span>
      </div>

      {liveOn && (
        <div className="h-1 w-16 bg-slate-800 rounded overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500"
            style={{ width: `${meter}%`, transition: 'width 80ms linear' }}
          />
        </div>
      )}

      {speakers.length > 0 && (
        <label className="flex items-center gap-1">
          <span className="text-slate-500">voice</span>
          <select
            value={speakerId}
            onChange={(e) => setSpeakerId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-xs text-slate-200"
          >
            <option value="">(default)</option>
            {speakers.map((s) => {
              const id = s.voiceId;
              const label = s.name || s.displayName || s.voice_name || id;
              const accent = s.labels?.accent ? ` · ${s.labels.accent}` : '';
              return (
                <option key={id} value={id}>
                  {label}{accent}
                </option>
              );
            })}
          </select>
        </label>
      )}

      <label className="flex items-center gap-1 select-none cursor-pointer">
        <input
          type="checkbox"
          checked={speakReplies}
          onChange={(e) => setSpeakReplies(e.target.checked)}
          className="accent-indigo-500"
        />
        speak replies
      </label>

      {error && <span className="text-rose-400 text-[11px]">{error}</span>}
    </div>
  );
}
