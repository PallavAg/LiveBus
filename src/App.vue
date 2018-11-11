<template>
  <v-app class="secondary" style="height: 100%">
    <v-toolbar class="primary" dark app>
      <v-toolbar-title class="mx-0 px-0" to="/">
        <v-img
          :src="require('./assets/bus-side-view.svg')"
          contain
          width="55"
          height="40"
        ></v-img>
      </v-toolbar-title>
      <v-toolbar-title class="ml-0 px-0">
        live-bus
      </v-toolbar-title>
      <v-spacer></v-spacer>
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
export default {
  name: 'App',
  methods: {
    newMessage()
    {
      this.$router.push("/newMessage/");
    }
  }
}
</script>
