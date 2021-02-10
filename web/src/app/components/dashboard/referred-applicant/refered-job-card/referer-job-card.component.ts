import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'app-referer-job-card',
    templateUrl: 'referer-job-card.component.html'
})
export class RefererJobCardComponent implements OnInit {
    @Input()
    job?: any;

    constructor() {
    }

    ngOnInit(): void {
    }
}
