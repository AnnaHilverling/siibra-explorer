import { Component, Input, OnChanges, ViewChild, ElementRef } from "@angular/core";

@Component({
  selector : 'readmore',
  templateUrl : './readmore.template.html',
  styleUrls : [
    './readmore.style.css'
  ]
})

export class ReadmoreComponent implements OnChanges{
  @Input() collapsedHeight : number = 45
  @Input() show : boolean = false
  @ViewChild('content') contentContainer : ElementRef
  
  ngOnChanges(){
    
  }

  private toggle(event:MouseEvent){
    this.show = !this.show
    event.stopPropagation()
    event.preventDefault()
  }

  get contentContainerMaxHeight(){
    return this.show ? 
      `9999px` :
      `${this.collapsedHeight}px`
  }
}