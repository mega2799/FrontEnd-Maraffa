// draggable-image.component.ts
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from "@angular/core";

@Component({
  selector: "app-draggable-image",
  templateUrl: "./draggable-image-component.html",
  styleUrls: ["./draggable-image-component.css"],
})
export class DraggableImageComponent implements OnInit {
  ngOnInit(): void {
    console.log(this.src);
  }
  @Input() alt!: string;
  @Input() src!: string;
  @Input() position!: { x: number; y: number };
  @Input() hidden!: boolean;
  @Output() positionChange = new EventEmitter<{ x: number; y: number }>();
  @Output() hiddenChange = new EventEmitter<boolean>();
  @Output() playedCard = new EventEmitter<string>();

  private dragging = false;
  private startY = 0;

  startDrag(event: MouseEvent) {
    this.dragging = true;
    this.startY = event.clientY - this.position.y;
    event.preventDefault(); // Prevenire selezioni indesiderate
  }

  stopDrag() {
    if (this.dragging && this.position.y < 0) {
      this.hiddenChange.emit(true); // Nascondi l'immagine se trascinata verso l'alto
    }
    this.dragging = false;
  }

  onDrag(event: MouseEvent) {
    if (this.dragging) {
      this.position.y = event.clientY - this.startY;
      this.positionChange.emit(this.position);
    }
  }

  @HostListener("document:mouseup", ["$event"])
  onMouseUp(event: MouseEvent) {
    this.stopDrag();
  }

  onTransitionEnd() {
    this.playedCard.emit(this.src);
    if (this.hidden) {
      console.log(`Image with src ${this.src} has been hidden.`);
      // this.cardArry = this.cardArry.filter((card) => card.src !== this.src);
    }
  }
}
