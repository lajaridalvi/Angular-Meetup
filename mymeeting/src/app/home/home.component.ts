import { Component, OnInit } from '@angular/core';
import {Router,RouterModule} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(public router: Router) { }

  ngOnInit() {
  }

  navigate(){

    this.router.navigate(['/sign-in']);

  }
}