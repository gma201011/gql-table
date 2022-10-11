import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash/debounce';
import styles from './index.module.scss';

interface IProps {
  inputRef: React.MutableRefObject<HTMLInputElement | undefined>;
  handleInputValueOnChange: () => void;
}

const TextSearcher = ({ inputRef, handleInputValueOnChange }: IProps) => {
  return (
    <TextField
      placeholder='Search mission name, rocket name or rocket type'
      inputRef={inputRef}
      onChange={debounce(handleInputValueOnChange, 1000)}
      className={styles.textSearchField}
      variant='standard'
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default TextSearcher;
