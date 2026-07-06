<script setup>
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* Palette: professional light blue */
  --color-bg: #f3f9ff;
  --color-surface: #ffffff;
  --color-primary: #1976d2; /* main blue */
  --color-primary-light: #63a4ff;
  --color-primary-contrast: #ffffff;
  --color-muted: #6b7280;
  --color-success: #16a34a;
  --radius: 8px;
  --shadow-lg: 0 8px 24px rgba(25, 118, 210, 0.08);
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, var(--color-bg) 0%, #ffffff 100%);
  color: #0f172a;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Surface */
.card, .panel {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  padding: 16px;
}

/* Buttons */
.btn-primary, .btn-submit, .btn-guardar {
  background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: var(--color-primary-contrast);
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary:disabled,
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-info, .btn-limpiar {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid rgba(25,118,210,0.12);
  padding: 7px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-cancel-action {
  background: transparent;
  color: var(--color-muted);
  border: 1px solid rgba(0,0,0,0.06);
  padding: 6px 10px;
  border-radius: 6px;
}

.notification {
  background: linear-gradient(90deg, rgba(99,164,255,0.06), rgba(25,118,210,0.02));
  border-left: 4px solid var(--color-primary-light);
  padding: 12px 16px;
  border-radius: 6px;
}

/* Navbar / header */
.navbar {
  background: transparent;
  padding: 12px 18px;
}

.hero {
  padding: 36px 18px;
}

/* Form inputs */
input, select, textarea {
  border: 1px solid #e6eefc;
  padding: 8px 10px;
  border-radius: 6px;
}

.text-muted {
  color: var(--color-muted);
}
</style>
