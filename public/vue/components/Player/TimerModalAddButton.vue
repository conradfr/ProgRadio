<template>
  <div class="btn-group" :class="{'hidden-xs': hideMobile}" role="group">
    <a role="button" class="btn btn-info" v-on:click="addTo">
      +{{ $t('message.player.timer.modal.x_minutes', { minutes: add }) }}
    </a>
  </div>
</template>

<script>
export default {
  props: ['value', 'add', 'hideMobile'],
  methods: {
    addTo() {
      let { value } = this;
      const { add } = this;
      if (typeof value === 'string') {
        value = parseInt(value, 10);
      }

      value += (typeof add === 'string' ? parseInt(add, 10) : add);
      this.$emit('input', value);
    }
  }
};
</script>
