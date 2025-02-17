import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AngularMaterialModule } from "src/sharedModules";
import { UtilModule } from "src/util";
import { BsFeatureService } from "../service";
import { BsFeatureReceptorAR } from "./ar/autoradiograph.component";
import { BsFeatureReceptorEntry } from "./entry/entry.component";
import { BsFeatureReceptorFingerprint } from "./fp/fp.component";
import { BsFeatureReceptorDirective } from "./hasReceptor.directive";
import { BsFeatureReceptorProfile } from "./profile/profile.component";
import { RECEPTOR_FEATURE_NAME } from "./type";

@NgModule({
  imports: [
    CommonModule,
    UtilModule,
    AngularMaterialModule,
    FormsModule,
  ],
  declarations: [
    BsFeatureReceptorProfile,
    BsFeatureReceptorAR,
    BsFeatureReceptorFingerprint,
    BsFeatureReceptorEntry,
    BsFeatureReceptorDirective,
  ],
  exports: [
    BsFeatureReceptorEntry,
    BsFeatureReceptorDirective,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})

export class BSFeatureReceptorModule{
  constructor(svc: BsFeatureService){
    svc.registerFeature({
      name: RECEPTOR_FEATURE_NAME,
      icon: 'fas fa-info',
      View: BsFeatureReceptorEntry,
      Ctrl: BsFeatureReceptorDirective,
    })
  }
}
