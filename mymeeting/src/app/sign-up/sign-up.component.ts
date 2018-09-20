import { Component, OnInit } from '@angular/core';
import {Router ,ActivatedRoute } from '@angular/router';
import {MyserviceService } from '../../app/myservice.service'
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
   
  public registerUser: any={}

  constructor(private Myservice: MyserviceService, public route:Router, private cookieService:CookieService) { }

  ngOnInit() {

  }
  onsubmit() {
    // console.log(this.registerUser);
    
    if(!this.registerUser.firstName || !this.registerUser.lastName || !this.registerUser.email || !this.registerUser.password ||!this.registerUser.companyName  || !this.registerUser.jobTitle ){
      
     
      document.getElementById('snackbar').classList.add('show')
      document.getElementById('snackbar').innerHTML = "Please Enter All Valid Details..."

      setTimeout(function() {
        document.getElementById('snackbar').className = document.getElementById('snackbar').className.replace("show", "");
      }, 3000);
      
        
    }else{    
      this.Myservice.signupFunction(this.registerUser).subscribe(data => {

        if(data.message) {
          document.getElementById('snackbar').classList.add('show')
          document.getElementById('snackbar').innerHTML = data.message
  
          setTimeout(function() {
            document.getElementById('snackbar').className = document.getElementById('snackbar').className.replace("show", "");
          }, 3000);
        } else {

      console.log(data);
      if(data.token) {
      this.cookieService.set('token',data.token)
      this.cookieService.set('userId',data.userId)
      this.route.navigate([data.redirect])   
      } 
    }
  })
}
}
}
