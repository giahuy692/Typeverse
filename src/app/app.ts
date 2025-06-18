import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { SelectModule } from 'primeng/select';

interface City {
    name: string;
    code: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
      standalone: true,
    imports: [FormsModule, SelectModule]
})
export class App {
  protected title = 'typeverse';
   cities: City[] | undefined;

    selectedCity: City | undefined;

      constructor(private primeng: PrimeNG) {}

    ngOnInit() {
        this.primeng.ripple.set(true);
             this.cities = [
            { name: 'New York', code: 'NY' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN' },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS' }
        ];
    }
}
