<template>
  <div class="container">
    <div class="row">
      <div class="col-md-12 pb-3 pb-md-2">
        <nav aria-label="navigation">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ 'disabled': page === 1 }">
              <a class="page-link" href="#top" v-on:click="gotoPage(page - 1)" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            <li
                class="page-item"
                v-for="(n, index) in pagesList"
                :key="n"
                :class="{
                  'active': page === n,
                  'ellipsis': pagesList[index] - pagesList[index - 1] > 1
                }"
            >
              <a class="page-link" href="#top"
                 v-on:click="gotoPage(n)">{{ n }}</a>
            </li>
            <li class="page-item" :class="{ 'disabled': page === pages }">
              <a class="page-link" href="#top" v-on:click="gotoPage(page + 1)" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

/* eslint-disable import/no-cycle */
import { useStreamsStore } from '@/stores/streamsStore';

import { STREAMS_DEFAULT_PER_PAGE } from '@/config/config';

export default defineComponent({
  computed: {
    ...mapState(useStreamsStore, ['total', 'page', 'selectedCountry']),
    pages(): number {
      return Math.ceil(this.total / STREAMS_DEFAULT_PER_PAGE);
    },
    pagesList(): number[] {
      // not sure what this does anymore
      // if (this.pages <= STREAMS_MAX_PAGES_DISPLAY) { return [this.pages]; }
      const pagesList = [1];

      if (this.page > 2) {
        pagesList.push(this.page - 1);
      }

      pagesList.push(this.page);

      if (this.page < this.pages - 1 || (this.page === 1 && this.pages > 1)) {
        pagesList.push(this.page + 1, this.pages);
      }

      return pagesList.filter((item, index) => pagesList.indexOf(item) === index);
    },
  },
  methods: {
    gotoPage(page: number) {
      if (page < 1 || page > this.pages) {
        return;
      }

      const params = {
        ...this.$route.params,
        countryOrCategoryOrUuid: this.selectedCountry,
        page: page.toString()
      };

      this.$router.push({
        name: 'streaming',
        params
      });
    },
  }
});
</script>
