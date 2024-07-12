import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatCardModule } from '@angular/material/card'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { CameraDialogComponent } from '../camera-dialog/camera-dialog.component';
import { WebcamImage } from 'ngx-webcam';
import { DomSanitizer } from '@angular/platform-browser';
import * as Tesseract from 'tesseract.js';
import { threadId } from 'worker_threads';
import { BarcodeReader, TextResult } from 'dynamsoft-javascript-barcode';
import { log } from 'console';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'

interface outputObj {
  index: number;
  outputText: string;
  valid?: boolean;
}
@Component({
  selector: 'app-ocr-viwer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatToolbarModule, MatCardModule, MatDialogModule, MatProgressBarModule, MatButtonToggleModule, FormsModule],
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
  private reader!: BarcodeReader
  activeModel!: string 

  constructor(private dialog: MatDialog, private _sanitizer: DomSanitizer) {
    this.activeModel = 'tessaract'
   }

  ngOnInit() {
    // BarcodeReader.license = "DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9";
    BarcodeReader.license = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAzMDAwNjExLVRYbFhaV0pRY205cSIsIm1haW5TZXJ2ZXJVUkwiOiJodHRwczovL21kbHMuZHluYW1zb2Z0b25saW5lLmNvbSIsIm9yZ2FuaXphdGlvbklEIjoiMTAzMDAwNjExIiwic3RhbmRieVNlcnZlclVSTCI6Imh0dHBzOi8vc2Rscy5keW5hbXNvZnRvbmxpbmUuY29tIiwiY2hlY2tDb2RlIjoyMTA2NzEyNTI0fQ==";
    BarcodeReader.engineResourcePath = '/assets/dynamsoft/';
  }


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


  prepareImageOutputDynamsoft = async () => {
    // BarcodeReader.license = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAzMDAwNjExLVRYbFhaV0pRY205cSIsIm1haW5TZXJ2ZXJVUkwiOiJodHRwczovL21kbHMuZHluYW1zb2Z0b25saW5lLmNvbSIsIm9yZ2FuaXphdGlvbklEIjoiMTAzMDAwNjExIiwic3RhbmRieVNlcnZlclVSTCI6Imh0dHBzOi8vc2Rscy5keW5hbXNvZnRvbmxpbmUuY29tIiwiY2hlY2tDb2RlIjoyMTA2NzEyNTI0fQ==";
  

    try {
      console.log("Startting");

      // Initialize the Barcode Reader
      this.reader = await BarcodeReader.createInstance();

      if (this.reader) {
        console.log("We've successfully created a reader!");


        // Decode the image data directly
        const results: TextResult[] = await this.reader.decode(this.mrzSnapShot);

        // Handle the results
        if (results.length) {
          console.log('MRZ Results:', results);
        } else {
          Swal.fire({
            title: "Result Empty!",
            text: "No MRZ found in the image.",
            icon: "error"
          })
          console.log('No MRZ found in the image.', results);
        }
      } else {
        console.log("No reader created yet");

      }

    } catch (error) {
      console.error('Error reading image:', error);
    }
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
