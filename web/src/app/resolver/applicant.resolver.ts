import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ApplicantDataService } from '../services/applicant-data.service';
import { Injectable } from '@angular/core';

@Injectable()
export class ApplicantResolver implements Resolve<Observable<string>> {
    constructor(private applicantDataService: ApplicantDataService) {}
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        return this.applicantDataService.getApplicantCompleteData(route.params['id']);
    }

}
