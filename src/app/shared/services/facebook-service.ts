import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Platform} from '@ionic/angular';
import {SessionService} from './session-service';
import {Facebook, FacebookLoginResponse} from '@ionic-native/facebook/ngx';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {UserModel} from '../models/user.model';
import {FacebookAccountModel} from '../models/facebook-account.model';
import {FacebookPostModel} from '../models/facebook-post.model';
declare var FB: any;

@Injectable()
export class FacebookService {
  static readonly APP_KEY = '2295688167225162';

  constructor(
      private httpClient: HttpClient,
      public platform: Platform,
      private facebook: Facebook,
      private sessionService: SessionService,
  ) {

    (window as any).fbAsyncInit = response => {
      FB.init({
        appId      : FacebookService.APP_KEY,
        cookie     : true,
        xfbml      : true,
        version    : 'v4.0'
      });
      FB.AppEvents.logPageView();
    };

    (((d, s, id) => {
      let js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return; }
      js = d.createElement(s); js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk'));
  }
  // public facebookLogin() {
  //   return new Observable(observer => {
  //     const perms = new Array('email');
  //     this.facebook.login(perms).then((response: FacebookLoginResponse) => {
  //       if (response.status === 'connected') {
  //         this.sessionService.setSession(response);
  //         observer.next(true);
  //         observer.complete();
  //       } else {
  //         observer.next(false);
  //         observer.complete();
  //       }
  //     }, (error) => {
  //       console.log(error);
  //     });
  //   });
  // }

  public facebookLogin() {
    return new Observable(observer => {
      FB.login((response: FacebookLoginResponse) => {
        if (response.status === 'connected') {
          this.sessionService.setSession(response);
          observer.next(true);
          observer.complete();
        } else {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  public getFacebookProfile(): Observable<UserModel> {
    const url = `https://graph.facebook.com/me/?fields=id,first_name,last_name,email,picture{url}&access_token=${this.sessionService.getSessionAuthToken()}`;
    return this.httpClient.get(url).pipe(map(response => UserModel.fromResponse(response)));
  }

  public getFacebookAccountsPage(): Observable<FacebookAccountModel[]> {
      const url = `https://graph.facebook.com/me/accounts?fields=id,name,access_token,page_token,about,bio,picture{url}&access_token=${this.sessionService.getSessionAuthToken()}`;
      return this.httpClient.get(url).pipe(map( (response: {data: Array<FacebookAccountModel>, paging: any})  => {
      return response.data;
    }));
  }
  public getFacebookFeeds(accountId: number): Observable<FacebookPostModel[]> {
    const url = `https://graph.facebook.com/${accountId}/feed?fields=created_time,id,message,full_picture,from,attachments{url,title,type,description}&access_token=${this.sessionService.getSessionAuthToken()}`;
    return this.httpClient.get(url).pipe(map( (response: {data: Array<FacebookPostModel>, paging: any})  => {
      return response.data;
    }));
  }
  public postFacebookFeed(account: FacebookAccountModel, postData: any, imgBlob?: any): Observable<FacebookPostModel[]> {
    const params: any = {};
    const formData = new FormData();
    for (const key in postData) {
      if (postData.hasOwnProperty(key)) {
        if (postData[key] !== '' && postData[key] != null ) {
          params[key] = postData[key];
        }
      }
    }
    if (imgBlob) {
      formData.append('source', imgBlob);
    }
    console.log(params);
    const url = `https://graph.facebook.com/${account.id}/${imgBlob ? 'photos' : 'feed'}?access_token=${account.accessToken}`;
    return this.httpClient.post(url, imgBlob ? formData : null, { params}).pipe(map( (response: {data: Array<FacebookPostModel>, paging: any})  => {
      return response.data;
    }));
  }
}
