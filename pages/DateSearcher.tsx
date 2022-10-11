import { TextField, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import styles from './index.module.scss';

interface IProps {
  dateValue: string | null | undefined;
  dataSearching: boolean;
  handleDatePickerOnChange: (
    value: string | null,
    keyboardInputValue?: string | undefined
  ) => void;
  handleMonthSearchingButtonOnClick: () => void;
}

const DateSearcher = ({
  dateValue,
  dataSearching,
  handleDatePickerOnChange,
  handleMonthSearchingButtonOnClick,
}: IProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        inputFormat='yyyy/MM'
        views={['year', 'month']}
        value={dateValue}
        onChange={handleDatePickerOnChange}
        InputAdornmentProps={{ position: 'start' }}
        renderInput={(params) => (
          <div className={styles.dateSearchingArea}>
            <TextField variant='standard' {...params} />
            <Button
              onClick={handleMonthSearchingButtonOnClick}
              variant='outlined'
              disabled={params.error || dataSearching}
            >
              Search by Month
            </Button>
          </div>
        )}
      />
    </LocalizationProvider>
  );
};

export default DateSearcher;
