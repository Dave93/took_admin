import { Create, useForm } from "@refinedev/antd";
import {
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  TimePicker,
} from "antd";
import { client } from "graphConnect";
import { gql } from "graphql-request";
import { IOrganization, IWorkSchedules } from "interfaces";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useGetIdentity } from "@refinedev/core";
let daysOfWeekRu = {
  "1": "Понедельник",
  "2": "Вторник",
  "3": "Среда",
  "4": "Четверг",
  "5": "Пятница",
  "6": "Суббота",
  "7": "Воскресенье",
};

const format = "HH:mm";

export const DailyGarantCreate = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps } = useForm<IWorkSchedules>({
    meta: {
      fields: ["id", "name", "date", "amount", "late_minus_sum"],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  return (
    <Create saveButtonProps={saveButtonProps} title="Создать рабочий график">
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Название"
          name="name"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Время начисления"
              name="date"
              rules={[
                {
                  required: true,
                },
              ]}
              getValueProps={(value) => ({
                value: value ? dayjs(value) : "",
              })}
            >
              <TimePicker format={format} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Сумма гаранта" name="amount">
              <InputNumber />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Сумма штрафа за опоздание за каждые 30 мин."
              name="late_minus_sum"
            >
              <InputNumber />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
