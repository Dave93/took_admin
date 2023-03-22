import { CanAccess, useGetIdentity } from "@refinedev/core";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import { rangePresets } from "components/dates/RangePresets";
import { ExportOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  IOrderTransactions,
  IOrganization,
  ITerminals,
  IUsers,
} from "interfaces";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { GrShare } from "react-icons/gr";
import { Excel } from "components/export/src";
import { IconContext } from "react-icons/lib";
import { useModalForm } from "@refinedev/antd";
import { sortBy } from "lodash";

const { RangePicker } = DatePicker;

const CourierTransactions = ({
  user,
  terminals,
  organizations,
}: {
  user: IUsers;
  terminals: ITerminals[];
  organizations: IOrganization[];
}) => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<IOrderTransactions[]>([]);
  const { handleSubmit, control, getValues } = useForm<{
    created_at: [dayjs.Dayjs, dayjs.Dayjs];
    status: string;
  }>({
    defaultValues: {
      created_at: [dayjs().startOf("w"), dayjs().endOf("w")],
    },
  });

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
  } = useModalForm<IOrderTransactions>({
    action: "create",
    resource: "order_transactions",
    redirect: false,
    autoResetForm: true,
    onMutationSuccess: () => {
      loadData();
    },
    defaultFormValues: {
      courier_id: user.id,
      transaction_type: "CUSTOM",
      organization_id: organizations[0]?.id,
    },
    meta: {
      pluralize: true,
      fields: ["id"],
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  const onSubmit = async (data: any) => {
    loadData();
  };

  const loadData = async () => {
    setIsLoading(true);

    const { created_at, status } = getValues();

    const query = gql`
      query {
        orderTransactions(
          where: {
            AND: { created_at: { gt: "${created_at[0].toISOString()}" } }
            created_at: { lt: "${created_at[1].toISOString()}" }
            courier_id: { equals: "${user.id}" }
            ${status ? `status: { equals: ${status} }` : ""}
          }
          orderBy: { created_at: desc }
        ) {
          id
          order_id
          created_at
          amount
          status
          balance_before
          balance_after
          comment
          not_paid_amount
          order_transactions_orders {
              order_number
          }
          order_transactions_terminals {
              id
              name
          }
          order_transactions_created_byTousers {
              id
              first_name
              last_name
          }
        }
      }
    `;
    const { orderTransactions } = await client.request<{
      orderTransactions: IOrderTransactions[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });

    setData(orderTransactions);
    setIsLoading(false);
  };

  const columns = [
    {
      title: "№",
      dataIndex: "created_at",
      key: "created_at",
      exportable: true,
      render: (value: string, record: IOrderTransactions, index: number) =>
        index + 1,
    },
    {
      title: "Дата",
      dataIndex: "created_at",
      key: "created_at",
      exportable: true,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      exportable: true,
      excelRender: (value: string) =>
        value === "success" ? "Оплачено" : "Не оплачено",
      render: (value: string) => {
        switch (value) {
          case "success":
            return <Tag color="#87d068">Оплачено</Tag>;
          default:
            return <Tag color="#f50">Не оплачено</Tag>;
        }
      },
    },
    {
      title: "Заказ",
      dataIndex: "order_transactions_orders",
      key: "order_transactions_orders",
      exportable: true,
      excelRender: (value: any) => (value ? value.order_number : ""),
      render: (value: any, record: IOrderTransactions) =>
        record.order_id ? (
          <div>
            {value.order_number}{" "}
            <Button
              type="primary"
              size="small"
              onClick={() => window.open(`/orders/show/${record.order_id}`)}
              icon={
                <IconContext.Provider
                  value={{
                    color: "white",
                  }}
                >
                  <GrShare color="white" />
                </IconContext.Provider>
              }
            />
          </div>
        ) : (
          ""
        ),
    },
    {
      title: "Филиал",
      dataIndex: "order_transactions_terminals",
      key: "order_transactions_terminals",
      exportable: true,
      excelRender: (value: any) => (value ? value.name : ""),
      render: (value: any) => (value ? value.name : ""),
    },
    {
      title: "Кто добавил",
      dataIndex: "order_transactions_created_byTousers",
      key: "order_transactions_created_byTousers",
      exportable: true,
      excelRender: (value: any) =>
        value ? `${value.first_name} ${value.last_name}` : "Система",
      render: (value: any) =>
        value ? `${value.first_name} ${value.last_name}` : "Система",
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      exportable: true,
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      exportable: true,
      excelRender: (value: number) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Не оплачено",
      dataIndex: "not_paid_amount",
      key: "not_paid_amount",
      exportable: true,
      excelRender: (value: number) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Кошелёк до",
      dataIndex: "balance_before",
      key: "balance_before",
      exportable: true,
      excelRender: (value: number) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Кошелёк после",
      dataIndex: "balance_after",
      key: "balance_after",
      exportable: true,
      excelRender: (value: number) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
  ];

  const exportData = async () => {
    setIsLoading(true);
    const excel = new Excel();
    excel
      .addSheet("test")
      .addColumns(columns.filter((c) => c.exportable !== false))
      .addDataSource(data, {
        str2Percent: true,
      })
      .saveAs(`Начисления ${user.first_name} ${user.last_name}.xlsx`);

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
        <h1>Начисления</h1>
        <Space>
          <Button type="default" icon={<ExportOutlined />} onClick={exportData}>
            Экспорт
          </Button>
          <CanAccess resource="order_transactions" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => createModalShow()}
            >
              Добавить
            </Button>
          </CanAccess>
        </Space>
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
            <Form.Item label="Статус">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select {...field} allowClear>
                    <Select.Option value="success">Оплачено</Select.Option>
                    <Select.Option value="pending">Не оплачено</Select.Option>
                  </Select>
                )}
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
        columns={columns}
        pagination={{
          pageSize: 200,
        }}
      />
      <Modal {...createModalProps}>
        <Form {...createFormProps} layout="vertical">
          <Form.Item
            label="Сумма"
            name="amount"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value: any) =>
                new Intl.NumberFormat("ru-RU").format(+value)
              }
              parser={(value: any) => value?.toString().replace(/\s?/g, "")}
            />
          </Form.Item>
          <Form.Item
            label="Филиал"
            name="terminal_id"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select>
              {terminals.map((t) => (
                <Select.Option key={t.id} value={t.id}>
                  {t.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Комментарий"
            name="comment"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="courier_id" hidden></Form.Item>
          <Form.Item name="transaction_type" hidden></Form.Item>
          <Form.Item name="organization_id" hidden></Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default CourierTransactions;
