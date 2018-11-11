<template>
  <v-card
    color="red lighten-2"
    dark
  >
    <v-card-title class="headline red lighten-3" >
      {{ nearest_station !== null ? nearest_station.name : "Bus Route" }}
    </v-card-title>
    <v-card-text>
      Search for bus route
    </v-card-text>

    <v-card-text>
      <v-autocomplete
        v-model="route_model"
        :items="route_items"
        :search-input.sync="route_search"
        color="white"
        hide-no-data
        hide-selected
        item-text="name"
        item-value="route"
        label="Route"
        placeholder="Search for bus route"
        prepend-icon="directions_bus"
        return-object
      ></v-autocomplete>
    </v-card-text>

    <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
        :disabled="!route_model"
        color="blue darken-3"
        v-on:click="search"
      >
        Search
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  import axios from 'axios'
  import * as hash from 'object-hash'
  import { db } from '../../plugins/firebase'
  import { HERE_APP_ID, HERE_APP_CODE }  from '@/constants'

  export default {
    data: () => ({
      route_entries: [],
      route_model: null,
      route_search: null,
      nearest_station: null,
      stations: []
    }),

    methods: {
      search () {
        let id = hash(this.nearest_station.city + 
                      this.nearest_station.state + 
                      this.nearest_station.ccode + 
                      this.route_model)

        // query lines info
        axios.get('https://transit.api.here.com/v3/lines/by_stn_id.json' + 
        '?app_id=' + HERE_APP_ID + 
        '&app_code=' + HERE_APP_CODE +  
        '&stnId=' + this.nearest_station.id +  
        '&graph=1' +
        '&max=20')

        .then(res => {
          const info = res.data.Res
          
          db.collection('routes').doc(id).set(info)
          .then(docRef => {})
          .catch(err => {})
        })
        .catch(err => {
          console.log(err)
        })


        // redirect to the next page
        this.$router.push('/routes/' + id)
      }
    },

    mounted () {
      navigator.geolocation.watchPosition(pos => {
        axios.get('https://transit.api.here.com/v3/stations/by_geocoord.json' + 
          '?center=' + pos.coords.latitude +
          '%2C' + pos.coords.longitude + 
          '&radius=350' + 
          '&app_id=' + HERE_APP_ID + 
          '&app_code=' + HERE_APP_CODE)

        .then(res => {
          const stations = res.data.Res.Stations.Stn
          let closestStation = stations.reduce((prev, curr) => prev.distance < curr.distance ? prev : curr)
          this.stations = stations
          this.nearest_station = closestStation
        })
        .catch(err => {
          console.log(err)
        })
      })
    },

    computed: {
      route_items () {
        let routes = []

        if (this.stations !== null) {
          this.stations.forEach(entry => {
            let transport = entry.Transports.Transport
            
            transport.forEach(route => {
              if (!routes.includes(route.name))
                routes.push(route.name)
            })
          })
          return routes
        }
      },
    },

    watch: {
      route_search () {
        // Items have already been loaded
        if (this.route_items.length > 0) return
      },
    }
  }
</script>