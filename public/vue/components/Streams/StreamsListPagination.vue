<template>
  <div class="container">
    <div class="row">
      <div class="col-md-12 pb-5 pb-sm-5 pb-md-0">
        <nav aria-label="navigation">
          <ul class="pagination">
            <li class="page-item" :class="{ 'disabled': page === 1 }">
              <a class="page-link" v-on:click="gotoPage(page - 1)" aria-label="Previous">
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
              <a class="page-link"
                 v-on:click="gotoPage(n)">{{ n }}</a>
            </li>
            <li class="page-item" :class="{ 'disabled': page === pages }">
              <a class="page-link" v-on:click="gotoPage(page + 1)" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import { STREAMS_DEFAULT_PER_PAGE, STREAMS_MAX_PAGES_DISPLAY } from '../../config/config';

export default {
  computed: {
    ...mapState({
      total: state => state.streams.total,
      page: state => state.streams.page
    }),
    pages() {
      return Math.ceil(this.total / STREAMS_DEFAULT_PER_PAGE);
    },
    pagesList() {
      if (this.pages <= STREAMS_MAX_PAGES_DISPLAY) { return this.pages; }
      const pagesList = [1];

      if (this.page > 2) {
        pagesList.push(this.page - 1);
      }

      pagesList.push(this.page);

      if (this.page < this.pages - 1) {
        pagesList.push(this.page + 1, this.pages);
      }

      return pagesList.filter((item, index) => pagesList.indexOf(item) === index);
    },
  },
  methods: {
    gotoPage(page) {
      if (page < 1 || page > this.pages) {
        return;
      }

      this.$store.dispatch('pageSelection', page);
    },
  }
};
</script>
