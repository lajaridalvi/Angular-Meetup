import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-headerpartial',
  templateUrl: './headerpartial.component.html',
  styleUrls: ['./headerpartial.component.css']
})
export class HeaderpartialComponent implements OnInit {

  constructor(private cookieService: CookieService, public router:Router) { }
  public body:any={}
  ngOnInit() {

    // this.body.token = this.cookieService.get('token')
    this.body.userFName = this.cookieService.get('userFName')
    this.body.userLName = this.cookieService.get('userLName')

    

  }

  logout(){
    this.cookieService.deleteAll();
    localStorage.clear()
    this.router.navigate(['sign-in'])
  }

 

}
