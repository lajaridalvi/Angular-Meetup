import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboardpartial',
  templateUrl: './dashboardpartial.component.html',
  styleUrls: ['./dashboardpartial.component.css']
})
export class DashboardpartialComponent implements OnInit {
  public event:any={}

  constructor(public router:Router) { }

  ngOnInit() {
    
  }


}
// }
