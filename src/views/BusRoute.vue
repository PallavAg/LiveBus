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
const CUSTOM_THEME = {
  getClusterPresentation (cluster) {
    let sum = 0
    let count = 0
    cluster.forEachDataPoint(datapoint => {
      const data = datapoint.getData()
      count += 1
      if (!data.capacity) {
        return
      }
      sum += data.capacity
    })
    const color = ['green', 'yellow', 'red'][Math.round(sum / count)]
    console.log(color)
    const markup = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" version="1.1" viewBox="0 0 500 500" fill-rule="evenodd" clip-rule="evenodd">
<path fill="${color}" d="M112 0l282 0c35,0 62,21 62,56l0 46 51 0c0,25 0,50 0,76l-33 0 0 -59 -18 0 0 275 -80 0 -11 40 91 -1c0,24 -10,45 -37,46l0 22c0,12 -9,22 -21,22l-20 0c-12,0 -21,-10 -21,-22l0 -22 -207 0 0 22c0,12 -10,22 -22,22l-19 0c-12,0 -22,-10 -22,-22l0 -22c-27,-1 -36,-22 -36,-46l91 1 -11 -40 -80 0 0 -275 -18 0 0 59 -33 0c0,-26 0,-51 0,-76l51 0 0 -46c0,-35 27,-56 61,-56zm-30 28c-10,0 -18,7 -18,17l0 263c0,24 20,44 44,44l290 0c24,0 44,-20 44,-44l0 -263c0,-10 -7,-17 -17,-17l-343 0z"/>
<text x="180" y="280" fill="${color}" font-size="300px" font-weight="bold">${count}</text>
</svg>`
    const marker = new Here.map.Marker(cluster.getPosition(), {
      min: cluster.getMinZoom(),
      max: cluster.getMaxZoom(),
      icon: new Here.map.Icon(markup, {
        size: {w: 30, h: 30},
        anchor: {x: 15, y: 15}
      })
    })
    return marker
  },
  getNoisePresentation (noisePoint) {
    const data = noisePoint.getData()
    const noiseMarker = new Here.map.Marker(noisePoint.getPosition(), {
      min: noisePoint.getMinZoom(),
      icon: new Here.map.Icon(data.photoURL || 'https://assets-cdn.github.com/images/modules/logos_page/Octocat.png', {
        size: {w: 20, h: 20},
        anchor: {x: 10, y: 10}
      })
    })

    // Link a data from the point to the marker
    // to make it accessible inside onMarkerClick
    noiseMarker.setData(data)

    return noiseMarker
  }
}
export default {
  name: "BusRoute",
  data() {
    return {
      boarded: null,
      capacity: 0,
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
    this.clusteredDataProvider = new Here.clustering.Provider([], {
      theme: CUSTOM_THEME,
      clusteringOptions: {
        // Maximum radius of the neighbourhood
        eps: 16,
        // minimum weight of points required to form a cluster
        minWeight: 1
      }
    })
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
      for (const uid in data.users) {
        const theUser = data.users[uid]
        const geoPoint = theUser.location
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
          dataPoints.push(new Here.clustering.DataPoint(coords.lat, coords.lng, null, theUser))
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
        obj[`users.${auth.currentUser.uid}.photoURL`] = auth.currentUser.photoURL
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
