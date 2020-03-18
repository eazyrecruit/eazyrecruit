import { Component, OnInit, TemplateRef } from '@angular/core';
import { SkillsService } from '../../../services/skills.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';


@Component({
  selector: 'app-skill',
  templateUrl: './skill.component.html',
  styleUrls: ['./skill.component.css'],
  providers: [SkillsService, ValidationService]
})
export class SkillComponent implements OnInit {

  skillsDetail: FormGroup;
  modalRef: BsModalRef;

  skills = [];
  deleteSkillObject: any = {};

  limit = 10;
  offset = 0;
  skillId = null;
  totalRecords = 0;
  serialNo = 0;
  isSearchResultAvail: any = 0;
  filter: any;
  errorMessage: any;

  skillDialogTitle = 'Create';
  deleteName = '';

  constructor(private skillsService: SkillsService,
    private fbForm: FormBuilder,
    private validationService: ValidationService,
    private modalService: BsModalService) {
      this.populateForm(null);
  }

  ngOnInit() {
    this.filter = {
      pageIndex: 1,
      pageSize: 10,
      searchText: '',
      sortField: 'name',
      sortOrder: '1',
      offset: 0
    };
    // this.onFilterChange(this.filter);
  }

  populateForm(skill) {
    if (skill) {
      this.skillId = skill._id;
      this.skillsDetail = this.fbForm.group({
        name: [skill.name, [<any>Validators.required]],
        is_deleted : [skill.is_deleted],
        modified_at : [Date.now()]
      });
    } else {
      this.skillsDetail = this.fbForm.group({
        name: [null, [<any>Validators.required]],
        is_deleted : [false],
        created_at : [Date.now()],
        modified_at : [Date.now()]
      });
    }
  }

  skillDetails(skillsForm: any) {
    if (!this.skillsDetail.valid) {
      this.validationService.validateAllFormFields(this.skillsDetail);
    }

    if (this.skillsDetail.valid) {
      if (this.skillId == null) {
        this.skillDialogTitle = 'Create';
        this.createSkills(skillsForm);
      } else {
        this.editSkill(skillsForm, this.skillId);
      }
    }
  }

  createSkills(skillsForm: any) {
    this.skillsService.saveSkills(skillsForm).subscribe(result => {
      if (result['success']) {
        this.onFilterChange(this.filter);
        const close = document.getElementById('close');
        close.click();
        this.skillsDetail.reset();
      } else if (result['fail']) {
        this.errorMessage = result['fail']['data'];
      }
    });
  }

  showSkillList(limit: any, offset: any) {
    this.skillsService.getSkills(this.filter).subscribe(result => {
      if (result['success']) {
        this.skills = result['success']['data'];
      }
    });
  }

  editSkill(skillsForm: any, id: any) {
    skillsForm.id = id;
    this.skillsService.editSkill(skillsForm, this.skillId).subscribe(result => {
      if (result['success']) {
        this.skillsDetail.reset();
        const close = document.getElementById('close');
        close.click();
        this.onFilterChange(this.filter);
      }
    });
  }

  setSkillId(skill: any) {
    skill == null ? this.skillDialogTitle = 'Create' : this.skillDialogTitle = 'Edit';
    this.skillId = skill;
    this.populateForm(skill);
  }

  onFilterChange(filter: any) {
    this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
    this.filter.searchText = filter.searchText;
    this.filter.pageSize = filter.pageSize;
    this.skillsService.getSkills(this.filter).subscribe(result => {
      if (result['success']) {
        if (result['success']['data'] && result['success']['data']['count']) {
          this.skills = result['success']['data']['skills'];
          this.totalRecords = result['success']['data']['count'];
          this.serialNo = (filter.pageIndex - 1) * filter.pageSize;
          this.isSearchResultAvail = 1;
        } else {
          this.skills.length = 0;
          this.isSearchResultAvail = 2;
          this.totalRecords = 0;
        }
      } else {
        this.isSearchResultAvail = 2;
        this.totalRecords = 0;
      }
    });
  }

  onKeyPress(event) {
    if (event.target.value === '') {
      this.errorMessage = null;
    }
  }

  openDeleteModal(skill, template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    this.skillId = skill._id;
    this.deleteName = skill.name;
  }

  confirm(): void {
    if (this.skillId) {
      this.skillsService.deleteSkill(this.skillId).subscribe(skillResult => {
        if (skillResult['success']) {
          this.onFilterChange(this.filter);
          this.modalRef.hide();
        }
      });
    }
  }

  decline(): void {
    this.modalRef.hide();
  }

}
