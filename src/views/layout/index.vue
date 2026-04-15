<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  CollectionTag,
  Download,
  MoonNight,
  Promotion,
  Sunny,
  UserFilled,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'

const THEME_STORAGE_KEY = 'dashdesk-theme'
const musicModules = import.meta.glob('../../../music/*', {
  eager: true,
  as: 'url'
})

const route = useRoute()
const theme = ref('light')
const audioRef = ref(null)
const currentTrackIndex = ref(0)
const trackHistory = ref([])
const historyPointer = ref(-1)
const hasUnlockedAudio = ref(false)
const isPlaying = ref(false)
const autoplayBlocked = ref(false)
const volume = ref(0.6)
const tiltPosition = ref(0.6)
const tiltVelocity = ref(0)
const tiltDirection = ref(0)
const tiltSlope = ref(0)
const interactionEvents = ['pointerdown', 'keydown', 'touchstart']
let tiltAnimationFrame = null
let lastTiltFrameTime = 0
const chaosBroadcasts = [
  'Tilt mixer engaged. Gravity is now your sound engineer.',
  'Press left or right and let the orb do the dangerous part.',
  'The bar gains confidence the longer you keep it tilted.',
  'This volume control strongly believes in sideways chaos.',
  'One of these days, the orb will unionize.'
]
const chaosMessage = ref('Hold Left or Right to tilt the bar. The orb will roll faster and drag the volume with it.')

