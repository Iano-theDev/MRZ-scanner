import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button' 
import { MatIconModule } from '@angular/material/icon' 
import { MatToolbarModule } from '@angular/material/toolbar' 
import { MatCardModule } from '@angular/material/card' 
import { MatProgressBarModule } from '@angular/material/progress-bar' 
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { CameraDialogComponent } from '../camera-dialog/camera-dialog.component';
import { WebcamImage } from 'ngx-webcam';
import { DomSanitizer } from '@angular/platform-browser';
import * as Tesseract from 'tesseract.js';

@Component({
  selector: 'app-ocr-viwer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatToolbarModule, MatCardModule, MatDialogModule, MatProgressBarModule],
  // imports: [CommonModule],
  templateUrl: './ocr-viwer.component.html',
  styleUrls: ['./ocr-viwer.component.css']
})
export class OcrViwerComponent {
  snapShot: any;
  outPutText: string = ''
  textReady: boolean = true;
  constructor (private dialog: MatDialog, private _sanitizer: DomSanitizer) {}

  openCameraDialog() {
    const dialogRef = this.dialog.open(CameraDialogComponent, {
      // width: '300px',
      // height: '300px',
      width: 'auto',
      height: 'auto',
      maxWidth: '50vw',
      maxHeight: '96vh',
    })

    dialogRef.afterClosed().subscribe((result: WebcamImage) => {
      if (result) {
        // console.log("[result] from dialog ref onClose: ", result);
        console.log("[result] from dialog ref onClose: ");
        // this.snapShot = this._sanitizer.bypassSecurityTrustResourceUrl('data: image/jpg;base64,' + result)
        // this.snapShot = this._sanitizer.bypassSecurityTrustResourceUrl(result.imageAsBase64)
        this.snapShot = result
        
      }
    })
  }

  prepareImageOutput = async () =>  {
    this.textReady = false
    const worker = Tesseract.createWorker(
      {logger: m => console.log("[m]: ", m)}
  )
    const imagePath = 
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(this.snapShot);
    console.log("Text ", text);
    if (text) {
      this.textReady =true
      this.outPutText = text
    }
    await worker.terminate();

    
  }

  logSomething() {
    console.log("You clicked the cam ")
  }

}
