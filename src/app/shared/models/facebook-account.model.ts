export class FacebookAccountModel {
  id: number;
  name: string;
  accessToken: string;
  pageToken: string;
  pictureUrl?: string;

  static fromResponse(response: any): FacebookAccountModel {
    return Object.assign(new FacebookAccountModel(), {
      id: response.id,
      name: response.name,
      accessToken: response.access_token,
      pageToken: response.page_token,
      pictureUrl: response.picture.data.url,
    });
  }

  public clone(): FacebookAccountModel {
    return Object.assign(new FacebookAccountModel(), {
      id: this.id,
      name: this.name,
      accessToken: this.accessToken,
      pageToken: this.pageToken,
      pictureUrl: this.pictureUrl,
    });
  }
}
