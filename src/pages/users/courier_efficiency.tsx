import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Edit,
  EditButton,
  Form,
  Input,
  InputNumber,
  PageHeader,
  Row,
  Select,
  Space,
  Spin,
  Table,
  useDrawerForm,
} from "@pankod/refine-antd";
import { ExportOutlined, EditOutlined } from "@ant-design/icons";
import { useGetIdentity, useTranslate } from "@pankod/refine-core";
import { ITerminals, IUsers, IWorkSchedules } from "interfaces";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { chain, sortBy } from "lodash";
import { Excel } from "components/export/src";
import { rangePresets } from "components/dates/RangePresets";

const { RangePicker } = DatePicker;

const CourierEfficiency = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [couriersList, setCouriersList] = useState<IUsers[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [efficiencyData, setEfficiencyData] = useState<any[]>([]);
  const {
    handleSubmit,
    control,
    register,
    setValue,
    watch,
    formState: { errors },
    getValues,
  } = useForm<{
    created_at: [dayjs.Dayjs, dayjs.Dayjs];
    courier_id: string;
    terminal_id: string;
    status: string;
  }>({
    defaultValues: {
      created_at: [dayjs().startOf("d"), dayjs().endOf("d")],
      courier_id: undefined,
      terminal_id: undefined,
      status: "active",
    },
  });
  const tr = useTranslate();

  const onSubmit = async (data: any) => {
    loadData();
  };

  const fetchAllData = async () => {
    const query = gql`
      query {
        cachedTerminals {
          id
          name
          organization {
            id
            name
          }
        }
        users(
          where: {
            users_roles_usersTousers_roles_user_id: {
              some: { roles: { is: { code: { equals: "courier" } } } }
            }
          }
        ) {
          first_name
          last_name
          id
        }
      }
    `;
    const { cachedTerminals, users } = await client.request<{
      cachedTerminals: ITerminals[];
      users: IUsers[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });

    setCouriersList(users);
    setTerminals(sortBy(cachedTerminals, ["name"]));
  };

  const loadData = async () => {
    setIsLoading(true);

    const { created_at, courier_id, terminal_id, status } = getValues();
  };

  const exportData = async () => {
    setIsLoading(true);
    const excel = new Excel();
    // excel
    //   .addSheet("test")
    //   .addColumns(columns.filter((c) => c.exportable !== false))
    //   .addDataSource(efficiencyData, {
    //     str2Percent: true,
    //   })
    //   .saveAs("Гарант.xlsx");

    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllData();
    loadData();

    return () => {};
  }, []);

  return (
    <>
      <PageHeader
        title="Эффективность курьеров"
        ghost={false}
        extra={
          <Space>
            <Button
              type="default"
              icon={<ExportOutlined />}
              onClick={exportData}
            >
              Экспорт
            </Button>
          </Space>
        }
      >
        <Spin spinning={isLoading}>
          <Form onFinish={handleSubmit(onSubmit)}>
            <Card
              bordered={false}
              actions={[
                <Space key="save-btn">
                  <Button type="primary" htmlType="submit">
                    Фильтровать
                  </Button>
                </Space>,
              ]}
            >
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
                  <Form.Item label="Филиал">
                    <Controller
                      name="terminal_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          showSearch
                          optionFilterProp="children"
                          allowClear
                          mode="multiple"
                        >
                          {terminals.map((terminal: any) => (
                            <Select.Option
                              key={terminal.id}
                              value={terminal.id}
                            >
                              {terminal.name}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Курьер">
                    <Controller
                      name="courier_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Выберите курьера"
                          allowClear
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          filterSort={(optionA, optionB) =>
                            (optionA?.label ?? "")
                              .toLowerCase()
                              .localeCompare(
                                (optionB?.label ?? "").toLowerCase()
                              )
                          }
                          options={couriersList.map((c) => ({
                            label: `${c.first_name} ${c.last_name}`,
                            value: c.id,
                          }))}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Статус">
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Выберите статус"
                          allowClear
                          options={[
                            {
                              label: tr("users.status.active"),
                              value: "active",
                            },
                            {
                              label: tr("users.status.inactive"),
                              value: "inactive",
                            },
                            {
                              label: tr("users.status.blocked"),
                              value: "blocked",
                            },
                          ]}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Form>
        </Spin>
      </PageHeader>
    </>
  );
};

export default CourierEfficiency;
