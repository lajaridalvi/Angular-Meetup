import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ParsedVariable } from '@angular/compiler';
import { MyserviceService } from '../myservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.css']
})
export class BookmarkComponent implements OnInit {
   public body:any ={}
   public event: any = {}
  public users:any=[]

  constructor(private cookieService:CookieService, public Myservice:MyserviceService,public router:Router) { }

  ngOnInit() {

    this.loadPage();
    this.event.users = [];

  }

    loadPage() {
      this.body.token = this.cookieService.get('token')
      this.body.eventCode = localStorage.getItem('eventId')
      this.Myservice.getallbookmarkuser(this.body).subscribe(data=>{
      console.log(data);        
      this.event=data;
      this.users=data.users;
        
      })
    }

    remove(userId){
      this.body.token = this.cookieService.get('token')
      this.body.userId = userId
      this.body.eventId = localStorage.getItem('eventId')
      this.Myservice.remove(this.body).subscribe(data=>{
        console.log(data)
        this.loadPage();
        })
  
    }
  
  
    //to add and remove bookmark
    bookmarkuser(userId){
      this.body.token = this.cookieService.get('token')
      this.body.userId = userId
      this.body.eventId = localStorage.getItem('eventId')
      this.Myservice.getallbookmarkuser(this.body).subscribe(data=>{
        console.log(data)
        this.loadPage();
        // this.router.navigate([data.redirect]);
        })
  
    }

    //to view profile
    viewprofile(userId){
      this.body.token = this.cookieService.get('token')
      this.body.userId = userId
      this.body.eventId = localStorage.getItem('eventId')
      this.Myservice.viewprofile(this.body).subscribe(data=>{

        this.router.navigate(['/web/viewprofile'])
        // console.log(data)
        this.loadPage();
        })
  
  }
}
  
  
