import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'app-user-card',
    templateUrl: 'user.card.component.html'
})
export class UserCardComponent implements OnInit {
    @Input()
    applicants?: any;
    applicant?: any;

    constructor() {
    }

    @Output()
    onSelect: EventEmitter<any> = new EventEmitter();

    ngOnInit() {
    }

    name_clicked(): void {
        this.onSelect.emit(this.applicants._id);
    }

    getName(applicant) {
        let name = '';
        if (applicant.firstName) {
            name = name + ' ' + applicant.firstName;
        }
        if (applicant.middleName) {
            name = name + ' ' + applicant.middleName;
        }
        if (applicant.lastName) {
            name = name + ' ' + applicant.lastName;
        }

        return name;
    }
}
