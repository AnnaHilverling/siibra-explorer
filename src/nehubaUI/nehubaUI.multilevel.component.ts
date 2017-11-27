import { Input, Component, ViewChildren } from '@angular/core'
import { Multilevel,EventPacket,RegionDescriptor } from './nehuba.model'
import { EventCenter,EVENTCENTER_CONST } from './nehubaUI.services'

@Component({
    selector : 'multilevel',
    templateUrl : 'src/nehubaUI/templates/nehubaUI.multilevel.template.html',
    styles : [` 
        :host >>> span.highlight
        {
        background-color:#770;
        }
    `],
    styleUrls : ['src/nehubaUI/templates/nehubaUI.multilevel.template.css']
})

export class MultilevelSelector {

    @Input() searchTerm : string
    @Input() data : Multilevel[]
    @Input() selectedData : Multilevel[]
    @ViewChildren(MultilevelSelector) childrenMultilevel : MultilevelSelector[]

    constructor(private eventCenter : EventCenter){}

    chooseLevel = (data:Multilevel):void => 
        data.hasEnabledChildren() ? 
            data.disableSelfAndAllChildren() : 
            data.enableSelfAndAllChildren()

    toggleExpansion = (m:Multilevel):boolean => m.isExpanded = !m.isExpanded

    ShowPMap(singleData:RegionDescriptor){
        if (singleData.position){
            this.eventCenter.nehubaViewerRelay.next(
                new EventPacket(
                    EVENTCENTER_CONST.NEHUBAVIEWER.TARGET.NAVIGATE,
                    Date.now().toString(),
                    100,
                    {pos:singleData.position}
                ))
        }
        this.eventCenter.nehubaViewerRelay.next(
            new EventPacket(EVENTCENTER_CONST.NEHUBAVIEWER.TARGET.LOAD_LAYER,'',100,{
                url:singleData.PMapURL,
                title:singleData.name
            }))    
    }

    onScroll = (ev:any)=>{
        this.childrenMultilevel.forEach(multilevel=>{
            multilevel.onScroll(ev)
        })
    }
}