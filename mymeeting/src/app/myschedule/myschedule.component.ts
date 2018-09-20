import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-myschedule',
  templateUrl: './myschedule.component.html',
  styleUrls: ['./myschedule.component.css']
})
export class MyscheduleComponent implements OnInit {
  public users: any

  constructor() { }
 

  ngOnInit() {
   this.users=[1,2,3];
  }

}
