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

export const printStandardText = (text: string, lineBreak = true): void =>
  console.log(chalk.white(text) + (lineBreak ? '\n' : ''));

export const printInfoText = (text: string, lineBreak = true): void =>
  console.log(chalk.gray(text) + (lineBreak ? '\n' : ''));

export const printWarningText = (text: string, lineBreak = true): void =>
  console.log(chalk.yellow(text) + (lineBreak ? '\n' : ''));

export const printErrorText = (text: string, lineBreak = true): void =>
  console.log(chalk.red(text) + (lineBreak ? '\n' : ''));

export const printSuccessText = (text: string, lineBreak = true): void =>
  console.log(chalk.green(text) + (lineBreak ? '\n' : ''));
