import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MrzService {
  tessaractServer:string =  'http://localhost:5000'

  constructor(private http: HttpClient) { }

  pingTessaractServer() {
    console.log("[pingTessaractServer] service running ...");
    return this.http.get(this.tessaractServer)
  }

  getMrzText(img: any) {
    const formdata = new FormData()
    formdata.append('file', img, 'image.png')
    console.log("[getMrzTex] service running ...");
    
    // const imageObj = {
    //   image: img
    // }
    // const imageObj = {
    //   image: formdata
    // }


    return this.http.post(this.tessaractServer + "/getMrzText", formdata)
  }
}
