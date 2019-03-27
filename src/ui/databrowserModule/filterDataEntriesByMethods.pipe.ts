import { PipeTransform, Pipe } from "@angular/core";
import { DataEntry } from "../../services/stateStore.service";
import { temporaryFilterDataentryName } from './databrowser.service'

@Pipe({
  name : 'filterDataEntriesByMethods'
})

export class FilterDataEntriesbyMethods implements PipeTransform{
  public transform(dataEntries:DataEntry[],showDataMethods:string[]):DataEntry[]{
    return showDataMethods.length > 0
      ? dataEntries.filter(dataEntry => {
          return dataEntry.activity.some(a => a.methods.some(m => showDataMethods.findIndex(dm => dm === temporaryFilterDataentryName(m)) >= 0))
        })
      : dataEntries
  }
}