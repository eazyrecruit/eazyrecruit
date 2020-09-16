import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanysettingsComponent } from './companysettings.component';

describe('CompanysettingsComponent', () => {
  let component: CompanysettingsComponent;
  let fixture: ComponentFixture<CompanysettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanysettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanysettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
