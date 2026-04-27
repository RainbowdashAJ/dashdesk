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
const PLAYER_VOLUME = 0.6
const musicModules = import.meta.glob('../../../music/*', {
  eager: true,
  as: 'url'
})

const route = useRoute()
const logoSvgUrl = `${import.meta.env.BASE_URL}12.svg`
const theme = ref('light')
const audioRef = ref(null)
const currentTrackIndex = ref(0)
const hasUnlockedAudio = ref(false)
const isPlaying = ref(false)
const interactionEvents = ['pointerdown', 'keydown', 'touchstart']

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

const applyAudioDefaults = () => {
  if (audioRef.value) {
    audioRef.value.volume = PLAYER_VOLUME
  }
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

const playAudio = async () => {
  if (!audioRef.value || !currentTrack.value) return

  applyAudioDefaults()

  try {
    await audioRef.value.play()
    isPlaying.value = true
  } catch (error) {
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
  removeInteractionUnlock()
  await playAudio()
}

const setTrack = async (nextIndex, { shouldPlay = true } = {}) => {
  if (!hasPlaylist.value) return

  currentTrackIndex.value = nextIndex

  await nextTick()

  if (!audioRef.value) return

  audioRef.value.load()
  applyAudioDefaults()

  if (shouldPlay) {
    await playAudio()
  }
}

const playRandomTrack = async ({ includeCurrent = false } = {}) => {
  const excludeIndex = includeCurrent ? null : currentTrackIndex.value
  const nextIndex = getRandomTrackIndex(excludeIndex)

  await setTrack(nextIndex)
}

const playNextTrack = async () => {
  await playRandomTrack()
}

onMounted(async () => {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (savedTheme === 'light' || savedTheme === 'dark') {
    theme.value = savedTheme
  }

  applyAudioDefaults()

  if (hasPlaylist.value) {
    currentTrackIndex.value = getRandomTrackIndex()
    await setTrack(currentTrackIndex.value, {
      shouldPlay: false
    })
    armInteractionUnlock()
  }
})

onBeforeUnmount(() => {
  removeInteractionUnlock()
})

watch(theme, (value) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, value)
  }
})
</script>

<template>
  <div :class="['common-layout', themeClass]">
    <el-container>
      <el-header class="header">
        <span class="logo">
          <iframe
            class="logo-media"
            :src="logoSvgUrl"
            title="DashDesk Center logo"
          ></iframe>
        </span>
        <span class="title">DashDesk Center</span>
      </el-header>

      <el-container class="layout-shell">
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

              <h2 class="player-title">{{ currentTrack?.title }}</h2>

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
            </section>
          </div>
        </el-aside>

        <el-main class="main-panel">
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
  display: flex;
  align-items: center;
  gap: 18px;
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
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  width: 138px;
  height: 80px;
  overflow: visible;
}

.logo-media {
  display: block;
  width: 92px;
  height: 92px;
  border: none;
  background: transparent;
  transform: translate(-12px, -12px) scale(1.78);
  transform-origin: left center;
}

.title {
  display: block;
  color: white;
  font-size: 40px;
  font-family: "Segoe UI", sans-serif;
  line-height: 1;
  font-weight: bolder;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layout-shell {
  min-height: calc(100vh - 80px);
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
  text-align: center;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.03)),
    var(--player-bg);
  box-shadow: 0 18px 36px var(--player-button-shadow);
  backdrop-filter: blur(14px);
}

.player-title {
  margin: 0;
  color: var(--page-heading-color);
  font-size: 18px;
  line-height: 1.35;
  word-break: break-word;
}

.player-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  margin-top: 14px;
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

.main-panel {
  min-width: 0;
  min-height: calc(100vh - 80px);
  padding: 0;
  background: transparent;
  color: inherit;
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
    gap: 10px;
    padding: 10px 14px;
  }

  .logo {
    width: 96px;
    height: 80px;
  }

  .logo-media {
    width: 76px;
    height: 76px;
    transform: translate(-10px, -10px) scale(1.54);
  }

  .title {
    font-size: 24px;
  }

  .layout-shell {
    flex-direction: column;
    min-height: auto;
  }

  .aside {
    width: 100% !important;
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }

  .aside-shell {
    min-height: auto;
    padding-bottom: 18px;
  }

  .menu {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    padding: 14px 14px 0;
  }

  .menu :deep(.el-menu-item) {
    justify-content: center;
    min-width: 0;
    min-height: 58px;
    margin: 0;
    padding: 12px 10px;
    border: 1px solid var(--border-color);
    border-radius: 18px;
    line-height: 1.35;
    white-space: normal;
    text-align: center;
  }

  .player-card {
    margin: 18px 14px 0;
  }

  .main-panel {
    min-height: auto;
  }

  .theme-toggle {
    right: 16px;
    left: auto;
    bottom: 16px;
    padding: 12px;
    border-radius: 20px;
  }

  .theme-toggle span {
    display: none;
  }

  .footer {
    padding: 18px 16px 84px;
    font-size: 13px;
  }
}

</style>
