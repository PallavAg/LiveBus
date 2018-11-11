<template>
  <v-app class="secondary" style="height: 100%">
    <v-toolbar class="primary" dark app>
      <v-toolbar-title class="mx-0 px-0" to="/">
        <v-img
          :src="require('./assets/bus-side-view.svg')"
          contain
          width="55"
        ></v-img>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <search-route></search-route>
      <v-btn icon to="/login" v-if="!user">
        <v-icon>account_circle</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
import SearchRoute from "./components/SearchRoute"
import { auth } from '@/plugins/firebase'
export default {
  name: 'App',
  components: {SearchRoute},
  data () {
    return {
      user: null,
    }
  },
  mounted () {
    auth.onAuthStateChanged(user => {
      this.user = user
    })
  }
}
</script>
