import React, { useState, useRef } from 'react';
import { useLazyQuery } from '@apollo/client';
import client from '../apollo-client';
import { format } from 'date-fns';
import {
  GET_ALL_LAUNCHES_QUERY,
  FIND_LAUNCHES_BY_TEXT_QUERY,
  FIND_LAUNCHES_BY_DATE_QUERY,
} from '../graphql/Queries';
import { CircularProgress } from '@mui/material';
import TableTabs from '../components/TableTabs';
import TextSearcher from './TextSearcher';
import DateSearcher from './DateSearcher';
import SortedTable from '../components/SortedTable';
import styles from './index.module.scss';
import { ILaunchData, ITableData, IHeadCell } from './interfaces';

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
  const [tabValue, setTabValue] = useState(0);
  const [dataSearching, setDataSearching] = useState<boolean>(false);

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

  function handleFormattingTableData(
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
      handleFormattingTableData(
        item?.mission_name,
        item?.rocket?.rocket_name,
        item?.rocket?.rocket_type,
        format(new Date(item?.launch_date_local), 'yyyy/MM/dd'),
        item?.id
      )
    );
  }

  function handleTextSearcherOnChange() {
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

  function handleDateSearcherOnChange(newValue: string | null | undefined) {
    setDateValue(newValue);
  }

  function handleMonthSearchingButtonOnClick() {
    if (!dateValue) return;
    setDataSearching(true);
    if (inputRef.current) inputRef.current.value = '';
    const formattedDate = format(new Date(dateValue), 'yyyy-MM');

    getMonthSearchResult({
      variables: {
        date: { launch_date_local: formattedDate },
      },
    });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchArea}>
        <TextSearcher
          inputRef={inputRef}
          handleInputValueOnChange={handleTextSearcherOnChange}
        />
        <DateSearcher
          dateValue={dateValue}
          dataSearching={dataSearching}
          handleDatePickerOnChange={handleDateSearcherOnChange}
          handleMonthSearchingButtonOnClick={handleMonthSearchingButtonOnClick}
        />
      </div>
      {dataSearching ? (
        <div className={styles.circularProgress}>
          <CircularProgress />
        </div>
      ) : (
        !dataSearching && (
          <TableTabs
            value={tabValue}
            setValue={setTabValue}
            tableData={tabData}
          />
        )
      )}
    </div>
  );
};

export default Home;
