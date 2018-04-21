<template>
    <div class="navbar-player">
        <div class="player-wrap">
            <div class="player-sound" v-on:click="toggleMute">
                <span class="glyphicon glyphicon-volume-off"  v-bind:class="{ 'player-muted': player.muted }" aria-hidden="true"></span>
            </div>
            <div class="player-sound player-sound-fader" v-on:mouseover="volumeFocus(true)" v-on:mouseleave="volumeFocus(false)" v-on:click="volumeClick">
                <span class="glyphicon" v-bind:class="{ 'glyphicon-volume-up': player.volume > 4, 'glyphicon-volume-down': player.volume <= 4 }" aria-hidden="true"></span>
            </div>
            <div class="player-playpause" v-bind:class="{ 'player-playpause-disabled': player.radio === null }" v-on:click="togglePlay">
                <span class="glyphicon icon-round" v-bind:class="{ 'glyphicon-play': !player.playing, 'glyphicon-pause': player.playing }" aria-hidden="true"></span>
            </div>
            <div v-if="player.radio" class="player-name">{{ player.radio.name }}</div>
            <div v-if="!player.radio" class="player-name player-name-help">Cliquer sur un logo pour lancer la lecture</div>
        </div>
        <volume-fader v-if="displayVolume" />
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import VolumeFader from './VolumeFader.vue'

export default {
    components: {VolumeFader},
    data: function () {
        return {
            audio: null,
            volume: 5,
        }
    },
    computed: {
        ...mapState([
            'player'
        ]),
        ...mapGetters([
            'displayVolume'
        ])
    },
    watch: {
        'player.playing': function (val, oldVal) {
            if (val === true) {
                this.play(this.player.radio.streamUrl);
            } else {
                this.stop();
            }
        },
        'player.muted': function (val, oldVal) {
            if (this.audio !== null) {
                this.audio.muted = val;
            }
        },
        'player.volume': function (val, oldVal) {
            if (this.audio !== null) {
                this.audio.volume = (val * 0.1);
            }
        },
    },
    methods: {
        toggleMute: function (event) {
            this.$store.dispatch('toggleMute');
        },
        togglePlay: function (event) {
            this.$store.dispatch('togglePlay');
        },
        play: function (url) {
            this.audio = new Audio(url + '?cb=' + new Date().getTime());
            this.audio.muted = this.player.muted;
            this.audio.volume = ( this.player.volume * 0.1);
            this.audio.play();
        },
        stop: function () {
            this.audio.pause();
            this.audio = null;
        },
        volumeFocus: function (status) {
            this.$store.dispatch('volumeFocus', {element:'icon', status: status});
        },
        // for mobiles users
        volumeClick: function () {
            this.$store.dispatch('volumeFocus', {element:'icon', status: !this.displayVolume});
        },
    }
}
</script>
