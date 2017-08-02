<template>
    <div id="app">
        <timeline></timeline>
        <timeline-cursor-head></timeline-cursor-head>
        <schedule-container></schedule-container>
    </div>
</template>

<script>
import Timeline from './Timeline.vue'
import TimelineCursorHead from './TimelineCursorHead.vue'
import ScheduleContainer from './ScheduleContainer.vue'

export default {
  components: {
    Timeline,
    TimelineCursorHead,
    ScheduleContainer
  }
}
</script>