const formatTrackTitle = (fileName) => {
  let readableName = fileName

  try {
    readableName = decodeURIComponent(fileName)
  } catch (error) {
    readableName = fileName
  }

  return readableName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const playlist = Object.entries(musicModules)
  .filter(([path]) => /\.(mp3|wav|ogg|m4a)$/i.test(path))
  .map(([path, src]) => {
    const fileName = path.split('/').pop() ?? ''

    return {
      title: formatTrackTitle(fileName),
      src
    }
  })
  .sort((firstTrack, secondTrack) => firstTrack.title.localeCompare(secondTrack.title))

const isDarkMode = computed(() => theme.value === 'dark')
const themeClass = computed(() => (isDarkMode.value ? 'theme-dark' : 'theme-light'))
const hasPlaylist = computed(() => playlist.length > 0)
const currentTrack = computed(() => playlist[currentTrackIndex.value] ?? null)
const displayedVolume = computed(() => Math.round(volume.value * 100))
const aimedVolume = computed(() => Math.round(tiltPosition.value * 100))
const tiltTrackStyle = computed(() => ({
  transform: `rotate(${tiltSlope.value * 12}deg)`
}))
const tiltOrbStyle = computed(() => ({
  left: `calc(${aimedVolume.value}% - 12px)`
}))
const tiltSpeedWidth = computed(() => `${Math.min(100, Math.round(Math.abs(tiltVelocity.value) * 3600))}%`)
const tiltStatus = computed(() => {
  if (tiltDirection.value > 0) return 'Right pressed | speed climbing'
  if (tiltDirection.value < 0) return 'Left pressed | speed climbing'
  if (Math.abs(tiltVelocity.value) > 0.015) return 'Released | still rolling'
  if (Math.abs(tiltVelocity.value) > 0.004) return 'Released | slowing down'
  return 'Resting | waiting for trouble'
})
const tiltHint = computed(() => {
  if (Math.abs(tiltVelocity.value) > 0.02) return 'very fast'
  if (Math.abs(tiltVelocity.value) > 0.01) return 'getting silly'
  if (Math.abs(tiltVelocity.value) > 0.003) return 'warming up'
  return 'steady'
})
const volumeFillWidth = computed(() => `${displayedVolume.value}%`)

const clampVolume = (value) => Math.min(1, Math.max(0, value))

const setChaosCommentary = (message = null) => {
  if (message) {
    chaosMessage.value = message
    return
  }

  chaosMessage.value = chaosBroadcasts[Math.floor(Math.random() * chaosBroadcasts.length)]
}

const commitChaosVolume = (nextVolume, message = null) => {
  volume.value = clampVolume(nextVolume)
  setChaosCommentary(message)
}

const toggleTheme = () => {
  theme.value = isDarkMode.value ? 'light' : 'dark'
}

const removeInteractionUnlock = () => {
  if (typeof window === 'undefined') return

  interactionEvents.forEach((eventName) => {
    window.removeEventListener(eventName, handleInteractionUnlock)
  })
}

async function handleInteractionUnlock() {
  if (!audioRef.value || hasUnlockedAudio.value) return

  removeInteractionUnlock()
  hasUnlockedAudio.value = true
  autoplayBlocked.value = false
  audioRef.value.muted = false

  if (audioRef.value.paused) {
    await playAudio()
  }
}

const armInteractionUnlock = () => {
  if (typeof window === 'undefined') return

  removeInteractionUnlock()

  interactionEvents.forEach((eventName) => {
    window.addEventListener(eventName, handleInteractionUnlock, {
      once: true,
      passive: true
    })
  })
}

const getRandomTrackIndex = (excludeIndex = null) => {
  if (!playlist.length) return 0
  if (playlist.length === 1) return 0

  let nextIndex = Math.floor(Math.random() * playlist.length)

  while (nextIndex === excludeIndex) {
    nextIndex = Math.floor(Math.random() * playlist.length)
  }

  return nextIndex
}

const syncVolume = () => {
  if (audioRef.value) {
    audioRef.value.volume = volume.value
  }
}

const removeTiltReleaseListeners = () => {
  if (typeof window === 'undefined') return

  window.removeEventListener('pointerup', stopTiltControl)
  window.removeEventListener('pointercancel', stopTiltControl)
}

const stopTiltAnimation = () => {
  if (tiltAnimationFrame !== null) {
    cancelAnimationFrame(tiltAnimationFrame)
    tiltAnimationFrame = null
  }

  lastTiltFrameTime = 0
}

const stepTiltAnimation = (now) => {
  if (!lastTiltFrameTime) {
    lastTiltFrameTime = now
  }

  const frameFactor = Math.min(2.2, (now - lastTiltFrameTime) / 16.7 || 1)
  lastTiltFrameTime = now
  const targetSlope = tiltDirection.value

  tiltSlope.value += (targetSlope - tiltSlope.value) * 0.18 * frameFactor
  tiltVelocity.value += tiltSlope.value * 0.00125 * frameFactor
  tiltVelocity.value = Math.max(-0.035, Math.min(0.035, tiltVelocity.value))

  const drag = targetSlope === 0 ? Math.pow(0.9, frameFactor) : Math.pow(0.988, frameFactor)
  tiltVelocity.value *= drag

  let nextPosition = tiltPosition.value + tiltVelocity.value * frameFactor

  if (nextPosition <= 0) {
    nextPosition = 0
    tiltVelocity.value = Math.abs(tiltVelocity.value) * 0.42
  } else if (nextPosition >= 1) {
    nextPosition = 1
    tiltVelocity.value = -Math.abs(tiltVelocity.value) * 0.42
  }

  tiltPosition.value = nextPosition
  volume.value = tiltPosition.value

  if (targetSlope === 0 && Math.abs(tiltSlope.value) < 0.002 && Math.abs(tiltVelocity.value) < 0.0005) {
    tiltSlope.value = 0
    tiltVelocity.value = 0
    stopTiltAnimation()
    return
  }

  tiltAnimationFrame = requestAnimationFrame(stepTiltAnimation)
}

const ensureTiltAnimation = () => {
  if (tiltAnimationFrame === null) {
    tiltAnimationFrame = requestAnimationFrame(stepTiltAnimation)
  }
}

const beginTiltControl = (direction, event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return

  tiltDirection.value = direction
  setChaosCommentary(
    direction > 0
      ? 'Right side pressed. The bar tips down and the orb keeps accelerating.'
      : 'Left side pressed. The bar tips down and the orb starts rushing the other way.'
  )

  ensureTiltAnimation()

  if (typeof window !== 'undefined') {
    removeTiltReleaseListeners()
    window.addEventListener('pointerup', stopTiltControl)
    window.addEventListener('pointercancel', stopTiltControl)
  }
}

function stopTiltControl() {
  if (tiltDirection.value !== 0) {
    tiltDirection.value = 0
    setChaosCommentary('Released. The bar is leveling out, but the orb is still rolling.')
  }

  removeTiltReleaseListeners()
  ensureTiltAnimation()
}

const playAudio = async () => {
  if (!audioRef.value || !currentTrack.value) return

  try {
    await audioRef.value.play()
    autoplayBlocked.value = false
    isPlaying.value = true
  } catch (error) {
    autoplayBlocked.value = true
    isPlaying.value = false
  }
}

const pauseAudio = () => {
  if (!audioRef.value) return

  audioRef.value.pause()
  isPlaying.value = false
}

const togglePlayback = async () => {
  if (isPlaying.value) {
    pauseAudio()
    return
  }

  if (audioRef.value) {
    audioRef.value.muted = false
  }

  hasUnlockedAudio.value = true
  autoplayBlocked.value = false
  removeInteractionUnlock()
  await playAudio()
}

const setTrack = async (nextIndex, { shouldPlay = true, addToHistory = true } = {}) => {
  if (!hasPlaylist.value) return

  currentTrackIndex.value = nextIndex

  if (addToHistory) {
    trackHistory.value = trackHistory.value.slice(0, historyPointer.value + 1)
    trackHistory.value.push(nextIndex)
    historyPointer.value = trackHistory.value.length - 1
  }

  await nextTick()

  if (!audioRef.value) return

  audioRef.value.load()
  syncVolume()

  if (shouldPlay) {
    await playAudio()
  }
}

const playRandomTrack = async ({ includeCurrent = false, addToHistory = true } = {}) => {
  const excludeIndex = includeCurrent ? null : currentTrackIndex.value
  const nextIndex = getRandomTrackIndex(excludeIndex)

  await setTrack(nextIndex, { shouldPlay: true, addToHistory })
}

const playPreviousTrack = async () => {
  if (!trackHistory.value.length) {
    await playRandomTrack({ includeCurrent: true })
    return
  }

  if (historyPointer.value > 0) {
    historyPointer.value -= 1
    await setTrack(trackHistory.value[historyPointer.value], {
      shouldPlay: true,
      addToHistory: false
    })
    return
  }

  await setTrack(trackHistory.value[0], {
    shouldPlay: true,
    addToHistory: false
  })
}

const playNextTrack = async () => {
  if (historyPointer.value < trackHistory.value.length - 1) {
    historyPointer.value += 1
    await setTrack(trackHistory.value[historyPointer.value], {
      shouldPlay: true,
      addToHistory: false
    })
    return
  }

  await playRandomTrack()
}

onMounted(async () => {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (savedTheme === 'light' || savedTheme === 'dark') {
    theme.value = savedTheme
  }

  syncVolume()
  tiltPosition.value = volume.value

  if (hasPlaylist.value) {
    currentTrackIndex.value = getRandomTrackIndex()
    await setTrack(currentTrackIndex.value, {
      shouldPlay: false,
      addToHistory: true
    })
    autoplayBlocked.value = true
    armInteractionUnlock()
  }
})

onBeforeUnmount(() => {
  removeInteractionUnlock()
  removeTiltReleaseListeners()
  stopTiltAnimation()
})

watch(theme, (value) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, value)
  }
})

