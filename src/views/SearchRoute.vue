<template>
  <div ref="map" id="map" style="height: 100%;">
  </div>
</template>
<script>
  import {db} from '@/plugins/firebase'
  import Here, { platform } from "../plugins/heremap"
  export default {
    data()
    {
      return{
        route:"w4avnsE14vXMhUFKeHZp3zlldJ72",
        map:undefined
      }
    },
    mounted()
    {
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
      db.collection("routes").doc(this.route).collection("users").where("updated","<",Date.now()).get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            let bubble = new Here.ui.InfoBubble(doc.data().location, {
              content: doc.data().message
            });
            ui.addBubble(bubble);
          });
        })
        .catch(err => {
        })
      db.collection("routes").doc(this.route).collection("users").where("updated","<",Date.now()).onSnapshot(doc => {
          if (change.type === 'modified') {
            let bubble = new Here.ui.InfoBubble(doc.data().location, {
              content: doc.data().message
            });
            ui.addBubble(bubble);
          }
        }, err => {
          console.log(`Encountered error: ${err}`);
        });
    },
    methods: [{
    }]
</script>