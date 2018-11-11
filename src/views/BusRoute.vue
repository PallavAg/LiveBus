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
      myMarker: null,
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
    this.clusteredDataProvider = new Here.clustering.Provider([])
    const layer = new Here.map.layer.ObjectLayer(this.clusteredDataProvider)
    this.map.addLayer(layer)

    window.addEventListener('resize', () => {
      this.map.getViewPort().resize()
    })
    const behavior = new Here.mapevents.Behavior(new Here.mapevents.MapEvents(this.map))
    // const ui = Here.ui.UI.createDefault(this.map, defaultLayers)
    const docRef = db.collection('routes').doc(this.route)
    docRef.get()
      .then(doc => {
        console.log('retrieved initial data')
        if (!doc.exists) {
          return docRef.set({})
        }
        const data = doc.data()
        const markup = '<svg width="24" height="24" ' +
          'xmlns="http://www.w3.org/2000/svg">' +
          '<rect stroke="white" fill="#1b468d" x="1" y="1" width="22" ' +
          'height="22" /><text x="12" y="18" font-size="12pt" ' +
          'font-family="Arial" font-weight="bold" text-anchor="middle" ' +
          'fill="white">H</text></svg>'
        const icon = new Here.map.Icon(markup)
        data.Stations.Stn.forEach(station => {
          const theMarker = new Here.map.Marker({lat: station.y, lng: station.x}, {icon: icon})
          this.map.addObject(theMarker)
        })
        data.PathSegments.PathSeg.forEach(segment => {
          const lineString = new Here.geo.LineString()
          const points = segment.graph.split(' ')
          points.forEach(point => {
            const coords = point.split(',')
            console.log(coords)
            lineString.pushPoint({lat:coords[0], lng:coords[1]})
          })
          this.map.addObject(new Here.map.Polyline(
            lineString, { style: { lineWidth: 4 }}
          ))
        })
      })
    window.navigator.geolocation.getCurrentPosition(this.updateLocation)
    db.collection("routes").doc(this.route)
      .onSnapshot(this.docUpdated)
  },
  methods: {
    board() {
      this.boarded = window.navigator.geolocation.watchPosition(this.updateLocation)
    },
    unboard() {
      window.navigator.geolocation.clearWatch(this.boarded)
      this.boarded = null
    },
    docUpdated (doc) {
      const data = doc.data()
      const dataPoints = []
      console.log(data)
      for (const uid in data.users) {
        const geoPoint = data.users[uid].location
        const coords = {lat: geoPoint.latitude, lng: geoPoint.longitude}
        if (uid == auth.currentUser.uid) {
          if (this.myMarker) {
            this.myMarker.setPosition(coords)
          } else {
            console.log('create new marker for ' + uid)
            const markup = `<div><img src="${auth.currentUser.photoURL}" class="user-icon"></div>`
            const icon = new Here.map.DomIcon(markup)
            const theMarker = new Here.map.DomMarker(coords, {icon: icon})
            this.myMarker = theMarker
            this.map.addObject(theMarker)
          }
        } else {
          dataPoints.push(new Here.clustering.DataPoint(coords.lat, coords.lng))
        }

      }
      this.clusteredDataProvider.setDataPoints(dataPoints)
    },
    updateLocation(position) {
      console.log("ping")
      const coords = {lat: position.coords.latitude, lng: position.coords.longitude}
      if (this.boarded !== null) {
        const obj = {}
        obj[`users.${auth.currentUser.uid}.location`] = new firebase.firestore.GeoPoint(
          position.coords.latitude,
          position.coords.longitude
        )
        obj[`users.${auth.currentUser.uid}.lastAlive`] = new Date()
        db.collection('routes').doc(this.route).update(obj)
      } else {
        this.map.setCenter(coords)
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
  top: -10px;
  left: -10px;
  height: 20px;
  width: 20px;
  border-radius: 10px;
  border-style: solid;
  border-width: 2px;
}
</style>
