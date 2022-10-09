import React, { useState, useRef } from 'react';
import { useLazyQuery } from '@apollo/client';
import SortedTable from '../components/SortedTable';
import client from '../apollo-client';
import { format } from 'date-fns';
import {
  TextField,
  CircularProgress,
  InputAdornment,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  GET_ALL_LAUNCHES_QUERY,
  FIND_LAUNCHES_BY_TEXT_QUERY,
  FIND_LAUNCHES_BY_DATE_QUERY,
} from '../graphql/Queries';
import styles from './index.module.scss';
import debounce from 'lodash/debounce';
import TableTabs from '../components/TableTabs';

interface ILaunchData {
  mission_name: string;
  rocket: { rocket_name: string; rocket_type: string };
  launch_date_local: string;
  id: string;
}

interface ITableData {
  mission_name: string;
  rocket_name: string;
  rocket_type: string;
  launch_date_local: string;
  id: string;
}

interface IHeadCell {
  id: string;
  label: string;
}

export async function getStaticProps() {
  const { data } = await client.query({
    query: GET_ALL_LAUNCHES_QUERY,
    fetchPolicy: 'no-cache',
  });
  return {
    props: {
      launchData: data.launches,
    },
  };
}

const Home = ({ launchData }: { launchData: ILaunchData[] }) => {
  const [searchData, setSearchData] = useState<ITableData[] | []>([]);
  const [dateValue, setDateValue] = useState<string | null | undefined>(null);
  const [dataSearching, setDataSearching] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState(0);

  const inputRef = useRef<HTMLInputElement>();

  const [getMonthSearchResult] = useLazyQuery(FIND_LAUNCHES_BY_DATE_QUERY, {
    fetchPolicy: 'no-cache',
    onCompleted: (result) => {
      setSearchData(createTableData(result.launches));
      setDataSearching(false);
      setTabValue(1);
    },
  });

  const [getTextSearchResult] = useLazyQuery(FIND_LAUNCHES_BY_TEXT_QUERY, {
    fetchPolicy: 'no-cache',

    onCompleted: (result) => {
      setDateValue(null);
      const searchResult = createTableData([
        ...result.mission_name_result,
        ...result.rocket_name_result,
        ...result.rocket_type_result,
      ]);
      const hash: any = {};
      const deduplicatedResult = searchResult.reduce(
        (item: ITableData[], next) => {
          hash[next.id] ? '' : (hash[next.id] = true && item.push(next));
          return item;
        },
        []
      );
      setSearchData(deduplicatedResult);
      setDataSearching(false);
      setTabValue(1);
    },
  });

  const headCells: IHeadCell[] = [
    {
      id: 'mission_name',
      label: 'Mission Name',
    },
    {
      id: 'rocket_name',
      label: 'Rocket Name',
    },
    {
      id: 'rocket_type',
      label: 'Rocket Type',
    },
    {
      id: 'launch_date_local',
      label: 'Launch Date',
    },
  ];

  const tabData = [
    {
      label: 'Data',
      child: (
        <SortedTable
          tableData={createTableData(launchData)}
          headCells={headCells}
          loading={dataSearching}
        />
      ),
    },
    {
      label: 'Search Result',
      child: (
        <SortedTable
          tableData={searchData}
          headCells={headCells}
          loading={dataSearching}
        />
      ),
    },
  ];

  function createTableRow(
    mission_name: string,
    rocket_name: string,
    rocket_type: string,
    launch_date_local: string,
    id: string
  ) {
    return { mission_name, rocket_name, rocket_type, launch_date_local, id };
  }

  function createTableData(data: ILaunchData[]) {
    return data?.map((item: ILaunchData) =>
      createTableRow(
        item?.mission_name,
        item?.rocket?.rocket_name,
        item?.rocket?.rocket_type,
        item?.launch_date_local &&
          format(new Date(item?.launch_date_local), 'yyyy/MM/dd'),
        item?.id
      )
    );
  }

  function handleInputValueOnChange() {
    if (!inputRef.current?.value) return;
    setDataSearching(true);
    getTextSearchResult({
      variables: {
        mission_name: { mission_name: inputRef.current?.value },
        rocket_name: { rocket_name: inputRef.current?.value },
        rocket_type: { rocket_type: inputRef.current?.value },
      },
    });
  }

  function handleDatePickerOnChange(newValue: string | null | undefined) {
    setDateValue(newValue);
  }

  function handleMonthSearchingButtonOnClick() {
    setDataSearching(true);
    if (!dateValue || dateValue === null) return setDataSearching(false);
    if (inputRef.current) inputRef.current.value = '';
    const formattedDate = format(new Date(dateValue), 'yyyy-MM').toString();

    getMonthSearchResult({
      variables: {
        date: { launch_date_local: formattedDate },
      },
    });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchArea}>
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
        <div>
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
        </div>
      </div>
      {dataSearching ? (
        <div className={styles.circularProgress}>
          <CircularProgress />
        </div>
      ) : (
        <TableTabs
          value={tabValue}
          setValue={setTabValue}
          tableData={tabData}
        />
      )}
    </div>
  );
};

export default Home;
