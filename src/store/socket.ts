import Vue from 'vue'
import Vuex, {Commit, ActionTree} from 'vuex'
import settings from '@/api-path';

Vue.use(Vuex)

const removeItem = (arr, item) => {
    var index = arr.indexOf(item);    
    if (index !== -1) {
        arr.splice(index, 1);
    }
    return arr
}

const URL_PREFIX = {
    'base': 'ws://localhost:8000/ws',
    'user':'ws://localhost:8000/ws',
    'item':'ws://localhost:8000/ws/item',
}

export let websocketEvents = {
    itemAdded: [],
    itemUpdated: [],
    itemDeleted: [],
    itemLocked:[],
    itemUnLocked:[]
}

export class WebsocketAdaptor {
    public url: string;
    public payload: any;
    public connection: any;

    public constructor(url: string, payload: any) {
        this.url = url;
        this.payload = payload;
        this.connection = new WebSocket(`${URL_PREFIX['base']}/${this.url}`)
    }

    send(){
        let data:any = null;

        this.connection.onmessage = (event) => {
            data = JSON.parse(event.data);
            console.log(data);
            
            Vue.$toast(data.msg)
            
            if (websocketEvents.hasOwnProperty(data.event)){
                if (data.event == 'itemUnLocked') {
                    websocketEvents['itemLocked'] = removeItem(websocketEvents['itemLocked'], data.body.id)
                    websocketEvents[data.event].push(data.body.id);
                } else if(data.event == 'itemLocked'){
                    websocketEvents[data.event].push(data.body.id);
                } 
                else{
                    websocketEvents[data.event].push(data.body);
                }
            }
            
            // console.log(rootState.SocketStore);
            
            
            // Vue.set(events, data.event, data.body);
        }

        this.connection.onopen = (event) => {
            this.connection.send(JSON.stringify(this.payload));
        }

        return data
    }
}

export interface IEventType {
    itemAdded: any[],
    itemUpdated: any[],
    itemDeleted: any[],
    itemLocked:any[]
}

export interface ISocket {
    isConnected: boolean,
    message: string,
    reconnectError: boolean,
}

// export const state:IEventType = {
//     itemAdded: [],
//     itemUpdated: [],
//     itemDeleted: [],
//     itemLocked:[]

// }

export const mutations:any = {
    addTask: (currentState, payload) => {
        let name = payload['event']
        let content = payload['body']
        Vue.set(currentState, name, content)
    }
}

export const actions = {
    itemLock:({commit, rootState}, payload) => {  
        const userId = rootState.UserStore.currentUser.fullName
        
        const itemSocket = new WebsocketAdaptor(`${userId}/${payload.body.id}`, payload) 

        itemSocket.send()
        // console.log(response);        
        // commit('addTask', payload)
    },
    itemChange: ({commit, rootState}, payload) => {  
        const userId = rootState.UserStore.currentUser.fullName
        
        const itemSocket = new WebsocketAdaptor(`${userId}/${payload.id}`, payload) 
        itemSocket.send();    
        // commit('addTask', payload)
    },

    userChange:({commit, rootState}, payload = {}) => {     
        const userId = rootState.UserStore.currentUser.fullName
        const userSocket = new WebsocketAdaptor(userId, payload)
        userSocket.send()
        // console.log(response);
        // commit('addTask', payload)
    },


}

const namespaced: boolean = true;


export const SocketStore = {
    namespaced,
    state:{ websocketEvents: websocketEvents},
    mutations,
    actions,
}
