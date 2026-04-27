<script setup>
import DashRunner from './components/DashRunner.vue'
</script>

<template>
  <div class="page">
    <div class="hero">
      <span class="eyebrow">JOIN US</span>
      <h1>Let's Build Something Bright Together</h1>
      <p>
        This page is ready for your contact details. You can replace each card with your
        email, social links, community invites, or collaboration channels.
      </p>
    </div>

    <div class="card-grid">
      <section class="contact-card accent-pink">
        <span class="card-tag">General Contact</span>
        <h2>Main Inbox</h2>
        <p>first contact method</p>
        <div class="contact-value">vnsctx666@gmail.com</div>
      </section>

      <a
        class="contact-card contact-card--link accent-blue"
        href="https://discord.gg/sC5Qk7qr"
        target="_blank"
        rel="noreferrer"
      >
        <span class="card-tag">Community</span>
        <h2>Chat Space</h2>
        <p>Discord</p>
        <div class="contact-value">https://discord.gg/sC5Qk7qr</div>
      </a>

      <a
        class="contact-card contact-card--link accent-gold"
        href="https://x.com/GhggVhh40894"
        target="_blank"
        rel="noreferrer"
      >
        <span class="card-tag">Partnerships</span>
        <h2>Collaboration Desk</h2>
        <p>business inquiries, co-building requests, or creator partnerships</p>
        <div class="contact-value">https://x.com/GhggVhh40894</div>
      </a>

      <a
        class="contact-card contact-card--link accent-violet"
        href="https://youtube.com/@rdddash"
        target="_blank"
        rel="noreferrer"
      >
        <span class="card-tag">Social</span>
        <h2>Follow Updates</h2>
        <p>YouTube</p>
        <div class="contact-value">https://youtube.com/@rdddash</div>
      </a>
    </div>

    <DashRunner class="runner-block" />
  </div>
</template>

<style scoped>
.page {
  padding: 40px;
  color: var(--page-text-color);
}

.hero {
  max-width: 760px;
  margin-bottom: 32px;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(155, 93, 229, 0.12);
  color: var(--page-heading-color);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

h1 {
  margin: 0 0 16px;
  color: var(--page-heading-color);
  font-size: 42px;
  line-height: 1.1;
}

p {
  margin: 0;
  font-size: 16px;
  line-height: 1.8;
  color: var(--page-text-color);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 22px;
}

.contact-card {
  position: relative;
  overflow: hidden;
  min-height: 220px;
  padding: 24px;
  border: 1px solid var(--border-color);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.02)),
    var(--surface-bg);
  box-shadow: 0 18px 40px rgba(72, 38, 120, 0.12);
  backdrop-filter: blur(14px);
}

.contact-card--link {
  display: block;
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.contact-card--link:hover,
.contact-card--link:focus-visible {
  transform: translateY(-4px);
  border-color: rgba(155, 93, 229, 0.36);
  box-shadow: 0 22px 46px rgba(72, 38, 120, 0.18);
  outline: none;
}

.contact-card::after {
  content: '';
  position: absolute;
  inset: auto -40px -60px auto;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  opacity: 0.22;
  filter: blur(8px);
}

.accent-pink::after {
  background: #ff5da2;
}

.accent-blue::after {
  background: #4cc9f0;
}

.accent-gold::after {
  background: #ffb703;
}

.accent-violet::after {
  background: #9b5de5;
}

.card-tag {
  display: inline-flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.contact-card h2 {
  margin: 0 0 10px;
  font-size: 28px;
  line-height: 1.2;
}

.contact-card p {
  margin-bottom: 22px;
}

.contact-value {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.16);
  font-weight: 600;
  word-break: break-word;
}

.runner-block {
  margin-top: 14px;
}

@media (max-width: 768px) {
  .page {
    padding: 28px 20px;
  }

  h1 {
    font-size: 34px;
  }

  .runner-block {
    margin-top: 14px;
  }
}
</style>
