import {Component, OnInit, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {ApplicantService} from '../../../services/applicant.service';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {ValidationService} from '../../../services/validation.service';
import {ConstService} from "../../../services/const.service";

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
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
    @Output()
    commentAdded?: EventEmitter<any> = new EventEmitter();
    time = new Date().getTime();

    constructor(
        private applicantService: ApplicantService,
        private fbForm: FormBuilder,
        private constService: ConstService,
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
                this.commentAdded.emit({});
            }
            this.isSubmitting = false;
        });
    }

    getImageData(id) {
        return this.constService.publicUrl + '/api/user/profile/' + id + '?' + this.time;
    }

    editComment(comment) {
        this.applicantService.editComment(comment).subscribe(result => {
            if (result['success']) {
                this.commentDetails.reset();
                this.commentObject = null;
                this.commentAdded.emit({});
                this.getComments(this.applicant.id);
            }
            this.isSubmitting = false;
        });
    }
}
