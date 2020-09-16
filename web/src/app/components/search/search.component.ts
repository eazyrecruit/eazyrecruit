import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SearchService } from '../../services/search.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  providers: [SearchService]
})
export class SearchComponent implements OnInit {

  searchForm: FormGroup;
  errCategory = false;
  searchList = [];
  params: any = {};
  limit = 10;
  offset = 0;
  file: File;

  constructor(private searchService: SearchService, private fb: FormBuilder) {
    this.searchForm = fb.group({
      search: [null, [<any>Validators.required]],
      category: [null, [<any>Validators.required]]
    });
  }

  ngOnInit() {
    this.searchService.getAllResume(this.params).subscribe(result => {
      if (result['success']) {
        this.searchList = result['success']['data'];
      }
    });
  }

  previous() {
    if (this.params.limit > 10) {
      this.params.limit -= this.limit;
      this.getData();
    }
  }

  next() {
    this.params.limit += this.limit;
    this.getData();
  }

  searchDetail(searchForm: any) {
    this.getParamObj(searchForm);
    this.getData();
  }

  getData() {
    if (!this.errCategory) {
      this.searchService.search(this.params).subscribe(result => {
        if (result['success']) {
          this.searchList = result['success']['data'];
          this.offset = this.limit;
        }
      });
    }
  }

  getParamObj(searchForm: any) {
    if (searchForm.category === 'Phone') {
      this.params = {
        phone: searchForm.search
      };
    } else if (searchForm.category === 'Name') {
      this.params = {
        firstName: searchForm.search
      };
    } else if (searchForm.category === 'Email') {
      this.params = {
        email: searchForm.search
      };
    } else if (searchForm.category === 'Technology') {
      this.params = {
        technologies: searchForm.search
      };
    } else {
      this.errCategory = true;
    }
    this.params.limit = this.limit;
    this.params.offset = this.offset;
  }

  downloadResume(resumeId: any) {
    this.searchService.downloadPdf(resumeId).subscribe(
      (res) => {
        saveAs(res, 'resume');
        const fileURL = URL.createObjectURL(res);
        window.open(fileURL);
      }
    );
  }

}
