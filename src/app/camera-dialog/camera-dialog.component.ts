import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, Subject } from 'rxjs';
import { WebcamImage, WebcamModule } from 'ngx-webcam';

@Component({
  selector: 'app-camera-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule, MatButtonModule, MatIconModule, WebcamModule],
  templateUrl: './camera-dialog.component.html',
  styleUrls: ['./camera-dialog.component.css']
})

export class CameraDialogComponent implements OnInit{
  constructor(private dialogRef: MatDialogRef<CameraDialogComponent>) {}

  permisionStatus: string | undefined;
  camData: any = null;
  trigger: Subject<void> = new Subject<void>()
  capturedImage: any;
  stream: any

  ngOnInit(): void {
    this.checkPermision()
  }

  checkPermision = async () => {
    this.stream = await navigator.mediaDevices.getUserMedia({video: {width: 50, height: 50}}).then((response) => {
      this.permisionStatus = 'Allowed';
      this.camData = response;
      console.log("[camDate] in check permission is: ", this.camData);
      
    }).catch(err => {
      this.permisionStatus = 'Not Allowed';
      console.log("[permissionStatus] in check permission is: ", this.permisionStatus);
    })
  }

  get $trigger(): Observable<void> {
    return this.trigger.asObservable()
  }

  capture (event: WebcamImage) {
    this.capturedImage = event.imageAsDataUrl
  }


  takeSnapshot() {
    this.trigger.next() // check on this
    // console.log("Snapshot taken", this.capturedImage);
    console.log("Snapshot taken");
    this.dialogRef.close(this.capturedImage)
    this.stream.getTracks().forEach((track: any) => {
      track.stop()
    });
    
  }

  closeDialog() {

    this.dialogRef.close()
    console.log("Close Dialog");
    
  }
}
