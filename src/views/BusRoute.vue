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
import firebase, { db, auth } from '@/plugins/firebase'
export default {
  name: "BusRoute",
  data () {
    return {
      route: 'placeholder',
      boarded: null,
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
      this.boarded = window.navigator.geolocation.watchPosition(this.updateLocation)
    },
    updateLocation (position) {
      const obj = {}
      obj[`users.${auth.currentUser.uid}.location`] = new firebase.firestore.GeoPoint(
        position.coords.latitude,
        position.coords.longitude
      )
      db.collection('routes').doc(this.route).update(obj)
      const svgMarkup = '<svg width="24" height="24" ' +
        'xmlns="http://www.w3.org/2000/svg">' +
        '<rect stroke="white" fill="#1b468d" x="1" y="1" width="22" ' +
        'height="22" /><text x="12" y="18" font-size="12pt" ' +
        'font-family="Arial" font-weight="bold" text-anchor="middle" ' +
        'fill="white">H</text></svg>';
      const icon = new Here.map.Icon(svgMarkup)
      const coords = {lat: position.coords.latitude, lng: position.coords.longitude}
      const marker = new Here.map.Marker(coords, {icon: icon})
      this.map.addObject(marker)
    }
  },
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
