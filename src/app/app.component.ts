import { Component } from '@angular/core';
import * as vis from 'vis-network';

import {Prop, State, StateNode, PropNode} from 'reactive-data-store';
import {visualInspector, VisualInspector} from './build-graph';
import { ReactiveDataStore } from "reactive-data-store";
import {idGenFn, toLabel, idToObject, itemsMap} from 'reactive-data-store';
import {entry, z, c} from './example'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {

  /* VIS-Related Code */
  vI: VisualInspector; 

  /* Core-Related Code */
  reactiveState: ReactiveDataStore;

  ngOnInit() {
    /* Core-Related Code */
    const reactiveState = new ReactiveDataStore(entry);
    this.reactiveState = reactiveState;

    let vI = visualInspector(reactiveState, document.getElementById('mynetwork'));
    this.vI = vI;

    this.bootstrapRevision();
  }

  step() {
    let r = this.lastRevision.next();
    if (r.done === true) {
      this.bootstrapRevision(true);
    } 
  }

  bootstrapRevision(debug: boolean = false, trigger: boolean = false) {
    this.lastRevision = this.reactiveState.revise({
      debug
    });

    if (trigger === true) {
      this.lastRevision.next();
    }
  }

  addPropToZ() {
    const zProp = Prop([z, c], () => {
      return {
        actions: [['SET', z.value * 18 + c.value]],
        value: z.value * 18 + c.value
      }
    }, {}, 'z * 18 + c');
    
    this.reactiveState.appendNode(zProp);
  }

  /* UI-Related */

  /* TODO: Type. Use Generator? */
  lastRevision: any;   
  asNumber: boolean = false;
  selected: number = 1;
  getId(obj: StateNode<any>) {
    return idGenFn(obj)
  }
  toLabel(id?:string) {
    return toLabel(id);
  }
  toLabelFromObject(obj: StateNode<any> | PropNode<any, any, any>) {
    return this.toLabel(`${idGenFn(obj)}`)
  }
  toObject(id: string | number): PropNode<any, any, any> | StateNode<any> {
    return idToObject(`${id}`)
  }
  toggleRevision(n: string, newValue: string, asNumber: boolean) {
    let n2 = Number(n);
    if(this.reactiveState.markedForChange(n2)) {
      this.reactiveState.cancelChange(n2);  
    } else {
      this.reactiveState.addChange(n2, asNumber ? Number(newValue) : newValue)
    }
  }
  
  inRevision(n: string) {
    let n2 = Number(n);
    return this.reactiveState.markedForChange(n2);
  }

  get objects() {
    let keys = itemsMap().keys();
    return Array.from(keys);
  }

  get stateObjects() {
    return this.objects.filter(j => j instanceof State) 
  }

  log(v: any) {
    console.log(v)
  }

}
