<template>
  <v-container>
    <v-data-table
      :headers="tableHeaders"
      :footer-props="{itemsPerPageOptions:[20,30,-1]}"
      :items="items"
      :single-expand="singleExpand"
      :expanded.sync="expanded"
      item-key="id"
      show-expand
      class="elevation-1"
    >
      <template v-slot:header="{ props }">
        <th v-for="header in props.headers" :key="header.text" class="text-capitalize"/>
      </template>
      <!-- <template v-slot:body="{ items }"  >
          <tr
            v-for="item in items"
            :key="item.name"
          >
            <td v-for="header in tableHeaders" :key="header.text">
              {{item.bio[header.value]}}
            </td>

          </tr>
      </template> -->
      <!-- <template v-slot:item="{ item }">
        <tr> 
            <td>
              test
              <v-icon></v-icon>
            </td>    
            <td v-for="header in metadataHeader" :key="header.text">
              {{item.bio[header.value]}}
            </td>
        </tr>
      </template> -->
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>LiveBoss Data Table</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-switch
            v-model="singleExpand"
            label="Single expand"
            class="mt-2"
          ></v-switch>
          <v-spacer></v-spacer>
          <v-dialog
            persistent
            v-model="dialog"
            max-width="500px"
          >
            <template v-slot:activator="{ on }">
              <v-btn
                color="primary"
                dark
                class="mb-2"
                v-on="on"
              >
                New Item
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col 
                      v-for="header in metadataHeader" 
                      :key="header.text"
                      cols="12"
                      sm="6"
                      md="4">
                      <v-text-field
                        v-model="editedItem.bio[header.field]"
                        :label="header.text"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="close"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="save"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:[`item.bio.validation`]="{ item }">
        <v-chip
          :color="setCellColor(item.bio.validation)"
          dark
        >
          {{ fillData(item.bio.validation) }}
        </v-chip>
      </template>

      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          More info about: <span class="text-capitalize">{{ item.bio.display }}</span>
        </td>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon
            v-if="item.bio.locked"
            small
          >
            fa-solid fa-user-lock
          </v-icon>
        <v-flex v-else>
          <v-icon
            small
            class="mr-2"
            @click="editItem(item)"
          >
            fa-solid fa-pencil
          </v-icon>
          <v-icon
            small
            @click="deleteItem(item)"
          >
            fa-solid fa-trash-can
        </v-icon>
        </v-flex>
      </template>

    </v-data-table>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Watch} from 'vue-property-decorator';
import { namespace } from 'vuex-class';
const stoField = namespace('FieldStore');
const stoUser = namespace('UserStore');
const stoSocket = namespace('SocketStore');

const clone = (a:any) => JSON.parse(JSON.stringify(a));

@Component
export default class LiveBoss extends Vue {
  @stoField.State public items!: any[];
  @stoField.Action public fetch!: () => Promise<null>;
  @stoField.Action public create!: (item:any) => Promise<null>;
  @stoField.Action public update!: (item:any) => Promise<null>;
  @stoField.Action public delete!: (id:string) => Promise<null>;
  @stoUser.State public currentUser!:any;

  @stoSocket.State public websocketEvents!:any;
  @stoSocket.Action public itemLock!: (userId: string) => Promise<null>;
  // @stoSocket.Action public itemUnLock!: (userId: string) => Promise<null>;

  public dialog:boolean  = false;
  public dialogDelete:boolean = false;

  public BLANK_ITEM:any = {
    id: '',
    bio:{
        allowedValue: null,
        dataType: null,
        default: null,
        display: null,
        edit: false,
        fieldName: null,
        group: null,
        option: null,
        talkTo: null,
        validation: null,
        locked: false,
    },
    journal:{
          createdAt: '',
          createdBy: '',
          updatedAt: '',
          updatedBy: '',
          deletedAt: '',
          deletedBy: '',
    } 
  }
  
  public BLANK_ITEM_TEST:any = {
    id: '',
    bio:{
        allowedValue: '',
        dataType: '',
        default: '',
        display: '',
        edit: false,
        fieldName: '',
        group: '',
        option: '',
        talkTo: '',
        validation: '',
        locked: false,
    },
    journal:{
          createdAt: '',
          createdBy: '',
          deletedAt: '',
          deletedBy: '',
          updatedAt: '',
          updatedBy: '',
    } 
  }
  public editedItem = clone(this.BLANK_ITEM); 
  public defaultItem = clone(this.BLANK_ITEM); 

  public editedIndex:any = -1

