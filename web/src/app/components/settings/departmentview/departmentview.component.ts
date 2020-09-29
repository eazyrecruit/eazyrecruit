import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../../services/shared.service';
import { DepartmentService } from '../../../services/department.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-departmentview',
  templateUrl: './departmentview.component.html',
  providers: [DepartmentService, SharedService]
})
export class DepartmentviewComponent implements OnInit {
  errCategory = false;
  departmentList = [];
  params: any = {};
  departmentId = 0;
  modalRef: BsModalRef;
  deleteName: any;
  departmentDetails: any;

  constructor(private departmentService: DepartmentService,
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private modalService: BsModalService) {
      this.route.params.subscribe( prms => this.params = prms );
  }

  ngOnInit() {
    this.departmentService.searchDepartment(this.params.companyId).subscribe(result => {
      if (result['success']) {
        this.departmentList = result['success']['data'];
      }
    });
  }

   refreshList(e) {
    this.ngOnInit();
    let element = document.getElementById('closePopup');
    if (element) element.click();
  }

  getData() {
    if (!this.errCategory) {
      this.departmentService.searchDepartment(this.params).subscribe(result => {
        if (result['success']) {
          this.departmentList = result['success']['data']; 
        }
      });
    }
  }

  openDeleteModal(department, template: TemplateRef<any>) {
    this.departmentId = department.id;
    this.deleteName = department.name;
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }

  editDepartment(department) {
    this.departmentDetails = department;
  }

  confirm(): void {
    if (this.departmentId) {
      this.departmentService.deleteDepartment(this.departmentId).subscribe(result => {
        if (result['success']) {
          this.modalRef.hide();
          this.getData();
        }
      });
    }
  }

  decline(): void {
    this.modalRef.hide();
  }
}
