<template>
  <div ref="map" id="map" style="height: 100%;">
    <v-btn
      tag="div"
      color="success"
      class="map-overlay-btn"
      absolute
      @click="board"
    >Board</v-btn>
  </div>
</template>

<script>
import Here, { platform } from "../plugins/heremap"
export default {
  name: "BusRoute",
  data () {
    return {
      route: null,
    }
  },
  mounted () {
    const defaultLayers = platform.createDefaultLayers()
    this.map = new Here.Map(
      this.$refs.map,
      defaultLayers.normal.map,
      {
        zoom: 10,
        center: { lat: 52.5, lng: 13.4 }
      }
    )
    window.addEventListener('resize', () => {
      this.map.getViewPort().resize()
    })
    const behavior = new Here.mapevents.Behavior(new Here.mapevents.MapEvents(this.map))
    // const ui = Here.ui.UI.createDefault(this.map, defaultLayers)
  },
  methods: {
    board () {

    }
  }
}
</script>

<style>
  #map {
    height: 100%;
  }
  .map-overlay-btn {
    z-index: 100;
    bottom: 1.5rem;
    left: 2rem;
    right: 2rem;
  }
</style>
