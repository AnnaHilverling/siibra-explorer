import { Config as Nehubaconfig } from 'nehuba/exports'

export class FetchedTemplates {
    constructor(){
        this.templates = []
    }
    templates : TemplateDescriptor[];
}

export class LayerProperties{
    constructor(json:any){
        for(let key in this){
            if(json[key]){
                this[key] = json[key]
            }
        }
    }
    type:string = '';
    source:string = '';
    transform:number[][] = [
        [1,0,0,0],
        [0,1,0,0],
        [0,0,1,0],
        [0,0,0,1]
    ]
    shader:string = ''
}

export class LayerDescriptor {
    constructor(name:string,json:any){
        this.name = name
        this.properties = new LayerProperties(json)
    }
    properties : LayerProperties;
    name : string;
    masterOpacity : number = 1.0;

    isShown : boolean = true;
    subPanelShown : boolean = false;
}

export class Property{
    constructor(obj:any){
        try{
            this.name = obj.name
            if( obj.fields ){
                this.fields = obj.fields
            }else if ( obj.getUrl ){
                let self = this
                fetch(obj.getUrl)
                    .then(resp=> {
                        return resp.json()
                    })
                    .then(json=>{
                        self.fields = json
                    })
                    .catch(err=>{
                        throw new Error(err)
                    })
            }else {
                this.fields = {}
            }
        }catch (e) {
            console.log('Error parsing property object',e)
            console.log('Dumping text instead ...')
            this.name = "Text Info"
            this.fields = {
                "raw":JSON.stringify(obj)
            }
        }
    }

    name:string     /* will be displayed as title */
    fields:any      /* will be displayed as key JSON.stringify(value) pair */
                    /* set as an empty set if no values are to be displayed */
    getUrl:string   /* will be called if fields do not exist */

    /* fallback: fields are populated with length zero array */
    /* sample objs to be passed to Property constructor:

    {
        "name"      : "Academic Information",
        "fields"    : {
            "authors"       : "K.A. Person, B.A. Mass",
            "affiliation"   : "FZ Juelich"
        },
        "getUrl"    : "http://www.examples.org/sample/academic"  //will be ignored
    }

    {
        "name"      : "Histological Information",
        "getUrl"    : "http://www.examples.org/sample/histological"
    }
    
    {
        "name"      : "NB: This information is licensed under MIT license."
        "fields"    : []
    }

    */
}

export class TemplateDescriptor {
    constructor(json:any){

        this.name = json.name ? json.name : 'Untitled Template'
        this.useTheme = json.useTheme ? json.useTheme : 'light'
        this.properties = json.properties ? json.properties : []
        this.nehubaId = json.nehubaId ? json.nehubaId : ''

        this.parcellations = json.parcellations && json.parcellations.constructor.name == 'Array' ? json.parcellations.map((json:any)=>new ParcellationDescriptor(json)) : [];
        
        (new Promise((resolve,reject)=>{
            json.nehubaConfig ? 
                resolve(json.nehubaConfig) : 
                json.nehubaConfigURL ? 
                    fetch(json.nehubaConfigURL)
                        .then(res=>res.json())
                        .then(json=>resolve(json))
                        .catch(e=>reject(e)) :
                reject('no nehuba config URL')
        }))
            .then(nehubaConfig=>{
                this.nehubaConfig = nehubaConfig
            })
            .catch(e=>{
                console.log('constructing template error',e)
            })
    }
    name : string;
    useTheme : string;
    parcellations : ParcellationDescriptor[];
    properties : any;
    nehubaId : string;
    
    nehubaConfig : Nehubaconfig;
}

export class ParcellationDescriptor {
    constructor(json:any){
        this.name = json.name
        this.ngId = json.ngId ? json.ngId : ''
        this.regions = json.regions ? json.regions.map((region:any)=>new RegionDescriptor(region,0)) : []
        this.properties = json.properties ? json.properties : []
    }
    regions : RegionDescriptor[];
    name : string;
    getUrl : string;
    properties : any;
    ngId : string;

    isShown : boolean = true;
    masterOpacity : number = 1.00;
    subPanelShown : boolean = false;
    customGLSL : string = ``;

    nehubaConfig : Nehubaconfig;
}

export class PluginDescriptor{
    constructor(param:any){
        this.name = param.name
        this.templateURL = param.templateURL
        this.scriptURL = param.scriptURL
        this.icon = param.icon ? param.icon : null;
    }
    templateURL : string
    scriptURL : string
    name : string
    icon : string | null
}

export class Multilevel{

    name : string; /* should be overwritten by subclasses */

    enabled : boolean = false;

    hierarchy : number;
    parent : Multilevel | undefined;
    children : Multilevel[];
    isExpanded : boolean = false;
    isExpandedString : 'expanded' | 'collapsed' = 'collapsed'
    isVisible : boolean = true

    constructor(){
        this.enabled = false
        this.children = []
    }

    public disableSelfAndAllChildren = ():void => {
        this.enabled = false
        this.children.forEach( child => child.disableSelfAndAllChildren())
    }

    public enableSelfAndAllChildren = ():void => {
        this.enabled = true
        this.children.forEach( child => child.enableSelfAndAllChildren())
    }

    /* used to determine the tick status (selected, unselected, partially selected) */
    public hasDisabledChildren = ():boolean =>
        this.children.length > 0 ?
            this.children.some( child => child.hasDisabledChildren() ) :
            !this.enabled

    public hasEnabledChildren = ():boolean =>
        this.children.length > 0 ?
            this.children.some( child => child.hasEnabledChildren() ) :
            this.enabled

    /* used for searching and filtering tree */
    public hasVisibleChildren = ():boolean => 
        this.children.length > 0 ? 
            this.children.some( child=> this.isVisible || child.hasVisibleChildren()) :
            this.isVisible       
}

export class RegionDescriptor extends Multilevel{

    constructor(json:any,hierachy:number){
        super()
        this.name = json.name
        this.properties = json.properties ? json.properties : []
        this.labelIndex = json.labelIndex ? json.labelIndex : null
        this.hierarchy = hierachy
        this.PMapURL = json.PMapURL ? json.PMapURL : null
        this.position = json.position ? json.position : null
        this.children = json.children && json.children.constructor.name == 'Array' ? json.children.map((region:any)=>new RegionDescriptor(region,hierachy+1)) : []
    }

    children : RegionDescriptor[] = []
    name : string;
    properties : any;
    getUrl: string;
    labelIndex : number;
    position : number[];
    PMapURL : string;
}

export class EventPacket{
    constructor(target:string,id:string,code:number,body:any){
        this.target = target
        this.id = id
        this.code = code
        this.body = body
    }
    target : string     /* possible values: modal | floatingWidget */
    id : string         /* unique identifier for each transaction */
    code : number       /* code to indicate status. use http code for convenience */
    body : any    /* message */
}

export class LabComponent{
    script : HTMLElement
    template : HTMLElement
    name : string
    author : string
    desc : string

    constructor(json:any){
        this.name = json.name ? json.name : 'Untitled';
        this.author = json.author ? json.author : 'No author provided.';
        this.desc = json.desc ? json.desc : 'No description provided.';

        if( json.scriptURL ){
            this.script = document.createElement('script')
            this.script.setAttribute('src',json.scriptURL)
        }

        if( json.templateURL ){
            Promise.race([
                fetch(json.templateURL)
                .then(_template=>{

                })
                .catch(e=>{
                    console.log('error fetching plugin template',e)
                })
            ])
        }
    }
}