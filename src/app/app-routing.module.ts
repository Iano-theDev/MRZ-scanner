import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ocr-viwer/ocr-viwer.component').then(c => c.OcrViwerComponent)
  },
  {
    path: 'camera',
    loadComponent: () =>
      import('./camera-dialog/camera-dialog.component').then(c => c.CameraDialogComponent)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
