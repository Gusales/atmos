import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
    selector: 'app-star-icon',
    templateUrl: './star-icon.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarIconComponent {
    filled = input(false)
    size = input(16)
    mutedWhenEmpty = input(false)
}
