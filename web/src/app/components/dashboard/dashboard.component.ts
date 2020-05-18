import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FullCalendarOptions, EventObject, FullCalendarComponent } from 'ngx-fullcalendar';
import { InterviewService } from '../../services/interview.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { SchedulerComponent } from '../interview/scheduler/scheduler.component';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import { ReportService } from '../../services/report.service';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [InterviewService, ReportService]
})
export class DashboardComponent implements OnInit {

  events: EventObject[] = [];
  modalRef: BsModalRef;

  options: FullCalendarOptions;
  @ViewChild('fullCalendar')
  private fullCalendarElement: FullCalendarComponent;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;


  public lineChartData: ChartDataSets[] = [];
  public lineChartLabels: Label[] = [];
  public lineChartType = 'line';
  public lineChartColors: Color[] = [ { borderColor: 'red' }, ]

  interviews: any;
  role: any;

  constructor(
    private interviewService: InterviewService,
    private modalService: BsModalService,
    private reportService: ReportService,
    private accountService: AccountService
  ) { }

  ngOnInit() {
    this.options = { editable: true };
    this.loadResumeByDay();
    this.role = this.accountService.getRole();
  }

  loadCalendar(start, end) {
    this.interviewService.getEventBetweenDates(start,end).subscribe(res => {
      if (res['success']) {
        let allevents = this.fullCalendarElement.calendar.getEvents();
        allevents.forEach(el => { el.remove(); }); 
        res['success'].data.forEach(interview => {
          var startDate = new Date(interview.start);
          var endDate = new Date(interview.end);
          this.fullCalendarElement.calendar.addEvent({
            id: interview._id,
            title: this.getFullName(interview.jobApplicant.firstName,interview.jobApplicant.middleName,interview.jobApplicant.lastName),
            start: startDate.toString(),
            end: endDate.toString(),
            extendedProps: interview
          });
        });
      }
    });
  }

  loadResumeByDay() {
    this.reportService.getForLast15Days().subscribe(res => {
      if (res['success'] && res['success'].data && res['success'].data.aggregations) {
        if (res['success'].data.aggregations.byday && res['success'].data.aggregations.byday.buckets
          && res['success'].data.aggregations.byday.buckets.length > 0) {
          var labels = [], totals = [], emails = [], websites = [], uploads = [], dbs = [];
          res['success'].data.aggregations.byday.buckets.forEach(bucket => {
            labels.push(new Date(bucket.key_as_string).toLocaleDateString());
            totals.push(bucket.doc_count);
            if (bucket.value && bucket.value.buckets && bucket.value.buckets.length > 0) {
              var upload = bucket.value.buckets.find(buk => buk.key == 'upload');
              if (upload) uploads.push(upload.doc_count); else uploads.push(0);
              var email = bucket.value.buckets.find(buk => buk.key == 'email');
              if (email) emails.push(email.doc_count); else emails.push(0);
              var website = bucket.value.buckets.find(buk => buk.key == 'website');
              if (website) websites.push(website.doc_count); else websites.push(0);
              var db = bucket.value.buckets.find(buk => buk.key == 'db');
              if (db) dbs.push(db.doc_count); else dbs.push(0);
            } else {
              uploads.push(0); emails.push(0); websites.push(0); dbs.push(0);
            }
          });
          var reportData = [{ data: totals, label: "Total" }, { data: uploads, label: "Upload" },
          { data: emails, label: "Email" }, { data: websites, label: "Website" }, { data: dbs, label: "DB" }
          ];
          this.lineChartLabels = labels;
          this.lineChartData = reportData;
        }
      }
    });
  }

  onDatesRender(eventInfo) {
    if(eventInfo && eventInfo.info && eventInfo.info.view &&
      eventInfo.info.view.props && eventInfo.info.view.props.dateProfile &&
      eventInfo.info.view.props.dateProfile.activeRange && eventInfo.info.view.props.dateProfile.activeRange.start &&
      eventInfo.info.view.props.dateProfile.activeRange.end){
        this.loadCalendar(eventInfo.info.view.props.dateProfile.activeRange.start.getTime(), 
          eventInfo.info.view.props.dateProfile.activeRange.end.getTime());
    }
  }

  onEventClick(eventInfo) {
    this.modalRef = this.modalService.show(SchedulerComponent, {
      initialState: {
        event: {
          extendedProps: eventInfo.event.extendedProps,
          start: eventInfo.event.extendedProps.start,
          end: eventInfo.event.extendedProps.end,
          id: eventInfo.event.extendedProps._id
        } 
      }
    });
    this.modalRef.content.close = (data) => {
      if (data) {
        let updatedEvent = this.fullCalendarElement.calendar.getEventById(data.interview._id);
        var startDate = new Date(data.start);
        var endDate = new Date(data.end);
        data.jobApplicant = updatedEvent.extendedProps.jobApplicant;
        this.fullCalendarElement.calendar.addEvent({
          id: data._id,
          title: this.getFullName(data.jobApplicant.firstName,data.jobApplicant.middleName,data.jobApplicant.lastName),
          start: startDate.toString(),
          end: endDate.toString(),
          extendedProps: data
        });
        updatedEvent.remove();
        this.modalRef.hide();
      }
    }
  }

  getFullName(firstName, middleName, lastName) {
    var name = firstName;
    if (middleName) name = name + " " + middleName;
    if (lastName) name = name + " " + lastName;
    return name;
  }

  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: { xAxes: [{}], yAxes: [{ id: 'y-axis-0', position: 'left', }]},
    annotation: { annotations: [{ type: 'line', mode: 'vertical', scaleID: 'x-axis-0', borderWidth: 2,
          label: { enabled: false, fontColor: 'orange', content: 'LineAnno' }}]},
    maintainAspectRatio: false
  };
}
