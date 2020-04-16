import { Component, OnInit, TemplateRef } from '@angular/core';
import { AccountService } from '../../../../services/account.service';
import { ValidationService } from '../../../../services/validation.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
  providers: [AccountService, ValidationService]
})
export class ViewComponent implements OnInit {

  users = [];
  filter: any;
  totalRecords = 0;
  serialNo = 0;

  isRoleSelect: boolean;
  adminDetails: FormGroup;
  isDetailsUploading = false;
  isSubmitDisabled = false;
  roles = [];
  selectedrole = [];
  isSearchResultAvail: any = 0;
  userId: any;
  userDialogTitle: string;
  deleteName = '';

  modalRef: BsModalRef;

  constructor(private accountService: AccountService,
    private route: ActivatedRoute,
    private fbForm: FormBuilder,
    // private router: Router,
    private toasterService: ToasterService,
    private validationService: ValidationService,
    private modalService: BsModalService
  ) { }

  public config: ToasterConfig = new ToasterConfig({
    showCloseButton: true,
    tapToDismiss: true,
    timeout: 1000,
    animation: 'fade',
    positionClass: 'toast-top-right'
  });

  ngOnInit() {
    this.filter = {
      pageIndex: 1,
      pageSize: 10,
      searchText: '',
      sortField: 'firstName',
      sortOrder: '1',
      offset: 0
    };
    this.isRoleSelect = false;
    // this.onFilterChange(this.filter);

    this.accountService.getRoles().subscribe(result => {
      if (result['success']['data']) {
        this.roles = result['success']['data'];
      } else {
        this.toasterService.pop('error', 'Not Found', 'Roles not found!');
      }
    });

    this.populateForm(null);
  }

  onFilterChange(filter: any) {
    this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
    this.filter.searchText = filter.searchText;
    this.filter.pageSize = filter.pageSize;

    this.accountService.getAllUsers(filter).subscribe(result => {
      if (result['success']['data'].length) {
        this.users = result['success']['data'];
        this.totalRecords = result['success']['data'].length;
        this.serialNo = (filter.pageIndex - 1) * filter.pageSize;
        this.isSearchResultAvail = 1;
      } else {
        this.users.length = 0;
        this.isSearchResultAvail = 2;
        this.totalRecords = 0;
      }
    });
  }

  details(adminFormDetail: any) {
    if (this.userId) {
      this.editUser(adminFormDetail, this.userId);
    } else {
      this.create(adminFormDetail);
    }
  }

  populateForm(details) {
    if (details) {
      this.adminDetails = this.fbForm.group({
        firstName: [details.firstName, [<any>Validators.required], this.validationService.nameValid],
        lastName: [details.lastName, [<any>Validators.required], this.validationService.nameValid],
        email: [details.email, [<any>Validators.required], this.validationService.emailValid],
        phone: [details.phone, [<any>Validators.required], this.validationService.mobileValid],
        is_deleted: false,
        roleId: [null, []],
      });
      this.adminDetails.controls['roleId'].setValue(details.user ? details.user.role_id : '0', { onlySelf: true });
      this.adminDetails.controls['email'].disable({ onlySelf: true });
    } else {
      this.adminDetails = this.fbForm.group({
        firstName: [null, [<any>Validators.required], this.validationService.nameValid],
        lastName: [null, [<any>Validators.required], this.validationService.nameValid],
        email: [null, [<any>Validators.required], this.validationService.emailValid],
        phone: [null, [<any>Validators.required], this.validationService.mobileValid],
        is_deleted: false,
        roleId: [null, []],
      });
    }
  }

  onRoleChnage(event) {
    const value = event.target.value;
    if (value) {
      this.selectedrole.length = 0;
      this.selectedrole.push(value);
    } else {
      this.isRoleSelect = true;
    }
  }

  create(adminFormDetail) {
    if (!this.adminDetails.valid) {
      this.validationService.validateAllFormFields(this.adminDetails);
    } else if (this.adminDetails.valid && this.adminDetails.controls['roleId'].value != null) {
      this.isDetailsUploading = true;
      adminFormDetail.roleId = this.selectedrole;
      this.accountService.createUser(adminFormDetail).subscribe(result => {
        if (result['success']['data']) {
          this.adminDetails.reset();
          this.onFilterChange(this.filter);
          const close = document.getElementById('close');
          close.click();
          this.toasterService.pop('success', 'Successfull', 'User created successfully!');
        } else {
          this.toasterService.pop('error', 'Server Error', 'Error occure on user create!');
        }
        this.isDetailsUploading = false;
      }, err => {
        this.toasterService.pop('error', 'Server Error', 'Server Error!');
      });
    } else {
      this.isRoleSelect = true;
    }
  }

  getUser(id) {
    this.accountService.getUserById(id).subscribe(result => {
      if (result['success']) {
        this.userId = id;
        this.populateForm(result['success']['data']);
      }
    });
  }

  editUser(adminFormDetail, id: any) {
    if (!this.adminDetails.valid) {
      this.validationService.validateAllFormFields(this.adminDetails);
    } else if (this.adminDetails.valid && this.adminDetails.controls['roleId'].value != null) {
      this.isDetailsUploading = true;
      adminFormDetail.id = id;
      this.accountService.update(adminFormDetail, id).subscribe(result => {
        if (result['success']['data']) {
          this.adminDetails.reset();
          const close = document.getElementById('close');
          close.click();
        } else {
          this.toasterService.pop('error', 'Server Error', 'Error occure on user update!');
        }
        this.isDetailsUploading = false;
        this.onFilterChange(this.filter);
      }, err => {
        this.toasterService.pop('error', 'Server Error', 'Server Error!');
      });
      this.userId = null;
    } else {
      this.isRoleSelect = true;
    }
  }

  openDeleteModal(user, template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
    this.userId = user._id;
    this.deleteName = `${user.firstName}  ${user.lastName}`;
  }

  setUserId(user) {
    if (user == null) {
      this.userDialogTitle = 'Create';
      this.adminDetails.reset();
    } else {
      this.userDialogTitle = 'Edit';
      this.userId = user._id;
    }
    this.populateForm(user);
  }

  confirm(): void {
    if (this.userId) {
      this.accountService.delete(this.userId).subscribe(result => {
        if (result['success']['data']) {
        } else {
          this.toasterService.pop('success', 'Success', 'User successfully deleted!');
        }
        this.isDetailsUploading = false;
        this.onFilterChange(this.filter);
      }, err => {
        this.toasterService.pop('error', 'Server Error', 'Error occure on user delete!');
      });
      this.modalRef.hide();
    }
  }

  getRoleName(roleId) {
    var role = this.roles.filter(r => r.id == roleId);
    if (role.length > 0) {
      return role[0].name;
    }
    return "Undefined";
  }

  decline(): void {
    this.modalRef.hide();
  }

}
