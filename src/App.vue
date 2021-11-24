<template>
  <v-app>
    <v-app-bar app>
      <v-progress-linear
        v-if="$spyAgent.status"
        height="15"
        striped
        indeterminate
        color="deep-orange"
        class="progress-bar"
      />
    </v-app-bar>
    <v-main>
      
         <router-view />
      <!-- <v-container>
        <LiveBoss/>
      </v-container> -->
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import LiveBoss from '@/components/LiveBoss.vue';

@Component({
  components:{
    LiveBoss
  }
})
export default class App extends Vue {
}

</script>

<style scoped>
.progress-bar {
  position: fixed !important;
  z-index: 205; /*ensure this is above dialog*/
  top: 0;
  left: 0;
  margin: 0;
  height: 8px;
}
</style>
