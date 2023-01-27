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
} from "@pankod/refine-antd";
import { useGetIdentity } from "@pankod/refine-core";
import dayjs from "dayjs";
import * as gql from "gql-query-builder";
import { client } from "graphConnect";
import { ISystemConfigs } from "interfaces";
import moment from "moment";
import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

export const SystemConfigsList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    handleSubmit,
    control,
    register,
    setValue,
    formState: { errors },
  } = useForm();
  const { fields, append, prepend, remove, swap, move, insert, replace } =
    useFieldArray({
      control,
      name: "close_dates",
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
          setValue(item.name, JSON.parse(item.value));
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
          console.log(JSON.stringify(data[key]));
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
            </Card>
          </Form>
        </Spin>
      </PageHeader>
    </div>
  );
};
