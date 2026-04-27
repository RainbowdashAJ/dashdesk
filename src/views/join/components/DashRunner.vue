<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const BEST_SCORE_KEY = 'dashdesk-runner-best-score'
const STAGE_WIDTH = 560
const STAGE_HEIGHT = 124
const GROUND_Y = 93
const JUMP_VELOCITY = -380
const GRAVITY = 1180
const BASE_SPEED = 185

const canvasRef = ref(null)
const gameState = ref('idle')
const score = ref(0)
const bestScore = ref(0)

const overlayTitle = computed(() => (
  gameState.value === 'gameover' ? 'Crash' : 'Dash Run'
))

const overlayText = computed(() => (
  gameState.value === 'gameover'
    ? 'Tap or press R to retry'
    : 'Tap or Space to start'
))

let context = null
let rafId = 0
let pixelRatio = 1
let lastFrameTime = 0
let speed = BASE_SPEED
let distance = 0
let spawnTimer = 0.88
let clouds = []
let obstacles = []
let runFrame = 0
let runFrameTimer = 0

const pony = {
  x: 62,
  y: GROUND_Y - 42,
  width: 56,
  height: 42,
  velocityY: 0
}

const loadBestScore = () => {
  if (typeof window === 'undefined') return 0

  const storedValue = Number(window.localStorage.getItem(BEST_SCORE_KEY) ?? 0)
  return Number.isFinite(storedValue) ? storedValue : 0
}

const saveBestScore = () => {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(BEST_SCORE_KEY, String(bestScore.value))
}

const drawSmoothStroke = (points, color, width) => {
  if (!context || points.length < 2) return

  context.strokeStyle = color
  context.lineWidth = width
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.beginPath()
  context.moveTo(points[0][0], points[0][1])

  for (let index = 1; index < points.length - 1; index += 1) {
    const nextX = (points[index][0] + points[index + 1][0]) / 2
    const nextY = (points[index][1] + points[index + 1][1]) / 2
    context.quadraticCurveTo(points[index][0], points[index][1], nextX, nextY)
  }

  const lastPoint = points[points.length - 1]
  const previousPoint = points[points.length - 2]
  context.quadraticCurveTo(previousPoint[0], previousPoint[1], lastPoint[0], lastPoint[1])
  context.stroke()
}

const fillShape = (fillStyle, buildPath, strokeStyle = null, lineWidth = 1.5) => {
  if (!context) return

  context.beginPath()
  buildPath(context)
  context.fillStyle = fillStyle
  context.fill()

  if (strokeStyle) {
    context.strokeStyle = strokeStyle
    context.lineWidth = lineWidth
    context.lineJoin = 'round'
    context.lineCap = 'round'
    context.stroke()
  }
}

const createClouds = () => ([
  { x: 120, y: 18, scale: 0.78, speed: 14 },
  { x: 282, y: 26, scale: 0.96, speed: 10 },
  { x: 444, y: 16, scale: 0.82, speed: 13 }
])

const resetScene = () => {
  pony.y = GROUND_Y - pony.height
  pony.velocityY = 0
  speed = BASE_SPEED
  distance = 0
  spawnTimer = 0.88
  score.value = 0
  clouds = createClouds()
  obstacles = []
  runFrame = 0
  runFrameTimer = 0
}

const setupCanvas = () => {
  const canvas = canvasRef.value

  if (!canvas) return

  context = canvas.getContext('2d')

  if (!context) return

  pixelRatio = Math.max(1, window.devicePixelRatio || 1)
  canvas.width = STAGE_WIDTH * pixelRatio
  canvas.height = STAGE_HEIGHT * pixelRatio
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  context.imageSmoothingEnabled = true
  drawScene()
}

const isGrounded = () => pony.y >= GROUND_Y - pony.height - 0.5

const jump = () => {
  if (!isGrounded()) return

  pony.velocityY = JUMP_VELOCITY
}

const handleAction = () => {
  if (gameState.value === 'running') {
    jump()
    return
  }

  startRun()
}

const spawnObstacle = () => {
  obstacles.push({
    x: STAGE_WIDTH + 22,
    y: GROUND_Y - 26,
    width: 28,
    height: 26
  })
}

const getPonyHitbox = () => ({
  x: pony.x + 17,
  y: pony.y + 10,
  width: pony.width - 24,
  height: pony.height - 14
})

const getObstacleHitbox = (obstacle) => ({
  x: obstacle.x + 2,
  y: obstacle.y + 2,
  width: obstacle.width - 4,
  height: obstacle.height - 3
})

