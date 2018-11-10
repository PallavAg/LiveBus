<template>
  <v-container>
    <p class="mt-4 mb-0 text-xs-center headline">sign in</p>
    <p class="mt-0 mb-0 text-xs-center display-1"><b>live-bus</b></p>
    <v-img
      :src="require('../assets/bus-side-view.svg')"
      contain
      width="160"
      height="140"
      class="mx-auto"
    ></v-img>
    <div ref="loginC"></div>
  </v-container>
</template>

<script>
  import { LoadAuthUI } from '@/plugins/firebase'
  export default {
    name: "BusRoute",
    mounted() {
      LoadAuthUI(this.$refs['loginC'])
    }
  }
</script>