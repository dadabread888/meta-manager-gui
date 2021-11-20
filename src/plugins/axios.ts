import axios from 'axios';
import Vue from 'vue';
import {spyAgent} from './spy'

axios.interceptors.request.use(
  (request) => {
    
    request.toastConfig = {
      showToast: false, // may be overwritten in next line
      ...(request.toastConfig || {}),
      start: Date.now(),
    };

    spyAgent.startMission(request.url);    

    if (request.toastConfig.showToast) {
      request.toastConfig.requestToastId = Vue.$toast(
        request.toastConfig.requestToast.title, { timeout: false }
      );      
    }

    return request;
  },
);

axios.interceptors.response.use(
  (response:any) => {
    
    const now = Date.now();
    const request = response.config;
    const duration = now - request.toastConfig.start
    console.info(`Api Call ${request.url} took ${duration}ms`);
    
    if (request.toastConfig.requestToastId != undefined) {
      Vue.$toast.dismiss(request.toastConfig.requestToastId);
    }
    
    spyAgent.endMission(request.url);

    if (request.toastConfig.showToast && request.toastConfig.responseToast) {
      Vue.$toast.success(`${request.toastConfig.responseToast.title} - ${duration}ms`);
    }
    return response;
  },
  (error:any) => {
        Promise.reject(error);
        let errorConfig = error.config;

        spyAgent.endMission(errorConfig.url);

        Vue.$toast.dismiss(errorConfig.toastConfig.requestToastId);        
        Vue.$toast.error(`${error}`);
    },
);

export default axios;