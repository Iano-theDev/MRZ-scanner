import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OcrViwerComponent } from './ocr-viwer.component';

describe('OcrViwerComponent', () => {
  let component: OcrViwerComponent;
  let fixture: ComponentFixture<OcrViwerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ OcrViwerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OcrViwerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
