const Spinner = require('cli-spinner').Spinner;

const SpinnerW = (msg = 'loading', spinnerString = '|/-\\') => {
  const spinner = new Spinner(`${msg}... %s`);
  spinner.setSpinnerString(spinnerString);
  spinner.start();
  return spinner;
};

export default SpinnerW;
