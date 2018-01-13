<template>
    <!--<a v-bind:href="'/radio/' + radio.code_name"><div class="radio-logo" v-bind:title="radio.name" :style="styleObject"></div></a>-->
    <a v-on:click="play" v-bind:title="radio.name" :style="styleObject">
        <div class="radio-logo" v-bind:title="radio.name" :style="styleObject">
            <div class="radio-logo-play" v-bind:class="{ 'radio-logo-play-active': (radio.code_name === radioPlayingCodeName) }"></div>
        </div>
    </a>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    props: ['radio'],
    data: function () {
        return {
            styleObject: {
                backgroundImage: `url("/img/radio/${this.radio.code_name}_icon.png")`
            }
        }
    },
    computed: {
        ...mapGetters([
            'radioPlayingCodeName'
        ])
    },
    methods: {
        play: function (event) {
            this.$store.dispatch('play', this.radio.code_name);
        }
    }
}
</script>
