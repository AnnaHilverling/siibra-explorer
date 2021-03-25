import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { DatabrowserModule } from "src/atlasComponents/databrowserModule";
import { AuthModule } from "src/auth";
import { ComponentsModule } from "src/components";
import { FabSpeedDialModule } from "src/components/fabSpeedDial";
import { PluginModule } from "src/plugin";
import { UtilModule } from "src/util";
import { ConfigModule } from "../config/module";
import { CookieModule } from "../cookieAgreement/module";
import { HelpModule } from "../help/module";
import { KgTosModule } from "../kgtos/module";
import { ScreenshotModule } from "../screenshot";
import { AngularMaterialModule } from "../sharedModules/angularMaterial.module";
import { TopMenuCmp } from "./topMenuCmp/topMenu.components";
import {QuickTourModule} from "src/ui/quickTour/module";

@NgModule({
  imports: [
    CommonModule,
    UtilModule,
    AngularMaterialModule,
    DatabrowserModule,
    FabSpeedDialModule,
    ComponentsModule,
    CookieModule,
    KgTosModule,
    ConfigModule,
    HelpModule,
    PluginModule,
    AuthModule,
    ScreenshotModule,
    QuickTourModule
  ],
  declarations: [
    TopMenuCmp
  ],
  exports: [
    TopMenuCmp
  ]
})

export class TopMenuModule{}
