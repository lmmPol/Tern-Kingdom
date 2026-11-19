/* ==========================================================================
   ПРОЦЕДУРНЫЙ АТМОСФЕРНЫЙ ЗВУК КОСТРА (WEB AUDIO API)
   ========================================================================== */
let audioCtx = null;
let ambientGain = null;
let audioEnabled = false;

export function toggleCampfireAudio(toggleAudioBtn) {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    const bufferSize = audioCtx.sampleRate * 3;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let lastOut = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.03 * white) / 1.03;
      const crackle = Math.random() < 0.0012 ? (Math.random() * 0.8 - 0.4) : 0;
      data[i] = lastOut * 2.4 + crackle;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;

    ambientGain = audioCtx.createGain();
    ambientGain.gain.value = 0.001;

    noiseSource.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(audioCtx.destination);
    noiseSource.start();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  audioEnabled = !audioEnabled;
  const now = audioCtx.currentTime;
  ambientGain.gain.cancelScheduledValues(now);
  ambientGain.gain.setTargetAtTime(audioEnabled ? 0.18 : 0.0001, now, 0.25);

  if (toggleAudioBtn) {
    toggleAudioBtn.textContent = audioEnabled ? '🔥 Костёр: вкл' : '🔥 Костёр: выкл';
    toggleAudioBtn.classList.toggle('active', audioEnabled);
  }
  return audioEnabled;
}
