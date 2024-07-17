import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatCardModule } from '@angular/material/card'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { CameraDialogComponent } from '../camera-dialog/camera-dialog.component';
import { WebcamImage } from 'ngx-webcam';
import { DomSanitizer } from '@angular/platform-browser';
import * as Tesseract from 'tesseract.js';
import { threadId } from 'worker_threads';
import { BarcodeReader, TextResult } from 'dynamsoft-javascript-barcode';
import { log } from 'console';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'
// import * as Dynamsoft from 'dynamsoft-core';
import { LabelRecognizerModule } from 'dynamsoft-label-recognizer';
import * as Dynamsoft from 'dynamsoft-label-recognizer';
import type { TextLineResultItem } from "dynamsoft-label-recognizer";
import { CaptureVisionRouter } from "dynamsoft-capture-vision-router";
import { LicenseManager } from 'dynamsoft-license';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


interface outputObj {
  index: number;
  outputText: string;
  model: string;
  valid?: boolean;
}
@Component({
  selector: 'app-ocr-viwer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatToolbarModule, MatCardModule, MatDialogModule, MatProgressBarModule, MatButtonToggleModule, FormsModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
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
  license!: string;
  captureVisionRouterPromise: Promise<CaptureVisionRouter> | null = null
  testPromise: any

  constructor(private dialog: MatDialog, private _sanitizer: DomSanitizer) {
    this.activeModel = 'tessaract'
    this.license = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAzMDAwNjExLVRYbFhaV0pRY205cSIsIm1haW5TZXJ2ZXJVUkwiOiJodHRwczovL21kbHMuZHluYW1zb2Z0b25saW5lLmNvbSIsIm9yZ2FuaXphdGlvbklEIjoiMTAzMDAwNjExIiwic3RhbmRieVNlcnZlclVSTCI6Imh0dHBzOi8vc2Rscy5keW5hbXNvZnRvbmxpbmUuY29tIiwiY2hlY2tDb2RlIjoyMTA2NzEyNTI0fQ=="
    // this.license = "DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9"

  }

  ngOnInit() {
    // BarcodeReader.license = "DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9";
    // BarcodeReader.license = this.license;
    LicenseManager.initLicense(this.license)
    // BarcodeReader.engineResourcePath = '/assets/dynamsoft/';
    try {

      this.captureVisionRouterPromise = CaptureVisionRouter.createInstance()
    } catch (error: any) {
      console.log("Error creation capture vision router instance", error)
    }


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
   try { const worker = Tesseract.createWorker(
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
      model: 'tessaract',
      // index: this.outputArr ?  this.outputArr.length++ : 1
      index: this.counter++
    }
    console.log("[ outputObj ] is: ", obj);

    this.outputArr.push(obj)
    console.log("[ outputArr ] is: ", this.outputArr);


  }
  await worker.terminate();
    
   } catch (error: any) {
    this.textReady = true
    Swal.fire({
      title: "Result Empty!",
      text: error,
      icon: "error"
    })
   }
  }

  prepareImageOutputDynamsoft = async () => {
    this.textReady = false
    try {
      console.log("Startting label recorgnizer");
      // this.resRef!.innerText = "";
      const router = await this.captureVisionRouterPromise;
      const results = await router!.capture(this.mrzSnapShot);
      const res = [];
      for (let result of results.items) {
        console.log('hi there ', (result as TextLineResultItem).text);
        res.push((result as TextLineResultItem).text);


      }
      let text = res.join("\n");
      if (text) this.textReady = true

      let obj: outputObj = {
        outputText: text,
        model: 'dynamsoft',
        // index: this.outputArr ?  this.outputArr.length++ : 1
        index: this.counter++
      }

      this.outputArr.push(obj)
      // this.iptRef.nativeElement!.value = '';
    } catch (ex: any) {
      this.textReady = true
      let errMsg = ex.message || ex;
      console.error(errMsg);
      Swal.fire({
        title: "Result Empty!",
        text: errMsg,
        icon: "error"
      })
      // alert(errMsg);
    }
  }


  // prepareImageOutputDynamsoft = async () => {
  //   // BarcodeReader.license = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAzMDAwNjExLVRYbFhaV0pRY205cSIsIm1haW5TZXJ2ZXJVUkwiOiJodHRwczovL21kbHMuZHluYW1zb2Z0b25saW5lLmNvbSIsIm9yZ2FuaXphdGlvbklEIjoiMTAzMDAwNjExIiwic3RhbmRieVNlcnZlclVSTCI6Imh0dHBzOi8vc2Rscy5keW5hbXNvZnRvbmxpbmUuY29tIiwiY2hlY2tDb2RlIjoyMTA2NzEyNTI0fQ==";


  //   try {
  //     console.log("Startting");

  //     // Initialize the Barcode Reader
  //     this.reader = await BarcodeReader.createInstance();
  //     if (this.reader) {
  //       console.log("We've successfully created a reader!");


  //       // Decode the image data directly
  //       const results: TextResult[] = await this.reader.decode(this.mrzSnapShot);

  //       // Handle the results
  //       if (results.length) {
  //         console.log('MRZ Results:', results);
  //       } else {
  //         Swal.fire({
  //           title: "Result Empty!",
  //           text: "No MRZ found in the image.",
  //           icon: "error"
  //         })
  //         console.log('No MRZ found in the image.', results);
  //       }
  //     } else {
  //       console.log("No reader created yet");

  //     }

  //   } catch (error) {
  //     console.error('Error reading image:', error);
  //   }
  // }

  // prepareImageOutputDynamsoft = async () => {
  //   // const router = await this.captureVisionRouterPromise;
  //   // const results = await router!.capture(this.mrzSnapShot)


  //   try {
  //     console.log("Startting label recorgnizer");
  //     const router = await this.captureVisionRouterPromise;
  //     let results;

  //     if (router) {
  //       console.log("router has been created");
  //       results = await router.capture(this.mrzSnapShot)

  //     } 
  //     console.log("Router was not created!");


  //     // Initialize the Barcode Reader
  //     // this.reader = await BarcodeReader.createInstance();
  //     // if (this.reader) {
  //     //   console.log("We've successfully created a reader!");


  //     //   // Decode the image data directly
  //     //   const results: TextResult[] = await this.reader.decode(this.mrzSnapShot);

  //     //   // Handle the results
  //     //   if (results.length) {
  //     //     console.log('MRZ Results:', results);
  //     //   } else {
  //     //     Swal.fire({
  //     //       title: "Result Empty!",
  //     //       text: "No MRZ found in the image.",
  //     //       icon: "error"
  //     //     })
  //     //     console.log('No MRZ found in the image.', results);
  //     //   }
  //     // } else {
  //     //   console.log("No reader created yet");

  //     // }
  //     console.log("Results from capture vision router is", results)

  //   } catch (error) {
  //     console.error('Error reading image:', error);
  //   }
  // }


  captureImage = async (e: any) => {
    this.textReady = false
    try {
      // this.resRef!.innerText = "";
      const router = await this.captureVisionRouterPromise;
      const results = await router!.capture(e.target.files[0]);
      const res = [];
      for (let result of results.items) {
        console.log('hi there ', (result as TextLineResultItem).text);
        res.push((result as TextLineResultItem).text);
      }
      let text = res.join("\n");
      if (text) this.textReady = true

      let obj: outputObj = {
        outputText: text,
        model: 'dynamsoft',
        // index: this.outputArr ?  this.outputArr.length++ : 1
        index: this.counter++
      }

      this.outputArr.push(obj)
      // this.resRef.nativeElement!.innerText = res.join("\n");
      // this.iptRef.nativeElement!.value = '';
    } catch (ex: any) {
      this.textReady = true
      let errMsg = ex.message || ex;
      console.error(errMsg);
      Swal.fire({
        title: "Result Empty!",
        text: errMsg,
        icon: "error"
      })
      // alert(errMsg);
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
  deleteItem(item: outputObj) {
    console.log("deleting: ", item.index)
    this.outputArr = this.outputArr.filter(obj => obj.index !== item.index)
  }

  logSomething() {
    console.log("You clicked the cam ")
  }

}
