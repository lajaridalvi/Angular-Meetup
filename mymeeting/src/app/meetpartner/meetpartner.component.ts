import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MyserviceService } from '../myservice.service';

@Component({
  selector: 'app-meetpartner',
  templateUrl: './meetpartner.component.html',
  styleUrls: ['./meetpartner.component.css']
})
export class MeetpartnerComponent implements OnInit {

  constructor(public router:Router, public cookieService:CookieService, public Myservice:MyserviceService, public _route:ActivatedRoute) { }
  // public events: any=[]
  public user:any={}
  public body:any={}


  ngOnInit() {
    this.body.token = this.cookieService.get('token')
    this.body.eventId = localStorage.getItem('eventId')
    this.body.companyName = this._route.snapshot.queryParamMap.get("companyName");
    this.Myservice.meetpartner(this.body).subscribe(data=>{
      // console.log(data);
      this.user = data
      console.log('meetpartner',data);



  })
  }
 }
