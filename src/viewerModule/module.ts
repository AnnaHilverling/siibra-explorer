import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { Observable } from "rxjs";
import { AtlasCmptConnModule } from "src/atlasComponents/connectivity";
import { DatabrowserModule } from "src/atlasComponents/databrowserModule";
import { AtlasCmpParcellationModule } from "src/atlasComponents/parcellation";
import { ParcellationRegionModule } from "src/atlasComponents/parcellationRegion";
import { BSFeatureModule, BS_DARKTHEME,  } from "src/atlasComponents/regionalFeatures/bsFeatures";
import { SplashUiModule } from "src/atlasComponents/splashScreen";
import { AtlasCmpUiSelectorsModule } from "src/atlasComponents/uiSelectors";
import { ComponentsModule } from "src/components";
import { ContextMenuModule } from "src/contextMenuModule";
import { LayoutModule } from "src/layouts/layout.module";
import { AngularMaterialModule } from "src/ui/sharedModules/angularMaterial.module";
import { TopMenuModule } from "src/ui/topMenu/module";
import { UtilModule } from "src/util";
import { VIEWERMODULE_DARKTHEME } from "./constants";
import { NehubaModule, NehubaViewerUnit } from "./nehuba";
import { ThreeSurferModule } from "./threeSurfer";
import { RegionAccordionTooltipTextPipe } from "./util/regionAccordionTooltipText.pipe";
import { ViewerCmp } from "./viewerCmp/viewerCmp.component";
import {UserAnnotationsModule} from "src/atlasComponents/userAnnotations";
import {QuickTourModule} from "src/ui/quickTour/module";
import { INJ_ANNOT_TARGET } from "src/atlasComponents/userAnnotations/tools/type";
import { NEHUBA_INSTANCE_INJTKN } from "./nehuba/util";
import { map } from "rxjs/operators";

@NgModule({
  imports: [
    CommonModule,
    NehubaModule,
    ThreeSurferModule,
    LayoutModule,
    DatabrowserModule,
    AtlasCmpUiSelectorsModule,
    AngularMaterialModule,
    SplashUiModule,
    TopMenuModule,
    ParcellationRegionModule,
    UtilModule,
    AtlasCmpParcellationModule,
    AtlasCmptConnModule,
    ComponentsModule,
    BSFeatureModule,
    UserAnnotationsModule,
    QuickTourModule,
    ContextMenuModule,
  ],
  declarations: [
    ViewerCmp,
    RegionAccordionTooltipTextPipe,
  ],
  providers: [
    {
      provide: BS_DARKTHEME,
      useFactory: (obs$: Observable<boolean>) => obs$,
      deps: [
        VIEWERMODULE_DARKTHEME
      ]
    },
    {
      provide: INJ_ANNOT_TARGET,
      useFactory: (obs$: Observable<NehubaViewerUnit>) => {
        return obs$.pipe(
          map(unit => unit?.elementRef?.nativeElement)
        )
      },
      deps: [
        NEHUBA_INSTANCE_INJTKN
      ]
    }
  ],
  exports: [
    ViewerCmp,
  ],
})

export class ViewerModule{}
