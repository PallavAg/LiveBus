<template>
  <v-autocomplete
    solo-inverted
    single-line
    v-model="route_model"
    :items="route_items"
    :search-input.sync="route_search"
    hide-no-data
    hide-selected
    item-text="name"
    item-value="route"
    placeholder="Search for bus route"
    return-object
  ></v-autocomplete>
</template>

<script>
  import axios from 'axios'
  import * as hash from 'object-hash'
  import { db } from '../plugins/firebase'
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
                      this.nearest_station.ccode) + ':' + this.route_model

        // query lines info
        const docRef = db.collection('routes').doc(id)
        axios.get('https://transit.api.here.com/v3/lines/by_stn_id.json' +
        '?app_id=' + HERE_APP_ID +
        '&app_code=' + HERE_APP_CODE +
        '&stnId=' + this.nearest_station.id +
        '&graph=1' +
        '&max=20')
        .then(res => {
          return docRef.get()
            .then(async doc => {
              if (!doc.exists) {
                const info = res.data.Res
                await docRef.set(info)
              }
              this.$router.replace('/routes/' + id)
            })
        })
        .catch(err => {
          console.log(err)
        })


        // redirect to the next page

      }
    },

    mounted () {
      navigator.geolocation.getCurrentPosition(pos => {
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
      route_model () {
        this.search()
      }
    }
  }
</script>
