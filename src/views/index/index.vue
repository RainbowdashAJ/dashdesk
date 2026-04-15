<template>
  <div class="page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">Official Website · In Development</div>
        <h1>Welcome to DashDesk Center</h1>
        <p class="hero-text">
          DashDesk is a pony desktop companion project for Windows, built to bring
          animated, expressive, and interactive characters onto your desktop.
          We want it to feel playful, polished, and full of personality.
        </p>

        <p class="hero-note">
          More previews, downloads, and updates will be added as development continues.
          Please use the navigation menu on the left to explore more pages.
        </p>
      </div>

      <div class="hero-visual">
        <div class="image-placeholder large">
          <span>Main Visual / Character Preview Image</span>
          <small>Place your DashDesk artwork, promo image, or Rainbow Dash preview here</small>
        </div>
      </div>
    </section>

    <!-- Intro cards -->
    <section class="intro-grid">
      <div class="info-card">
        <h2>About DashDesk</h2>
        <p>
          DashDesk is more than a simple desktop pet. It is designed as a character-based
          desktop companion system with animation, interaction, customization, and future expansion.
        </p>
      </div>

      <div class="info-card">
        <h2>Current Status</h2>
        <p>
          The project is currently under active development. Core systems such as animation,
          desktop movement, interaction logic, and customization menus are still being built and refined.
        </p>
      </div>

      <div class="info-card">
        <h2>First Character</h2>
        <p>
          The first main companion of DashDesk is <strong>Rainbow Dash</strong>.
          Future versions may support more characters, creator tools, and community-made content.
        </p>
      </div>
    </section>

    <!-- Features -->
    <section class="features-section">
      <div class="section-header">
        <p class="section-tag">Features</p>
        <h2>Planned Features</h2>
        <p>
          DashDesk is being designed as a lively desktop companion platform with room to grow.
        </p>
      </div>

      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">01</div>
          <h3>Animated Companion</h3>
          <p>Idle, blink, walk, action, and transition animations for a more alive desktop presence.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">02</div>
          <h3>Customization</h3>
          <p>Menus and settings to adjust behavior, appearance, and desktop interaction preferences.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">03</div>
          <h3>Mood System</h3>
          <p>Planned mood, hunger, affection, and activity systems to make the companion feel dynamic.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">04</div>
          <h3>Plugin Support</h3>
          <p>Future support for plugin-based interactions, extra gameplay ideas, and utility features.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">05</div>
          <h3>Custom Characters</h3>
          <p>Built with expansion in mind, so additional pony characters can be added later.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">06</div>
          <h3>Creator Friendly</h3>
          <p>A long-term goal is to make DashDesk easier for others to expand with their own content.</p>
        </div>
      </div>
    </section>

    <!-- Preview / screenshot area -->
    <section class="gallery-section">
      <div class="section-header">
        <p class="section-tag">Preview</p>
        <h2>Development Showcase</h2>
        <p>Use this area for screenshots, desktop previews, UI concepts, or animation previews.</p>
      </div>

      <div class="gallery-grid">
        <div class="image-placeholder">
          <span>Screenshot / Preview 01</span>
          <small>Desktop companion preview</small>
        </div>
        <div class="image-placeholder">
          <span>Screenshot / Preview 02</span>
          <small>Menu or settings UI</small>
        </div>
        <div class="image-placeholder">
          <span>Screenshot / Preview 03</span>
          <small>Animation or feature preview</small>
        </div>
      </div>
    </section>

    <!-- Join us -->
    <section class="join-section">
      <div class="join-content">
        <p class="section-tag">Join the Project</p>
        <h2>We Are Looking for Development Partners</h2>
        <p>
          DashDesk is still growing, and we are interested in connecting with people who want
          to help build something creative and fun. This can include developers, artists,
          animators, designers, and plugin creators.
        </p>
        <p>
          If you are interested in joining the project, please check the
          <strong>Join Us</strong> page from the navigation menu on the left.
          The contact email is listed there.
        </p>
      </div>

      <div class="join-side">
        <div class="recruit-card">
          <h3>Wanted</h3>
          <ul>
            <li>Python developers</li>
            <li>Frontend / UI contributors</li>
            <li>Artists and animators</li>
            <li>Plugin and tool creators</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32px 20px 72px;
  color: #1e293b;
  background:
    radial-gradient(circle at top left, rgba(147, 197, 253, 0.35), transparent 26%),
    radial-gradient(circle at top right, rgba(191, 219, 254, 0.45), transparent 22%),
    linear-gradient(180deg, #f8fbff 0%, #eef5ff 52%, #f9fcff 100%);
}

