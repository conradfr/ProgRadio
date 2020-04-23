<template>
  <div class="collection-switcher" v-once>
      <div class="collection-control collection-backward"
           v-on:click="clickCollectionBackward">
        <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
      </div>
      <div class="collection-control collection-forward"
           v-on:click="clickCollectionForward">
        <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
      </div>
    </div>
</template>

<script>
// import { mapGetters, mapState } from 'vuex';

export default {
  data() {
    return {};
  },
  methods: {
    clickCollectionBackward() {
      this.$store.dispatch('collectionBackward');
    },
    clickCollectionForward() {
      this.$store.dispatch('collectionForward');
    },
  }
};
</script>
