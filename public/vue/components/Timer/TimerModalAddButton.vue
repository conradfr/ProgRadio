<template>
  <button type="button" class="btn btn-info" v-on:click="addTo"
    :class="{'d-none d-sm-block': hideMobile}">
    +{{ $t('message.player.timer.modal.x_minutes', { minutes: add }) }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: ['modelValue', 'add', 'hideMobile'],
  methods: {
    addTo() {
      let { modelValue } = this;
      const { add } = this;
      if (typeof modelValue === 'string') {
        modelValue = parseInt(modelValue, 10);
      }

      modelValue += (typeof add === 'string' ? parseInt(add, 10) : add);
      this.$emit('update:modelValue', modelValue);
    }
  }
});
</script>
