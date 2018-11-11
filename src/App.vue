<template>
  <v-app class="secondary">
    <v-toolbar class="primary" app>
      <v-toolbar-title class="mx-0 px-0" to="/">
        <v-img
          :src="require('./assets/bus-side-view.svg')"
          contain
          width="55"
        ></v-img>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <search-route></search-route>
      <v-btn icon to="/login">
        <v-icon>account_circle</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
import SearchRoute from "./components/common/SearchRoute";
export default {
  name: 'App',
  components: {SearchRoute},
  data () {
    return {
      //
    }
  }
}
</script>
