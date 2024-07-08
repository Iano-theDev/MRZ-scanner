import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, Subject } from 'rxjs';
import { WebcamImage, WebcamModule, WebcamUtil } from 'ngx-webcam';
import { ImageCroppedEvent, ImageCropperComponent, ImageTransform } from 'ngx-image-cropper';
import html2canvas from 'html2canvas';


@Component({
  selector: 'app-camera-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule, MatButtonModule, MatIconModule, WebcamModule, ImageCropperComponent],
  templateUrl: './camera-dialog.component.html',
  styleUrls: ['./camera-dialog.component.css']
})

export class CameraDialogComponent implements OnInit {
  
  @ViewChild('idArea') idArea!: ElementRef<HTMLDivElement>
  
  permisionStatus: string | undefined;
  camData: any = null;
  trigger: Subject<void> = new Subject<void>()
  nextCamera: Subject<boolean | string> = new Subject<boolean | string>()
  capturedImage: any;
  stream: any
  multipleCameras: boolean = false
  deviceId!: string;
  imageToCrop: any;
  croppingID: boolean = false
  croppingMRZ: boolean = false

  transform: ImageTransform = {
    translateUnit: 'px'
};
  
  // test
  croppedImage: any = '';
  constructor(private dialogRef: MatDialogRef<CameraDialogComponent>) { }

  ngOnInit(): void {
    this.checkPermision()
  }

  checkPermision = async () => {
    // this.stream = await navigator.mediaDevices.getUserMedia({video: {width: 50, height: 50}}).then((response) => {
    //   this.permisionStatus = 'Allowed';
    //   this.camData = response;
    //   console.log("[camData] in check permission is: ", this.camData);

    // }).catch(err => {
    //   this.permisionStatus = 'Not Allowed';
    //   console.log("[permissionStatus] in check permission is: ", this.permisionStatus);
    // })
    WebcamUtil.getAvailableVideoInputs().then(
      (mediaDevices: MediaDeviceInfo[]) => {
        this.camData = mediaDevices
        this.multipleCameras = mediaDevices && mediaDevices.length > 1
        if (this.multipleCameras) console.log("Got something!");
        else console.log("Only one or no cameras at all")

      }
    )
  }

  get $trigger(): Observable<void> {
    return this.trigger.asObservable()
  }

  capture(event: WebcamImage) {
    console.log("[capture] taking a snap!");
    // const idAreaElement = this.idArea?.nativeElement
    this.capturedImage = event.imageAsDataUrl
    this.imageToCrop = event.imageAsBase64
  }


  takeSnapshot() {
    this.trigger.next() // check on this
    // console.log("Snapshot taken", this.capturedImage);

    console.log("Snapshot taken");
    this.croppingID = true

    // this line should only exectute after the image is cropped
    // this.dialogRef.close(this.capturedImage)
    // this.stream.getTracks().forEach((track: any) => {
    //   track.stop()
    // });

  }

  switchCamera(statusOrId: boolean | string) {
    this.nextCamera.next(statusOrId);
  }

  closeDialog() {

    this.dialogRef.close()
    console.log("Close Dialog");

  }
  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextCamera.asObservable();
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl;
  }

  cropCurrentDimensions () {
    this.dialogRef.close(this.croppedImage)
  }
  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

}
