<template>
  <div class="hc-app-footer">
    <a href="https://jota.one" target="_blank">
      <HcLogo text-only class="hc-logo" />
    </a>
    Version 2023.1.0
  </div>
</template>

<style lang="postcss" scoped>
.hc-app-footer {
  height: 100%;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 0.7rem;
  color: rgba(128, 128, 128, 0.8);
  background: rgba(128, 128, 128, 0.08);

  .dark & {
    background: rgba(0, 0, 0, 0.2);
  }
}

.hc-logo {
  margin-top: 0.1rem;
  height: 0.8rem;
  width: 6rem;
}
</style>
