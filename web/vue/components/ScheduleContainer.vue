<template>
    <div class="schedule-container" tabindex="-1" v-on:keyup.left.prevent="keyLeft()" v-on:keyup.right.prevent="keyRight()">
        <schedule-radio-list></schedule-radio-list>
        <schedule-radio-grid></schedule-radio-grid>
    </div>
</template>

<script>
import { mapState } from 'vuex'

import ScheduleRadioList from './ScheduleRadioList.vue'
import ScheduleRadioGrid from './ScheduleRadioGrid.vue'

export default {
    components: { ScheduleRadioList, ScheduleRadioGrid },
    computed: mapState({
        radios: state => state.schedule.radios,
        schedule: state => state.schedule.schedule
    }),
    methods: {
        keyLeft: function () {
            this.$store.dispatch('scrollBackward');
        },
        keyRight: function () {
            this.$store.dispatch('scrollForward');
        }
    }
}
</script>
