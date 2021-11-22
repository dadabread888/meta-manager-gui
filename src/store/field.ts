import Vue from 'vue'
import Vuex, {Commit} from 'vuex'
// import axios, { AxiosResponse } from 'axios'
import settings from '@/api-path';

Vue.use(Vuex)

const findItemIdx = (items:IFieldItem[], itemId:string) => {
    return items.findIndex(({ id }: { id: string }) => id === itemId);
}

const catchError = (err:any, msg:string) => {
    if (err && err.data && err.data.message) {
        throw new Error(err.data.message);
    }
    else {
        throw new Error(`${msg} See console for details.`);
    }
}

export interface IBio {
    allowedValue?: null | string;
    dataType: null | string;
    default?: null | string;
    display: null | string;
    edit?: null | boolean;
    fieldName: null | string;
    group?: null | string;
    option?: null | string;
    talkTo?: null | string;
    validation?: null | string;
    locked?: boolean;

}

export interface IJournal{
    createdAt: string;
    createdBy: string;
    deletedAt: string;
    deletedBy: string;
    updatedAt: string;
    updatedBy: string;
}

export interface IFieldItem {
    id: string;
    bio: IBio;
    journal:  IJournal;
}

export interface IFieldState {
    items:IFieldItem[]
}
export const state: IFieldState = {
    items: [],
}

export const getter = {
    items: (currentState: IFieldState) => currentState.items,
} 

export const mutations = {
    setItems: (currentState: IFieldState, newItems: IFieldItem[]) => currentState.items = newItems,
    createItem:(currentState: IFieldState, item: IFieldItem) =>  {
        currentState.items.unshift(item);
    },
    updateItem: (currentState: IFieldState, item: IFieldItem) => {
        const items = currentState.items;
        const idx = findItemIdx(items, item.id)
        if (idx > -1) {
            currentState.items[idx] = item;
            Vue.set(currentState.items, idx, item);
        }
        else {
            throw new Error(`Problem updating field item ${item.id}`);
        }

    },
    deleteItem(currentState: IFieldState, itemId: string): void {
        const items = currentState.items;
        const idx = findItemIdx(items, itemId)
        if (idx > -1) {
            items.splice(idx, 1);
        }
        else {
            throw new Error(`Problem removing media item ${itemId}`);
        }
    },
}

export const actions:any = {
    fetch:async ({ commit }: { commit: Commit })=>{
        try {
            let response = await Vue.axios.get(`${settings.routes.database}/items`);
            commit('setItems', response.data); 
        } catch (error:any) {
            const msg = 'Unable to fetch fields.';
            catchError(error, msg)
        }
    },

    create:async ({ commit }: { commit: Commit}, payload: IFieldItem) => {
        try {            
            let response = await Vue.axios.post(`${settings.routes.database}/item`, payload, 
            {
                toastConfig: {
                    showToast: true,
                    requestToast: {
                        title: 'Creating',
                    },
                    responseToast: {
                        title: 'Created!',
                    },
                }
            });
            commit('createItem', response.data);
        } catch (error:any) {
            const msg = 'Unable to create field.';
            catchError(error, msg)
        }
    },

    update:async ({ commit }: { commit: Commit}, payload: IFieldItem) => {
        try {
            const id = payload.id          
              
            let response = await Vue.axios.put(`${settings.routes.database}/item/${id}`, payload, 
                {
                    toastConfig: {
                        showToast: true,
                        requestToast: {
                            title: 'Updating',
                        },
                        responseToast: {
                            title: 'Updated!',
                        },
                    }
                });
            commit('updateItem', response.data);
        } catch (error:any) {
            const msg = 'Unable to update field.';
            catchError(error, msg)
        }
    },
        
    delete:async ({ commit }: { commit: Commit}, payload: IFieldItem) => {
        try {
            const id = payload.id          
            await Vue.axios.delete(`${settings.routes.database}/item/${id}`, 
            {
                data: payload,
                toastConfig: {
                    showToast: true,
                    requestToast: {
                        title: 'Deleting',
                    },
                    responseToast: {
                        title: 'Deleted! Deleted field has moved into glacier storage.',
                    },
                } 
            });
            commit('deleteItem', id);
        } catch (error:any) {
            const msg = 'Unable to delete field.';
            catchError(error, msg)
        }
    }

}
const namespaced: boolean = true;

export const FieldStore = {
    namespaced,
    state,
    mutations,
    actions,
};