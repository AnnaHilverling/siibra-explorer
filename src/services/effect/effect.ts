import { Injectable, OnDestroy } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { select, Store } from "@ngrx/store";
import { merge, Observable, Subscription, combineLatest } from "rxjs";
import { filter, map, shareReplay, switchMap, take, withLatestFrom, mapTo, distinctUntilChanged } from "rxjs/operators";
import { LoggingService } from "src/logging";
import { IavRootStoreInterface, recursiveFindRegionWithLabelIndexId } from '../stateStore.service';
import { viewerStateNewViewer, viewerStateSelectAtlas, viewerStateSetSelectedRegionsWithIds, viewerStateToggleLayer } from "../state/viewerState.store.helper";
import { deserialiseParcRegionId, serialiseParcellationRegion } from "common/util"
import { getGetRegionFromLabelIndexId } from 'src/util/fn'
import { actionAddToRegionsSelectionWithIds, actionSelectLandmarks, viewerStateSelectParcellation, viewerStateSelectRegionWithIdDeprecated, viewerStateSetSelectedRegions } from "../state/viewerState/actions";

@Injectable({
  providedIn: 'root',
})
export class UseEffects implements OnDestroy {

  @Effect()
  setRegionsSelected$: Observable<any> 

  constructor(
    private actions$: Actions,
    private store$: Store<IavRootStoreInterface>,
    private log: LoggingService,
  ) {

    this.regionsSelected$ = this.store$.pipe(
      select('viewerState'),
      select('regionsSelected'),
      shareReplay(1),
    )

    this.setRegionsSelected$ = combineLatest(
      this.actions$.pipe(
        ofType(viewerStateSetSelectedRegionsWithIds),
        map(action => {
          const { selectRegionIds } = action
          return selectRegionIds
        })
      ),
      this.store$.pipe(
        select('viewerState'),
        select('parcellationSelected'),
        filter(v => !!v),
        distinctUntilChanged()
      ),
    ).pipe(
      map(([ids, parcellation]) => {
        const getRegionFromlabelIndexId = getGetRegionFromLabelIndexId({ parcellation })
        const selectRegions = !!ids && Array.isArray(ids)
          ? ids.map(id => getRegionFromlabelIndexId({ labelIndexId: id })).filter(v => !!v)
          : []
          /**
           * only allow 1 selection at a time
           */
        return viewerStateSetSelectedRegions({
          selectRegions: selectRegions.slice(0,1)
        })
      })
    )

    this.onDeselectRegionsWithId$ = this.actions$.pipe(
      ofType(ACTION_TYPES.DESELECT_REGIONS_WITH_ID),
      map(action => {
        const { deselecRegionIds } = action as any
        return deselecRegionIds
      }),
      withLatestFrom(this.regionsSelected$),
      map(([ deselecRegionIds, alreadySelectedRegions ]) => {
        const deselectSet = new Set(deselecRegionIds)
        return viewerStateSetSelectedRegions({
          selectRegions: alreadySelectedRegions
            .filter(({ ngId, labelIndex }) => !deselectSet.has(serialiseParcellationRegion({ ngId, labelIndex }))),
        })
      }),
    )

    this.addToSelectedRegions$ = this.actions$.pipe(
      ofType(actionAddToRegionsSelectionWithIds.type),
      map(action => {
        const { selectRegionIds } = action
        return selectRegionIds
      }),
      switchMap(selectRegionIds => this.updatedParcellation$.pipe(
        filter(p => !!p),
        take(1),
        map(p => [selectRegionIds, p]),
      )),
      map(this.convertRegionIdsToRegion),
      withLatestFrom(this.regionsSelected$),
      map(([ selectedRegions, alreadySelectedRegions ]) => {
        return viewerStateSetSelectedRegions({
          selectRegions: this.removeDuplicatedRegions(selectedRegions, alreadySelectedRegions),
        })
      }),
    )
  }

  private regionsSelected$: Observable<any[]>

