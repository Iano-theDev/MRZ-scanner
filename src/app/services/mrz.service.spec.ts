import { TestBed } from '@angular/core/testing';

import { MrzService } from './mrz.service';

describe('MrzService', () => {
  let service: MrzService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrzService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
