import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { select, Store } from "@ngrx/store";
import { combineLatest, Observable, Subject, merge } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, map, shareReplay, startWith, take, tap, withLatestFrom } from "rxjs/operators";
import { VIEWER_STATE_ACTION_TYPES } from "src/services/effect/effect";
import { CHANGE_NAVIGATION, SELECT_REGIONS } from "src/services/state/viewerState.store";
import { getMultiNgIdsRegionsLabelIndexMap } from "src/services/stateStore.service";
import { LoggingService } from "src/logging";
import { MatDialog } from "@angular/material/dialog";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { PureContantService } from "src/util";
import { viewerStateToggleRegionSelect, viewerStateNavigateToRegion, viewerStateSetSelectedRegions, viewerStateSetSelectedRegionsWithIds } from "src/services/state/viewerState.store.helper";
import { ARIA_LABELS, CONST } from 'common/constants'
import { serialiseParcellationRegion } from "common/util"
import { actionAddToRegionsSelectionWithIds } from "src/services/state/viewerState/actions";

const filterRegionBasedOnText = searchTerm => region => `${region.name.toLowerCase()}${region.status? ' (' + region.status + ')' : null}`.includes(searchTerm.toLowerCase())
  || (region.relatedAreas && region.relatedAreas.some(relatedArea => relatedArea.name && relatedArea.name.toLowerCase().includes(searchTerm.toLowerCase())))

const compareFn = (it, item) => it.name === item.name && it.status === item.status

