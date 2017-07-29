<template>
    <div id="app">
        <timeline></timeline>
        <schedule-container></schedule-container>
    </div>
</template>

<script>
import Timeline from './Timeline.vue'
import ScheduleContainer from './ScheduleContainer.vue'

export default {
  components: {
    Timeline,
    ScheduleContainer
  }
}
</script>

