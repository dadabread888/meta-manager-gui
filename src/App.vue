<template>
  <v-app>
      <v-progress-linear
        v-if="$spyAgent.status"
        height="15"
        striped
        indeterminate
        color="deep-orange"
        class="progress-bar"
      />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const stoUser = namespace('UserStore');

@Component
export default class App extends Vue {
  @stoUser.Action public verifyToken!: () => Promise<null>;
  @stoUser.State public authed!:boolean;

  @Watch('authed')
  private onAuthChange(){
    if(this.authed) {
      Object.assign(this.$route.query, { redirect: 'liveboss'});
    }
    this.$router.push(this.$route.query.redirect as string);
  }

  private async mounted(){
    await this.verifyToken()
  }
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
