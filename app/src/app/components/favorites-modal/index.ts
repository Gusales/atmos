import { ChangeDetectionStrategy, Component, ElementRef, effect, input, output, viewChild } from "@angular/core";
import { FavoritePlace } from "@/app/core/services/favorites";
import { StarIconComponent } from "../../shared/components/ui/icons/star-icon";
import { WeatherIconComponent } from "../../shared/components/ui/icons/weather-icon";

@Component({
    selector: 'app-favorites-modal',
    templateUrl: './favorites-modal.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [StarIconComponent, WeatherIconComponent]
})
export class FavoritesModalComponent {
    favorites = input<FavoritePlace[]>([])
    currentPlaceId = input<string | null>(null)
    open = input(false)

    placeSelected = output<FavoritePlace>()
    placeRemoved = output<string>()
    closed = output<void>()

    private panel = viewChild<ElementRef<HTMLElement>>('panel')
    private triggerElement: HTMLElement | null = null

    constructor() {
        effect(() => {
            if (typeof document === 'undefined') return

            if (this.open()) {
                this.triggerElement = document.activeElement as HTMLElement
                document.body.style.overflow = 'hidden'
                queueMicrotask(() => this.panel()?.nativeElement.focus())
            } else {
                document.body.style.overflow = ''
                this.triggerElement?.focus()
            }
        })
    }

    protected onSelect(place: FavoritePlace): void {
        this.placeSelected.emit(place)
        this.closed.emit()
    }

    protected onRemove(event: Event, id: string): void {
        event.stopPropagation()
        this.placeRemoved.emit(id)
    }

    protected onBackdropClick(): void {
        this.closed.emit()
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.stopPropagation()
            this.closed.emit()
            return
        }

        if (event.key === 'Tab') this.trapFocus(event)
    }

    private trapFocus(event: KeyboardEvent): void {
        const panel = this.panel()?.nativeElement
        if (!panel) return

        const focusable = panel.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
        }
    }
}
