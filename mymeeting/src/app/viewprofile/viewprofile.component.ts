import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router, ActivatedRoute } from '@angular/router';
import { MyserviceService } from '../myservice.service';

@Component({
  selector: 'app-viewprofile',
  templateUrl: './viewprofile.component.html',
  styleUrls: ['./viewprofile.component.css']
})
export class ViewprofileComponent implements OnInit {
  public profileUser:any=[]
  public body: any = {}
  public event:any={}

  constructor(public cookieService:CookieService, public router:Router,public Myservice:MyserviceService, public _route: ActivatedRoute) { }

  ngOnInit() {
    this.loadpage();
  }

  loadpage(){
    this.body.userId = this._route.snapshot.queryParamMap.get("userId");
    this.body.token = this.cookieService.get('token')
    this.body.eventCode = localStorage.getItem('eventId')
    this.Myservice.viewprofile(this.body).subscribe(data=>{
      
      console.log('viewprofile',data);
      this.profileUser = data.profileUser;
    // this.event=data;
    // this.users=data.users;
      
    })
  }

  //to add and remove bookmark
  bookmarkuser(userId){
    this.body.token = this.cookieService.get('token')
    this.body.userId = userId
    this.body.eventId = localStorage.getItem('eventId')
    this.Myservice.bookmarkuser(this.body).subscribe(data=>{
      console.log(data)
      this.loadpage();
      // this.router.navigate([data.redirect]);
      })

  }
  }


