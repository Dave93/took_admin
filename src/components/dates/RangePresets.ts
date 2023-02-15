import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
export const rangePresets: {
  label: string;
  value: [Dayjs, Dayjs];
}[] = [
  {
    label: "Текущий месяц",
    value: [dayjs().startOf("month"), dayjs().endOf("month")],
  },
  {
    label: "Текущая неделя",
    value: [dayjs().startOf("week"), dayjs().endOf("week")],
  },
  { label: "Сегодня", value: [dayjs().startOf("d"), dayjs().endOf("d")] },
  {
    label: "Вчера",
    value: [dayjs().add(-1, "d").startOf("d"), dayjs().add(-1, "d").endOf("d")],
  },
];