watch(volume, () => {
  syncVolume()
})

watch(currentTrack, (track) => {
  if (track) {
    setChaosCommentary(`Now sabotaging the mix with "${track.title}".`)
  }
})
</script>

<template>
  <div :class="['common-layout', themeClass]">
    <el-container>
      <el-header class="header">
        <span class="logo">
          <object
            class="logo-media"
            data="/12.svg"
            type="image/svg+xml"
            aria-label="DashDesk Center logo"
          >
            DashDesk Center logo
          </object>
        </span>
        <span class="title">DashDesk Center</span>
      </el-header>

      <el-container>
        <el-aside width="200px" class="aside">
          <div class="aside-shell">
            <el-menu :default-active="route.path" router class="menu">
              <el-menu-item index="/">
                <el-icon><Promotion /></el-icon>
                Home
              </el-menu-item>
              <el-menu-item index="/download">
                <el-icon><Download /></el-icon>
                Downloads
              </el-menu-item>
              <el-menu-item index="/articles">
                <el-icon><CollectionTag /></el-icon>
                Quotes & Articles
              </el-menu-item>
              <el-menu-item index="/join">
                <el-icon><UserFilled /></el-icon>
                Join Us
              </el-menu-item>
            </el-menu>

            <section v-if="hasPlaylist" class="player-card">
              <audio
                ref="audioRef"
                :src="currentTrack?.src"
                preload="auto"
                @ended="playNextTrack"
                @error="playNextTrack"
                @play="isPlaying = true"
                @pause="isPlaying = false"
              />

              <span class="player-eyebrow">Now Playing</span>
              <h2 class="player-title">{{ currentTrack?.title }}</h2>
              <p class="player-meta">Shuffle mode active | {{ playlist.length }} tracks</p>

              <div class="player-controls player-controls--solo">
                <button
                  class="player-button player-button--primary"
                  type="button"
                  :aria-label="isPlaying ? 'Pause playback' : 'Play music'"
                  @click="togglePlayback"
                >
                  <el-icon>
                    <VideoPause v-if="isPlaying" />
                    <VideoPlay v-else />
                  </el-icon>
                </button>
              </div>

              <div class="player-volume">
                <div class="player-chaos-board">
                  <div class="player-chaos-board__row">
                    <span>Current volume</span>
                    <span>{{ displayedVolume }}%</span>
                  </div>
                  <div class="player-chaos-board__row player-chaos-board__row--muted">
                    <span>Orb position</span>
                    <span>{{ aimedVolume }}% | {{ tiltStatus }}</span>
                  </div>

                  <div class="tilt-mixer">
                    <button
                      class="tilt-mixer__button"
                      type="button"
                      aria-label="Hold to tilt left"
                      @pointerdown.prevent="beginTiltControl(-1, $event)"
                      @pointerup="stopTiltControl"
                      @pointerleave="stopTiltControl"
                      @pointercancel="stopTiltControl"
                      @contextmenu.prevent
                    >
                      Lean Left
                    </button>

                    <div class="tilt-mixer__board">
                      <div class="tilt-mixer__track" :style="tiltTrackStyle">
                        <span class="tilt-mixer__fill" :style="{ width: volumeFillWidth }"></span>
                        <span class="tilt-mixer__orb" :style="tiltOrbStyle"></span>
                      </div>
                    </div>

                    <button
                      class="tilt-mixer__button tilt-mixer__button--right"
                      type="button"
                      aria-label="Hold to tilt right"
                      @pointerdown.prevent="beginTiltControl(1, $event)"
                      @pointerup="stopTiltControl"
                      @pointerleave="stopTiltControl"
                      @pointercancel="stopTiltControl"
                      @contextmenu.prevent
                    >
                      Lean Right
                    </button>
                  </div>

                  <div class="player-chaos-board__power">
                    <span class="player-chaos-board__power-fill" :style="{ width: tiltSpeedWidth }"></span>
                  </div>
                  <p class="player-chaos-board__message">{{ chaosMessage }}</p>
                  <p class="player-chaos-board__message player-chaos-board__message--soft">
                    Speed state: {{ tiltHint }}
                  </p>
                </div>
              </div>

              <p v-if="autoplayBlocked" class="player-note">
                Click anywhere on the page or press Play to start the music.
              </p>
            </section>
          </div>
        </el-aside>

        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <button
      class="theme-toggle"
      type="button"
      :aria-label="isDarkMode ? 'Switch to day mode' : 'Switch to night mode'"
      @click="toggleTheme"
    >
      <el-icon class="theme-toggle__icon">
        <Sunny v-if="isDarkMode" />
        <MoonNight v-else />
      </el-icon>
      <span>{{ isDarkMode ? 'Day Mode' : 'Night Mode' }}</span>
    </button>

    <footer>
      <div class="footer">
        <p>DashDesk is an independent, non-commercial fan project.</p>
        <p>My Little Pony: Friendship Is Magic © Hasbro, Inc.</p>
        <p>Not affiliated with, endorsed by, or sponsored by Hasbro or DHX Media.</p>
        <p>The software and website are fully open-source on GitHub.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.common-layout {
  --page-bg: linear-gradient(180deg, #fff7ff 0%, #f7f7ff 45%, #f2f6ff 100%);
  --surface-bg: rgba(255, 255, 255, 0.78);
  --page-text-color: #2c1d43;
  --page-heading-color: #7a2ea8;
  --border-color: rgba(155, 93, 229, 0.18);
  --menu-hover-bg: rgba(155, 93, 229, 0.1);
  --menu-active-bg: rgba(155, 93, 229, 0.16);
  --menu-active-text: #7a2ea8;
  --toggle-bg: rgba(255, 255, 255, 0.88);
  --toggle-text: #312047;
  --toggle-border: rgba(155, 93, 229, 0.18);
  --toggle-shadow: rgba(84, 43, 124, 0.18);
  --player-bg: rgba(255, 255, 255, 0.75);
  --player-subtext: rgba(44, 29, 67, 0.72);
  --player-button-bg: rgba(255, 255, 255, 0.56);
  --player-button-text: #3a2558;
  --player-button-shadow: rgba(84, 43, 124, 0.12);
  --slider-track: rgba(155, 93, 229, 0.18);
  --slider-fill: #9b5de5;
  --footer-bg: linear-gradient(to right, #b119c5, #e019a8, #e449cfc9);
  --footer-text: whitesmoke;
  min-height: 100vh;
  background: var(--page-bg);
  color: var(--page-text-color);
  transition: background 0.35s ease, color 0.35s ease;
}

.theme-dark {
  --page-bg: linear-gradient(180deg, #0f1020 0%, #18122b 48%, #110d1d 100%);
  --surface-bg: rgba(26, 20, 44, 0.86);
  --page-text-color: #f3ecff;
  --page-heading-color: #ffd166;
  --border-color: rgba(136, 112, 212, 0.22);
  --menu-hover-bg: rgba(122, 91, 206, 0.28);
  --menu-active-bg: rgba(104, 77, 196, 0.44);
  --menu-active-text: #ffffff;
  --toggle-bg: rgba(18, 15, 31, 0.92);
  --toggle-text: #fff8ff;
  --toggle-border: rgba(255, 255, 255, 0.12);
  --toggle-shadow: rgba(0, 0, 0, 0.35);
  --player-bg: rgba(30, 22, 49, 0.88);
  --player-subtext: rgba(243, 236, 255, 0.72);
  --player-button-bg: rgba(255, 255, 255, 0.08);
  --player-button-text: #fff8ff;
  --player-button-shadow: rgba(0, 0, 0, 0.28);
  --slider-track: rgba(255, 255, 255, 0.16);
  --slider-fill: #ffd166;
  --footer-bg: linear-gradient(to right, #2b153f, #3f1970, #1c2f75);
  --footer-text: #f7f2ff;
}

.footer {
  text-align: center;
  padding: 18px 20px;
  background: var(--footer-bg);
  color: var(--footer-text);
  font-size: 14px;
  line-height: 1.7;
  transition: background 0.35s ease, color 0.35s ease;
}

.footer p {
  margin: 0;
}

.header {
  height: 80px;
  padding: 10px 18px;
  background-image: linear-gradient(
    90deg,
    #ff4d6d 0%,
    #ff8a00 16%,
    #ffd60a 32%,
    #56cfe1 48%,
    #4cc9f0 64%,
    #4361ee 80%,
    #9b5de5 100%
  );
  background-size: 250% 250%;
  animation: rainbowFlow 8s linear infinite;
}

@keyframes rainbowFlow {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.logo {
  float: left;
  display: flex;
  align-items: center;
  width: 138px;
  height: 80px;
  overflow: visible;
}

.logo-media {
  display: block;
  width: 92px;
  height: 92px;
  transform: translate(-12px, -12px) scale(1.78);
  transform-origin: left center;
}

.title {
  color: white;
  font-size: 40px;
  font-family: "Segoe UI", sans-serif;
  line-height: 60px;
  font-weight: bolder;
}

.aside {
  width: 200px;
  border-right: 1px solid var(--border-color);
  min-height: calc(100vh - 80px);
  background: var(--surface-bg);
  backdrop-filter: blur(14px);
  transition: background 0.35s ease, border-color 0.35s ease;
}

.aside-shell {
  display: flex;
  min-height: calc(100vh - 80px);
  flex-direction: column;
}

.menu {
  border-right: none;
  background: transparent;
}

.menu :deep(.el-menu-item) {
  color: var(--page-text-color);
  transition: background-color 0.25s ease, color 0.25s ease;
}

.menu :deep(.el-menu-item:hover) {
  background: var(--menu-hover-bg);
  color: var(--menu-active-text);
}

.menu :deep(.el-menu-item.is-active) {
  background: var(--menu-active-bg);
  color: var(--menu-active-text);
}

.menu :deep(.el-menu-item .el-icon) {
  color: currentColor;
}

.player-card {
  margin: auto 12px 96px;
  padding: 18px 16px;
  border: 1px solid var(--border-color);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.03)),
    var(--player-bg);
  box-shadow: 0 18px 36px var(--player-button-shadow);
  backdrop-filter: blur(14px);
}

.player-eyebrow {
  display: inline-block;
  margin-bottom: 10px;
  color: var(--player-subtext);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.player-title {
  margin: 0;
  color: var(--page-heading-color);
  font-size: 18px;
  line-height: 1.35;
  word-break: break-word;
}

.player-meta,
.player-note {
  margin: 10px 0 0;
  color: var(--player-subtext);
  font-size: 12px;
  line-height: 1.6;
}

.player-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  margin-top: 16px;
}

.player-controls--solo {
  justify-items: center;
}

.player-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 8px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--player-button-bg);
  color: var(--player-button-text);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    background 0.25s ease,
    color 0.25s ease;
}

.player-button :deep(.el-icon) {
  font-size: 16px;
}

.player-button:hover {
  transform: translateY(-1px);
}

.player-button--primary {
  background: linear-gradient(135deg, #9b5de5, #f15bb5);
  border-color: transparent;
  color: #fff;
  min-width: 72px;
}

.player-volume {
  margin-top: 16px;
}

.player-chaos-board {
  padding: 12px;
  border: 1px dashed var(--border-color);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.05));
}

