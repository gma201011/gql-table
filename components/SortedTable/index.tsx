import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from '@mui/material';
import EnhancedTableHead from './EnhancedTableHead';
import styles from './index.module.scss';

interface ITableData {
  id: string;
  [propName: string]: any;
}

interface ITableProps {
  tableData: ITableData[] | [];
  headCells: any[];
  loading?: boolean;
}

const SortedTable = ({ tableData, headCells, loading }: ITableProps) => {
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('mission_name');

  function handleDescendingComparing<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator<Key extends keyof any>(
    order: 'asc' | 'desc',
    orderBy: Key
  ): (a: { [key in Key]: string }, b: { [key in Key]: string }) => number {
    return order === 'desc'
      ? (a, b) => handleDescendingComparing(a, b, orderBy)
      : (a, b) => -handleDescendingComparing(a, b, orderBy);
  }

  function handleStableSorting<T>(
    array: T[],
    comparator: (a: T, b: T) => number
  ) {
    const stabilizedThis = array?.map(
      (el, index) => [el, index] as [T, number]
    );

    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis?.map((el) => el[0]);
  }

  function handleRequestSort(
    event: React.MouseEvent<unknown>,
    property: string
  ) {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }

  function renderBodyCell(data: { [propName: string]: string }) {
    const fieldArr = Array();
    headCells.map((cell) => fieldArr.push(cell.id));
    return fieldArr.map((id: string) => {
      const item = id;
      return <TableCell key={id}>{data[item]}</TableCell>;
    });
  }

  return (
    <div className={styles.root}>
      <Paper className={styles.paper}>
        <TableContainer>
          <Table className={styles.table}>
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              headCells={headCells}
            />
            <TableBody>
              {!tableData?.length ? (
                <TableRow>
                  <TableCell>No Data</TableCell>
                </TableRow>
              ) : (
                <>
                  {handleStableSorting(
                    tableData,
                    getComparator(order, orderBy)
                  )?.map((row, index) => {
                    return (
                      <TableRow hover key={index}>
                        {renderBodyCell(row)}
                      </TableRow>
                    );
                  })}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default React.memo(SortedTable, (prevProps, nextProps) => {
  return prevProps.loading === nextProps.loading;
});
