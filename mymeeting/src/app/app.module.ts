import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service'; 

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ThisEventComponent } from './this-event/this-event.component';
import { EventPartialComponent } from './event-partial/event-partial.component';
import { HeaderpartialComponent } from './headerpartial/headerpartial.component';
import { FooterpartialComponent } from './footerpartial/footerpartial.component';
import { EventComponent } from './event/event.component';
import { MyscheduleComponent } from './myschedule/myschedule.component';
import { PartnersComponent } from './partners/partners.component';
import { EventinfoComponent } from './eventinfo/eventinfo.component';
import { EditprofileComponent } from './editprofile/editprofile.component';
import { DashboardpartialComponent } from './dashboardpartial/dashboardpartial.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { dashCaseToCamelCase } from '@angular/compiler/src/util';
import { CrateeventComponent } from './crateevent/crateevent.component';
import { AddpartnerComponent } from './addpartner/addpartner.component';
import { NewestComponent } from './newest/newest.component';
import { MatchesComponent } from './matches/matches.component';
import { BookmarkComponent } from './bookmark/bookmark.component';
import { ViewprofileComponent } from './viewprofile/viewprofile.component';
import { MeetpartnerComponent } from './meetpartner/meetpartner.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';

@NgModule({
  declarations: [
    AppComponent,
    
    HomeComponent,
    SignInComponent,
    SignUpComponent,
    ThisEventComponent,
    EventPartialComponent,
    HeaderpartialComponent,
    FooterpartialComponent,
    EventComponent,
    MyscheduleComponent,
    PartnersComponent,
    EventinfoComponent,
    EditprofileComponent,
    DashboardpartialComponent,
    DashboardComponent,
    CrateeventComponent,
    AddpartnerComponent,
    NewestComponent,
    MatchesComponent,
    BookmarkComponent,
    ViewprofileComponent,
    MeetpartnerComponent,
    PagenotfoundComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot([
      //below two lines is used for set home wala path
      {path: 'home', component: HomeComponent},
      {path: '', redirectTo: 'home', pathMatch:'full'},
      // {path: '**', component:HomeComponent},
      //to go on sign in page
      {path: 'sign-in', component: SignInComponent},
      {path: 'sign-up', component:SignUpComponent},
      {path:'event-partial', component:EventPartialComponent},
      {path:'web/thisEvent',component:ThisEventComponent},
      {path:'web/newest',component:NewestComponent},
      {path:'web/matches', component:MatchesComponent},
      {path:'web/bookmark', component:BookmarkComponent},
      {path: 'headerpartial', component:HeaderpartialComponent},
      {path:'footerpartial',component:FooterpartialComponent},
      {path:'event',component:EventComponent},
      {path:'myschedule',component:MyscheduleComponent},
      {path:'web/partners', component:PartnersComponent},
      {path: 'web/addPartner' , component:AddpartnerComponent},
      {path:'web/meetpartner', component:MeetpartnerComponent},
      {path:'eventinfo',component:EventinfoComponent},
      {path:'web/editprofile',component:EditprofileComponent},
      {path:'web/viewprofile',component:ViewprofileComponent},
      {path:'dashboardpartial',component:DashboardpartialComponent},
      {path:'dashboard',component:DashboardComponent},
      {path:'crateevent',component:CrateeventComponent},
      {path:'**', component:PagenotfoundComponent},



    ])
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