/* Hero */
.hero {
  max-width: 1200px;
  margin: 0 auto 28px;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 24px;
  align-items: stretch;
}

.hero-content,
.hero-visual {
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 18px 40px rgba(148, 163, 184, 0.14);
  backdrop-filter: blur(10px);
}

.hero-content {
  padding: 40px;
}

.hero-badge {
  display: inline-block;
  margin-bottom: 16px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: #1d4ed8;
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  border: 1px solid rgba(96, 165, 250, 0.25);
}

h1 {
  margin: 0 0 18px;
  font-size: clamp(34px, 5vw, 58px);
  line-height: 1.05;
  color: #0f172a;
}

.hero-text {
  max-width: 720px;
  margin: 0;
  font-size: 18px;
  line-height: 1.9;
  color: #334155;
}

.hero-note {
  margin-top: 24px;
  font-size: 14px;
  line-height: 1.8;
  color: #64748b;
}

.hero-visual {
  padding: 20px;
  display: flex;
}

.image-placeholder.large {
  min-height: 100%;
}

.image-placeholder {
  width: 100%;
  min-height: 220px;
  padding: 24px;
  border-radius: 22px;
  border: 1.5px dashed rgba(96, 165, 250, 0.4);
  background: linear-gradient(135deg, #f8fbff, #eaf3ff);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #1e3a8a;
  text-align: center;
}

.image-placeholder span {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1e40af;
}

.image-placeholder small {
  font-size: 14px;
  line-height: 1.7;
  color: #64748b;
  max-width: 320px;
}

/* Intro */
.intro-grid {
  max-width: 1200px;
  margin: 0 auto 28px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.info-card {
  padding: 26px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 12px 28px rgba(148, 163, 184, 0.12);
}

.info-card h2 {
  margin: 0 0 12px;
  font-size: 22px;
  color: #0f172a;
}

.info-card p {
  margin: 0;
  font-size: 15px;
  line-height: 1.85;
  color: #475569;
}

/* Shared section */
.features-section,
.gallery-section,
.join-section {
  max-width: 1200px;
  margin: 0 auto 28px;
  padding: 30px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 18px 42px rgba(148, 163, 184, 0.12);
}

.section-header {
  margin-bottom: 22px;
}

.section-tag {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #3b82f6;
}

.section-header h2,
.join-content h2 {
  margin: 0 0 12px;
  font-size: 34px;
  color: #0f172a;
}

.section-header p,
.join-content p {
  margin: 0;
  font-size: 16px;
  line-height: 1.9;
  color: #475569;
}

/* Features */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.feature-card {
  position: relative;
  padding: 24px;
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff, #f4f9ff);
  border: 1px solid rgba(96, 165, 250, 0.16);
  box-shadow: 0 10px 24px rgba(148, 163, 184, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(96, 165, 250, 0.28);
  box-shadow: 0 16px 30px rgba(96, 165, 250, 0.12);
}

.feature-icon {
  width: 42px;
  height: 42px;
  margin-bottom: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: #ffffff;
  background: linear-gradient(135deg, #60a5fa, #93c5fd);
}

.feature-card h3 {
  margin: 0 0 10px;
  font-size: 20px;
  color: #0f172a;
}

.feature-card p {
  margin: 0;
  font-size: 15px;
  line-height: 1.8;
  color: #475569;
}

/* Gallery */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

/* Join */
.join-section {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 22px;
  align-items: stretch;
}

.recruit-card {
  height: 100%;
  padding: 28px;
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff, #eef6ff);
  border: 1px solid rgba(96, 165, 250, 0.18);
  box-shadow: 0 12px 28px rgba(148, 163, 184, 0.1);
}

.recruit-card h3 {
  margin: 0 0 14px;
  font-size: 24px;
  color: #0f172a;
}

.recruit-card ul {
  margin: 0;
  padding-left: 20px;
  color: #475569;
}

.recruit-card li {
  margin-bottom: 12px;
  line-height: 1.7;
}

/* Responsive */
@media (max-width: 980px) {
  .hero,
  .join-section,
  .intro-grid,
  .feature-grid,
  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .hero-content {
    padding: 28px;
  }

  .features-section,
  .gallery-section,
  .join-section {
    padding: 22px;
  }
}

@media (max-width: 640px) {
  .page {
    padding: 18px 14px 48px;
  }

  h1 {
    font-size: 34px;
  }

  .section-header h2,
  .join-content h2 {
    font-size: 28px;
  }
}
</style>