<template>
  <v-container>
    <v-layout column>
      <v-flex>
        This is where the map goes
      </v-flex>
      <v-flex v-if="!route">
        <v-btn block>Board</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "BusRoute",
  data () {
    return {
      route: null,
    }
  }
}
</script>

<style scoped>

</style>
