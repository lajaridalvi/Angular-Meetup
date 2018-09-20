import { Component, OnInit } from '@angular/core';
import {Router,RouterModule} from '@angular/router';
import {MyserviceService } from '../../app/myservice.service'
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
public events: any=[]
public user:any={}
public body:any={}
public joinevent:any
  constructor(private Myservice: MyserviceService , private router: Router, private cookieService: CookieService , ) { }

  ngOnInit() {
   this.pageload()    
  }

  joinEvent() {
      this.body.token = this.cookieService.get('token')
      this.body.eventCode = this.joinevent;
      this.Myservice.joinEvent(this.body).subscribe(data=>{
        // console.log('..../??..??',data);

        if(data.message){
          document.getElementById('snackbar').classList.add('show')
          document.getElementById('snackbar').innerHTML = data.message

          setTimeout(function() {
            document.getElementById('snackbar').className = document.getElementById('snackbar').className.replace("show", "");
          }, 3000);

        }else{        
      this.router.navigate([data.redirect]);
      this.pageload()    
    }
   
    })
  }

  open(eventId, eventTitle, eventAdmin){
      localStorage.setItem('eventId',eventId)
      localStorage.setItem('eventAdmin',eventAdmin)
      localStorage.setItem('eventTitle',eventTitle)
      this.router.navigate(['web/thisEvent']);   
  }

  dashboard(eventId, eventTitle, eventAdmin){
      localStorage.setItem('eventId',eventId)
      localStorage.setItem('eventAdmin',eventAdmin)
      localStorage.setItem('eventTitle',eventTitle)
      this.router.navigate(['dashboard']);   
    }
  pageload(){
      this.body.token = this.cookieService.get('token')
      this.Myservice.showevents(this.body).subscribe(data=>{
      console.log(data);
      this.events = data.events;
      this.user=data.user;
    })
  }
}
