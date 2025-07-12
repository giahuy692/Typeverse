import { Component } from '@angular/core';

type PdfType = 'reading' | 'listening';

@Component({
  selector: 'app-pdf-list',
  templateUrl: './pdf-list.component.html'
})
export class PdfListComponent {
  maxReading = 50;    // Đổi số lượng phù hợp với số file thực tế
  maxListening = 50;  // Đổi số lượng phù hợp với số file thực tế

  selectedPdf: string | null = null;

 pdfType: PdfType = 'reading';

get pdfFiles() {
  const max = this.pdfType === 'reading' ? this.maxReading : this.maxListening;
  const prefix = this.pdfType === 'reading' ? 'Reading' : 'Listening';
  // Nếu chắc chắn file nào cũng tồn tại, ok. Nếu không thì nên có mảng lưu lại file thật.
  return Array.from({length: max}, (_, i) => `${prefix}-${i + 1}.pdf`);
}

  selectPdf(pdf: string) {
    this.selectedPdf = pdf;
  }

  switchType(type: PdfType) {
    this.pdfType = type;
    this.selectedPdf = null;
  }
  
}
