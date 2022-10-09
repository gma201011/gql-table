import { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import TabPanel from './TabPanel';

interface ITabData {
  child: React.ReactNode;
  label: string;
}

const TableTabs = ({
  tableData,
  value,
  setValue,
}: {
  tableData: ITabData[];
  value: number;
  setValue: Function;
}) => {
  function handleChange(event: React.SyntheticEvent, newValue: number) {
    setValue(newValue);
  }

  function handleTabProps(index: number) {
    return {
      id: `${index}`,
      'aria-controls': `tabpanel-${index}`,
    };
  }

  return (
    <>
      <Tabs value={value} onChange={handleChange}>
        {tableData?.map((item, index) => (
          <Tab label={item.label} {...handleTabProps(index)} key={item.label} />
        ))}
      </Tabs>
      {tableData?.map((item, index) => (
        <TabPanel value={value} index={index} key={item.label}>
          {item.child}
        </TabPanel>
      ))}
    </>
  );
};

export default TableTabs;
