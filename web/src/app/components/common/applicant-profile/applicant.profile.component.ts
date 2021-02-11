import {Component, Input, OnChanges, OnDestroy} from '@angular/core';
import {ApplicantInfoService} from '../../../services/applicant-info.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from "rxjs";


@Component({
    selector: 'app-applicant-profile',
    templateUrl: 'applicant.profile.component.html',
    providers: [ApplicantInfoService]
})
export class ApplicantProfileComponent implements OnChanges, OnDestroy {
    defaultColor = 'label label-default';
    matchedColor = 'label label-info';
    matchedSkills: any[] = [];
    unMatchSkills: any[] = [];
    SkillDiv = '';
    applyJobs: any = [];
    @Input()
    applicant?: any;

    @Input()
    isRefereed?: any;
    @Input()
    jobsSkils: any;
    private _subs: Subscription;

    constructor(
        private route: ActivatedRoute,
        private applicantInfoService: ApplicantInfoService,
    ) {
    }

    ngOnChanges() {
        if (this.applicant) {
            if (!this.isRefereed) {
                this.SkillDiv = '';
                this.matchedSkills = [];
                this.unMatchSkills = this.applicant.skills;
                this.setMatchSkils();
            }

        }
    }

    setMatchSkils() {
        this.matchedSkills = [];
        this.unMatchSkills = [];
        let matchSkillDiv = '';
        let unMatchSkillDiv = '';
        if (this.applicant && this.applicant.skills) {
            this.SkillDiv = '';
            for (let index = 0; index < this.applicant.skills.length; index++) {
                if (this.applicant.skills[index].name && this.jobsSkils.hasOwnProperty(this.applicant.skills[index].name.toUpperCase())) {
                    matchSkillDiv = matchSkillDiv + this.getSkilsDiv(this.applicant.skills[index].name, this.matchedColor);
                } else {
                    unMatchSkillDiv = unMatchSkillDiv + this.getSkilsDiv(this.applicant.skills[index].name, this.defaultColor);
                }

            }
            this.SkillDiv = matchSkillDiv + unMatchSkillDiv;
        }


    }

    getSkilsDiv(name, color) {
        return '<span class="display-inline-block box-shadow"> <span class="' + color + '">' + name + '</span></span>';
    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }


    }
}
