import Vue from 'vue'
import { Spy } from './spy';

interface IrequestConfig {
    requestToastId?: string | number;
    showToast?: boolean;
    requestToast: {
        title:string
    };
    responseToast: {
        title:string
    };
    start?: string | number;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    toastConfig: IrequestConfig;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $spyAgent: Spy;
  }
}