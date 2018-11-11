<template>
  <div ref="map" id="map" style="height: 100%;">
    <v-layout column class="map-overlay-btns">
      <v-btn
        color="success"
        @click="board"
        v-if="boarded === null"
      >Board
      </v-btn>
      <template v-else>
        <v-layout row class="map-overlay-btn-group">
          <v-btn
            v-for="id in [2, 1, 0]"
            :key="id"
            :color="id === capacity ? ['success','accent','error'][id] : ''"
            small
            tag="div"
            @click="capacity = id"
          >{{['Light', 'Moderate', 'Crowded'][id]}}</v-btn>
        </v-layout>
        <v-btn
          small
          color="error"
          @click="unboard">Exit
        </v-btn>
      </template>
    </v-layout>
  </div>
</template>

<script>
import Here, {platform} from "../plugins/heremap"
import firebase, {db, auth} from '@/plugins/firebase'

export default {
  name: "BusRoute",
  data() {
    return {
      boarded: null,
      capacity: null,
      markers: new Map(),
      myMarker: null
    }
  },
  mounted() {
    const defaultLayers = platform.createDefaultLayers()
    this.map = new Here.Map(
      this.$refs.map,
      defaultLayers.normal.map,
      {
        zoom: 10,
        center: {lat: 52.5, lng: 13.4}
      }
    )
    window.addEventListener('resize', () => {
      this.map.getViewPort().resize()
    })
    const behavior = new Here.mapevents.Behavior(new Here.mapevents.MapEvents(this.map))
    // const ui = Here.ui.UI.createDefault(this.map, defaultLayers)
    const docRef = db.collection('routes').doc(this.route)
    docRef.get()
      .then(doc => {
        if (!doc.exists) {
          return docRef.set({})
        }
      })
    window.navigator.geolocation.getCurrentPosition(this.updateLocation)
  },
  methods: {
    board() {
      this.boarded = window.navigator.geolocation.watchPosition(this.updateLocation)
      console.log(this.boarded)
    },
    unboard() {
      window.navigator.geolocation.clearWatch(this.boarded)
      this.boarded = null
    },
    updateLocation(position) {
      console.log("ping")
      const coords = {lat: position.coords.latitude, lng: position.coords.longitude}
      const obj = {}
      obj[`users.${auth.currentUser.uid}.location`] = new firebase.firestore.GeoPoint(
        position.coords.latitude,
        position.coords.longitude
      )
      db.collection('routes').doc(this.route).update(obj)
      if (this.myMarker) {
        console.log(coords)
        this.myMarker.setPosition(coords)
      } else {
        console.log('create new marker')
        this.map.setCenter(coords)
        const markup = `<div><img src="${auth.currentUser.photoURL}" class="user-icon"></img></div>`
        console.log(auth.currentUser)
        const icon = new Here.map.DomIcon(markup)
        this.myMarker = new Here.map.DomMarker(coords, {icon: icon})
        this.map.addObject(this.myMarker)
      }
    },
  },
  computed: {
    route () {
      return this.$route.params.routeID
    }
  },
  watch: {
    capacity (val) {
      const obj = {}
      obj[`users.${auth.currentUser.uid}.capacity`] = val
      db.collection('routes').doc(this.route).update(obj)
    }
  },
}
</script>

<style>
#map {
  height: 100%;
}

.map-overlay-btns {
  position: absolute;
  z-index: 100;
  bottom: 1.5rem;
  left: 2rem;
  right: 2rem;
}
.map-overlay-btn-group {
  padding: 0 0.5rem;
}
.map-overlay-btn-group > .v-btn {
  margin: 0;
  flex-grow: 1;
  border-radius: 0;
}
.map-overlay-btn-group > .v-btn:first-child {
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
}
.map-overlay-btn-group > .v-btn:last-child {
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}
.user-icon {
  position: absolute;
  top: -15px;
  left: -15px;
  height: 30px;
  width: 30px;
  border-radius: 15px;
  border-style: solid;
}
</style>
