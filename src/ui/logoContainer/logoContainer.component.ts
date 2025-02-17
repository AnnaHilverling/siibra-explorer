import { Component } from "@angular/core";
import { PureContantService } from "src/util";
import { Subscription } from "rxjs";

@Component({
  selector : 'logo-container',
  templateUrl : './logoContainer.template.html',
  styleUrls : [
    './logoContainer.style.css',
  ],
})

export class LogoContainer {
  // only used to define size
  public imgSrc = `${this.pureConstantService.backendUrl}logo`
  
  public containerStyle = {
    backgroundImage: `url('${this.pureConstantService.backendUrl}logo')`
  }

  private subscriptions: Subscription[] = []
  constructor(
    private pureConstantService: PureContantService
  ){
    this.subscriptions.push(
      pureConstantService.darktheme$.subscribe(flag => {
        this.containerStyle = {
          backgroundImage: `url('${this.pureConstantService.backendUrl}logo${!!flag ? '?darktheme=true' : ''}')`
        }
      })
    )
  }
}
