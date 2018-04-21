<template>
    <div class="timeline" :style="styleObject">
        <div class="timeline-control timeline-control-left" v-on:click="clickBackward" v-bind:class="{ 'filter-icon-active': displayFilter }">
            <div class="filter-icon" v-bind:class="{ 'filter-icon-active': displayFilter }" v-on:mouseover="filterFocus(true)"
                 v-on:mouseleave="filterFocus(false)" v-on:click.stop="filterClick">
                <span class="glyphicon glyphicon-filter" aria-hidden="true"></span>
            </div>
            <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
        </div>
        <div class="timeline-control timeline-control-right" v-on:click="clickForward"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></div>
        <div v-for="hour in 24" class="time">
            {{ hour | toTime }}
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    filters: {
        toTime: function (value) {
            return `${("0" + (value - 1)).slice(-2)}h00`
        }
    },
    computed: mapGetters({
        styleObject: 'gridIndex',
        displayFilter: 'displayCategoryFilter'
    }),
    methods: {
        clickBackward: function () {
            this.$store.dispatch('scrollBackward');
        },
        clickForward: function () {
            this.$store.dispatch('scrollForward');
        },
        filterFocus: function (status) {
            this.$store.dispatch('categoryFilterFocus', {element:'icon', status: status});
        },
        // for mobiles users
        filterClick: function () {
            this.$store.dispatch('categoryFilterFocus', {element:'icon', status: !this.displayFilter});
        }
    }
}
</script>
