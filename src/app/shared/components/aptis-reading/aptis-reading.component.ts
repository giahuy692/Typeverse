import { Component } from '@angular/core';

@Component({
  selector: 'app-aptis-reading',
  templateUrl: './aptis-reading.component.html',
  styleUrls: ['./aptis-reading.component.scss']
})
export class AptisReadingComponent {
allowDrop(event: DragEvent) {
  event.preventDefault();
}

drag(event: DragEvent) {
  event.dataTransfer?.setData("text", (event.target as HTMLElement).id);
}

drop(event: DragEvent) {
  event.preventDefault();
  const data = event.dataTransfer?.getData("text");
  if (data) {
    event.target && (event.target as HTMLElement).appendChild(document.getElementById(data) as HTMLElement);
  }
}

}
