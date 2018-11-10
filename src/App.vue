<template>
  <v-app>
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <search-route></search-route>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>


<script>
  import SearchRoute from '@/components/common/SearchRoute';

  export default {
    components: {
      SearchRoute
    }
  }
</script>