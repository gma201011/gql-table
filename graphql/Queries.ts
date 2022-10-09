import { gql } from '@apollo/client';

export const GET_ALL_LAUNCHES_QUERY = gql`
query {
  launches {
    mission_name
    launch_date_local
    rocket {
      rocket_name
      rocket_type
    }
    id
  }
}
`

export const FIND_LAUNCHES_BY_DATE_QUERY = gql`
query($date: LaunchFind) {
  launches(find: $date) {
    mission_name
    launch_date_local
    rocket {
      rocket_name
      rocket_type
    }
    id
  }
}
`

export const FIND_LAUNCHES_BY_TEXT_QUERY = gql`
query ($mission_name: LaunchFind, $rocket_name: LaunchFind, $rocket_type: LaunchFind) {
  mission_name_result: launches(find: $mission_name) {
    mission_name
    launch_date_local
    rocket {
      rocket_name
      rocket_type
    }
    id
  },
  rocket_name_result: launches(find: $rocket_name) {
    mission_name
    launch_date_local
    rocket {
      rocket_name
      rocket_type
    }
    id
  },
  rocket_type_result: launches(find: $rocket_type) {
    mission_name
    launch_date_local
    rocket {
      rocket_name
      rocket_type
    }
    id
  }
}
`