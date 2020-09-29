import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ApplicantService } from '../../../services/applicant.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css'],
  providers: [ApplicantService, ValidationService]
})
export class CommentComponent implements OnInit, OnChanges {

  commentDetails: FormGroup;
  commentObject: any = null;
  commentList: any[];
  isSubmitting = false;

  @Input()
  applicant?: any;

  @Input()
  job?: any;

  constructor(
    private applicantService: ApplicantService,
    private fbForm: FormBuilder,
    private validationService: ValidationService) {
      this.commentDetails = this.fbForm.group({
        comment: [null, [<any>Validators.required]]
      });
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.applicant && this.applicant._id) {
      this.getComments(this.applicant._id);
    }
  }

  populateForm(comment) {
    this.commentObject = comment;
    this.commentDetails = this.fbForm.group({
      comment: [comment.comment, [<any>Validators.required]]
    });
  }

  getComments(id: any) {
    this.applicantService.getComments(id).subscribe(result => {
      if (result['success'] && result['success']['data']) {
        this.commentList = result['success']['data'];
      }
    });
  }

  comment(commentForm: any) {
    if (!this.commentDetails.valid) {
      this.validationService.validateAllFormFields(this.commentDetails);
    } else {
      this.isSubmitting = true;
      if (this.commentObject) {
        this.commentObject.comment = commentForm.comment;
        this.editComment(this.commentObject);
      } else {
        const obj: any = {};
        obj.applicant = this.applicant._id;
        obj.comment = commentForm.comment;
        if (this.job) {
          obj.job = this.job;
        }
        this.addComment(obj);
      }
    }
  }

  addComment(comment) {
    this.applicantService.addComment(comment).subscribe(result => {
      if (result['success'] && result['success']['data']) {
        this.commentDetails.reset();
        this.commentList.push(result['success']['data']);
      }
      this.isSubmitting = false;
    });
  }

  editComment(comment) {
    this.applicantService.editComment(comment).subscribe(result => {
      if (result['success']) {
        this.commentDetails.reset();
        this.commentObject = null;
        this.getComments(this.applicant.id);
      }
      this.isSubmitting = false;
    });
  }
}
