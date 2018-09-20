import { Component, OnInit } from '@angular/core';
import {Router,RouterModule} from '@angular/router';
import {MyserviceService } from '../../app/myservice.service'
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public selectedTab: any;
  public events:any=[]
  public user:any={}
  public body: any = {}
  public eventDetails : any = {}
  public eventName:any
  public duration:any
  public startDate:any
  public partner:any={}
  public Statistics:any={}
  public Details :any={}
  public Invitations : any={}


  constructor(private Myservice: MyserviceService , private router: Router, private cookieService:CookieService) { }
  changetab(selected_tab) {
    this.selectedTab = selected_tab
    console.log(selected_tab);
    
    if(selected_tab === 'Statistics') {
      // this.body.token = this.cookieService.get("token");
    this.body.token= this.cookieService.get("token")

    this.body.eventCode = localStorage.getItem('eventId')
      this.Myservice.Statistics(this.body).subscribe(data => {
        this.eventDetails = data.events
        this.eventName = data.events.eventTitle
        console.log(this.eventDetails);

        document.getElementById("stats").classList.add("nav-active");
        document.getElementById("details").classList.remove("nav-active");
        document.getElementById("invite").classList.remove("nav-active");
        document.getElementById("partners").classList.remove("nav-active");
      })
    }

    else if(selected_tab === 'Invitations') {
      // this.body.token = this.cookieService.get("token");
    this.body.token= this.cookieService.get("token")

    this.body.eventCode = localStorage.getItem('eventId')
      this.Myservice.Invitations(this.body).subscribe(data => {
        this.eventDetails = data.events
        console.log(this.eventDetails);

        document.getElementById("stats").classList.remove("nav-active");
        document.getElementById("details").classList.remove("nav-active");
        document.getElementById("invite").classList.add("nav-active");
        document.getElementById("partners").classList.remove("nav-active");

      })
    }

   else if(selected_tab === 'Details') {
      // this.body.token = this.cookieService.get("token");
    this.body.token= this.cookieService.get("token")

    this.body.eventCode = localStorage.getItem('eventId')
      this.Myservice.Details(this.body).subscribe(data => {
        this.eventDetails = data.events
        this.eventName = data.events.eventTitle
        this.startDate = data.events.startDate
        this.duration = data.events.duration


        document.getElementById("stats").classList.remove("nav-active");
        document.getElementById("details").classList.add("nav-active");
        document.getElementById("invite").classList.remove("nav-active");
        document.getElementById("partners").classList.remove("nav-active");

        console.log(this.eventDetails);
      })
    }
    else if(selected_tab == 'partner'){
      
      this.partner.token= this.cookieService.get("token")
      this.partner.eventCode= localStorage.getItem("eventId")

      document.getElementById("stats").classList.remove("nav-active");
      document.getElementById("details").classList.remove("nav-active");
      document.getElementById("invite").classList.remove("nav-active");
      document.getElementById("partners").classList.add("nav-active");

  
    //   this.Myservice.addprtnerFunction(this.partner).subscribe(data=>{
    //     console.log(data);
    //     // this.router.navigate(["/web/addpartner"])
    // })
  }

    
  }
  onsubmit(){ 
    if(!this.partner.companyName|| !this.partner.companyUrl || !this.partner.facebookUrl || !this.partner.linkedinUrl || !this.partner.companyCode || !this.partner.Twitter){

      
      document.getElementById('snackbar').classList.add('show')
      document.getElementById('snackbar').innerHTML = "Please Enter All Valid Details..."

      setTimeout(function() {
        document.getElementById('snackbar').className = document.getElementById('snackbar').className.replace("show", "");
      }, 3000);

    }else{  
        console.log(this.partner)
    this.partner.token= this.cookieService.get("token")
    this.partner.eventCode= localStorage.getItem("eventId")

    this.Myservice.addprtnerFunction(this.partner).subscribe(data=>{
      console.log(data);
      this.router.navigate(["/web/partners"])
  })
}

}
 
  ngOnInit() {
    
    this.body.token= this.cookieService.get("token")
    this.body.eventCode = localStorage.getItem('eventId')
    this.Myservice.Statistics(this.body).subscribe(data => {
    this.eventDetails = data.events
    this.eventName = data.events.eventTitle
    this.selectedTab = 'Statistics';//this line of code for on first time statistics page show only
    document.getElementById("stats").classList.add("nav-active");
    
   

    //to show active calss on nav bar
   this.Statistics(function(){
      (this.Statistics= true),
      (this.Details = false),
      (this.Invitations = false),
      (this.partner = false)
     
    })

    this.Details(function(){
      (this.Statistics= false),
      (this.Details = true),
      (this.Invitations = false),
      (this.partner = false)    
    })

    this.Invitations(function(){
      (this.Statistics= false),
      (this.Details = false),
      (this.Invitations = true),
      (this.partner = false)    
    })

    this.partner(function(){
      (this.Statistics= false),
      (this.Details = false),
      (this.Invitations = false),
      (this.partner = true)    
    })
  })

}
uploadFile(e) {
  console.log('UPLOAD', e);
  // this.body.token = this.cookieService.get('token');
  var file = document.querySelector('#file');
  console.log('>>>file>>>',e.target.files[0]);
  
  var data = new FormData();
  data.append('profileImage', e.target.files[0])
  this.Myservice.uploadFile(data).subscribe(res => {
    console.log('image--', res);
    this.partner.companyImg = res.image_data.url;
    
  })
}
}