const hasCollision = (first, second) => (
  first.x < second.x + second.width
  && first.x + first.width > second.x
  && first.y < second.y + second.height
  && first.y + first.height > second.y
)

const endRun = () => {
  gameState.value = 'gameover'

  if (score.value > bestScore.value) {
    bestScore.value = score.value
    saveBestScore()
  }
}

const updateGame = (deltaTime) => {
  clouds.forEach((cloud) => {
    cloud.x -= cloud.speed * deltaTime

    if (cloud.x < -80) {
      cloud.x = STAGE_WIDTH + 18 + Math.random() * 40
      cloud.y = 14 + Math.random() * 20
    }
  })

  pony.velocityY += GRAVITY * deltaTime
  pony.y += pony.velocityY * deltaTime

  if (pony.y >= GROUND_Y - pony.height) {
    pony.y = GROUND_Y - pony.height
    pony.velocityY = 0
  }

  runFrameTimer += deltaTime

  if (runFrameTimer >= 0.12) {
    runFrameTimer = 0
    runFrame = runFrame === 0 ? 1 : 0
  }

  speed += deltaTime * 5
  distance += speed * deltaTime * 0.24
  score.value = Math.floor(distance)
  spawnTimer -= deltaTime

  if (spawnTimer <= 0) {
    spawnObstacle()
    spawnTimer = Math.max(0.5, 0.96 - speed * 0.001) + Math.random() * 0.24
  }

  obstacles = obstacles
    .map((obstacle) => ({
      ...obstacle,
      x: obstacle.x - speed * deltaTime
    }))
    .filter((obstacle) => obstacle.x + obstacle.width > -32)

  const hitbox = getPonyHitbox()
  const crashed = obstacles.some((obstacle) => hasCollision(hitbox, getObstacleHitbox(obstacle)))

  if (crashed) {
    endRun()
  }
}

const drawCloud = (x, y, scale) => {
  fillShape('rgba(255,255,255,0.95)', (path) => {
    path.arc(x, y + 7 * scale, 7 * scale, Math.PI * 0.9, Math.PI * 1.95)
    path.arc(x + 10 * scale, y + 5 * scale, 9 * scale, Math.PI, Math.PI * 1.9)
    path.arc(x + 22 * scale, y + 8 * scale, 7 * scale, Math.PI * 1.05, Math.PI * 1.95)
    path.lineTo(x + 25 * scale, y + 13 * scale)
    path.lineTo(x - 4 * scale, y + 13 * scale)
    path.closePath()
  })
}

const drawTrack = () => {
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT)

  clouds.forEach((cloud) => {
    drawCloud(cloud.x, cloud.y, cloud.scale)
  })

  context.strokeStyle = '#9ca3af'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(0, GROUND_Y + 2)
  context.lineTo(STAGE_WIDTH, GROUND_Y + 2)
  context.stroke()

  const dashOffset = Math.floor(distance * 2.1) % 24
  context.fillStyle = '#cbd5e1'

  for (let x = -24; x < STAGE_WIDTH + 24; x += 24) {
    context.fillRect(x + dashOffset, GROUND_Y + 7, 10, 2)
  }
}

const drawObstacle = (obstacle) => {
  fillShape('#d4d4d8', (path) => {
    path.arc(obstacle.x + 8, obstacle.y + 12, 8, Math.PI * 0.9, Math.PI * 1.95)
    path.arc(obstacle.x + 16, obstacle.y + 8, 10, Math.PI, Math.PI * 1.9)
    path.arc(obstacle.x + 24, obstacle.y + 12, 8, Math.PI * 1.05, Math.PI * 1.95)
    path.lineTo(obstacle.x + 27, obstacle.y + 18)
    path.lineTo(obstacle.x + 2, obstacle.y + 18)
    path.closePath()
  }, '#94a3b8', 1.2)

  fillShape('#fde047', (path) => {
    path.moveTo(obstacle.x + 15, obstacle.y + 14)
    path.lineTo(obstacle.x + 11, obstacle.y + 24)
    path.lineTo(obstacle.x + 17, obstacle.y + 24)
    path.lineTo(obstacle.x + 13, obstacle.y + 34)
    path.lineTo(obstacle.x + 24, obstacle.y + 20)
    path.lineTo(obstacle.x + 18, obstacle.y + 20)
    path.closePath()
  }, '#f59e0b', 1.1)
}