.player-chaos-board__row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--player-subtext);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.player-chaos-board__row + .player-chaos-board__row {
  margin-top: 8px;
}

.player-chaos-board__row--muted {
  font-size: 11px;
  letter-spacing: 0.02em;
  text-transform: none;
}

.player-chaos-board__message {
  margin: 10px 0 0;
  color: var(--page-text-color);
  font-size: 12px;
  line-height: 1.6;
}

.player-chaos-board__message--soft {
  margin-top: 6px;
  color: var(--player-subtext);
}

.tilt-mixer {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
}

.tilt-mixer__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 62px;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(241, 91, 181, 0.14), rgba(0, 187, 249, 0.12));
  color: var(--player-button-text);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.07);
  cursor: grab;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.25s ease;
}

.tilt-mixer__button:hover {
  transform: translateY(-1px);
}

.tilt-mixer__button:active {
  cursor: grabbing;
}

.tilt-mixer__button--right {
  background: linear-gradient(135deg, rgba(0, 187, 249, 0.14), rgba(241, 91, 181, 0.12));
}

.tilt-mixer__board {
  padding: 10px 0;
}

.tilt-mixer__track {
  position: relative;
  height: 28px;
  border: 1px dashed var(--border-color);
  border-radius: 999px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.04)),
    var(--slider-track);
  overflow: hidden;
  transition: transform 0.12s ease-out;
  transform-origin: center center;
}

