import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { ToastService } from "src/services/toastService.service";
import { ZipFileDownloadService } from "src/services/zipFileDownload.service";

@Component({
  selector: 'radio-list',
  templateUrl: './radiolist.template.html',
  styleUrls: [
    './radiolist.style.css'
  ],
  styles: [
    `
    ul > li.selected > .textSpan:before
    {
      content: '\u2022';
      width : 1em;
      display:inline-block;
    }
    ul > li:not(.selected) > .textSpan:before
    {
      content: ' ';
      width : 1em;
      display:inline-block;
    }  
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class RadioList{
  @Input() 
  listDisplay : (item:any) => string = (obj) => obj.name

  @Output()
  itemSelected : EventEmitter<any> = new EventEmitter()

  @Input()
  selectedItem: any | null = null

  @Input()
  inputArray: any[] = []

  @Input()
  ulClass: string = ''
  
  @Input() checkSelected: (selectedItem:any, item:any) => boolean = (si,i) => si === i

  @Input() isMobile: boolean
  @Input() darktheme: boolean

  @ViewChild('publicationTemplate') publicationTemplate: TemplateRef<any>

  handleToast

  constructor(private toastService: ToastService,
              private zipFileDownloadService: ZipFileDownloadService) {}

  showToast(item) {
    if (this.handleToast) {
      this.handleToast()
      this.handleToast = null
    }
    this.handleToast = this.toastService.showToast(this.publicationTemplate, {
        timeout: 7000
    })

  }


  downloadPublications(item) {
    const filename = item['name']
    let publicationsText = item['name'] + ' Publications:\r\n'
      item['properties']['publications'].forEach((p, i) => {
        publicationsText += '\t' + (i+1) + '. ' + p['citation'] + ' - ' + p['doi'] + '\r\n'
      });
    this.zipFileDownloadService.downloadZip(publicationsText, filename)
    publicationsText = ''
  }
}