import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, HostListener, inject, input, output, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged, filter, tap } from "rxjs";
import { Place } from "../../shared/types";

const SEARCH_DEBOUNCE_MS = 400

@Component({
    selector: 'app-place-search',
    templateUrl: './place-search.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceSearchComponent {
    private readonly elementRef = inject(ElementRef<HTMLElement>)
    private readonly destroyRef = inject(DestroyRef)

    places = input<Place[]>([])
    /** Controlado por fora: true enquanto a busca real (HTTP) está em andamento. */
    loading = input(false)

    placeSelected = output<Place>()
    /** Emite a busca já "assentada" — só depois que o usuário para de digitar. */
    search = output<string>()

    protected query = signal('')
    protected isOpen = signal(false)
    protected activeIndex = signal(-1)
    /** true enquanto o usuário ainda está digitando (aguardando o debounce assentar). */
    protected isDebouncing = signal(false)

    protected showLoading = computed(() => this.isDebouncing() || this.loading())

    constructor() {
        toObservable(this.query).pipe(
            tap(() => this.isDebouncing.set(true)),
            debounceTime(SEARCH_DEBOUNCE_MS),
            tap(() => this.isDebouncing.set(false)),
            distinctUntilChanged(),
            filter(query => query.trim().length > 0),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(query => this.search.emit(query.trim()))
    }

    /**
     * `places()` já é o resultado exato da busca real (a API filtra, não é
     * um array local pra filtrar aqui). Refiltrar por substring no cliente
     * era redundante e frágil (acento/maiúscula digitados nem sempre batem
     * byte a byte com o texto que a API devolve), e ainda podia esconder
     * resultados válidos se o usuário continuasse digitando depois do
     * debounce já ter disparado a busca.
     */
    protected filteredPlaces = computed(() => this.places())

    protected onInput(value: string): void {
        this.query.set(value)
        this.isOpen.set(true)
        this.activeIndex.set(-1)
    }

    protected open(): void {
        this.isOpen.set(true)
    }

    protected close(): void {
        this.isOpen.set(false)
        this.activeIndex.set(-1)
    }

    @HostListener('document:click', ['$event'])
    protected onDocumentClick(event: MouseEvent): void {
        if (!this.isOpen()) return
        if (!this.elementRef.nativeElement.contains(event.target as Node)) this.close()
    }

    protected onKeydown(event: KeyboardEvent): void {
        const list = this.filteredPlaces()

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                this.isOpen.set(true)
                this.activeIndex.update(index => Math.min(index + 1, list.length - 1))
                break
            case 'ArrowUp':
                event.preventDefault()
                this.activeIndex.update(index => Math.max(index - 1, 0))
                break
            case 'Enter': {
                event.preventDefault()
                const place = list[this.activeIndex()]
                if (place) this.select(place)
                break
            }
            case 'Escape':
                this.close()
                break
        }
    }

    protected select(place: Place): void {
        this.query.set(place.name)
        this.close()
        this.placeSelected.emit(place)
    }
}
