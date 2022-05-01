<template>
  <div ref="root">
    <slot></slot>
  </div>
</template>

<script>
/*
  Thin layer for HammerJs specific to this app

  !! NOTE !!

  As it seems this file is getting views on GitHub please note that I created it when converting
  this codebase to Vue3 as vue-touch had no support for it.

  I did the minimum amount of work to make it work for my use case so this is NOT a general
  implementation of HammerJs for Vue3. I did not know Vue3 well when coding it and I have NOT
  revisited the code since (but it works).
*/

import { ref, onMounted, onBeforeUnmount } from 'vue';
import Hammer from 'hammerjs';

const directions = ['horizontal', 'vertical'];

// Adapted from https://github.com/vuejs/vue-touch/blob/next/src/utils.js
/* eslint-disable no-param-reassign */
const guardDirections = (options) => {
  const dir = options.direction;
  if (typeof dir === 'string') {
    const hammerDirection = `DIRECTION_${dir.toUpperCase()}`;
    if (directions.indexOf(dir) > -1
      && Object.prototype.hasOwnProperty.call(Hammer, hammerDirection)) {
      options.direction = Hammer[hammerDirection];
    }
  }
  return options;
};

const gestures = {
  swipe: {
    all: ['swipe'],
    horizontal: [],
    vertical: []
  },
  pan: {
    all: ['panstart', 'panend'],
    horizontal: ['panleft', 'panright'],
    vertical: ['panup', 'pandown']
  }
};

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

export default {
  props: {
    enabled: Object,
    // can't make it to work dynamically with toRef, so we declare it instead
    swipeOptions: Object,
    panOptions: Object
  },
  setup(props, { emit }) {
    const root = ref(null);
    let gesturesList = [];

    onMounted(() => {
      const recognizers = [];
      root.value.hammer = new Hammer.Manager(root.value);

      Object.keys(props.enabled).forEach((key) => {
        if (props.enabled[key] === true) {
          const options = props[`${key}Options`] || { direction: 'horizontal' };
          gesturesList = gestures[key].all.concat(gestures[key][options.direction]);

          const recognizer = new Hammer[capitalize(key)](guardDirections(options));

          if (recognizers.length > 0) {
            recognizers.forEach(entry => recognizer.recognizeWith(entry));
          }

          root.value.hammer.add(recognizer);
          recognizers.push(recognizer);

          gesturesList.forEach((gesture) => {
            root.value.hammer.on(gesture, (e) => {
              emit(gesture, e);
              emit(e.type, e);
            });
          });
        }
      });
    });

    onBeforeUnmount(() => {
      if (root.value.hammer) {
        gesturesList.forEach((gesture) => {
          root.value.hammer.off(gesture);
        });

        root.value.hammer.destroy();
        root.value.hammer = null;
        delete root.value.hammer;
      }
    });

    return {
      root
    };
  }
};
</script>
