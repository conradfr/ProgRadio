<template>
  <div id="category-filter" v-on:mouseover="filterFocus(true)" v-on:mouseleave="filterFocus(false)">
    <div class="category-one"
      v-bind:class="{ 'category-one-excluded': isCategoryExcluded(entry.code_name) }"
      v-for="entry in categories" :key="entry.code_name"
      v-on:click="toggleExclude(entry.code_name)"
    >
      <span class="glyphicon" aria-hidden="true"
        v-bind:class="{ 'glyphicon-ok': !isCategoryExcluded(entry.code_name),
                        'glyphicon-minus': isCategoryExcluded(entry.code_name) }">
      </span>{{ entry.name_FR }}
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {};
  },
  computed: {
    ...mapState({
      categories: state => state.schedule.categories,
      categoriesExcluded: state => state.schedule.categoriesExcluded
    })
  },
  methods: {
    filterFocus(status) {
      this.$store.dispatch('categoryFilterFocus', { element: 'list', status });
    },
    isCategoryExcluded(category) {
      return this.categoriesExcluded.indexOf(category) !== -1;
    },
    toggleExclude(category) {
      this.$store.dispatch('toggleExcludeCategory', category);
    }
  }
};
</script>
