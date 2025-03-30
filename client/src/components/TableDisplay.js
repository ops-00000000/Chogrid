import React, { useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Box
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const TableDisplay = ({ table }) => {
  const { name, description, columns, items } = table;

  // Преобразование данных для react-table
  const data = useMemo(() => {
    return items.map(item => {
      // Преобразование Map рейтингов в простой объект
      const ratings = {};
      if (item.ratings) {
        // Проверим, является ли ratings Map или уже объектом
        if (item.ratings instanceof Map) {
          item.ratings.forEach((value, key) => {
            ratings[key] = value;
          });
        } else if (typeof item.ratings === 'object') {
          Object.assign(ratings, item.ratings);
        }
      }

      return {
        id: item._id,
        name: item.name,
        cost: item.cost,
        utility: item.utility,
        ...ratings
      };
    });
  }, [items]);

  // Определение колонок для react-table
  const tableColumns = useMemo(() => {
    const basicColumns = [
      {
        Header: 'Название',
        accessor: 'name',
      },
      {
        Header: 'Стоимость',
        accessor: 'cost',
      },
      {
        Header: 'Полезность',
        accessor: 'utility',
        Cell: ({ value }) => parseFloat(value).toFixed(2)
      }
    ];

    const customColumns = columns.map(column => ({
      Header: `${column.name} (вес: ${column.weight})`,
      accessor: column.name,
      Cell: ({ value }) => value || 'Н/Д'
    }));

    return [...basicColumns, ...customColumns];
  }, [columns]);

  // Инициализация таблицы
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable(
    {
      columns: tableColumns,
      data
    },
    useSortBy
  );

  if (!items || items.length === 0) {
    return (
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          {name}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          В этой таблице пока нет данных.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        {name}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {description}
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 3, mb: 3 }}>
        <Table {...getTableProps()} size="small">
          <TableHead>
            {headerGroups.map(headerGroup => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <TableCell
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {column.render('Header')}
                    <span>
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <ArrowDownwardIcon fontSize="small" />
                        ) : (
                          <ArrowUpwardIcon fontSize="small" />
                        )
                      ) : (
                        ''
                      )}
                    </span>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <TableCell {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableDisplay; 