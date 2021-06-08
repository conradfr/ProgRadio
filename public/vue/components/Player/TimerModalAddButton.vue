<template>
  <button type="button" class="btn btn-info" v-on:click="addTo"
    :class="{'d-none d-sm-block': hideMobile}">
    +{{ $t('message.player.timer.modal.x_minutes', { minutes: add }) }}
  </button>
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
