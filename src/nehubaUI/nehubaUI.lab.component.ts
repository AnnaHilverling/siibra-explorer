import { Component } from '@angular/core'
import { EventCenter } from './nehubaUI.services'
import { EventPacket } from './nehuba.model'

declare var window:{
      [key:string] : any
      prototype : Window;
      new() : Window;
}

@Component({
      selector : 'lab',
      template : `
<div id = "labContainer">
      <div *ngFor = "let plugin of plugins" (click)="launchPlugin(plugin)" class = "btn btn-default">
            <span *ngIf = "plugin.icon" [ngClass]="'glyphicon-'+plugin.icon" class = "glyphicon"></span> {{plugin.name.split('.')[plugin.name.split('.').length-1]}}
      </div>
      <div (click)="showInputModal()" class = "btn btn-default">
            <span class = "glyphicon glyphicon-plus"></span>
      </div>
</div>
      `
})

export class Lab {

      uix = {
            "name":"fzj.xg.uix",
            "icon":"info-sign",
            "type":"plugin",
            "templateURL":"http://172.104.156.15/html/nehuba_ui_extension",
            "scriptURL":"http://172.104.156.15/js/nehuba_ui_extension"
      }

      jugex = {
            name : 'fzj.xg.jugex',
            templateURL:'http://172.104.156.15/html/jugex.template',
            scriptURL : 'http://172.104.156.15/js/jugex.script'
      }

      constructor(private eventCenter:EventCenter){

      }

      plugins = [this.uix,this.jugex]

      appendPlugin(param:any){
            this.plugins.push(param)
      }

      launchPlugin(param:any){
            if(param.templateURL && param.scriptURL){
                  const requestNewFloatingWidget = new EventPacket('floatingWidgetRelay',Date.now().toString(),100,{})
                  const newSubject = this.eventCenter.createNewRelay(requestNewFloatingWidget)
                  newSubject.next(new EventPacket('lab','',100,param))
            }
            window
      }

      showInputModal(){
            this.eventCenter.modalEventRelay.next(new EventPacket('showInputModal',Date.now().toString(),100,{title:'Add'}))
      }
}
