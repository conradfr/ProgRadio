<template>
    <div class="schedule-radio-list">
        <schedule-radio-list-one v-for="entry in radios" :key="entry.code_name" :radio="entry"></schedule-radio-list-one>
    </div>
</template>

<script>
import { mapState } from 'vuex'

import ScheduleRadioListOne from './ScheduleRadioListOne.vue'

export default {
    components: { ScheduleRadioListOne },
    computed: mapState({
        radios: state => state.radios
    })
}
</script>
