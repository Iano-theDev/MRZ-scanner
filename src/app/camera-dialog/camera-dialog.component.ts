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
import { BarcodeReader } from 'dynamsoft-javascript-barcode';


@Component({
  selector: 'app-camera-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule, MatButtonModule, MatIconModule, WebcamModule, ImageCropperComponent],
  templateUrl: './camera-dialog.component.html',
  styleUrls: ['./camera-dialog.component.css']
})

export class CameraDialogComponent implements OnInit {
  
  @ViewChild('idAreaRef') idAreaDiv!: ElementRef<HTMLDivElement>
  @ViewChild('webcamIdAreaRef') webcamIdAreaDiv!: ElementRef<HTMLDivElement>
  @ViewChild('canvas') canvasDiv!: ElementRef<HTMLCanvasElement>
  
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
  croppedIdZone: any = '';
  croppedIdZone64: any = '';
  croppedMrzZone: any;
  croppedMrzZone64: any;
  constructor(private dialogRef: MatDialogRef<CameraDialogComponent>) { }

  ngOnInit() {
    // BarcodeReader.license = 'DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAzMDAwNjExLVRYbFhaV0pRY205cSIsIm1haW5TZXJ2ZXJVUkwiOiJodHRwczovL21kbHMuZHluYW1zb2Z0b25saW5lLmNvbSIsIm9yZ2FuaXphdGlvbklEIjoiMTAzMDAwNjExIiwic3RhbmRieVNlcnZlclVSTCI6Imh0dHBzOi8vc2Rscy5keW5hbXNvZnRvbmxpbmUuY29tIiwiY2hlY2tDb2RlIjoyMTA2NzEyNTI0fQ==';

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
    console.log("[capture] taking a snap!", this.imageToCrop);

    // const canvas = this.canvasDiv.nativeElement;
    // const context = canvas.getContext('2d');
    // const idArea = this.webcamIdAreaDiv.nativeElement;

    // if (context) {
    //   const image = new Image();
    //   image.src = this.capturedImage

    //   image.onload = () => {
    //     // Draw the full captured image onto the canvas
    //     context.drawImage(image, 0, 0, image.width, image.height);

    //     // Get the position and size of the id-area overlay
    //     const rect = idArea.getBoundingClientRect();
    //     const x = rect.left;
    //     const y = rect.top;
    //     const width = rect.width;
    //     const height = rect.height;

    //     // Calculate the scale factor for the canvas
    //     const scaleX = canvas.width / image.width;
    //     const scaleY = canvas.height / image.height;

    //     // Scale the coordinates and dimensions
    //     const scaledX = x * scaleX;
    //     const scaledY = y * scaleY;
    //     const scaledWidth = width * scaleX;
    //     const scaledHeight = height * scaleY;

    //     // Get the image data for the id-area overlay
    //     const croppedIdZoneData = context.getImageData(scaledX, scaledY, scaledWidth, scaledHeight);

    //     // Clear the canvas and resize it to the cropped area
    //     context.clearRect(0, 0, canvas.width, canvas.height);
    //     canvas.width = scaledWidth;
    //     canvas.height = scaledHeight;

    //     // Draw the cropped image data onto the canvas
    //     context.putImageData(croppedIdZoneData, 0, 0);
    //   };
    // }
 
  }


  takeSnapshot() {
    this.trigger.next() // check on this
    // console.log("Snapshot taken", this.capturedImage);

    console.log("Snapshot taken");
 
    this.croppingID = true;
    // this.cropIdZone()

    // this line should only exectute after the image is cropped
    // this.dialogRef.close(this.capturedImage)
    // this.stream.getTracks().forEach((track: any) => {
    //   track.stop()
    // });

  }

  cropIdZone()  {
    console.log("Cropping id zone");
    
 
    this.croppingID = false;
    this.croppingMRZ = true

   if (this.idAreaDiv) {
     
     const width = this.idAreaDiv.nativeElement.offsetWidth;
     const height = this.idAreaDiv.nativeElement.offsetHeight;
     console.log("Got id area div", width)
   }


  }

  cropMrzZone() {
    console.log("Cropping MRZ zone");

   
    let imageObj = {
      id: this.croppedIdZone,
      mrz: this.croppedMrzZone,
      id64: "",
      mrz64: ""
    }
    this.croppingMRZ = false
    this.dialogRef.close(imageObj)
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

  idCropped(event: ImageCroppedEvent) {
    this.croppedIdZone = event.blob;
    this.croppedIdZone64 = event.blob
    console.log("[idBlob ]: ", this.croppedIdZone64);
    
  }

  mrzCropped(event: ImageCroppedEvent) {
    this.croppedMrzZone = event.blob;
    this.croppedMrzZone64 = event.blob
    console.log("[base64 mrz]: ", this.croppedMrzZone64);
  }

  cropCurrentDimensions () {
    this.croppingID = false;
     this.croppingMRZ = true
    if (this.idAreaDiv) {
      
      const width = this.idAreaDiv.nativeElement.offsetWidth;
      const height = this.idAreaDiv.nativeElement.offsetHeight;
      console.log("Got id area div", width)
    }
    // this.dialogRef.close(this.croppedIdZone)
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
