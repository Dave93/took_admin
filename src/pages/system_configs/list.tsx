import {
  Card,
  Form,
  Input,
  Layout,
  PageHeader,
  Space,
  Spin,
  Table,
  TimePicker,
  useTable,
  Button,
  Col,
  Row,
  InputNumber,
  DatePicker,
  Divider,
  Select,
} from "@pankod/refine-antd";
import { useGetIdentity, useTranslate } from "@pankod/refine-core";
import dayjs from "dayjs";
import * as gql from "gql-query-builder";
import { client } from "graphConnect";
import { ISystemConfigs } from "interfaces";
import moment from "moment";
import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { drive_type } from "interfaces/enums";

export const SystemConfigsList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const tr = useTranslate();
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
        if (key == "close_dates") {
          formData.push({
            name: key,
            value: JSON.stringify(data[key]),
          });
        } else if (key == "garant_prices") {
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

  useEffect(() => {
    loadDefaultData();
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
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="Время начала дня системы"
                    rules={[
                      { required: true, message: "Обязательно для заполнения" },
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
                      { required: true, message: "Обязательно для заполнения" },
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
                      { required: true, message: "Обязательно для заполнения" },
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
                      { required: true, message: "Обязательно для заполнения" },
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
                                <DatePicker format="DD.MM.YYYY" {...field} />
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
                                      <Select.Option key={type} value={type}>
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
                              render={({ field }) => <InputNumber {...field} />}
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
            </Card>
          </Form>
        </Spin>
      </PageHeader>
    </div>
  );
};
