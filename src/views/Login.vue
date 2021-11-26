<template>

    <v-container fluid fill-height fill-width>
        <v-layout align-center justify-center>
            <particles-bg 
                id="particles" 
                type="cobweb" 
                :canvas="{backgroundColor:'#888'}" 
                :bg="true"
                :config="config"
            />
            <v-btn 
                dark 
                x-large 
                color="grey darken-3" 
                elevation="7" 
                @click="signin"
            >Login</v-btn>
        </v-layout>

    </v-container>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const stoLogin = namespace('UserStore');

@Component
export default class Login extends Vue {
    @stoLogin.Action public login!: (user:any) => Promise<null>;
    public config = {
        num: [4, 7],
        rps: 0.5,
        radius: [5, 40],
        life: [.5, 3],
        v: [2, 3],
        tha: [-30, 30],
        body: "icon",
        alpha: [0., 0],
        scale: [0.1, 0.4],
        position: "all",
        cross: "dead",
        random: 15
    }

    public async signin(){
        const googleUser = await this.$gAuth.signIn()
        await this.login(googleUser);
    }
}
</script>
<style scoped>
#particles{
    z-index: 0 !important;
    background-color: rgb(136 136 136 / 0%) !important;
}
</style>