const drawLeg = (x, y, isFront, airborne) => {
  const lift = airborne ? -6 : 0
  const stride = airborne ? 0 : (runFrame === (isFront ? 0 : 1) ? -3 : 3)

  drawSmoothStroke(
    [
      [x, y],
      [x + stride * 0.2, y + 8 + lift * 0.2],
      [x + stride, y + 18 + lift],
      [x + stride + 1, y + 30 + lift]
    ],
    '#69bfe9',
    5
  )
}

const drawPony = () => {
  const x = pony.x
  const y = pony.y
  const bodyColor = '#8fd8ff'
  const outline = '#5eb7e5'
  const airborne = !isGrounded()

  drawSmoothStroke(
    [[x + 4, y + 25], [x - 4, y + 28], [x - 9, y + 34], [x - 15, y + 42]],
    '#ff595e',
    4
  )
  drawSmoothStroke(
    [[x + 5, y + 27], [x - 2, y + 31], [x - 7, y + 38], [x - 12, y + 46]],
    '#ff924c',
    4
  )
  drawSmoothStroke(
    [[x + 6, y + 29], [x, y + 34], [x - 4, y + 40], [x - 9, y + 48]],
    '#ffca3a',
    4
  )
  drawSmoothStroke(
    [[x + 7, y + 31], [x + 1, y + 36], [x - 2, y + 42], [x - 7, y + 49]],
    '#8ac926',
    4
  )
  drawSmoothStroke(
    [[x + 9, y + 33], [x + 3, y + 38], [x + 1, y + 44], [x - 4, y + 51]],
    '#1982c4',
    4
  )
  drawSmoothStroke(
    [[x + 10, y + 35], [x + 5, y + 40], [x + 4, y + 46], [x, y + 52]],
    '#6a4c93',
    4
  )

  drawLeg(x + 25, y + 34, false, airborne)
  drawLeg(x + 36, y + 33, false, airborne)

  fillShape(bodyColor, (path) => {
    path.ellipse(x + 30, y + 25, 18, 12, -0.12, 0, Math.PI * 2)
  }, outline, 1.6)

  fillShape('#d4f1ff', (path) => {
    path.moveTo(x + 22, y + 17)
    path.quadraticCurveTo(x + 13, y + 23, x + 18, y + 31)
    path.quadraticCurveTo(x + 23, y + 28, x + 27, y + 19)
    path.closePath()
  }, '#abdff8', 1.1)

  fillShape(bodyColor, (path) => {
    path.moveTo(x + 33, y + 17)
    path.quadraticCurveTo(x + 37, y + 4, x + 45, y + 6)
    path.quadraticCurveTo(x + 49, y + 16, x + 42, y + 22)
    path.quadraticCurveTo(x + 35, y + 24, x + 33, y + 17)
    path.closePath()
  }, outline, 1.5)

  fillShape(bodyColor, (path) => {
    path.moveTo(x + 40, y + 8)
    path.lineTo(x + 43, y)
    path.lineTo(x + 47, y + 7)
    path.closePath()
  }, outline, 1.3)

  drawSmoothStroke(
    [[x + 39, y + 4], [x + 32, y + 7], [x + 26, y + 15], [x + 22, y + 25]],
    '#ff595e',
    4.5
  )
  drawSmoothStroke(
    [[x + 41, y + 5], [x + 35, y + 8], [x + 30, y + 16], [x + 26, y + 24]],
    '#ff924c',
    4.5
  )
  drawSmoothStroke(
    [[x + 43, y + 6], [x + 37, y + 10], [x + 33, y + 18], [x + 29, y + 24]],
    '#ffca3a',
    4.5
  )
  drawSmoothStroke(
    [[x + 45, y + 7], [x + 40, y + 12], [x + 36, y + 19], [x + 33, y + 24]],
    '#8ac926',
    4.5
  )
  drawSmoothStroke(
    [[x + 46, y + 9], [x + 42, y + 14], [x + 39, y + 21], [x + 37, y + 26]],
    '#1982c4',
    4.5
  )
  drawSmoothStroke(
    [[x + 47, y + 10], [x + 44, y + 16], [x + 42, y + 22], [x + 40, y + 27]],
    '#6a4c93',
    4.5
  )

  fillShape('#ffffff', (path) => {
    path.ellipse(x + 43, y + 13, 5.2, 6.8, 0.12, 0, Math.PI * 2)
  }, '#111827', 0.8)
  fillShape('#e879f9', (path) => {
    path.ellipse(x + 43.5, y + 14, 2.7, 4.2, 0.1, 0, Math.PI * 2)
  })
  fillShape('#111827', (path) => {
    path.arc(x + 44, y + 14.6, 1.3, 0, Math.PI * 2)
  })
  fillShape('#ffffff', (path) => {
    path.arc(x + 45.2, y + 12.5, 0.9, 0, Math.PI * 2)
  })

  drawSmoothStroke(
    [[x + 46, y + 18], [x + 48, y + 18.5], [x + 50, y + 18]],
    '#4b5563',
    1.4
  )

  fillShape('#ffffff', (path) => {
    path.arc(x + 28, y + 24, 2.4, 0, Math.PI * 2)
    path.arc(x + 31, y + 23.5, 3, 0, Math.PI * 2)
    path.arc(x + 34, y + 24.5, 2.2, 0, Math.PI * 2)
  })
  fillShape('#38bdf8', (path) => {
    path.moveTo(x + 29, y + 26)
    path.lineTo(x + 25, y + 32)
    path.lineTo(x + 29, y + 32)
    path.lineTo(x + 26, y + 38)
    path.lineTo(x + 36, y + 29)
    path.lineTo(x + 31, y + 29)
    path.closePath()
  })
  fillShape('#f59e0b', (path) => {
    path.moveTo(x + 31, y + 26)
    path.lineTo(x + 28, y + 30)
    path.lineTo(x + 31, y + 30)
    path.lineTo(x + 29, y + 34)
    path.lineTo(x + 36, y + 28)
    path.lineTo(x + 33, y + 28)
    path.closePath()
  })

  drawLeg(x + 31, y + 33, true, airborne)
  drawLeg(x + 44, y + 32, true, airborne)
}

