import {
  List,
  DateField,
  Table,
  useTable,
  Switch,
  Space,
  EditButton,
  ShowButton,
  Tag,
} from "@pankod/refine-antd";

import { IWorkSchedules, WorkScheduleEntriesReportForPeriod } from "interfaces";

export const WorkSchedulesReport: React.FC = () => {
  const { searchFormProps } = useTable<WorkScheduleEntriesReportForPeriod>();

  return (
    <>
      <List title="Отчёт по рабочим графикам"></List>
    </>
  );
};
