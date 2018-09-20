import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MyserviceService } from '../myservice.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-newest',
  templateUrl: './newest.component.html',
  styleUrls: ['./newest.component.css']
})
export class NewestComponent implements OnInit {
  public event: any = {}
  public users:any=[]
  public body: any = {}

  constructor(public router:Router, public Myservice:MyserviceService, private cookieService:CookieService) { }

  ngOnInit() {
    this.pageload();
    this.event.users = [];


}
remove(userId){
  this.body.token = this.cookieService.get('token')
  this.body.userId = userId
  this.body.eventId = localStorage.getItem('eventId')
  this.Myservice.remove(this.body).subscribe(data=>{
    console.log(data)
    this.pageload();
    // this.router.navigate([data.redirect]);
    })

}
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
    this.pageload();
    // this.router.navigate([data.redirect]);
    })

}
pageload(){
  this.body.token = this.cookieService.get('token')
    this.body.eventCode = localStorage.getItem('eventId')
    this.Myservice.newestuser(this.body).subscribe(data=>{
      console.log(data);
      
    this.event=data;
    this.users=data.users;
  })
}

}
