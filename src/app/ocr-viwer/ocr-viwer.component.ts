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
import { threadId } from 'worker_threads';
interface outputObj {
  index: number;
  outputText: string;
  valid?: boolean;
}
@Component({
  selector: 'app-ocr-viwer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatToolbarModule, MatCardModule, MatDialogModule, MatProgressBarModule],
  // imports: [CommonModule],
  templateUrl: './ocr-viwer.component.html',
  styleUrls: ['./ocr-viwer.component.css']
})
export class OcrViwerComponent {
  idSnapShot: any;
  mrzSnapShot: any;
  currentSnapShot: any;
  outPutText: string = ''
  textReady: boolean = true;
  counter: number = 0
  outputArr: outputObj[] = [];
  constructor(private dialog: MatDialog, private _sanitizer: DomSanitizer) { }

  openCameraDialog() {
    const dialogRef = this.dialog.open(CameraDialogComponent, {
      // width: '300px',
      // height: '300px',
      width: 'auto',
      height: 'auto',
      maxWidth: '90vw',
      maxHeight: '100vh',
    })

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // console.log("[result] from dialog ref onClose: ", result);
        console.log("[result] from dialog ref onClose: "), result;
        // this.snapShot = this._sanitizer.bypassSecurityTrustResourceUrl('data: image/jpg;base64,' + result)
        // this.snapShot = this._sanitizer.bypassSecurityTrustResourceUrl(result.imageAsBase64)
        this.idSnapShot = result.id
        this.mrzSnapShot = result.mrz
        this.currentSnapShot = this.mrzSnapShot



      }
    })
  }

  prepareImageOutputTessaract = async () => {
    this.textReady = false
    const worker = Tesseract.createWorker(
      { logger: m => console.log("[m]: ", m) }
    )
    const imagePath =
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(this.mrzSnapShot);
    console.log("Text ", text);
    if (text) {
      this.textReady = true
      this.outPutText = text
      let obj: outputObj = {
          outputText: text,
          // index: this.outputArr ?  this.outputArr.length++ : 1
          index: this.counter++
      }
      console.log("[ outputObj ] is: ", obj);
      
      this.outputArr.push(obj)
      console.log("[ outputArr ] is: ", this.outputArr);


    }
    await worker.terminate();
  }

  prepareImageOutputDynamsoft () {
    
  }

  setCurrentSnapShot(snapShot: any) {
    this.currentSnapShot = snapShot
  }

  copyOutputText(item: outputObj) {
    navigator.clipboard.writeText(item.outputText)
  }

  confirmOutputText(item: outputObj) {
    // this.outputArr.find(value => {
    //   value.index === item.index
    // })
    this.outputArr[item.index].valid = true
    this.outputArr.forEach(value => {
      if (value.index !== item.index) {
        value.valid = false
      }
    })
    console.log("New item is: ", item)
  }

  logSomething() {
    console.log("You clicked the cam ")
  }

}
