import { Component, OnInit } from '@angular/core';
import {Router,ActivatedRoute} from '@angular/router';
import {MyserviceService} from '../../app/myservice.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-addpartner',
  templateUrl: './addpartner.component.html',
  styleUrls: ['./addpartner.component.css']
})
export class AddpartnerComponent implements OnInit {
   public partner:any={}
   public body: any = {}
  constructor(public route:Router, public Myservice: MyserviceService, private cookieService:CookieService) { }


  ngOnInit() {
     
    
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
      this.route.navigate(["/web/partners"])
  })
}

}
}
