<template>
  <div>
  </div>
</template>

<script>

export default {
  compatConfig: {
    MODE: 3
  },
  // TODO fix this hack
  mounted() {
    const body = document.querySelector('body');
    body.classList.remove('body-app');

    const app = document.getElementById('app');
    app.classList.add('no-background');

    document.title = this.$i18n.t('message.radio_page.title', { radio: this.radio.name });
  },
  beforeUnmount() {
    const body = document.querySelector('body');
    body.classList.add('body-app');

    const app = document.getElementById('app');
    app.classList.remove('no-background');
  }
};
</script>
