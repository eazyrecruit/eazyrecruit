import {Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {ApplicantService} from '../../../services/applicant.service';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {ValidationService} from '../../../services/validation.service';
import {ConstService} from "../../../services/const.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    providers: [ApplicantService, ValidationService]
})
export class CommentComponent implements OnInit, OnChanges, OnDestroy {

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
    private _subs: Subscription;

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
         this._subs = this.applicantService.getComments(id).subscribe(result => {
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
         this._subs = this.applicantService.addComment(comment).subscribe(result => {
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
         this._subs = this.applicantService.editComment(comment).subscribe(result => {
            if (result['success']) {
                this.commentDetails.reset();
                this.commentObject = null;
                this.commentAdded.emit({});
                this.getComments(this.applicant.id);
            }
            this.isSubmitting = false;
        });
    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
    }
}
