<template>
  <v-card
    color="red lighten-2"
    dark
  >
    <v-card-title class="headline red lighten-3">
      Bus Route
    </v-card-title>
    <v-card-text>
      Search for bus route
    </v-card-text>

    <v-card-text>
      <v-autocomplete
        v-model="city_model"
        :items="city_items"
        :loading="city_isLoading"
        :search-input.sync="city_search"
        color="white"
        hide-no-data
        hide-selected
        item-text="Description"
        item-value="city"
        label="City"
        placeholder="Search for city"
        prepend-icon="location_city"
        return-object
      ></v-autocomplete>
    </v-card-text>

    <v-card-text>
      <v-autocomplete
        v-model="route_model"
        :items="route_items"
        :loading="route_isLoading"
        :search-input.sync="route_search"
        color="white"
        hide-no-data
        hide-selected
        item-text="Description"
        item-value="route"
        label="Route"
        placeholder="Search for bus route"
        prepend-icon="directions_bus"
        return-object
      ></v-autocomplete>
    </v-card-text>

    <v-card-actions>
        <v-spacer></v-spacer>

        <!-- TODO: GIVE SEARCH ID -->
        <v-btn
        :disabled="!route_model && !city_model"
        color="blue darken-3"
        @click="search()"
      >
        Search
      </v-btn>
      <v-btn
        :disabled="!route_model && !city_model"
        color="grey darken-3"
        @click="route_model = null; city_model = null"
      >
        Clear
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  import axios from 'axios'

  export default {
    data: () => ({
      descriptionLimit: 60,
      route_entries: [],
      route_isLoading: false,
      route_model: null,
      route_search: null,
      city_entries: [],
      city_isLoading: false,
      city_model: null,
      city_search: null,
    }),

    methods: {
      search () {
          console.log("GIMME A RESULT BITCH!")
      }
    },

    computed: {
      fields () {
        if (!this.model) return []

        return Object.keys(this.model).map(key => {
          return {
            key,
            value: this.model[key] || 'n/a'
          }
        })
      },
      route_items () {
        return this.route_entries.map(entry => {
          const Description = entry.Description.length > this.descriptionLimit
            ? entry.Description.slice(0, this.descriptionLimit) + '...'
            : entry.Description

          return Object.assign({}, entry, { Description })
        })
      },
      city_items () {
        return this.city_entries.map(entry => {
          const Description = entry.Description.length > this.descriptionLimit
            ? entry.Description.slice(0, this.descriptionLimit) + '...'
            : entry.Description

          return Object.assign({}, entry, { Description })
        })
      },


    },

    watch: {
      route_search (val) {
        // Items have already been loaded
        if (this.route_items.length > 0) return

        // Items have already been requested
        if (this.route_isLoading) return

        this.route_isLoading = true

        // Lazily load input items
        // TODO: REPLACE THE BUS ROUTE API BELOW
        axios.get('https://api.publicapis.org/entries')
          .then(res => {
            const { count, entries } = res.data
            this.count = count
            this.route_entries = entries
          })
          .catch(err => {
            console.log(err)
          })
          .finally(() => (this.route_isLoading = false))
      },

      city_search (val) {
        // Items have already been loaded
        if (this.city_items.length > 0) return

        // Items have already been requested
        if (this.city_isLoading) return

        this.city_isLoading = true

        // Lazily load input items
        // TODO: REPLACE THE BUS ROUTE API BELOW
        axios.get('https://api.publicapis.org/entries')
          .then(res => {
            const { count, entries } = res.data
            this.count = count
            this.city_entries = entries
          })
          .catch(err => {
            console.log(err)
          })
          .finally(() => (this.city_isLoading = false))
      }
    }
  }
</script>