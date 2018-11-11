<template>
  <div style="height: 100%">
    <v-container v-if="writing" style="height: 100%; width: 100%">
      <p class="mt-4 mb-4 text-xs-left title">How's Your Trip On Bus Going?</p>
      <v-textarea
        solo
        name="input-context"
        label="Type Here :)"
        v-model="text"
      >
      </v-textarea>
      <v-btn rounded primary v-on:click="submit">Submit</v-btn>
      <v-btn rounded dark v-on:click="canclesubmit">Cancel</v-btn>
    </v-container>
    <div v-else class=" mx-0; px-0" style="width: 100%;">
    <v-card v-if="boarded != null && !writing" column class="map-overlay-btns mx-0; px-0" style="width: 100%;">
      <template>
        <v-layout row class="map-overlay-btn-group">
          <v-btn
            v-for="id in [2, 1, 0]"
            :key="id"
            :color="['success','accent','error'][id]"
            small
            tag="div"
            @click="capacity = id"
          >{{['Light', 'Moderate', 'Crowded'][id]}}</v-btn>
        </v-layout>
        <v-btn
          small
          color="warning"
          @click="unboard"
        style="width: 100%; height: 3rem;margin:0">Exit
        </v-btn>
      </template>
    </v-card>
    </div>
    <div ref="map" id="map" style="height:100%"></div>
    <v-btn
      color="success"
      @click="board"
      v-if="boarded === null && !writing"
      style="width: 100%; height: 7rem;margin:0;border-radius: 0;position: absolute;
        z-index: 100;
        bottom: 0;
        left: 0;
        right: 0;"
    >Board
    </v-btn>
    <v-btn v-if="!writing" icon @click="center" style="position: absolute;
        z-index: 500;
        top: 1rem;
        left: 1rem" >
      <v-icon>my_location</v-icon>
    </v-btn>
    <v-btn v-if="true" large fab class="primary" style="position: absolute;
        z-index: 500;
        bottom: 8rem;
        right: 1rem"
           v-on:click="newMessage">
      <v-icon>message</v-icon>
    </v-btn>
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
    const delay = Date.now() - data.lastAlive.toMillis()
    console.log(delay)
    const imageURL = data.photoURL|| 'https://assets-cdn.github.com/images/modules/logos_page/Octocat.png'
    const markup = `<div><img src="${imageURL}" class="user-icon" style="${delay > 15000 ? 'filter: grayscale(100%);' : ''}"></div>`
    const noiseMarker = new Here.map.DomMarker(noisePoint.getPosition(), {
      min: noisePoint.getMinZoom(),
      icon: new Here.map.DomIcon(markup , {
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
      markers: new Map(),
      writing: false,
      text:'',
      bubbles: [
      ],
      messages: [
      ],
      myMarker: null,
      userID:'',
    }
  },
  mounted() {
    if(auth.currentUser && auth.currentUser.uid)
      this.userID = auth.currentUser.uid
    const defaultLayers = platform.createDefaultLayers()
    this.map = new Here.Map(
      this.$refs.map,
      defaultLayers.normal.map,
      {
        zoom: 10,
        center: {lat: 49, lng: -89}
      }
    )
    this.clusteredDataProvider = new Here.clustering.Provider([], {
      theme: CUSTOM_THEME,
      clusteringOptions: {
        // Maximum radius of the neighbourhood
        eps: 64,
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
    this.loadBubbles()
    window.navigator.geolocation.getCurrentPosition(this.updateLocation)
    this.load()
  },
  methods: {
    load() {
      if (this.unsubsribe) this.unsubsribe()
      this.map.removeObjects(this.map.getObjects())
      if (!this.route) return;

      const docRef = db.collection('routes').doc(this.route)
      docRef.get()
        .then(doc => {
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
          /* data.Stations.Stn.forEach(station => {
            const theMarker = new Here.map.Marker({lat: station.y, lng: station.x}, {icon: icon})
            this.map.addObject(theMarker)
          }) */
          const thePath = data.LineInfos.LineInfo.find(a => a.name == this.routeName)
          const segIDs = thePath.LineSegments[0].seg_ids.split(' ')
          console.log(segIDs)
          for (const id of segIDs) {
            const segment = data.PathSegments.PathSeg.find(a => a.id == id)
            const lineString = new Here.geo.LineString()
            const points = segment.graph.split(' ')
            points.forEach(point => {
              const coords = point.split(',')
              lineString.pushPoint({lat:coords[0], lng:coords[1]})
            })
            this.map.addObject(new Here.map.Polyline(
              lineString, { style: { lineWidth: 4 }}
            ))
          }
        })
      this.unsubsribe = db.collection("routes").doc(this.route)
        .onSnapshot(this.docUpdated)
    },
    board() {
      this.boarded = window.navigator.geolocation.watchPosition(this.updateLocation)
    },
    unboard() {
      window.navigator.geolocation.clearWatch(this.boarded)
      this.boarded = null
    },
    canclesubmit()
    {
      this.writing = false;
    },
    center() {
      window.navigator.geolocation.getCurrentPosition(pos => {
        this.map.setCenter({lat: pos.coords.latitude, lng: pos.coords.longitude})
      })
    },
    loadBubbles(){
      if (!this.route) return;
      const defaultLayers = platform.createDefaultLayers()
      let ui = Here.ui.UI.createDefault(this.map, defaultLayers, 'en-US');
      let routeRef = db.collection("routes").doc(this.route);
      routeRef.get()
        .then(doc => {
          if (doc.exists) {
            let data = doc.data();
            console.log("loadBubbles:  "+data)
            for (let uid in data.users) {
              const user = data.users[uid]
              console.log("loadBubbles, user:  "+user.message)
              if (user.message) {
                let updated = user.updated;
                console.log("loadBubbles: Boolean: "+ (updated.seconds + 100000 > Date.now() / 1000))
                if (updated.seconds + 15 > Date.now() / 1000) {
                  this.messages.push({content: user.message, time: updated.seconds})
                  let bubble = new Here.ui.InfoBubble({lat: user.location.latitude, lng: user.location.longitude}, {
                    content: user.message
                  });
                  console.log("loadBubbles: SHOW")
                  this.bubbles.push({bubble:bubble,user:uid})
                  ui.addBubble(bubble);
                  setTimeout(() => {
                    ui.removeBubble(bubble)
                  }, 15000 + updated.seconds * 1000 - Date.now())
                }
              }
            }
          }
        })
        .catch(err => {
        })
      routeRef.onSnapshot(
        doc => {
          if (doc.exists) {
            console.log("SNAPSHOT!!!!")
            let data = doc.data();
            for (let uid in data.users) {
              const user = data.users[uid]
              if (user.message) {
                let updated = user.updated;
                console.log("SNAP:" +user.message )
                if (this.messages && !this.messages.includes({content: user.message, time: updated.seconds})) {
                  console.log("SNAP:SSS" )
                  if (updated.seconds + 15 > Date.now() / 1000) {
                    this.messages.push({content: user.message, time: updated.seconds})
                    this.bubbles.filter( function(currentValue, index, arr){
                      console.log("SNAP: OLD DISCORVERED")
                      ui.removeBubble(currentValue.bubble)
                    }, {user:uid})
                    let bubble = new Here.ui.InfoBubble({lat: user.location.latitude, lng: user.location.longitude}, {
                      content: user.message
                    });
                    ui.addBubble(bubble);
                    this.bubbles.push({bubble:bubble,user:uid})
                    setTimeout(() => {
                      ui.removeBubble(bubble)
                    //}, 15 * 1000 + updated.seconds * 1000 - Date.now())
                    }, 15000 + updated.seconds * 1000 - Date.now())
                  }
                }
              }
            }
          }
        }, err => {
        })
    },
    submit() {
      let obj ={}
      obj[`users.${auth.currentUser.uid}.message`] = this.text
      obj[`users.${auth.currentUser.uid}.updated`] = new Date()
      db.collection('routes').doc(this.route).update(obj)
        .then(() =>
        {
          this.writing = false
        })
        .catch(err =>
        {
          console.log("UPLOAD ERROR")
          this.writing = false
        })
    },
    docUpdated (doc) {
      const data = doc.data()
      const dataPoints = []
      for (const uid in data.users) {
        const theUser = data.users[uid]
        const geoPoint = theUser.location
        console.log("SHIT" + geoPoint)
        const coords = {lat: geoPoint.latitude, lng: geoPoint.longitude}
        if (uid == auth.currentUser.uid) {
          if(this.bubbles) {
            this.bubbles.forEach(bubble => {
              if (bubble.user === uid) {
                bubble.bubble.setPosition(coords)
              }
            });
          }
          if (this.myMarker) {
            this.myMarker.setPosition(coords)
          } else {
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
    newMessage()
    {
      this.writing = true;
    },
    updateLocation(position) {
      console.log("ping")
      const coords = {lat: position.coords.latitude, lng: position.coords.longitude}
      if (this.boarded !== null) {
        console.log("pingSHIT")
        const obj = {}
        obj[`users.${auth.currentUser.uid}.location`] = new firebase.firestore.GeoPoint(
          position.coords.latitude,
          position.coords.longitude
        )
        obj[`users.${auth.currentUser.uid}.lastAlive`] = new Date()
        obj[`users.${auth.currentUser.uid}.photoURL`] = auth.currentUser.photoURL
        if (this.route) {
          db.collection('routes').doc(this.route).update(obj)
        }

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
    },
    route () {
      console.log('route change')
      this.load()
    },
    routeName () {
      if (!this.route) return null;
      return this.route.split(':')[1]
    }
  },
}
</script>

<style>
  #map {
  height: 100%;
  padding-bottom: 7rem;
}

.map-overlay-btns {
  position: absolute;
  z-index: 100;
  bottom: 0;
  left: 0;
  right: 0;
  height: 7rem;
}
.map-overlay-btn-group {
  padding: 0 0;
}
.map-overlay-btn-group > .v-btn {
  width: 33%;
  height: 4rem;
  margin: 0;
  flex-grow: 1;
  border-radius: 0;
}
.map-overlay-btn-group > .v-btn:first-child {
  width: 33%;
  height: 4rem;
  border-radius: 0;
}
.map-overlay-btn-group > .v-btn:last-child {
  width: 33%;
  height: 4rem;
  border-radius: 0;
}
.user-icon {
  position: absolute;
  top: -10px;
  left: -10px;
  height: 20px;
  width: 20px;
  border-radius: 10px;
  border-style: solid;
  border-width: 1px;
}
</style>
