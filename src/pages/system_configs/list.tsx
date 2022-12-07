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
} from "@pankod/refine-antd";
import { useGetIdentity } from "@pankod/refine-core";
import dayjs from "dayjs";
import * as gql from "gql-query-builder";
import { client } from "graphConnect";
import { ISystemConfigs } from "interfaces";
import moment from "moment";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

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
    console.log(data.systemConfigs);
    data.systemConfigs.forEach((item: any) => {
      if (item.name.indexOf("time") !== -1) {
        setValue(item.name, dayjs(item.value));
      } else {
        setValue(item.name, item.value);
      }
    });
  };

  const onSubmit = async (data: any) => {
    console.log(data);
    setIsLoading(true);
    let formData = [];
    for (const key in data) {
      if (typeof data[key].toISOString !== "undefined") {
        formData.push({
          name: key,
          value: data[key].toISOString(),
        });
      } else {
        formData.push({
          name: key,
          value: data[key].toString(),
        });
      }
    }

    console.log(formData);
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
              </Row>
            </Card>
          </Form>
        </Spin>
      </PageHeader>
    </div>
  );
};
