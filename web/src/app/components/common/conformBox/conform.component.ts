import {Component, OnInit} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';

@Component({
    selector: 'app-cancel-conform',
    templateUrl: 'conform.component.html'
})
export class ConformComponent implements OnInit {
    close: any;
    message: any;

    constructor(
        public modalRef: BsModalRef
    ) {

    }

    deleteInterView() {
        this.close(true);

    }

    ngOnInit(): void {
    }
}
