import {
  Col,
  Form,
  Row,
  DatePicker,
  Button,
  Table,
  Checkbox,
} from "@pankod/refine-antd";
import { rangePresets } from "components/dates/RangePresets";
import { useGetIdentity } from "@pankod/refine-core";
import { Excel } from "components/export/src";
import dayjs from "dayjs";
import { ICourierEfficiencyReportPerDayItem, IUsers } from "interfaces";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { ExportOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

const CourierEffectiveness = ({ user }: { user: IUsers }) => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<ICourierEfficiencyReportPerDayItem[]>([]);
  const { handleSubmit, control, getValues, watch } = useForm<{
    created_at: [dayjs.Dayjs, dayjs.Dayjs];
    per_hour: boolean;
  }>({
    defaultValues: {
      created_at: [dayjs().startOf("w"), dayjs().endOf("w")],
      per_hour: false,
    },
  });

  const isPerHour = watch("per_hour");

  const onSubmit = async (data: any) => {
    loadData();
  };

  const loadData = async () => {
    setIsLoading(true);

    const { created_at, per_hour } = getValues();
    console.log("per_hour", per_hour);
    let query = gql``;
    if (per_hour) {
      query = gql`
            query {
                getCouriersEfficiencyByHour(
                startDate: "${created_at[0].toISOString()}"
                endDate: "${created_at[1].toISOString()}"
                courierId: "${user.id}"
                ) {
                    courier_id
                    order_day
                    efficiency
                    hour_period {
                        period
                        efficiency
                    }
                }
            }
        `;
      const { getCouriersEfficiencyByHour } = await client.request<{
        getCouriersEfficiencyByHour: ICourierEfficiencyReportPerDayItem[];
      }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });

      setData(getCouriersEfficiencyByHour);
    } else {
      query = gql`
            query {
                getCouriersEfficiencyByPeriod(
                startDate: "${created_at[0].toISOString()}"
                endDate: "${created_at[1].toISOString()}"
                courierId: "${user.id}"
                ) {
                    courier_id
                    order_day
                    efficiency
                }
            }
        `;
      const { getCouriersEfficiencyByPeriod } = await client.request<{
        getCouriersEfficiencyByPeriod: ICourierEfficiencyReportPerDayItem[];
      }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });

      setData(getCouriersEfficiencyByPeriod);
    }

    setIsLoading(false);
  };

  const resultColumns = useMemo(() => {
    const columns: any[] = [
      {
        title: "Дата",
        dataIndex: "order_day",
        key: "order_day",
        exportable: true,
      },
    ];

    console.log("data", data);

    if (isPerHour) {
      const hours = data.map((d) => d.hour_period).flat();
      const uniqueHours = hours
        .map((h) => h!.period)
        .filter((v, i, a) => a.indexOf(v) === i);
      uniqueHours.forEach((hour) => {
        columns.push({
          title: hour,
          dataIndex: hour,
          key: hour,
          exportable: true,
          render: (value: number, record: any) => {
            const hourData = record.hour_period.find(
              (h: any) => h.period === hour
            );
            return hourData ? hourData.efficiency : 0;
          },
        });
      });
    } else {
      columns.push({
        title: "Средняя эффективность",
        dataIndex: "efficiency",
        key: "efficiency",
        exportable: true,
        render: (value: number) => value,
      });
    }

    return columns;
  }, [data]);

  const exportData = async () => {
    setIsLoading(true);
    const excel = new Excel();
    excel
      .addSheet("test")
      .addColumns(resultColumns.filter((c) => c.exportable !== false))
      .addDataSource(data, {
        str2Percent: true,
      })
      .saveAs(`Эффективность курьера.xlsx`);

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();

    return () => {};
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1>Перекличка</h1>
        <Button type="default" icon={<ExportOutlined />} onClick={exportData}>
          Экспорт
        </Button>
      </div>
      <Form onFinish={handleSubmit(onSubmit)}>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Дата">
              <Controller
                name="created_at"
                control={control}
                render={({ field }) => (
                  <RangePicker
                    {...field}
                    showTime
                    format="DD.MM.YYYY HH:mm"
                    presets={rangePresets}
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="По часам">
              <Controller
                name="per_hour"
                control={control}
                render={({ field }) => <Checkbox {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Фильтровать
            </Button>
          </Col>
        </Row>
      </Form>
      <Table
        dataSource={data}
        rowKey="id"
        bordered
        size="small"
        columns={resultColumns}
        pagination={{
          pageSize: 200,
        }}
      />
    </>
  );
};

export default CourierEffectiveness;
