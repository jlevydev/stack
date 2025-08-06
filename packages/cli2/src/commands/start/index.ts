import { Command } from '@oclif/core';
import { render } from 'ink';
import React from 'react';
import EnvironmentsView from '../../components/environmentsView.tsx';

export default class PfCommand extends Command {
  static override description = 'Launch the Panfactum Infrastructure Manager CLI application';

  async run(): Promise<void> {

    const { unmount } = render(React.createElement(EnvironmentsView));

    process.on('SIGINT', () => {
      unmount();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      unmount();
      process.exit(0);
    });
  }
}