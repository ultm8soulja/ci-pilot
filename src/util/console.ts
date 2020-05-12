/* eslint-disable no-console */
import clear from 'clear';
import chalk from 'chalk';
import { textSync } from 'figlet';

export const startup = (clearConsole = false): void => {
  if (clearConsole) {
    clear();
  }

  console.log(chalk.green(textSync('CI Pilot', { horizontalLayout: 'full' })));
};

export const printInfoText = (text: string): void => console.log(chalk.gray(text) + '\n');

export const printWarningText = (text: string): void => console.log(chalk.yellow(text) + '\n');

export const printErrorText = (text: string): void => console.log(chalk.red(text) + '\n');

export const printSuccessText = (text: string): void => console.log(chalk.green(text) + '\n');
