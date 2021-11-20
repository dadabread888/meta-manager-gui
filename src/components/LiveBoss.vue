<template>
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
      <tbody>
        <tr
          v-for="item in items"
          :key="item.name"
        >
          <td v-for="header in tableHeaders" :key="header.text">
            {{item.bio[header.value]}}
          </td>

        </tr>
      </tbody>
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
          v-model="dialog"
          max-width="500px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              dark
              class="mb-2"
              v-bind="attrs"
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
          small
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { Vue, Component} from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { IFieldItem}  from '@/store/field'
const stoField = namespace('FieldStore');

@Component
export default class LiveBoss extends Vue {
  @stoField.State public items!: any[];
  @stoField.Action public fetch!: () => Promise<null>;
  @stoField.Action public create!: (item:any) => Promise<null>;
  @stoField.Action public update!: (item:any) => Promise<null>;
  @stoField.Action public delete!: (id:string) => Promise<null>;

  public dialog:boolean  = false;
  public dialogDelete:boolean = false;

  public blankItem:any = {
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
    },
    journal:{
          active: true,
          createdAt: '',
          createdBy: '',
          deletedAt: '',
          deletedBy: '',
          locked: false,
          updatedAt: '',
          updatedBy: '',
    } 
  }

  public editedItem = Object.assign({}, this.blankItem); 
  public defaultItem = Object.assign({}, this.blankItem);

  public editedIndex:any = -1

  public get formTitle() {
    return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
  }

  public get saveAction () {
    return this.editedIndex > -1 ? 'update': 'create';
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
  }

  public editItem(item:any){
    this.editedIndex = this.items.indexOf(item)
    this.editedItem = Object.assign({}, item)
    this.dialog = true
  }

  public deleteItem(item:any){
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
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

    } catch (error) {
      
    }

    this.close()
  }

  public close () {
    this.dialog = false
    this.$nextTick(() => {
      this.editedItem = Object.assign({}, this.defaultItem)
      this.editedIndex = -1
    })
  }

  public closeDelete () {
    this.dialogDelete = false
    this.$nextTick(() => {
      this.editedItem = Object.assign({}, this.blankItem)
      this.editedIndex = -1
    })
  }

  public  deleteItemConfirm () {
    this.delete(this.editedItem.id);
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