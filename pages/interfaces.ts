export interface ILaunchData {
  mission_name: string;
  rocket: { rocket_name: string; rocket_type: string };
  launch_date_local: string;
  id: string;
}

export interface ITableData {
  mission_name: string;
  rocket_name: string;
  rocket_type: string;
  launch_date_local: string;
  id: string;
}

export interface IHeadCell {
  id: string;
  label: string;
}