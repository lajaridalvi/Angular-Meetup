import { Component, OnInit } from '@angular/core';
import {Router,RouterModule} from '@angular/router';
import {MyserviceService } from '../../app/myservice.service'
import { CookieService } from 'ngx-cookie-service';
import { $ } from 'protractor';


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  public loginuser:any={}

  constructor(private Myservice: MyserviceService , public route: Router, private cookieService: CookieService ) { }

  ngOnInit() {
  }
  navigate(){
    this.route.navigate(['/sign-up']);
  }
  onsubmit(){

    if(!this.loginuser.email || !this.loginuser.password ){
      
     
      document.getElementById('snackbar').classList.add('show')
      document.getElementById('snackbar').innerHTML = "Please Enter All Valid Details..."

      setTimeout(function() {
        document.getElementById('snackbar').className = document.getElementById('snackbar').className.replace("show", "");
      }, 3000);
      
  }else{  
    this.Myservice.signinFunction(this.loginuser).subscribe(data => {
      console.log(data);
      
      // this.cookieService.set('userProfileColor',data.userProfileColor)



      if(data.message) {
        document.getElementById('snackbar').classList.add('show')
        document.getElementById('snackbar').innerHTML = data.message

        setTimeout(function() {
          document.getElementById('snackbar').className = document.getElementById('snackbar').className.replace("show", "");
        }, 3000);

      } else {
        this.cookieService.set('token',data.token)
      this.cookieService.set('userId',data.userId)
      this.cookieService.set('userFName',data.userFName)
      this.cookieService.set('userLName',data.userLName)
        this.route.navigate([data.redirect])    
      }
         })
  }
}}

