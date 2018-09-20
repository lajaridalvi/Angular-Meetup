import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MyserviceService } from '../myservice.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.css']
})
export class PartnersComponent implements OnInit {
  // public partners:any;
  public partners:any=[]
  public body:any={}

  constructor(public router :Router , public Myservice:MyserviceService, private cookieService:CookieService) { }

  ngOnInit() {
    // this.partners=[1,2,3,4,5];
    // this.parts=[1,2,3,4,5];
    this.body.token = this.cookieService.get('token')
    this.body.eventCode = localStorage.getItem('eventId')
    this.Myservice.viewpartner(this.body).subscribe(data=>{
      this.partners = data.partners;
      console.log(data);
      
    // this.event=data;
    // this.users=data.users;
      
    })
  }
  meetpartner(companyName){
    console.log('/////',companyName);
    
    this.router.navigate(['/web/meetpartner'], { queryParams: { companyName: companyName } })


  }

}
