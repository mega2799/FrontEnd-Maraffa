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
  ngOnInit(): void {}
  @Input() alt!: string;
  @Input() src!: string;
  @Input() position!: { x: number; y: number };
  @Input() hidden!: boolean;
  @Input() isMyTurn: boolean = false;
  @Output() positionChange = new EventEmitter<{ x: number; y: number }>();
  @Output() hiddenChange = new EventEmitter<boolean>();
  @Output() playedCard = new EventEmitter<string>();

  private dragging = false;
  private startY = 0;
  private hasDragged = false;

  startDrag(event: MouseEvent) {
    if (!this.isMyTurn) return;
    this.dragging = true;
    this.hasDragged = false;
    this.startY = event.clientY - this.position.y;
    event.preventDefault();
  }

  stopDrag() {
    if (this.dragging) {
      if (this.position.y < 0) {
        this.hiddenChange.emit(true);
      } else if (this.isMyTurn && !this.hasDragged) {
        // click senza drag: gioca la carta
        this.hiddenChange.emit(true);
      }
    }
    this.dragging = false;
    this.hasDragged = false;
  }

  onDrag(event: MouseEvent) {
    if (this.dragging) {
      this.hasDragged = true;
      this.position.y = event.clientY - this.startY;
      this.positionChange.emit(this.position);
    }
  }

  @HostListener("document:mouseup", ["$event"])
  onMouseUp(event: MouseEvent) {
    this.stopDrag();
  }

  onTransitionEnd(event: any) {
    if (event.target !== event.currentTarget) return; // ignora bubble da elementi figli
    if (event.propertyName == "transform") {
      this.playedCard.emit(this.src);
    }
  }
}
