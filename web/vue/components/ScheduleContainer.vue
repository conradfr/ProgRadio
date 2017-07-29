<template>
    <div class="schedule-container">
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
        radios: state => state.radios,
        schedule: state => state.schedule
    })
}
</script>
