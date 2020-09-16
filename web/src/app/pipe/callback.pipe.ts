import { PipeTransform, Pipe } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'callback', pure: false })
export class CallbackPipe implements PipeTransform {
    transform(items: any[], callback: (item: any) => boolean): any {
        if (!items || !callback) {
            return items;
        }
        return items.filter(item => callback(item));
    }
}

@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {

  constructor(private _sanitizer:DomSanitizer) {
  }

  transform(v:string):SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(v);
  }
}