import { Component, ViewChild, TemplateRef, Input, OnChanges, DoCheck } from '@angular/core';
import { ApplicantDataService } from '../../services/applicant-data.service';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { saveAs } from 'file-saver';
import { SearchService } from '../../services/search.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UploadService } from '../../services/upload.service';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'applicant-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.css'],
  providers: [SearchService, UploadService,ValidationService]
})
export class ResumeComponent implements OnChanges {

  @ViewChild('template')
  template: TemplateRef<any>;
  errInvalidFile: boolean;
  isResumeUploading = false;
  isUploadDisabled = false;
  resumeForm: FormGroup;
  resume: any;
  resume_html: any;
  modalRef: BsModalRef;
  applicant_Id: any;
  applicantResume: any;
  resumeData: any;

  @Input()
  set applicant(_applicant) {
    this.applicant_Id = _applicant._id;
    this.applicantResume = _applicant;

    // console.log(_applicant);
    if (_applicant.resume) {
      this.getResume(_applicant.resume);
    } else {
      this.resume = '';
    }
  }

  constructor(
    private applicantDataService: ApplicantDataService,
    private modalService: BsModalService,
    private searchService: SearchService,
    private uploadService: UploadService,
    private fb: FormBuilder,
    private validationService: ValidationService
  ) {
    this.resumeForm = this.fb.group({
      resume: [null, [<any>Validators.required]]
    });
  }

  ngOnChanges() {
    if (this.applicantResume && typeof this.applicantResume.resume === 'string' && this.applicantResume.resume.length) {
      this.getResume(this.applicantResume.resume);
    }
  }

  getResume(_resumeId) {
    if (_resumeId) {
      this.applicantDataService.getResume(_resumeId).subscribe((result) => {
        if (result && result['success'] && result['success']['data'])
        this.resume = result['success']['data'];
      }, (error) => {
        SiteJS.stopLoader();
      });
    }
  }

  download(id) {
    if (id) {
      this.searchService.downloadPdf(id).subscribe(
        (res) => {
          saveAs(res, this.resume.fileName);
        },
        (error) => {
          SiteJS.stopLoader();
        }
      );
    }
  }

  open() {
    if ((this.resume.fileName).includes('.pdf')) {
      const blob = this.converBase64toBlob(this.resume.resume, 'application/pdf');
      const blobURL = window.URL.createObjectURL(blob);
      this.resume_html = `<div><iframe  type="application/pdf" width="100%" height="800px" style="overflow: auto;" src="${blobURL}"></iframe></div>`;
      // console.log(this.resume_html);
      this.modalRef = this.modalService.show(this.template, { class: 'modal-lg' });
    } else {
      this.resume_html = this.resume.resume;
      this.modalRef = this.modalService.show(this.template, { class: 'modal-lg' });
    }
  }

  upload() {
    const formData = new FormData();
    formData.append('resumeData', this.resumeData);
    formData.append('applicantId', this.applicant_Id);
    if (!this.resumeForm.valid) {
      this.validationService.validateAllFormFields(this.resumeForm);
    }
    if (this.resumeForm.valid) {
      this.isResumeUploading = true;
      this.isUploadDisabled = true;
      this.uploadService.uploadResume(formData).subscribe(result => {
        if (result['success']) {
          this.applicant.result = result['success']['data']._id;
          this.resumeForm.get(['resume']).setValue(null);
          this.resumeData = result['success']['data'];
        }
        this.isResumeUploading = false;
        this.isUploadDisabled = false;
      });
    }
  }


  onFileChange(event) {
    if (event.length > 0) {
      if (event[0].type.includes('pdf') || event[0].type.includes('msword') ||
        event[0].type.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        this.errInvalidFile = false;
        this.resumeData = event[0];
      } else {
        this.errInvalidFile = true;
      }
      this.resumeForm.get(['resume']).setValue(event[0].name);

    } else {
      this.resumeForm.get(['resume']).setValue(null);
    }
  }

  converBase64toBlob(content: any, contentType: any): any {
    contentType = contentType || '';
    const sliceSize = 512;
    const byteCharacters = window.atob(content); // method which converts base64 to binary
    const byteArrays = [
    ];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, {
      type: contentType
    }); // statement which creates the blob
    return blob;
  }
}
