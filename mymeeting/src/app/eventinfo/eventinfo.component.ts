import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MyserviceService } from '../myservice.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-eventinfo',
  templateUrl: './eventinfo.component.html',
  styleUrls: ['./eventinfo.component.css']
})
export class EventinfoComponent implements OnInit {
  // public eventDetails : any = {}
  // public eventName:any  
  // public startDate:any
  // public body:any={}
  public eventDetails:any={}
  public body: any = {}


  constructor( public router:Router, public Myservice:MyserviceService, private cookieService:CookieService) { }

  ngOnInit() {
    this.eventDetails.events = {}
    this.eventDetails.events.duration =[];
    // this.eventTitle= localStorage.getItem('eventTitle')
    this.body.token = this.cookieService.get("token")
    this.body.eventCode = localStorage.getItem('eventId')
    this.Myservice.eventInfo(this.body).subscribe(data => {
      console.log(data);
          this.eventDetails = data;
    })

  }
  
}
