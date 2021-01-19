import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CompanyService } from '../../../services/company.service';
import { SharedService } from '../../../services/shared.service';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
@Component({
  selector: 'app-companayview',
  templateUrl: './companayview.component.html',
  providers: [CompanyService, SharedService]
})
export class CompanayviewComponent implements OnInit {
  errCategory = false;
  companyList = [];
  params: any = {};
  filter: any;
  totalRecords = 0;
  isSearchResultAvail: any = 0;
  companyId = 0;
  modalRef: BsModalRef;
  deleteName: any;
  companyDetails: any = null;

  constructor(private companyService: CompanyService,
      private router: Router,
      private sharedService: SharedService,
      private modalService: BsModalService) { }

  ngOnInit() {
    this.filter = {
      pageIndex: 1,
      pageSize: 10,
      searchText: '',
      sortField: 'name',
      sortOrder: '1',
      offset: 0
    };
    this.onFilterChange(this.filter);
  }

  refreshList(e) {
    this.ngOnInit();
    let element = document.getElementById('closePopup');
    if (element) element.click();
  }
  
  getData(searchForm: any) {
    if (!this.errCategory) {
      this.companyService.getCompany().subscribe(result => {
        if (result['success']) {
          this.companyList = result['success']['data'];
        }
      });
    }
  }

  editCompany(company) {
    this.companyDetails = company;
  }

  onFilterChange(filter: any) {
    this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
    this.filter.searchText = filter.searchText;
    this.filter.pageSize = filter.pageSize;

    this.companyService.getCompany().subscribe(result => {
      if (result['success']['data'].rows.length) {
        this.companyList = result['success']['data'].rows;
        this.totalRecords = result['success']['data'].count;
        this.isSearchResultAvail = 1;
      } else {
        this.companyList.length = 0;
        this.isSearchResultAvail = 2;
        this.totalRecords = 0;
      }
    });
  }

  openDeleteModal(company, template: TemplateRef<any>) {
    this.companyId = company.id;
    this.deleteName = company.name;
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }

  confirm(): void {
    if (this.companyId) {
      this.companyService.deleteCompany(this.companyId).subscribe(result => {
        if (result['success']) {
          this.modalRef.hide();
          this.onFilterChange(this.filter);
        }
      });
    }
  }

  decline(): void {
    this.modalRef.hide();
  }
}
