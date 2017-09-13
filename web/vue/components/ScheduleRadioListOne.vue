<template>
    <a v-bind:href="'/radio/' + radio.code_name"><div class="radio-logo" v-bind:title="radio.name" :style="styleObject"></div></a>
</template>

<script>
export default {
    props: ['radio'],
    data: function () {
        return {
            styleObject: {
                backgroundImage: `url("/img/radio/${this.radio.code_name}_icon.png")`
            }
        }
    }
}
</script>
