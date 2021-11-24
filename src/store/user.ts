import Vue from 'vue'
import Vuex, {Commit} from 'vuex'
import settings from '@/api-path';

Vue.use(Vuex)

const catchError = (err:any, msg:string) => {
    if (err && err.data && err.data.message) {
        throw new Error(err.data.message);
    }
    else {
        throw new Error(`${msg} See console for details.`);
    }
}

export interface IUser {
    fname: string;
    lname: string;
    fullName?: string;
    token: string;
    email: string;
    avatar: string;
}
export interface IUserState {
    currentUser: IUser
}

export const state: IUserState = {
    currentUser: {
        fname: '',
        lname: '',
        fullName: '',
        token: '',
        email: '',
        avatar: ''
    }
}

export const mutations = {
    setUser: (currentState: any, user: IUser) => {
        currentState.currentUser = user
    }
}

export const actions = {
    verifyUser: async ({ commit }: { commit: Commit }, googleUser:any) => {
        try {  
            const token = googleUser.getAuthResponse().id_token;      
            console.log(token);
            let response = await Vue.axios.post(`${settings.routes.user}/login`, {'token': token});
            commit('setUser', response.data); 

        } catch (error:any) {
            const msg = 'Unable to login .';
            catchError(error, msg)
        }
    }
}

const namespaced: boolean = true;

export const UserStore = {
    namespaced,
    state,
    mutations,
    actions,
}
