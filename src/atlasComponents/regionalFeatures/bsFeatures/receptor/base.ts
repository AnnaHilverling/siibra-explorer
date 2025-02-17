import { Directive, Input } from "@angular/core";
import { TBSDetail } from "./type";

@Directive()
export class BsFeatureReceptorBase {
  @Input()
  bsFeature: TBSDetail

  public urls: {
    url: string
    text?: string
  }[] = []

  public error = null

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(){}
}