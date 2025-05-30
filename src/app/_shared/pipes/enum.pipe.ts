import { Pipe, PipeTransform } from '@angular/core';
import { getStatusLabel } from '../../_shared/utils/enum.utils';

@Pipe({
  name: 'statusLabel'
})
export class StatusLabelPipe implements PipeTransform {
  transform(value: number): string {
    return getStatusLabel(value);
  }
}