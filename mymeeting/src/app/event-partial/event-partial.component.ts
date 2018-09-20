import { Component, OnInit } from '@angular/core';
import { MyserviceService } from '../myservice.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';



@Component({
  selector: 'app-event-partial',
  templateUrl: './event-partial.component.html',
  styleUrls: ['./event-partial.component.css']
})
export class EventPartialComponent implements OnInit {
  public eventTitle:any=[]

  constructor(private Myservice:MyserviceService,public router:Router,private CookieService:CookieService) { }

  ngOnInit() {
    this.eventTitle= localStorage.getItem('eventTitle')
    // this.eventTitle= localStorage.getItem('eventTitle')

    if(this.router.url == '/web/thisEvent'){
      document.getElementById('people').classList.add('nav-active')

    }else if(this.router.url == '/myschedule'){
      document.getElementById('Schedule').classList.add('nav-active')

    }else if(this.router.url == '/web/partners'){
      document.getElementById('Partners').classList.add('nav-active')

  }else if(this.router.url == '/web/editprofile'){
    document.getElementById('Profile').classList.add('nav-active')

}
  }
}
