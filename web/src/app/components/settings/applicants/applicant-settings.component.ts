import { Component, OnInit } from '@angular/core';
import { ApplicantService } from '../../../services/applicant.service';
import { ToasterService } from 'angular2-toaster';

@Component({
  selector: 'app-applicant-settings',
  templateUrl: './applicant-settings.component.html',
  providers: [ApplicantService]
})
export class ApplicantSettingsComponent implements OnInit {

  constructor(
    private applicantService: ApplicantService,
    private toasterService: ToasterService
  ) { }

  ngOnInit() {
  }

  reProcessResumes(){
    if(confirm("Are you sure, you want to reprocess all resumes? It might take several minutes.")){
      this.applicantService.reprocess().subscribe(res => {
        this.toasterService.pop('success', 'Success', 'Resume reprocessing started successfully');
      }, err =>{
        this.toasterService.pop('error', 'Error', 'Failed to start resume reprocessing');
      });
    }
  }

  reSyncDb(){
    if(confirm("Are you sure, you want to resync db?")){
      this.applicantService.resync().subscribe(res => {
        this.toasterService.pop('success', 'Success', 'Sync started successfully');
      }, err =>{
        this.toasterService.pop('error', 'Error', 'Sync failed to start');
      });
    }
  }
}
