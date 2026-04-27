<template>
  <div class="page">
    <h1>Quotes & Articles</h1>
    <p>You can place your quotes, notes, article lists, or external links on this page.</p>
  </div>
</template>

<style scoped>
.page {
  padding: 40px;
  color: var(--page-text-color);
}

h1 {
  margin-bottom: 16px;
  color: var(--page-heading-color);
}

p {
  font-size: 16px;
  line-height: 1.8;
  color: var(--page-text-color);
}

@media (max-width: 768px) {
  .page {
    padding: 28px 20px 40px;
  }

  h1 {
    margin-bottom: 12px;
    font-size: 30px;
  }

  p {
    font-size: 15px;
    line-height: 1.75;
  }
}
</style>
