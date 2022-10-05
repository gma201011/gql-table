import { gql } from '@apollo/client';
import client from '../apollo-client';
import SortedTable from '../components/SortedTable';
import { format } from 'date-fns';

export interface ILaunchData {
  mission_name: string;
  rocket: { rocket_name: string; rocket_type: string };
  launch_date_local: string;
  id: string;
}

interface IHeadCell {
  id: string;
  label: string;
}

export async function getStaticProps() {
  const { data } = await client.query({
    query: gql`
      query GetLaunches($limit: Int = 100) {
        launches(limit: $limit) {
          mission_name
          rocket {
            rocket_name
            rocket_type
          }
          launch_date_local
          id
        }
      }
    `,
  });

  return {
    props: {
      launchData: data.launches,
    },
  };
}

const Home = ({ launchData }: { launchData: ILaunchData[] }) => {
  const rows = launchData?.map((item: ILaunchData) =>
    createData(
      item.mission_name,
      item.rocket.rocket_name,
      item.rocket.rocket_type,
      format(new Date(item.launch_date_local), 'yyyy/MM/dd'),
      item.id
    )
  );

  const headCells: IHeadCell[] = [
    {
      id: 'mission_name',
      label: 'Mission name',
    },
    {
      id: 'rocket_name',
      label: 'Rocket name',
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

  function createData(
    mission_name: string,
    rocket_name: string,
    rocket_type: string,
    launch_date_local: string,
    id: string
  ) {
    return { mission_name, rocket_name, rocket_type, launch_date_local, id };
  }

  return (
    <>
      <SortedTable rows={rows} headCells={headCells} />
    </>
  );
};

export default Home;