const drawScore = () => {
  context.fillStyle = '#6b7280'
  context.font = '700 12px "Segoe UI", sans-serif'
  context.textAlign = 'right'
  context.fillText(`HI ${String(bestScore.value).padStart(5, '0')}`, STAGE_WIDTH - 14, 18)
  context.fillText(String(score.value).padStart(5, '0'), STAGE_WIDTH - 14, 34)
}

const drawScene = () => {
  if (!context) return

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  context.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT)

  drawTrack()
  obstacles.forEach(drawObstacle)
  drawPony()
  drawScore()
}

const gameLoop = (timestamp) => {
  if (!lastFrameTime) {
    lastFrameTime = timestamp
  }

  const deltaTime = Math.min(0.032, (timestamp - lastFrameTime) / 1000)
  lastFrameTime = timestamp

  if (gameState.value === 'running') {
    updateGame(deltaTime)
  }

  drawScene()

  if (gameState.value === 'running') {
    rafId = requestAnimationFrame(gameLoop)
    return
  }

  cancelAnimationFrame(rafId)
  rafId = 0
}

const startRun = () => {
  cancelAnimationFrame(rafId)
  resetScene()
  gameState.value = 'running'
  lastFrameTime = 0
  drawScene()
  rafId = requestAnimationFrame(gameLoop)
}

const handleKeydown = (event) => {
  if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
    event.preventDefault()
    handleAction()
    return
  }

  if (event.code === 'KeyR' && gameState.value === 'gameover') {
    event.preventDefault()
    startRun()
  }
}

onMounted(() => {
  bestScore.value = loadBestScore()
  resetScene()
  setupCanvas()
  window.addEventListener('resize', setupCanvas)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', setupCanvas)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <section class="runner-section">
    <div class="runner-stage" @pointerdown.prevent="handleAction">
      <canvas
        ref="canvasRef"
        class="runner-canvas"
        :width="STAGE_WIDTH"
        :height="STAGE_HEIGHT"
      />

      <div v-if="gameState !== 'running'" class="runner-overlay">
        <strong>{{ overlayTitle }}</strong>
        <p>{{ overlayText }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.runner-section {
  margin-top: 8px;
}

.runner-stage {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
}

.runner-canvas {
  display: block;
  width: 100%;
  height: auto;
}

.runner-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.45);
  text-align: center;
  pointer-events: none;
}

.runner-overlay strong {
  color: #374151;
  font-size: 16px;
  line-height: 1;
}

.runner-overlay p {
  margin: 0;
  color: #6b7280;
  font-size: 11px;
  line-height: 1.4;
}

:global(.theme-dark) .runner-stage {
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

:global(.theme-dark) .runner-overlay {
  background: rgba(15, 23, 42, 0.3);
}

:global(.theme-dark) .runner-overlay strong {
  color: #f8fafc;
}

:global(.theme-dark) .runner-overlay p {
  color: rgba(226, 232, 240, 0.9);
}
</style>
