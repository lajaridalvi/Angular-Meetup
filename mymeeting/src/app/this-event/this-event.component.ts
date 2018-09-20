import { Component, OnInit } from '@angular/core';
import {Router ,ActivatedRoute } from '@angular/router';
import {MyserviceService } from '../../app/myservice.service'
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-this-event',
  templateUrl: './this-event.component.html',
  styleUrls: ['./this-event.component.css']
})
export class ThisEventComponent implements OnInit {

  public event: any = {}
  public users:any=[]
  public body: any = {}
  constructor(public router :Router , public Myservice:MyserviceService, private cookieService:CookieService, public route:ActivatedRoute) { }

  ngOnInit() {
    this.loadPage();
    this.event.users = [];
  }

  remove(userId){
    this.body.token = this.cookieService.get('token')
    this.body.userId = userId
    this.body.eventId = localStorage.getItem('eventId')
    this.Myservice.remove(this.body).subscribe(data=>{
      console.log(data)
      this.loadPage();
      // this.router.navigate([data.redirect]);
      })

  }

    //to view profile
    viewprofile(userId){
      this.router.navigate(['/web/viewprofile'], { queryParams: { userId: userId } })
        
  }
  //to add and remove bookmark
  bookmarkuser(userId){
    this.body.token = this.cookieService.get('token')
    this.body.userId = userId
    this.body.eventId = localStorage.getItem('eventId')
    this.Myservice.bookmarkuser(this.body).subscribe(data=>{
      console.log(data)
      this.loadPage();
      // this.router.navigate([data.redirect]);
      })

  }

  loadPage() {
    this.body.token = this.cookieService.get('token')
    this.body.eventCode = localStorage.getItem('eventId')
    this.Myservice.showalleventUser(this.body).subscribe(data=>{
      console.log(data);
      
    this.event=data;
    this.users=data.users;
      
    })
  }
}
