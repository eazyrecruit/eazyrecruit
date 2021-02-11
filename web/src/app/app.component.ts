import {Component} from '@angular/core';
import {OnInit, OnDestroy} from '@angular/core';
import {ToasterService, ToasterConfig} from 'angular2-toaster';
import {DataShareService} from './services/data-share.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {

    title = 'app';
    bodyClasses = 'skin-blue sidebar-mini';
    body: HTMLBodyElement = document.getElementsByTagName('body')[0];

    public config: ToasterConfig = new ToasterConfig({
        showCloseButton: true,
        tapToDismiss: true,
        timeout: 2500,
        animation: 'fade',
        positionClass: 'toast-top-right'
    });

    constructor(
        private toasterService: ToasterService,
        private dataShared: DataShareService
    ) {
    }

    ngOnInit() {
        // add the the body classes
        this.body.classList.add('skin-blue');
        this.body.classList.add('sidebar-mini');
        this.dataShared.notificationChange.subscribe(notification => {
            if (notification && notification.message) {
                this.toasterService.pop(notification.name, notification.type, notification.message);
            }
        });
    }

    ngOnDestroy() {
        // remove the the body classes
        this.body.classList.remove('skin-blue');
        this.body.classList.remove('sidebar-mini');
    }
}
