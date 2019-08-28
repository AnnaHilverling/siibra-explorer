import { Action, Store, select } from '@ngrx/store'
import { UserLandmark } from 'src/atlasViewer/atlasViewer.apiService.service';
import { NgLayerInterface } from 'src/atlasViewer/atlasViewer.component';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { withLatestFrom, map, shareReplay, startWith, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface ViewerStateInterface{
  fetchedTemplates : any[]

  templateSelected : any | null
  parcellationSelected : any | null
  regionsSelected : any[]

  landmarksSelected : any[]
  userLandmarks : UserLandmark[]

  navigation : any | null
  dedicatedView : string[]

  loadedNgLayers: NgLayerInterface[]
}

export interface AtlasAction extends Action{
  fetchedTemplate? : any[]

  selectTemplate? : any
  selectParcellation? : any
  selectRegions?: any[]
  selectRegionIds: string[]
  deselectRegions? : any[]
  dedicatedView? : string

  updatedParcellation? : any

  landmarks : UserLandmark[]
  deselectLandmarks : UserLandmark[]

  navigation? : any

  payload: any
}

export function viewerState(
  state:Partial<ViewerStateInterface> = {
    landmarksSelected : [],
    fetchedTemplates : [],
    loadedNgLayers: [],
    userLandmarks: []
  },
  action:AtlasAction
){
  switch(action.type){
    /**
     * TODO may be obsolete. test when nifti become available
     */
    case LOAD_DEDICATED_LAYER:
      const dedicatedView = state.dedicatedView
        ? state.dedicatedView.concat(action.dedicatedView)
        : [action.dedicatedView]
      return {
        ...state,
        dedicatedView 
      }
    case UNLOAD_DEDICATED_LAYER:
      return {
        ...state,
        dedicatedView : state.dedicatedView
          ? state.dedicatedView.filter(dv => dv !== action.dedicatedView)
          : []
      }
    case NEWVIEWER:
      const { selectParcellation: parcellation } = action
      // const parcellation = propagateNgId( selectParcellation ): parcellation
      const { regions, ...parcellationWORegions } = parcellation
      return {
        ...state,
        templateSelected : action.selectTemplate,
        parcellationSelected : {
          ...parcellationWORegions,
          regions: null
        },
        // taken care of by effect.ts
        // regionsSelected : [],
        landmarksSelected : [],
        navigation : {},
        dedicatedView : null
      }
    case FETCHED_TEMPLATE : {
      return {
        ...state,
        fetchedTemplates: state.fetchedTemplates.concat(action.fetchedTemplate)
      }
    }
    case CHANGE_NAVIGATION : {
      return {
        ...state,
        navigation : action.navigation
      }
    }
    case SELECT_PARCELLATION : {
      const { selectParcellation:parcellation } = action
      const { regions, ...parcellationWORegions } = parcellation
      return {
        ...state,
        parcellationSelected: parcellationWORegions,
        // taken care of by effect.ts
        // regionsSelected: []
      }
    }
    case UPDATE_PARCELLATION: {
      const { updatedParcellation } = action
      return {
        ...state,
        parcellationSelected: updatedParcellation
      }
    }
    case SELECT_REGIONS:
      const { selectRegions } = action
      return {
        ...state,
        regionsSelected: selectRegions
      }
    case DESELECT_LANDMARKS : {
      return {
        ...state,
        landmarksSelected : state.landmarksSelected.filter(lm => action.deselectLandmarks.findIndex(dLm => dLm.name === lm.name) < 0)
      }
    }
    case SELECT_LANDMARKS : {
      return {
        ...state,
        landmarksSelected : action.landmarks
      }
    }
    case USER_LANDMARKS : {
      return {
        ...state,
        userLandmarks: action.landmarks
      } 
    }
    case NEHUBA_LAYER_CHANGED: {
      if (!window['viewer']) {
        return {
          ...state,
          loadedNgLayers: []
        }
      } else {
        return {
          ...state,
          loadedNgLayers: (window['viewer'].layerManager.managedLayers as any[]).map(obj => ({
            name : obj.name,
            type : obj.initialSpecification.type,
            source : obj.sourceUrl,
            visible : obj.visible
          }) as NgLayerInterface)
        }
      }
    }
    default :
      return state
  }
}

export const LOAD_DEDICATED_LAYER = 'LOAD_DEDICATED_LAYER'
export const UNLOAD_DEDICATED_LAYER = 'UNLOAD_DEDICATED_LAYER'

export const NEWVIEWER = 'NEWVIEWER'

export const FETCHED_TEMPLATE = 'FETCHED_TEMPLATE'
export const CHANGE_NAVIGATION = 'CHANGE_NAVIGATION'

export const SELECT_PARCELLATION = `SELECT_PARCELLATION`
export const UPDATE_PARCELLATION = `UPDATE_PARCELLATION`

export const SELECT_REGIONS = `SELECT_REGIONS`
export const SELECT_REGIONS_WITH_ID = `SELECT_REGIONS_WITH_ID`
export const SELECT_LANDMARKS = `SELECT_LANDMARKS`
export const DESELECT_LANDMARKS = `DESELECT_LANDMARKS`
export const USER_LANDMARKS = `USER_LANDMARKS`

export const NEHUBA_LAYER_CHANGED = `NEHUBA_LAYER_CHANGED`

@Injectable({
  providedIn: 'root'
})

export class ViewerStateUseEffect{
  constructor(
    private actions$: Actions,
    private store$: Store<any>
  ){
    this.currentLandmarks$ = this.store$.pipe(
      select('viewerState'),
      select('userLandmarks'),
      shareReplay(1),
    )

    this.removeUserLandmarks = this.actions$.pipe(
      ofType(ACTION_TYPES.REMOVE_USER_LANDMARKS),
      withLatestFrom(this.currentLandmarks$),
      map(([action, currentLandmarks]) => {
        const { landmarkIds } = (action as AtlasAction).payload
        for ( const rmId of landmarkIds ){
          const idx = currentLandmarks.findIndex(({ id }) => id === rmId)
          if (idx < 0) console.warn(`remove userlandmark with id ${rmId} does not exist`)
        }
        const removeSet = new Set(landmarkIds)
        return {
          type: USER_LANDMARKS,
          landmarks: currentLandmarks.filter(({ id }) => !removeSet.has(id))
        }
      })
    )

    this.addUserLandmarks$ = this.actions$.pipe(
      ofType(ACTION_TYPES.ADD_USERLANDMARKS),
      withLatestFrom(this.currentLandmarks$),
      map(([action, currentLandmarks]) => {
        const { landmarks } = action as AtlasAction
        const landmarkMap = new Map()
        for (const landmark of currentLandmarks) {
          const { id } = landmark
          landmarkMap.set(id, landmark)
        }
        for (const landmark of landmarks) {
          const { id } = landmark
          if (landmarkMap.has(id)) {
            console.warn(`Attempting to add a landmark that already exists, id: ${id}`)
          } else {
            landmarkMap.set(id, landmark)
          }
        }
        const userLandmarks = Array.from(landmarkMap).map(([id, landmark]) => landmark)
        return {
          type: USER_LANDMARKS,
          landmarks: userLandmarks
        }
      })
    )
  }

  private currentLandmarks$: Observable<any[]>

  @Effect()
  removeUserLandmarks: Observable<any>

  @Effect()
  addUserLandmarks$: Observable<any>
}

const ACTION_TYPES = {
  ADD_USERLANDMARKS: `ADD_USERLANDMARKS`,
  REMOVE_USER_LANDMARKS: 'REMOVE_USER_LANDMARKS'
}

export const VIEWERSTATE_ACTION_TYPES = ACTION_TYPES