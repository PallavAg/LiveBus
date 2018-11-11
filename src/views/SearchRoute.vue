<template>
  <div ref="map" id="map" style="height: 100%;">
  </div>
</template>
<meta name="viewport" content="initial-scale=1.0,
      width=device-width" />
<script>
  import {db} from '@/plugins/firebase'
  import Here, { platform } from "../plugins/heremap"
  export default {
    data() {
      return {
        route: 'silver',
        map: undefined,
        messages: [
        ],
      }
    },
    mounted() {
      const defaultLayers = platform.createDefaultLayers()
      this.map = new Here.Map(
        this.$refs.map,
        defaultLayers.normal.map,
        {
          zoom: 10,
          center: {lat: 43, lng: -89}
        }
      )
      let ui = Here.ui.UI.createDefault(this.map, defaultLayers, 'en-US');
      /*let bubble = new Here.ui.InfoBubble({lat: 43, lng: -89}, {
        content: 'Hello World!'
      });
      ui.addBubble(bubble);*/
      let routeRef = db.collection("routes").doc(this.route);
      routeRef.get()
        .then(doc => {
          if(doc.exists) {
            let data = doc.data();
            for (let uid in data.users) {
              const user = data.users[uid]
              if(user.message) {
                let updated = user.updated;
                if(updated.seconds + 15 > Date.now()/1000)
                {
                  this.messages.push({content:user.message, time: updated.seconds})
                  let bubble = new Here.ui.InfoBubble({lat: user.location.latitude, lng: user.location.longitude}, {
                    content: user.message
                  });
                  ui.addBubble(bubble);
                  setTimeout(()=>
                  {
                    ui.removeBubble(ui)
                  }, 15 *1000 + updated.seconds*1000 - Date.now())
                }
              }
            }
          }
        })
        .catch(err => {
        })
       routeRef.onSnapshot(
        doc => {
          if(doc.exists) {
            let data = doc.data();
            for (let uid in data.users) {
              const user = data.users[uid]
              if(user.message) {
                let updated = user.updated;
                if(this.message && !this.messages.includes({content:user.message, time: updated.seconds})){
                  if (updated.seconds + 15  > Date.now() / 1000) {
                    this.messages.push({content:user.message, time: updated.seconds})
                    let bubble = new Here.ui.InfoBubble({lat: user.location.latitude, lng: user.location.longitude}, {
                      content: user.message
                    });
                    ui.addBubble(bubble);
                    setTimeout(() => {
                      ui.removeBubble(ui)
                    }, 15 * 1000 + updated.seconds*1000 - Date.now())
                  }
                }
              }
            }
          }
        }, err => {
        });


    }
  }
</script>