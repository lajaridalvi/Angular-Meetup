import { Component, OnInit } from '@angular/core';
import{Router,ActivatedRoute} from '@angular/router';
import{MyserviceService} from '../../app/myservice.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-crateevent',
  templateUrl: './crateevent.component.html',
  styleUrls: ['./crateevent.component.css']
})
export class CrateeventComponent implements OnInit {

  public event:any={}
  // public body:any={}

  constructor(public Myservice: MyserviceService , public router :Router ,private cookieService:CookieService, public route:ActivatedRoute) { }

  ngOnInit() {
  }

  onsubmit(){

    if(!this.event.eventTitle || !this.event.eventDesc  || !this.event.eventCode || !this.event.startDate ||!this.event.duration ){
      
     
      document.getElementById('snackbar').classList.add('show')
      document.getElementById('snackbar').innerHTML = "Please Enter All Valid Details..."
      setTimeout(function() {
        document.getElementById('snackbar').className = document.getElementById('snackbar').className.replace("show", "");
      }, 3000);
      
  }else{  
    console.log('submit create event');
    
    this.event.token= this.cookieService.get("token")

    this.Myservice.createevent(this.event).subscribe(data=>{
      console.log(data);
      localStorage.setItem('eventId',data.event._id)
      localStorage.setItem('eventTitle',data.event.eventTitle)
      localStorage.setItem('admin',data.event.admin)

      // this.router.navigate(['web/thisEvent']);   
      this.router.navigate([data.redirect])
    })
  }
  
}}
