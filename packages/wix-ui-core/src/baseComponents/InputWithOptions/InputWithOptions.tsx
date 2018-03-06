import * as React from 'react';
import style from './InputWithOptions.st.css';
import {Dropdown} from '../../baseComponents/Dropdown';
import {Placement} from '../../baseComponents/Popover';
import {Option, optionPropType, OptionFactory} from '../../baseComponents/DropdownOption';
import {OPEN_TRIGGER_TYPE} from '../../baseComponents/Dropdown/constants';
import {bool, object, arrayOf, string, func, oneOfType, number, node, oneOf, Requireable} from 'prop-types';
import {Input, InputProps} from '../../components/Input';

export interface InputWithOptionsProps {
  /** The location to display the content */
  placement?: Placement;
  /** The dropdown options array */
  options: Array<Option>;
  /** Trigger type to open the content */
  openTrigger?: OPEN_TRIGGER_TYPE;
  /** Handler for when an option is selected */
  onSelect?: (option: Option) => void;
  /** Handler for when an option is deselected */
  onDeselect?: (option: Option) => void;
  /** initial selected option ids */
  initialSelectedIds?: Array<string | number>;
  /** A callback for when initial selected options are set */
  onInitialSelectedOptionsSet?: (options: Array<Option>) => void;
  /** Should close content on select */
  closeOnSelect?: boolean;
  /** An element that always appears at the top of the options */
  fixedHeader?: React.ReactNode;
  /** An element that always appears at the bottom of the options */
  fixedFooter?: React.ReactNode;
  /** Animation timer */
  timeout?: number;
  /** Callback when the user pressed the Enter key or Tab key after he wrote in the Input field - meaning the user selected something not in the list  */
  onManualInput?: (value: string) => void;
  /** Should mark the text that matched the filter */
  highlightMatches?: boolean;
  /** Input prop types */
  inputProps: InputProps;
}

/**
 * InputWithOptions
 */
export class InputWithOptions extends React.PureComponent<InputWithOptionsProps> {
  static displayName = 'InputWithOptions';
  static defaultProps = {
    openTrigger: 'click',
    placement: 'bottom-start',
    closeOnSelect: true,
    initialSelectedIds: [],
    highlightMatches: true,
    onSelect: () => null,
    onDeselect: () => null,
    onManualInput: () => null,
    onInitialSelectedOptionsSet: () => null
  };

  static propTypes = {
    /** The location to display the content */
    placement: oneOf(['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start']),
    /** The dropdown options array */
    options: arrayOf(optionPropType).isRequired,
    /** Trigger type to open the content */
    openTrigger: oneOf(['click', 'hover']),
    /** Handler for when an option is selected */
    onSelect: func,
    /** Handler for when an option is deselected */
    onDeselect: func,
    /** initial selected option ids */
    initialSelectedIds: arrayOf(oneOfType([number, string])),
    /** A callback for when initial selected options are set */
    onInitialSelectedOptionsSet: func,
    /** Should close content on select */
    closeOnSelect: bool,
    /** An element that always appears at the top of the options */
    fixedHeader: node,
    /** An element that always appears at the bottom of the options */
    fixedFooter: node,
    /** Animation timer */
    timeout: number,
    /** Callback when the user pressed the Enter key or Tab key after he wrote in the Input field - meaning the user selected something not in the list. If the component is controlled then the value will be the Input value. if not it will be `undefined`  */
    onManualInput: func,
    /** Should mark the text that matched the filter */
    highlightMatches: bool,
    /** Input prop types */
    inputProps: object.isRequired
  };

  private isEditing: boolean = false;

  constructor() {
    super();

    this._onFocus = this._onFocus.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  _filterOptions(): Array<Option> {
    const {highlightMatches, inputProps, options} = this.props;
    if (!inputProps.value || !this.isEditing) {
      return options;
    }

    const lowerValue = inputProps.value.toLowerCase();
    const filteredOptions = options
      .filter((option: Option) =>
        (!option.isSelectable && option.value) ||
        (option.isSelectable && option.value && option.value.toLowerCase().includes(lowerValue)));

    if (!highlightMatches) {
      return filteredOptions;
    }

    return filteredOptions.map((option: Option) =>
      option.isSelectable && option.value ? OptionFactory.createHighlighted(option, inputProps.value) : option);
  }

  _onSelect(option: Option) {
    const {onSelect, onManualInput, inputProps} = this.props;
    if (option) {
      onSelect(option);
    } else {
      onManualInput(inputProps.value);
    }
  }

  _onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      this.isEditing = true;
    }

    const {onKeyDown} = this.props.inputProps;
    onKeyDown && onKeyDown(event);
  }

  _onFocus(event) {
    this.isEditing = false;
    const {onFocus} = this.props.inputProps;
    onFocus && onFocus(event);
  }

  render () {
    const {
      placement,
      options,
      openTrigger,
      initialSelectedIds,
      onInitialSelectedOptionsSet,
      closeOnSelect,
      fixedFooter,
      fixedHeader,
      timeout,
      onDeselect,
      inputProps} = this.props;

    return (
      <Dropdown
        {...style('root', {}, this.props)}
        placement={placement}
        openTrigger={openTrigger}
        disabled={inputProps.disabled}
        onSelect={this._onSelect}
        showArrow={false}
        fixedFooter={fixedFooter}
        fixedHeader={fixedHeader}
        onDeselect={onDeselect}
        initialSelectedIds={initialSelectedIds}
        onInitialSelectedOptionsSet={onInitialSelectedOptionsSet}
        options={this._filterOptions()}
        timeout={timeout}
        closeOnSelect={closeOnSelect}>
        <Input
          {...inputProps}
          onKeyDown={this._onKeyDown}
          onFocus={this._onFocus}
          className={style.input}
        />
      </Dropdown>
    );
  }
}