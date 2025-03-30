<template>
  <button :class="{'d-none d-sm-block': hideMobile}"
    type="button" class="btn btn-sm btn-light" @click="addTo">
    {{ text }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import typeUtils from '@/utils/typeUtils';

export default defineComponent({
  props: {
    modelValue: {
      type: [Number, String],
      required: true
    },
    add: {
      type: Number,
      required: true
    },
    hideMobile: {
      type: Boolean,
      required: false,
      default: true
    },
  },
  emits: ['update:modelValue'],
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