  public get formTitle() {
    return this.editedIndex === -1 ? 'New Item' : 'Edit Item';
  }

  public get saveAction () {    
    return this.editedIndex === -1 ? 'create': 'update' ;
  }

  public setCellColor(fieldValue:any){    
    if (fieldValue != null && fieldValue.includes('required')){
      return 'success'
    } else if (fieldValue != null){
      return 'warning'
    }
    return ''
  }
  public expanded = []

  public singleExpand = false

  public metadataHeader:any = [
     { 
      text: 'Field Name', 
      value: 'bio.fieldName',
      field:'fieldName',
    },
    { 
      text: 'Display Name',
      align: 'start',
      sortable:'false',
      value:'bio.display',
      field:'display',
    },
    { 
      text: 'Data Type', 
      value: 'bio.dataType',
      field:'dataType',
    },
    { 
      text: 'Default Value', 
      value: 'bio.default',
      field:'default',
    },
    { 
      text: 'Validation', 
      value: 'bio.validation',
      field:'validation',
    },
    { 
      text: 'Description', 
      value: 'bio.description',
      field:'description', 
    },
    { 
      text: 'Relationship', 
      value:'bio.talkTo',
      field:'talkTo',
    },
  ]

  public utilHeader:any = [
    { 
      text: 'Actions', 
      value: 'actions', 
      sortable: false 
    },
  ]

  public get tableHeaders():any{
    return this.metadataHeader.concat(this.utilHeader);    
  }
  private async mounted(){
    await this.fetch();
    this.onItemLocked(this.websocketEvents.itemLocked);
  }

  public editItem(item:any){
    this.editedIndex = this.items.indexOf(item)
    this.editedItem = Object.assign({}, item)
    this.dialog = true
    
    let payload:any = {
        'event': 'itemLocked',
        'body': {'id': item.id},
        'msg': `${this.currentUser.fullName} is editing ${item.id}`
    }
    this.itemLock(payload);
  }

  // @Watch('websocketEvents.itemUnLocked',{immediate:true, deep: true})
  @Watch('websocketEvents.itemLocked',{immediate:true, deep: true})
  private onItemLocked(value){
    // console.log('item locked',websocketEvents.itemLocked);
    this.$nextTick(() =>{
      this.websocketEvents.itemLocked.forEach(id => {
        this.items.forEach(item => {
          if (item.id == id) {
            item.bio.locked = true
          }
        })
      })
    })

    // this.websocketEvents.itemLocked.filter(item => !this.websocketEvents.itemLocked.includes(item))  
  }
  
  @Watch('websocketEvents.itemUnLocked',{immediate:true, deep: true})
  private onItemUnLocked(value){
    // console.log('item unlocked::::', websocketEvents.itemUnLocked);
    this.websocketEvents.itemUnLocked.forEach(id => {
      this.items.forEach(item => {
        if (item.id == id) {
          item.bio.locked = false
        }
      })
      this.websocketEvents.itemUnLocked = []
    })

  }


  public deleteItem(item:any){
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
      let payload:any = {
          'event': 'itemLocked',
          'body': {'id': item.id},
          'msg': `${this.currentUser.fullName} is editing ${item.id}`
      }
      this.itemLock(payload);
  }

  public async save(){
    
    // if (this.editedIndex > -1) {
    //   Object.assign(this.items[this.editedIndex], this.editedItem)
    // } else {
    //   this.items.push(this.editedItem)
    // }
    try {
      if (this.saveAction == "create") {
        await this.create(this.editedItem);
      } else{
        await this.update(this.editedItem);
      }
      this.close()
    } catch (error) {
      console.log(error);
    }
  }

  public close () {
    let payload:any = {
        'event': 'itemUnLocked',
        'body': {'id': this.editedItem.id},
        'msg': `${this.currentUser.fullName} finished editing ${this.editedItem.id}`
    }
    this.itemLock(payload);
    this.dialog = false    
    this.editedItem = clone(this.BLANK_ITEM); 
    this.editedIndex = -1
  }

  public closeDelete () {
    this.dialogDelete = false
    this.$nextTick(() => {
      this.editedItem = clone(this.BLANK_ITEM); 
      this.editedIndex = -1
    })
  }

  public deleteItemConfirm () {
    this.delete(this.editedItem);
    // this.items.splice(this.editedIndex, 1)
    this.closeDelete()
  }

  public fillData (info:any) {
    if(!info){
      return 'None'
    }
    return info
  }

}
</script>
<style scoped>
.hide{
  display: none;
}
</style>
