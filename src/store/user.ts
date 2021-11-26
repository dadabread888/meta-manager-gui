import Vue from 'vue'
import Vuex, {Commit, ActionTree} from 'vuex'
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
    avatar?: string;
}
export interface IUserState {
    currentUser: IUser | null;
    authed:boolean;
}

export const state: IUserState = {
    currentUser: JSON.parse(localStorage.getItem('user') || 'null'),
    authed:false
}

export const mutations = {
    setUser: (currentState: any, user: IUser) => {
        currentState.currentUser = user
    },
    setAuth:(currentState: any, auth: boolean) => {
        currentState.authed = auth
    }
}

export const actions: ActionTree<IUserState, any> = {

    login: async ({ commit }: { commit: Commit }, googleUser:any) => {
        try {  
            const token = googleUser.getAuthResponse().id_token;   
                
            let response = await Vue.axios.post(`${settings.routes.user}/login`, {'token': token});

            const access_token = response.data.access_token

            let user = extract_user_info(googleUser, access_token);

            localStorage.setItem('user', JSON.stringify(user));

            commit('setUser', user); 
            commit('setAuth', response.data.verified); 

        } catch (error:any) {
            console.log(error);

            const msg = 'Unable to login .';
            commit('setUser', null); 
            commit('setAuth', false); 

            catchError(error, msg)
        }
    },

    logout: async ({ commit }) => {
        localStorage.removeItem('user');
        commit('setUser', null); 
        commit('setAuth', false); 
    },

    verifyToken: async ({ state, commit }) => {
        try {
            
            const token = state.currentUser!.token;   
            let response = await Vue.axios.post(`${settings.routes.user}/verify_token`, {'token': token});

            commit('setAuth', response.data.verified); 
            
        } catch (error) {
            const msg = 'Unable to verify token .';
            commit('setUser', null); 
            commit('setAuth', false); 

            catchError(error, msg)
        }

    
    }

}

const namespaced: boolean = true;
const extract_user_info = (googleUser:any, access_token:string) =>{
    
    let email = googleUser.getBasicProfile().getEmail()
    
    let newUser:IUser = {
        email: email,
        fname:googleUser.getBasicProfile().getGivenName(),
        lname: googleUser.getBasicProfile().getFamilyName(),
        fullName : (email.split('@')[0]).toLowerCase(),
        avatar: googleUser.getBasicProfile().getImageUrl(),
        token: access_token,
    }

    return newUser;
}

export const UserStore = {
    namespaced,
    state,
    mutations,
    actions,
}