.tilt-mixer__fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #00bbf9, #fee440, #f15bb5);
  background-size: 200% 100%;
  animation: chaosGlow 1.8s linear infinite;
}

.tilt-mixer__orb {
  position: absolute;
  top: 50%;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ffffff, #f15bb5 45%, #9b5de5 100%);
  box-shadow: 0 0 0 4px rgba(241, 91, 181, 0.12), 0 0 24px rgba(155, 93, 229, 0.45);
  transform: translateY(-50%);
}

.player-chaos-board__power {
  margin-top: 12px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  overflow: hidden;
}

.player-chaos-board__power-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #f15bb5, #fee440);
  transition: width 0.08s linear;
}

:deep(.el-main) {
  min-height: calc(100vh - 80px);
  background: transparent;
  color: inherit;
}

@keyframes chaosGlow {
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 100% 50%;
  }
}

.theme-toggle {
  position: fixed;
  left: 20px;
  bottom: 24px;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid var(--toggle-border);
  border-radius: 999px;
  background: var(--toggle-bg);
  color: var(--toggle-text);
  box-shadow: 0 14px 30px var(--toggle-shadow);
  backdrop-filter: blur(14px);
  cursor: pointer;
  font: inherit;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.35s ease,
    color 0.35s ease,
    border-color 0.35s ease;
}

.theme-toggle:hover {
  transform: translateY(-2px);
}

.theme-toggle__icon {
  font-size: 18px;
}

@media (max-width: 768px) {
  .header {
    height: 80px;
    padding: 10px 14px;
  }

  .logo {
    width: 110px;
    height: 80px;
  }

  .logo-media {
    width: 78px;
    height: 78px;
    transform: translate(-8px, -8px) scale(1.5);
  }

  .title {
    font-size: 28px;
    line-height: 60px;
  }

  .player-card {
    margin: 20px 12px 92px;
  }

  .theme-toggle {
    left: 16px;
    bottom: 16px;
    padding: 10px 14px;
  }
}
</style>