  public ngOnDestroy() {
    while (this.subscriptions.length > 0) {
      this.subscriptions.pop().unsubscribe()
    }
  }

  private subscriptions: Subscription[] = []

  private parcellationSelected$ = this.actions$.pipe(
    ofType(viewerStateSelectParcellation.type),
  )


  private updatedParcellation$ = this.store$.pipe(
    select('viewerState'),
    select('parcellationSelected'),
    map(p => p.updated ? p : null),
    shareReplay(1),
  )

  @Effect()
  public onDeselectRegionsWithId$: Observable<any>

  private convertRegionIdsToRegion = ([selectRegionIds, parcellation]) => {
    const { ngId: defaultNgId } = parcellation
    return (selectRegionIds as any[])
      .map(labelIndexId => deserialiseParcRegionId(labelIndexId))
      .map(({ ngId, labelIndex }) => {
        return {
          labelIndexId: serialiseParcellationRegion({
            ngId: ngId || defaultNgId,
            labelIndex,
          }),
        }
      })
      .map(({ labelIndexId }) => {
        return recursiveFindRegionWithLabelIndexId({
          regions: parcellation.regions,
          labelIndexId,
          inheritedNgId: defaultNgId,
        })
      })
      .filter(v => {
        if (!v) {
          this.log.log(`SELECT_REGIONS_WITH_ID, some ids cannot be parsed intto label index`)
        }
        return !!v
      })
  }

  private removeDuplicatedRegions = (...args) => {
    const set = new Set()
    const returnArr = []
    for (const regions of args) {
      for (const region of regions) {
        if (!set.has(region.name)) {
          returnArr.push(region)
          set.add(region.name)
        }
      }
    }
    return returnArr
  }

  @Effect()
  public addToSelectedRegions$: Observable<any>

  /**
   * for backwards compatibility.
   * older versions of atlas viewer may only have labelIndex as region identifier
   */
  @Effect()
  public onSelectRegionWithId = this.actions$.pipe(
    ofType(viewerStateSelectRegionWithIdDeprecated.type),
    map(action => {
      const { selectRegionIds } = action
      return selectRegionIds
    }),
    switchMap(selectRegionIds => this.updatedParcellation$.pipe(
      filter(p => !!p),
      take(1),
      map(parcellation => [selectRegionIds, parcellation]),
    )),
    map(this.convertRegionIdsToRegion),
    map(selectRegions => {
      return viewerStateSetSelectedRegions({
        selectRegions
      })
    }),
  )

  /**
   * side effect of selecting a parcellation means deselecting all regions
   */
  @Effect()
  public onParcChange$ = merge(
    this.actions$.pipe(
      ofType(viewerStateToggleLayer.type)
    ),
    this.parcellationSelected$,
    this.actions$.pipe(
      ofType(viewerStateNewViewer.type)
    ),
    this.actions$.pipe(
      ofType(viewerStateSelectAtlas.type)
    )
  ).pipe(
    mapTo(
      viewerStateSetSelectedRegions({
        selectRegions: []
      })
    )
  )

  /**
   * side effects of loading a new template space
   * Landmarks will no longer be accurate (differente template space)
   */

  @Effect()
  public onNewViewerResetLandmarkSelected$ = this.actions$.pipe(
    ofType(viewerStateNewViewer.type),
    mapTo(
      actionSelectLandmarks({
        landmarks: []
      })
    )
  )
}

export const compareRegions: (r1: any, r2: any) => boolean = (r1, r2) => {
  if (!r1) { return !r2 }
  if (!r2) { return !r1 }
  return r1.ngId === r2.ngId
    && r1.labelIndex === r2.labelIndex
    && r1.name === r2.name
}

const ACTION_TYPES = {
  DESELECT_REGIONS_WITH_ID: 'DESELECT_REGIONS_WITH_ID',
}

export const VIEWER_STATE_ACTION_TYPES = ACTION_TYPES
