import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Observable';
// import { Cookie } from 'ng2-cookies/ng2-cookies';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, observable } from 'rxjs';

import 'rxjs/add/operator/catch';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';
import { AngularWaitBarrier } from 'blocking-proxy/built/lib/angular_wait_barrier';
// import { HttpErrorResponse, HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})



export class MyserviceService {
  public url='http://localhost:3001'

  constructor(public http:HttpClient) { }


  //to signup new user
  public signupFunction(data):Observable<any>{    
    const  body = new HttpParams()
    .set('firstName',data.firstName)
    .set('lastName',data.lastName)
    .set('email',data.email)
    .set('password',data.password)
    .set('companyName',data.companyName)
    .set('jobTitle',data.jobTitle)
    return this.http.post(`${this.url}/registerweb `,body);
  }

  //singin code
  public signinFunction(data):Observable<any>{
     
    const body= new HttpParams()
      .set('email',data.email)
      .set('password',data.password)
    return this.http.post(`${this.url}/loginWeb`,body);

  }

  //to create event
  public createevent(data):Observable<any>{

    const body= new HttpParams()
    .set('token',data.token)
    .set('eventTitle',data.eventTitle)
    .set('eventDesc',data.eventDesc)
    .set('eventCode',data.eventCode)
    .set('startDate',data.startDate)
    .set('duration',data.duration)

    return this.http.post(`${this.url}/web/addEvent`,body);

  }

  public showevents(data):Observable<any>{
    const body= new HttpParams()
    .set('token',data.token)
    return this.http.post(`${this.url}/web/events`, body)

  }

  

  //to meet the partner

  public meetpartner(data):Observable<any>{
    console.log(data);
    
    const body =  new HttpParams()
    .set('token', data.token)
    .set('eventCode',data.eventId)
    .set('companyName', data.companyName)
    return this.http.post(`${this.url}/web/meetPartners`,body)
  }

  //to add partner

  public addprtnerFunction (data):Observable<any>{
    console.log(data);
    
     const body= new HttpParams()
      .set('token',data.token) 
      .set('companyName', data.companyName)
      .set('eventCode', data.eventCode)
      .set('companyUrl', data.companyUrl)
      .set('facebookUrl', data.facebookUrl)
      .set('linkedinUrl', data.linkedinUrl)
      .set('companyCode', data.companyCode)
      .set('Twitter', data.Twitter)
      .set('companyImg',data.companyImg)

      return this.http.post(`${this.url}/web/addPartner`,body)
  }

  //to show all partners

  public viewpartner(data):Observable<any>{
    const body = new HttpParams()
    .set('token',data.token)
    .set('eventCode', data.eventCode)

    return this.http.post(`${this.url}/web/partners`,body)
  }

  //to show all eventuser
  public showalleventUser(data):Observable<any>{
    console.log(data);    
    const body= new  HttpParams()
    .set('eventCode', data.eventCode)
    .set('token', data.token)
    return this.http.post(`${this.url}/web/thisEvent`, body)  
  }
  //to show all newest user

  public newestuser(data):Observable<any>{
     const body = new HttpParams()
     .set('token',data.token)
    .set('eventCode', data.eventCode)
     return this.http.post(`${this.url}/web/getallnewestusers`,body)
  }
  //to get all matches user
  public getallmatchedusers(data):Observable<any>{
    const body = new HttpParams()
    .set('token',data.token)
   .set('eventCode', data.eventCode)
    return this.http.post(`${this.url}/web/getallmatchedusers`,body)
 }

  //to join event
  public joinEvent(data):Observable<any>{
    const body = new HttpParams()
    .set('token',data.token)
    .set('eventCode',data.eventCode)
    return this.http.post(`${this.url}/web/joinEvent`, body)
  }

  //to remove user 
  public remove(data):Observable<any>{
    console.log(data)
    const body = new HttpParams()
      .set('token',data.token)
      .set('userId',data.userId)
      .set('eventId',data.eventId)

    return this.http.post(`${this.url}/web/removeattendees`, body) 

  }
  //to show all bookmark user

  public getallbookmarkuser(data):Observable<any>{
     const body =  new HttpParams()
     .set('token', data.token)
     .set('eventCode', data.eventCode)     
     return this.http.post(`${this.url}/web/getAllBookmarkedUsers`,body)
  }

  //to view profile of paticular user
   public viewprofile(data):Observable<any>{

    const body =  new HttpParams()
    .set('token', data.token)
    .set('eventCode', data.eventCode)  
    .set('userId', data.userId)
    return this.http.post(`${this.url}/web/viewProfile`,body)
   }
  //to pass eventcode on create evnt ke continue page pe(dashboard ka functiom)

  public push(data):Observable<any>{
    const body = new HttpParams()
    .set('token',data.token)
    .set('eventCode',data.eventCode)
    return this.http.post(`${this.url}/web/addEvent`, body)
  }
  //on dashboard for invitation details 
  public Invitations(data):Observable<any>{
    const body = new HttpParams()
      .set('token', data.token)
      .set('eventCode', data.eventCode)
      return this.http.post(`${this.url}/web/eventDetails`, body)
    
  }

  //on dashboard for statistics 

  public Statistics (data):Observable<any>{
    const body =  new HttpParams()
    .set('token',data.token)
    .set('eventCode', data.eventCode)

    return this.http.post(`${this.url}/web/dashboard`,body)

  }

  //on dashbord for details
   public Details (data):Observable<any>{
      const body =  new HttpParams()
       .set('token',data.token)
       .set('eventCode', data.eventCode)

       return this.http.post(`${this.url}/web/eventDetails`,body)
    }

    //to add and remove bookmarks

    public bookmarkuser(data):Observable<any>{
      console.log(data)
      const body = new HttpParams()
        .set('token',data.token)
        .set('userId',data.userId)
        .set('eventId',data.eventId)
  
      return this.http.post(`${this.url}/web/addBookmarks`, body)
     
  
    }

    //toshow eventinfo on eventinfo page

    public eventInfo (data):Observable<any>{
       const body =  new HttpParams()
        .set('token',data.token)
        .set('eventCode', data.eventCode)
        return this.http.post(`${this.url}/web/eventInfo`,body)
    }  
    public uploadFile(data):Observable<any>{
      const body = new HttpParams()
      .set('data', data.data)
      // var headers = new HttpHeaders()
      // .set('Content-Type', "multipart/form-data")      
     
      return this.http.post(`${this.url}/uploadfile`,data)
    }
}



//