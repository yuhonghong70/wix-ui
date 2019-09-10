import * as React from 'react';
import { mount } from 'enzyme';

import { deepAssign } from '../../test/utils/deep-assign';
import Markdown from '../Markdown';
import AutoExample from '../AutoExample';
import StoryPage from './index';
import { AutoTestkit } from '../AutoTestkit';

export default class {
  component;

  defaultProps = {
    metadata: {
      props: {},
    },
    config: {},
    component: () => <div />,
    componentProps: {},
    exampleProps: {},
    examples: null,
  };

  when = {
    created: props =>
      (this.component = mount(
        <StoryPage {...deepAssign(this.defaultProps, props)} />,
      )),
  };

  openTab = title =>
    this.component.find(`li[data-hook="${title}"]`).simulate('click');

  debug = () => console.log(this.component.debug());

  get = {
    readme: () =>
      this.component
        .find('[data-hook="metadata-readme"]')
        .find(Markdown)
        .prop('source'),

    import: () =>
      this.component
        .find('[data-hook="metadata-import"]')
        .find(Markdown)
        .prop('source'),

    codeBlock: () =>
      this.component.find('[data-hook="metadata-codeblock"]').find(Markdown),

    autoExample: () => this.component.find(AutoExample),

    api: {
      markdown: () => this.component.find('[data-hook="api-markdown"]'),
    },

    testkit: {
      markdown: () => this.component.find('[data-hook="testkit-markdown"]'),
      autoGenerated: () => this.component.find(AutoTestkit),
    },
  };
}
