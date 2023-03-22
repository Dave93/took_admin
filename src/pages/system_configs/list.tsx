import { PageHeader } from "@refinedev/antd";
import {
  Card,
  Form,
  Input,
  Space,
  Spin,
  TimePicker,
  Button,
  Col,
  Row,
  InputNumber,
  DatePicker,
  Divider,
  Select,
  Tabs,
  TabsProps,
} from "antd";
import { useGetIdentity, useTranslate } from "@refinedev/core";
import dayjs from "dayjs";
import * as gql from "gql-query-builder";
import { client } from "graphConnect";
import { ITerminals } from "interfaces";
import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { drive_type } from "interfaces/enums";
import { chain } from "lodash";
import StickyBox from "react-sticky-box";

const { TabPane } = Tabs;

export const SystemConfigsList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [terminals, setTerminals] = useState<any[]>([]);
  const tr = useTranslate();

  const renderTabBar: TabsProps["renderTabBar"] = (
    props: any,
    DefaultTabBar: any
  ) => (
    <StickyBox offsetTop={0} offsetBottom={20} style={{ zIndex: 1 }}>
      <DefaultTabBar {...props} />
    </StickyBox>
  );

  const {
    handleSubmit,
    control,
    register,
    setValue,
    formState: { errors },
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "close_dates",
  });

  const {
    fields: garantPriceFields,
    append: garantPriceAppend,
    remove: garantPriceRemove,
  } = useFieldArray({
    control,
    name: "garant_prices",
  });

  const {
    fields: terminalCloseDaysFields,
    append: terminalCloseDaysAppend,
    remove: terminalCloseDaysRemove,
  } = useFieldArray({
    control,
    name: "terminal_close_days",
  });

  const loadDefaultData = async () => {
    setIsLoading(true);
    const { query } = gql.query({
      operation: "systemConfigs",
      fields: ["id", "name", "value"],
    });
    const data = await client.request(
      query,
      {},
      {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );
    setIsLoading(false);
    data.systemConfigs.forEach((item: any) => {
      if (item.name.indexOf("time") !== -1) {
        setValue(item.name, dayjs(item.value));
      } else {
        if (item.name == "close_dates") {
          try {
            let closeDates = JSON.parse(item.value);
            closeDates = closeDates.map((item: any) => {
              return {
                date: dayjs(item.date),
                reason: item.reason,
              };
            });
            setValue(item.name, closeDates);
          } catch (error) {
            console.log(error);
          }
        } else if (item.name == "garant_prices") {
          try {
            let closeDates = JSON.parse(item.value);
            setValue(item.name, closeDates);
          } catch (error) {
            console.log(error);
          }
        } else if (item.name == "terminal_close_days") {
          try {
            let terminalCloseDays = JSON.parse(item.value);
            terminalCloseDays = terminalCloseDays.map((item: any) => {
              return {
                date: dayjs(item.date),
                terminal_id: item.terminal_id,
              };
            });
            setValue(item.name, terminalCloseDays);
          } catch (error) {
            console.log(error);
          }
        } else {
          setValue(item.name, item.value);
        }
      }
    });
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    let formData = [];
    for (const key in data) {
      if (typeof data[key].toISOString !== "undefined") {
        formData.push({
          name: key,
          value: data[key].toISOString(),
        });
      } else {
        if (
          ["close_dates", "garant_prices", "terminal_close_days"].includes(key)
        ) {
          formData.push({
            name: key,
            value: JSON.stringify(data[key]),
          });
        } else {
          formData.push({
            name: key,
            value: data[key].toString(),
          });
        }
      }
    }

    const { query, variables } = gql.mutation({
      operation: "createSystemConfig",
      variables: {
        data: {
          value: { items: formData },
          type: "CreateSystemConfigInput",
          required: true,
        },
      },
      fields: ["name", "value"],
    });
    const response = await client.request(query, variables, {
      Authorization: `Bearer ${identity?.token.accessToken}`,
    });

    setIsLoading(false);
  };

  const fetchAllData = async () => {
    const { query } = gql.query([
      {
        operation: "cachedTerminals",
        fields: ["id", "name", "organization { id name }"],
      },
    ]);
    const { cachedTerminals } = await client.request<{
      cachedTerminals: ITerminals[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });

    var result = chain(cachedTerminals)
      .groupBy("organization.name")
      .toPairs()
      .map(function (item) {
        return {
          name: item[0],
          children: item[1],
        };
      })
      .value();

    setTerminals(result);
  };

  useEffect(() => {
    loadDefaultData();
    fetchAllData();
  }, []);

  return (
    <div>
      <PageHeader title="Системные настройки" ghost={false}>
        <Spin spinning={isLoading}>
          <Form onFinish={handleSubmit(onSubmit)}>
            <Card
              bordered={false}
              actions={[
                <Space key="save-btn">
                  <Button type="primary" htmlType="submit">
                    Сохранить
                  </Button>
                </Space>,
              ]}
            >
              <Tabs
                defaultActiveKey="1"
                type="card"
                renderTabBar={renderTabBar}
              >
                <TabPane tab="Основные" key="1">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        label="Время начала дня системы"
                        rules={[
                          {
                            required: true,
                            message: "Обязательно для заполнения",
                          },
                        ]}
                      >
                        <Controller
                          name="work_start_time"
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <TimePicker format="HH:mm" {...field} />
                          )}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="Время окончания дня системы"
                        rules={[
                          {
                            required: true,
                            message: "Обязательно для заполнения",
                          },
                        ]}
                      >
                        <Controller
                          name="work_end_time"
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <TimePicker format="HH:mm" {...field} />
                          )}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="Телефон для звонков"
                        rules={[
                          {
                            required: true,
                            message: "Обязательно для заполнения",
                          },
                        ]}
                      >
                        <Controller
                          name="admin_phone"
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => <Input {...field} />}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="Сумма гаранта"
                        rules={[
                          {
                            required: true,
                            message: "Обязательно для заполнения",
                          },
                        ]}
                      >
                        <Controller
                          name="garant_price"
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <InputNumber size="small" {...field} />
                          )}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Divider>Нерабочие дни</Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      {fields.map((field, index) => {
                        return (
                          <Row key={field.id}>
                            <Col span={10}>
                              <Form.Item label="Дата">
                                <Controller
                                  name={`close_dates.${index}.date`}
                                  control={control}
                                  rules={{ required: true }}
                                  render={({ field }) => (
                                    <DatePicker
                                      format="DD.MM.YYYY"
                                      {...field}
                                    />
                                  )}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={10}>
                              <Form.Item label="Причина">
                                <Controller
                                  name={`close_dates.${index}.reason`}
                                  control={control}
                                  rules={{ required: true }}
                                  render={({ field }) => <Input {...field} />}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item label="&nbsp;">
                                <Button
                                  danger
                                  shape="circle"
                                  icon={<DeleteOutlined />}
                                  onClick={() => {
                                    remove(index);
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        );
                      })}
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() =>
                            append({
                              date: null,
                              reason: "",
                            })
                          }
                          block
                          icon={<PlusOutlined />}
                        >
                          Добавить нерабочие дни
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab="Гарант" key="2">
                  <Divider>Суммы гаранта</Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      {garantPriceFields.map((field, index) => {
                        return (
                          <Row key={field.id} gutter={16}>
                            <Col span={10}>
                              <Form.Item label="Тип доставки">
                                <Controller
                                  name={`garant_prices.${index}.drive_type`}
                                  control={control}
                                  rules={{ required: true }}
                                  render={({ field }) => (
                                    <Select {...field}>
                                      {Object.keys(drive_type).map(
                                        (type: string) => (
                                          <Select.Option
                                            key={type}
                                            value={type}
                                          >
                                            {tr(
                                              `deliveryPricing.driveType.${type}`
                                            )}
                                          </Select.Option>
                                        )
                                      )}
                                    </Select>
                                  )}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={10}>
                              <Form.Item label="Сумма">
                                <Controller
                                  name={`garant_prices.${index}.price`}
                                  control={control}
                                  rules={{ required: true }}
                                  render={({ field }) => (
                                    <InputNumber {...field} />
                                  )}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item label="&nbsp;">
                                <Button
                                  danger
                                  shape="circle"
                                  icon={<DeleteOutlined />}
                                  onClick={() => {
                                    garantPriceRemove(index);
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        );
                      })}
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() =>
                            garantPriceAppend({
                              drive_type: null,
                              price: 0,
                            })
                          }
                          block
                          icon={<PlusOutlined />}
                        >
                          Добавить сумму гаранта
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Divider>Закрытые дни филиалов</Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      {terminalCloseDaysFields.map((field, index) => {
                        return (
                          <Row key={field.id} gutter={16}>
                            <Col span={10}>
                              <Form.Item label="Филиал">
                                <Controller
                                  name={`terminal_close_days.${index}.terminal_id`}
                                  control={control}
                                  rules={{ required: true }}
                                  render={({ field }) => (
                                    <Select {...field}>
                                      {terminals.map((terminal: any) => (
                                        <Select.OptGroup
                                          key={terminal.name}
                                          label={terminal.name}
                                        >
                                          {terminal.children.map(
                                            (terminal: ITerminals) => (
                                              <Select.Option
                                                key={terminal.id}
                                                value={terminal.id}
                                              >
                                                {terminal.name}
                                              </Select.Option>
                                            )
                                          )}
                                        </Select.OptGroup>
                                      ))}
                                    </Select>
                                  )}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={10}>
                              <Form.Item label="Дата">
                                <Controller
                                  name={`terminal_close_days.${index}.date`}
                                  control={control}
                                  rules={{ required: true }}
                                  render={({ field }) => (
                                    <DatePicker
                                      format="DD.MM.YYYY"
                                      {...field}
                                    />
                                  )}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item label="&nbsp;">
                                <Button
                                  danger
                                  shape="circle"
                                  icon={<DeleteOutlined />}
                                  onClick={() => {
                                    terminalCloseDaysRemove(index);
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        );
                      })}
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() =>
                            terminalCloseDaysAppend({
                              date: dayjs(),
                              terminal_id: null,
                            })
                          }
                          block
                          icon={<PlusOutlined />}
                        >
                          Добавить
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </TabPane>
              </Tabs>
            </Card>
          </Form>
        </Spin>
      </PageHeader>
    </div>
  );
};
