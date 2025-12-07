import { DateUtils } from '../../date';
import { ApiBadRequestException } from '../../exception';

import { AllowedFilter } from '../types';

export const convertFilterValue = (input: Pick<AllowedFilter<unknown>, 'format'> & { value: unknown }) => {
  if (input.format === 'String') {
    return `${input.value}`;
  }

  if (input.format === 'Date') {
    return DateUtils.createJSDate({ date: `${input.value}`, utc: false });
  }

  if (input.format === 'DateIso') {
    return DateUtils.createISODate({ date: `${input.value}`, utc: false });
  }

  if (input.format === 'Boolean') {
    if (input.value === 'true') {
      return true;
    }

    if (input.value === 'false') {
      return false;
    }
    throw new ApiBadRequestException('invalid boolean filter');
  }

  if (input.format === 'Number') {
    const notNumber = Number.isNaN(input.value);
    if (notNumber) {
      throw new ApiBadRequestException('invalid number filter');
    }
    return Number(input.value);
  }

  return input.value;
};
