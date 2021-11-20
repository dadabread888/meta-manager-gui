import { Component, Vue } from 'vue-property-decorator';
import _Vue from 'vue';

@Component
export class Spy extends Vue {
    public missionList:string[] = [];

    get status() {
      return this.missionList.length > 0;
    }

    public startMission(mission:any){
        this.missionList.push(mission);
    }
    
    public endMission(mission:any){
        const found = this.missionList.findIndex(targetMission => targetMission === mission);
        if (found >= 0) {
            this.missionList.splice(found, 1);
        }
    }
}

export const spyAgent = new Spy();

export default (localVue: typeof _Vue): void => {
  localVue.prototype.$spyAgent = spyAgent;
};
