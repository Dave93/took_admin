import { Col, Form, Row, DatePicker, Button, Table } from "antd";
import { rangePresets } from "components/dates/RangePresets";
import { Excel } from "components/export/src";
import dayjs from "dayjs";
import {
  IManagerWithdraw,
  IManagerWithdrawTransactions,
  IUsers,
} from "interfaces";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useGetIdentity } from "@refinedev/core";
import { ExportOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

const CourierWithdraws = ({ user }: { user: IUsers }) => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<IManagerWithdraw[]>([]);
  const { handleSubmit, control, getValues } = useForm<{
    created_at: [dayjs.Dayjs, dayjs.Dayjs];
  }>({
    defaultValues: {
      created_at: [dayjs().startOf("w"), dayjs().endOf("w")],
    },
  });

  const onSubmit = async (data: any) => {
    loadData();
  };

  const loadData = async () => {
    setIsLoading(true);

    const { created_at } = getValues();

    const query = gql`
      query {
        getCourierWithdraws(
          startDate: "${created_at[0].toISOString()}"
          endDate: "${created_at[1].toISOString()}"
          courierId: "${user.id}"
        ) {
            id
            amount
            amount_before
            amount_after
            created_at
            payed_date
            manager_withdraw_managers {
                first_name
                last_name
            }
            manager_withdraw_terminals {
                name
            }
        }
      }
    `;
    const { getCourierWithdraws } = await client.request<{
      getCourierWithdraws: IManagerWithdraw[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });

    setData(getCourierWithdraws);
    setIsLoading(false);
  };

  const columns = [
    {
      title: "Дата",
      dataIndex: "created_at",
      key: "created_at",
      exportable: true,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Менеджер",
      dataIndex: "manager_withdraw_managers",
      key: "manager_withdraw_managers",
      exportable: true,
      render: (value: IUsers) => `${value.first_name} ${value.last_name}`,
    },
    {
      title: "Выплатил",
      dataIndex: "amount",
      key: "amount",
      exportable: true,
      excelRender: (value: number) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Кошелёк до выплат",
      dataIndex: "amount_before",
      key: "amount_before",
      exportable: true,
      excelRender: (value: number) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Кошелёк после выплат",
      dataIndex: "amount_after",
      key: "amount_after",
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
      .saveAs(`Выплаты ${user.first_name} ${user.last_name}.xlsx`);

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
        <h1>Выплаты</h1>
        <Button type="default" icon={<ExportOutlined />} onClick={exportData}>
          Экспорт
        </Button>
      </div>
      <Form onFinish={handleSubmit(onSubmit)}>
        <Row gutter={16}>
          <Col span={12}>
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
        expandable={{
          expandedRowRender: (record: IManagerWithdraw) => (
            <ManagerWithdrawTransactions record={record} />
          ),
        }}
        pagination={{
          pageSize: 200,
        }}
        summary={(pageData) => {
          let total = 0;
          let amountBefore = 0;
          let amountAfter = 0;
          pageData.forEach(({ amount, amount_before, amount_after }) => {
            total += +amount;
            amountBefore += +amount_before;
            amountAfter += +amount_after;
          });
          return (
            <>
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    Итого
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    {new Intl.NumberFormat("ru-RU").format(total)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    {new Intl.NumberFormat("ru-RU").format(amountBefore)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}>
                    {new Intl.NumberFormat("ru-RU").format(amountAfter)}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            </>
          );
        }}
      />
    </>
  );
};

export const ManagerWithdrawTransactions = ({
  record,
}: {
  record: IManagerWithdraw;
}) => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [data, setData] = useState<IManagerWithdrawTransactions[]>([]);

  const loadData = async () => {
    const query = gql`
      query {
        getCourierWithdrawTransactions(
            withdrawId: "${record.id}"
        ) {
            id
            amount
            created_at
            manager_withdraw_transactions_transaction {
                id
                created_at
                order_transactions_orders {
                    order_number
                    delivery_price
                    created_at
                }
            }
        }
      }
    `;
    const { getCourierWithdrawTransactions } = await client.request<{
      getCourierWithdrawTransactions: IManagerWithdrawTransactions[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });

    setData(getCourierWithdrawTransactions);
  };

  const columns = [
    {
      title: "Номер заказа",
      dataIndex: "manager_withdraw_transactions_transaction",
      key: "manager_withdraw_transactions_transaction",
      exportable: true,
      render: (value: string, record: any) => {
        if (
          !record.manager_withdraw_transactions_transaction
            .order_transactions_orders
        )
          return "";
        return record.manager_withdraw_transactions_transaction
          .order_transactions_orders.order_number;
      },
    },
    {
      title: "Дата зачисления в кошелёк",
      dataIndex: "manager_withdraw_transactions_transaction",
      key: "manager_withdraw_transactions_transaction",
      exportable: true,
      render: (value: string, record: any) =>
        dayjs(
          record.manager_withdraw_transactions_transaction.created_at
        ).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Дата заказа",
      dataIndex: "manager_withdraw_transactions_transaction",
      key: "manager_withdraw_transactions_transaction",
      exportable: true,
      render: (value: string, record: any) => {
        if (
          !record.manager_withdraw_transactions_transaction
            .order_transactions_orders
        )
          return "";
        return dayjs(
          record.manager_withdraw_transactions_transaction
            .order_transactions_orders.created_at
        ).format("DD.MM.YYYY HH:mm");
      },
    },
    {
      title: "Выплачено",
      dataIndex: "amount",
      key: "amount",
      exportable: true,
      excelRender: (value: number) => +value,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
  ];

  useEffect(() => {
    loadData();

    return () => {};
  }, []);
  return (
    <>
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
    </>
  );
};

export default CourierWithdraws;
