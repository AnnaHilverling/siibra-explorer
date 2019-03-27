import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ComponentsModule } from "../components/components.module";

import { NehubaViewerUnit } from "./nehubaContainer/nehubaViewer/nehubaViewer.component";
import { NehubaContainer } from "./nehubaContainer/nehubaContainer.component";
import { SplashScreen } from "./nehubaContainer/splashScreen/splashScreen.component";
import { LayoutModule } from "../layouts/layout.module";
import { FormsModule } from "@angular/forms";

import { GroupDatasetByRegion } from "../util/pipes/groupDataEntriesByRegion.pipe";
import { filterRegionDataEntries } from "../util/pipes/filterRegionDataEntries.pipe";
import { FileViewer } from "./fileviewer/fileviewer.component";
import { MenuIconsBar } from './menuicons/menuicons.component'

import { ChartsModule } from 'ng2-charts'
import { RadarChart } from "./fileviewer/radar/radar.chart.component";
import { LineChart } from "./fileviewer/line/line.chart.component";
import { GetPropMapPipe } from "../util/pipes/getPropMap.pipe";
import { GetUniquePipe } from "src/util/pipes/getUnique.pipe";

import { DedicatedViewer } from "./fileviewer/dedicated/dedicated.component";
import { LandmarkUnit } from "./nehubaContainer/landmarkUnit/landmarkUnit.component";
import { SafeStylePipe } from "../util/pipes/safeStyle.pipe";
import { PluginBannerUI } from "./pluginBanner/pluginBanner.component";
import { AtlasBanner } from "./banner/banner.component";
import { CitationsContainer } from "./citation/citations.component";
import { LayerBrowser } from "./layerbrowser/layerbrowser.component";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { KgEntryViewer } from "./kgEntryViewer/kgentry.component";
import { SubjectViewer } from "./kgEntryViewer/subjectViewer/subjectViewer.component";
import { GetLayerNameFromDatasets } from "../util/pipes/getLayerNamePipe.pipe";
import { SortDataEntriesToRegion } from "../util/pipes/sortDataEntriesIntoRegion.pipe";

import { SpatialLandmarksToDataBrowserItemPipe } from "../util/pipes/spatialLandmarksToDatabrowserItem.pipe";
import { DownloadDirective } from "../util/directives/download.directive";
import { LogoContainer } from "./logoContainer/logoContainer.component";
import { TemplateParcellationCitationsContainer } from "./templateParcellationCitations/templateParcellationCitations.component";
import { MobileOverlay } from "./nehubaContainer/mobileOverlay/mobileOverlay.component";
import { FilterNullPipe } from "../util/pipes/filterNull.pipe";
import { ShowToastDirective } from "../util/directives/showToast.directive";
import { HelpComponent } from "./help/help.component";
import { ConfigComponent } from './config/config.component'
import { FlatmapArrayPipe } from "src/util/pipes/flatMapArray.pipe";
import { PopoverModule } from 'ngx-bootstrap/popover'
import { DatabrowserModule } from "./databrowserModule/databrowser.module";


@NgModule({
  imports : [
    ChartsModule,
    FormsModule,
    BrowserModule,
    LayoutModule,
    ComponentsModule,
    DatabrowserModule,

    PopoverModule.forRoot(),
    TooltipModule.forRoot()
  ],
  declarations : [
    NehubaContainer,
    NehubaViewerUnit,
    SplashScreen,
    FileViewer,
    RadarChart,
    LineChart,
    DedicatedViewer,
    LandmarkUnit,
    AtlasBanner,
    PluginBannerUI,
    CitationsContainer,
    LayerBrowser,
    KgEntryViewer,
    SubjectViewer,
    LogoContainer,
    TemplateParcellationCitationsContainer,
    MobileOverlay,
    HelpComponent,
    ConfigComponent,
    MenuIconsBar,

    /* pipes */
    GroupDatasetByRegion,
    filterRegionDataEntries,
    GetPropMapPipe,
    GetUniquePipe,
    FlatmapArrayPipe,
    SafeStylePipe,
    GetLayerNameFromDatasets,
    SortDataEntriesToRegion,
    SpatialLandmarksToDataBrowserItemPipe,
    FilterNullPipe,

    /* directive */
    DownloadDirective,
    ShowToastDirective
  ],
  entryComponents : [

    /* dynamically created components needs to be declared here */
    NehubaViewerUnit,
    FileViewer,
    LayerBrowser,
  ],
  exports : [
    SubjectViewer,
    KgEntryViewer,
    CitationsContainer,
    AtlasBanner,
    PluginBannerUI,
    NehubaContainer,
    NehubaViewerUnit,
    LayerBrowser,
    FileViewer,
    LogoContainer,
    TemplateParcellationCitationsContainer,
    MobileOverlay,
    HelpComponent,
    ConfigComponent,
    MenuIconsBar
  ]
})

export class UIModule{

}