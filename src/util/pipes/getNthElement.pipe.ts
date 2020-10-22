import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'getNthElement'
})
export class GetNthElementPipe<T> implements PipeTransform{
  public transform(array: T[], idx: number): T{
    if (!array[idx]) throw new Error(`[GetNthElementPipe] accessor error`)
    return array[idx]
  }
}
