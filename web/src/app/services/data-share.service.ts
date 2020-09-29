import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class DataShareService {

  private messageSource = new BehaviorSubject<string>('empty');
  currentMessage = this.messageSource.asObservable();
  changeMessage(message: string) { this.messageSource.next(message);}

  private notificationSource = new BehaviorSubject<any>({});
  notificationChange = this.notificationSource.asObservable();
  notificationChangeMessage(notification: any) { this.notificationSource.next(notification);}

  constructor() { }

}
