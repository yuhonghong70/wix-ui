import {
  BaseUniDriver,
  baseUniDriverFactory,
} from 'wix-ui-test-utils/base-driver';
import { UniDriver } from 'wix-ui-test-utils/unidriver';
import { dataHooks } from './constants';

export interface CircularProgressBarUniDriver extends BaseUniDriver {
  /** Returns boolean that indicates if the success icon exists */
  isSuccessIconDisplayed(): Promise<boolean>;
  /** Returns boolean that indicates if the error icon exists */
  isErrorIconDisplayed(): Promise<boolean>;
  /** Returns boolean that indicates if the progress percentages text exists */
  isPercentagesProgressDisplayed(): Promise<boolean>;
  /** Get the progress percentages value */
  getValue(): Promise<string>;
  /** Returns true if has progress completed (value is 100) */
  isCompleted(): Promise<boolean>;
  /** Returns true if has error */
  hasError(): Promise<boolean>;
}

const byDataHook = dataHook => `[data-hook="${dataHook}"]`;

export const circularProgressBarUniDriverFactory = (
  base: UniDriver,
): CircularProgressBarUniDriver => {
  const getValue = async () => {
    if (!(await base.exists())) {
      return null;
    }

    return base.$(byDataHook(dataHooks.progressIndicator)).text();
  };

  return {
    ...baseUniDriverFactory(base),
    isSuccessIconDisplayed: () =>
      base.$(byDataHook(dataHooks.successIcon)).exists(),
    isErrorIconDisplayed: () =>
      base.$(byDataHook(dataHooks.errorIcon)).exists(),
    isPercentagesProgressDisplayed: () =>
      base.$(byDataHook(dataHooks.progressIndicator)).exists(),
    getValue: () => getValue(),
    isCompleted: async () => (await getValue()) === '100',
    hasError: async () => (await base.attr('data-error')) === 'true',
  };
};