@Component({
  selector: 'region-text-search-autocomplete',
  templateUrl: './regionSearch.template.html',
  styleUrls: [
    './regionSearch.style.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class RegionTextSearchAutocomplete {

  public renderInputText(regionsSelected: any[]){
    if (!regionsSelected) return ''
    if (regionsSelected.length === 0) return ''
    if (regionsSelected.length === 1) return regionsSelected[0].name || ''
    return CONST.MULTI_REGION_SELECTION
  }

  public manualRenderList$: Subject<any> = new Subject()

  public compareFn = compareFn

  public CLEAR_SELECTED_REGION = ARIA_LABELS.CLEAR_SELECTED_REGION

  @Input() public ariaLabel: string = ARIA_LABELS.TEXT_INPUT_SEARCH_REGION
  @Input() public showBadge: boolean = false
  @Input() public showAutoComplete: boolean = true

  @ViewChild('regionHierarchyDialog', {read: TemplateRef}) public regionHierarchyDialogTemplate: TemplateRef<any>

  public useMobileUI$: Observable<boolean>

  public selectedRegionLabelIndexSet: Set<string> = new Set()

  constructor(
    private store$: Store<any>,
    private dialog: MatDialog,
    private pureConstantService: PureContantService,
    private log: LoggingService
  ) {

    this.useMobileUI$ = this.pureConstantService.useTouchUI$

    const viewerState$ = this.store$.pipe(
      select('viewerState'),
      shareReplay(1),
    )

    this.regionsWithLabelIndex$ = viewerState$.pipe(
      select('parcellationSelected'),
      distinctUntilChanged(),
      filter(p => !!p && p.regions),
      map(parcellationSelected => {
        try {
          const returnArray = []
          const ngIdMap = getMultiNgIdsRegionsLabelIndexMap(parcellationSelected, { ngId: 'root', relatedAreas: [], fullId: null })
          for (const [ngId, labelIndexMap] of ngIdMap) {
            for (const [labelIndex, region] of labelIndexMap) {
              returnArray.push({
                ...region,
                ngId,
                labelIndex,
                labelIndexId: serialiseParcellationRegion({ ngId, labelIndex }),
              })
            }
          }
          return returnArray
        } catch (e) {
          this.log.warn(`getMultiNgIdsRegionsLabelIndexMap error`, e)
          return []
        }
      }),
      shareReplay(1),
    )

    this.regionsSelected$ = viewerState$.pipe(
      select('regionsSelected'),
      distinctUntilChanged(),
      tap(regions => {
        const arrLabelIndexId = regions.map(({ ngId, labelIndex }) => serialiseParcellationRegion({ ngId, labelIndex }))
        this.selectedRegionLabelIndexSet = new Set(arrLabelIndexId)
      }),
      startWith([]),
      shareReplay(1),
    )

    this.autocompleteList$ = combineLatest(
      merge(
        this.manualRenderList$.pipe(
          withLatestFrom(this.regionsSelected$),
          map(([_, selectedRegions]) => this.renderInputText(selectedRegions)),
          startWith('')
        ),
        this.formControl.valueChanges.pipe(
          startWith(''),
          distinctUntilChanged(),
          debounceTime(200),
        )
      ),
      this.regionsWithLabelIndex$.pipe(
        startWith([]),
      ),
    ).pipe(
      map(([searchTerm, regionsWithLabelIndex]) => regionsWithLabelIndex.filter(filterRegionBasedOnText(searchTerm))),
      map(arr => arr.slice(0, 5)),
    )

    this.parcellationSelected$ = viewerState$.pipe(
      select('parcellationSelected'),
      distinctUntilChanged(),
      shareReplay(1),
    )
  }

  public toggleRegionWithId(id: string, removeFlag= false) {
    if (removeFlag) {
      this.store$.dispatch({
        type: VIEWER_STATE_ACTION_TYPES.DESELECT_REGIONS_WITH_ID,
        deselecRegionIds: [id],
      })
    } else {
      this.store$.dispatch(
        actionAddToRegionsSelectionWithIds({
          selectRegionIds : [id],
        })
      )
    }
  }

  public navigateTo(position) {
    this.store$.dispatch({
      type: CHANGE_NAVIGATION,
      navigation: {
        position,
        animation: {},
      },
    })
  }

  public optionSelected(_ev?: MatAutocompleteSelectedEvent) {
    this.store$.dispatch(
      viewerStateSetSelectedRegionsWithIds({
        selectRegionIds: _ev ? [ _ev.option.value ] : []
      })
    )
  }

  private regionsWithLabelIndex$: Observable<any[]>
  public autocompleteList$: Observable<any[]>
  public formControl = new FormControl()

  public filterNullFn(item: any){
    return !!item
  }
  public regionsSelected$: Observable<any>
  public parcellationSelected$: Observable<any>

  @Output()
  public focusedStateChanged: EventEmitter<boolean> = new EventEmitter()

  private _focused: boolean = false
  set focused(val: boolean) {
    this._focused = val
    this.focusedStateChanged.emit(val)
  }
  get focused() {
    return this._focused
  }

  public deselectAllRegions(_event: MouseEvent) {
    this.store$.dispatch({
      type: SELECT_REGIONS,
      selectRegions: [],
    })
  }

  // TODO handle mobile
  public handleRegionClick({ mode = null, region = null } = {}) {
    if (mode === 'single') {
      this.store$.dispatch(
        viewerStateToggleRegionSelect({
          payload: { region }
        })
      )
    }
    if (mode === 'double') {
      this.store$.dispatch(
        viewerStateNavigateToRegion({
          payload: { region }
        })
      )
    }
  }

  public showHierarchy(_event: MouseEvent) {
    // mat-card-content has a max height of 65vh
    const dialog = this.dialog.open(this.regionHierarchyDialogTemplate, {
      height: '65vh',
      panelClass: [
        'col-10',
        'col-sm-10',
        'col-md-8',
        'col-lg-8',
        'col-xl-6',
      ],
    })

    /**
     * keep sleight of hand shown while modal is shown
     *
     */
    this.focused = true

    /**
     * take 1 to avoid memory leak
     */
    dialog.afterClosed().pipe(
      take(1),
    ).subscribe(() => this.focused = false)
  }

  public deselectAndSelectRegion(region: any) {
    this.store$.dispatch(
      viewerStateSetSelectedRegions({
        selectRegions: [ region ]
      })
    )
  }
}
