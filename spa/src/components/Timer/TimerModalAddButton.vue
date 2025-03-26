<template>
  <button type="button" class="btn btn-sm btn-light" v-on:click="addTo"
    :class="{'d-none d-sm-block': hideMobile}">
    {{ text }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import typeUtils from '@/utils/typeUtils';

export default defineComponent({
  props: ['modelValue', 'add', 'hideMobile'],
  computed: {
    text(): string {
      return typeUtils.toIntIfString(this.add) < 0 ? this.add : `+${this.add}`;
    }
  },
  methods: {
    addTo() {
      let { modelValue } = this;
      modelValue = typeUtils.toIntIfString(modelValue);
      const toAdd = typeUtils.toIntIfString(this.add);
      modelValue += toAdd;

      this.$emit('update:modelValue', modelValue);
    }
  }
});
</script>
