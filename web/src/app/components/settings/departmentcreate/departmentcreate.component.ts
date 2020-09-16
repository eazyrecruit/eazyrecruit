import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { CompanyService } from '../../../services/company.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationService } from '../../../services/validation.service';
import { SharedService } from '../../../services/shared.service';
import { DepartmentService } from '../../../services/department.service';

@Component({
  selector: 'app-departmentcreate',
  templateUrl: './departmentcreate.component.html',
  providers: [CompanyService, ValidationService, SharedService, DepartmentService],
})
export class DepartmentcreateComponent implements OnInit, OnChanges {

  departmentDetails: FormGroup;
  department = {
    id: Number,
    company_id: Number,
    name: String,
    is_deleted: String,
    modified_by: String
  };
  companyList: any[];
  errCategory = false;
  params: any = {};

  @Input()
  data: any = null;

  @Output()
  refreshList: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private companyService: CompanyService,
    private router: Router,
    private route: ActivatedRoute,
    private fbForm: FormBuilder,
    private validationService: ValidationService,
    private sharedService: SharedService,
    private departmentService: DepartmentService) {
    this.route.params.subscribe(prms => this.params = prms);

    this.departmentDetails = this.fbForm.group({
      category: [null, <any>[Validators.required]],
      departmentName: [null, <any>[<any>Validators.required], this.validationService.nameValid],
    });
  }

  ngOnChanges(): void {
    this.populate(this.data);
  }

  ngOnInit() {
    this.department = JSON.parse(this.sharedService.getDeptDetail());
    this.sharedService.deleteDeptDetail();
    this.populate(null);
    this.getCompany();
  }


  populate(department) {
    if (department) {
      this.departmentDetails = this.fbForm.group({
        category: [department.company_id, [<any>Validators.required]],
        departmentName: [department.name, [<any>Validators.required], this.validationService.nameValid]
      });
    } else {
      this.departmentDetails = this.fbForm.group({
        category: [null, [<any>Validators.required]],
        departmentName: [null, [<any>Validators.required], this.validationService.nameValid],
      });

    }
  }

  getCompany() {
    if (!this.errCategory) {
      this.companyService.searchCompany().subscribe(result => {
        if (result['success']) {
          this.companyList = result['success']['data']['rows'];
        }
      });
    }
  }

  create(deptForm: any) {
    if (!this.departmentDetails.valid) {
      this.validationService.validateAllFormFields(this.departmentDetails);
    }

    this.departmentService.createDepartment(deptForm).subscribe(result => {
      if (result['success']) {
        this.departmentDetails.reset();
        this.refreshList.emit(true);
        this.router.navigate(['/settings/companies/' + this.params.companyId]);
      }
    });
  }


  edit(deptForm) {
    if (!this.departmentDetails.valid) {
      this.validationService.validateAllFormFields(this.departmentDetails);
    }
    this.departmentService.editDepartment(deptForm).subscribe(result => {
      if (result['success']) {
        this.departmentDetails.reset();
        this.refreshList.emit(true);
        this.router.navigate(['/settings/companies/' + this.params.companyId]);
      }
    });

  }

  departmentDetail(deptForm: any) {
    if (this.data) {
      deptForm.id = this.data.id;
      this.edit(deptForm);
    } else {
      this.create(deptForm);
    }
  }
}
