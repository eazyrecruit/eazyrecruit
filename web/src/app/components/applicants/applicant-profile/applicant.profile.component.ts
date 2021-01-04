import {Component, Input, OnChanges} from '@angular/core';
import {ApplicantInfoService} from '../applicant-info.service';
import {ActivatedRoute} from '@angular/router';


@Component({
    selector: 'app-applicant-profile',
    templateUrl: 'applicant.profile.component.html',
    providers: [ApplicantInfoService]
})
export class ApplicantProfileComponent implements OnChanges {
    defaultColor = 'label label-default';
    matchedColor = 'label label-info';
    matchedSkills: any[] = [];
    unMatchSkills: any[] = [];
    SkillDiv = '';
    applyJobs: any = [];
    @Input()
    applicant?: any;
    @Input()
    jobsSkils: any;

    constructor(
        private route: ActivatedRoute,
        private applicantInfoService: ApplicantInfoService,
    ) {
    }

    ngOnChanges() {
        if (this.applicant) {
            this.SkillDiv = '';
            this.matchedSkills = [];
            this.unMatchSkills = this.applicant.skills;
            this.setMatchSkils();
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
        return '<span class="display-inline-block"> <span class="' + color + '">' + name + '</span></span>';
    }

}
