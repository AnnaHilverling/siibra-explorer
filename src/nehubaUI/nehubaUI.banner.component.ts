import { Pipe, PipeTransform,ViewChild,TemplateRef,Output,EventEmitter, Component, AfterViewInit } from '@angular/core'
import { EXTERNAL_CONTROL as gExternalControl, UI_CONTROL, MainController,HELP_MENU } from './nehubaUI.services'
import { RegionDescriptor }from './nehuba.model'
import { ModalHandler } from './nehubaUI.modal.component'

@Component({
  selector : 'atlasbanner',
  templateUrl : 'src/nehubaUI/templates/nehubaBanner.template.html',
  styles : [
    `
    div[bannerContainer]
    {
      position:relative;
      height:0px;
      padding-bottom:1px;

      display:flex;
    }
    img[hbplogo]
    {
      height:6em;
      pointer-events:none;
      display:inline-block;
      padding:0px;
      margin:1em;
      box-sizing:border-box;

      flex:0 0 auto;
    }
    div
    {
      display:inline-block;
    }
    div > *
    {
      display:inline-block;
    }
    div[textContainer]
    {
      vertical-align:top;
      margin-top:1em;
      flex: 1 1 auto;
    }
    div[textContainer] > div
    {
      display:inline-block
    }
    div[editBtn]
    {
      height:34px;
      box-sizing:border-box;
      padding:2px;
      position:relative;
      margin-left:-2.5em;
      z-index:9;
    }
    div[editBtn]:before
    {
      content:'';
      height:100%;
      width:0px;
      vertical-align:middle;
      display:inline-block;
    }
    [btnCustom]
    {
      border-radius : 0px;
    }
    
    ul li.selected a:before
    {
      content: '\u2022';
      width : 1em;
      display:inline-block;
    }

    div[modeSelection]
    {
      vertical-align : top;
      width:20em;
    }

    div[inputSearchRegion]
    {
      vertical-align : top;
      width:20em;
    }
    span[glyphiconShowHelp]
    {
      
    }

    `
  ]
})

export class NehubaBanner implements AfterViewInit {
  darktheme : boolean
  @Output() showRegionDialog : EventEmitter<any> = new EventEmitter()
  @ViewChild('searchRegion',{read:TemplateRef}) searchRegion : TemplateRef<any>
  @ViewChild('selectMode',{read:TemplateRef}) searchMode : TemplateRef<any>
  hbpimg : string = 'src/assets/images/HBP_Primary_RGB_BlackText.png'
  hbpimgdark : string = 'src/assets/images/HBP_Primary_RGB_WhiteText.png'

  showTemplateSelection : boolean = false
  widgetiseSearchRegion : boolean = false

  searchTerm : string = ``

  /* viewing mode variables */
  listOfActivities : string[] = []
  showListOfActivities : boolean = false
  searchActivityTerm : string = ``
  Array = Array

  constructor(public mainController:MainController){
    // this.mainController.unwidgitiseSearchRegion = (templateRef:TemplateRef<any>)=>{
    //   templateRef
    //   this.widgetiseSearchRegion = false
    // }

    this.mainController.onParcellationSelectionHook.push(()=>{
      this.listOfActivities = Array.from(this.mainController.regionsLabelIndexMap.values())
        .reduce((prev:string[],curr:RegionDescriptor)=>
            prev.concat(curr.moreInfo.filter(info=> info.name != 'Go To There' && prev.findIndex(i=>i==info.name) < 0).map(i=>i.name))
          ,[])
    })
  }

  widgetiseSearchRegionComponent(){
    this.widgetiseSearchRegion = true
    const widgitComponent = this.mainController.widgitiseTemplateRef(this.searchRegion,{name:'Search Region',onShutdownCleanup : ()=>{
      this.widgetiseSearchRegion = false
      widgitComponent.parentViewRef.destroy()
      if(this.mainController.nehubaViewer)this.mainController.nehubaViewer.redraw()
    }})
    widgitComponent.changeState("floating")
  }

  parseSrcToBGUrl(str:string){
    return `url('${str}')`
  }

  ngAfterViewInit(){
    UI_CONTROL.afterTemplateSelection(()=>{
      this.darktheme = gExternalControl.metadata.selectedTemplate ? gExternalControl.metadata.selectedTemplate.useTheme == 'dark' : false
    })
  }

  showRegion(){
    if(this.mainController.selectedTemplate && this.mainController.selectedParcellation){
      this.showRegionDialog.emit()
    }
  }

  focusSearchInput(){
    console.log('focus search input')
    // console.log('atlascontrol click',ev)
  }

  /* viewing mode functions */
  clearSearchActivityTerm(){
    this.searchActivityTerm = ''
    this.showListOfActivities = false
  }
  
  selectViewingMode(activity?:string){
    let newActivity
    if(activity){
      newActivity = activity
    }else{
      const newPipe = new PrependNavigate()
      const newP2 = new SearchPipe()
      const filter = newP2.transform(newPipe.transform(this.listOfActivities),this.searchActivityTerm)
      if(filter.length > 0) { 
        newActivity = filter[0] 
      }else{
        newActivity = this.mainController.viewingMode
      }
    }
    
    this.clearSearchActivityTerm()
    this.mainController.setMode(newActivity)
  }

  showhelp(){
    const modalHandler = <ModalHandler>UI_CONTROL.modalControl.getModalHandler()
    modalHandler.title = `<h4>Help</h4>`
    modalHandler.body = HELP_MENU
    modalHandler.footer
    modalHandler.show()
  }
}


@Pipe({
  name:'prependNavigatePipe'
})

export class PrependNavigate implements PipeTransform{
  public transform(array:string[]):string[]{
    return ['navigation (default mode)', ... array,'Querying Landmarks']
  }
}


@Pipe({
  name:'searchPipe'
})

export class SearchPipe implements PipeTransform{
  regExp : RegExp

  public transform(array:string[],searchTerm:string){

    let sanitaized = searchTerm.replace(/[^\w\s]/gi, '')
    this.regExp = new RegExp(sanitaized,'gi')

    return searchTerm == '' ? 
      array : 
      array
        .filter( (item) => {
          return this.regExp.test(item)
        })
  }
}

@Pipe({
  name : 'mapToValuePipe'
})

export class MapToValuePipe implements PipeTransform{
  public transform(map:Map<any,any>):any[]{
    return Array.from(map.values()).map(re=>re.moreInfo)
  }
}

@Pipe({
  name : 'concatFlattenArrayPipe'
})

export class ConcatFlattenArrayPipe implements PipeTransform{
  public transform(array:any[]):any[]{
    return array.reduce((acc:any[],curr)=>acc.concat(curr),[])
  }
}

@Pipe({
  name : 'uniquefyPipe'
})

export class UniquefyPipe implements PipeTransform{
  public transform(array:any[]):any[]{

    return array.reduce((acc:any[],curr)=> 
      acc.findIndex(it=>it==curr.name) >= 0 ? 
        acc : 
        curr.name == 'Go To There' ?
          acc :
          acc.concat(curr.name)
      ,[])
  }
}