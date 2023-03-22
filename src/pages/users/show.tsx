import { useGetIdentity, useShow, useTranslate } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { Descriptions, Col, Row, Tag, Tabs } from "antd";
import dayjs from "dayjs";
import { IOrganization, ITerminals, IUsers } from "interfaces";
import "dayjs/locale/ru";
import duration from "dayjs/plugin/duration";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import UserRollCallList from "components/users/user_roll_call";
import CourierWithdraws from "components/users/courier_withdraws";
import CourierEffectiveness from "components/users/courier_effectiveness";
import CourierTransactions from "components/users/courier_transactions";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { useEffect, useState } from "react";
import { sortBy } from "lodash";
dayjs.locale("ru");
dayjs.extend(duration);

const UsersShow = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [terminals, setTerminals] = useState<ITerminals[]>([]);
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const tr = useTranslate();

  const getAllFilterData = async () => {
    const query = gql`
      query {
        cachedOrganizations {
          id
          name
        }
        cachedTerminals {
          id
          name
        }
      }
    `;
    const { cachedTerminals, cachedOrganizations } = await client.request<{
      cachedTerminals: ITerminals[];
      cachedOrganizations: IOrganization[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setOrganizations(cachedOrganizations);
    setTerminals(sortBy(cachedTerminals, (item) => item.name));
  };

  const { queryResult } = useShow<IUsers>({
    meta: {
      fields: [
        "id",
        "first_name",
        "last_name",
        "created_at",
        "drive_type",
        "car_model",
        "car_number",
        "card_name",
        "card_number",
        "phone",
        "latitude",
        "longitude",
        "status",
        "max_active_order_count",
        "doc_files",
        "order_start_date",
        {
          users_terminals: [
            {
              terminals: ["id", "name"],
            },
          ],
        },
        {
          users_work_schedules: [
            {
              work_schedules: ["id", "name"],
            },
          ],
        },
        {
          users_roles_usersTousers_roles_user_id: [
            {
              roles: ["id", "name"],
            },
          ],
        },
      ],
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  useEffect(() => {
    getAllFilterData();
    return () => {};
  }, []);
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show
      isLoading={isLoading}
      title={`Пользователь ${record?.last_name} ${record?.first_name}`}
    >
      <Tabs defaultActiveKey="main">
        <Tabs.TabPane tab="Основная информация" key="main">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Descriptions bordered>
                <Descriptions.Item label="Дата создания" span={3}>
                  {dayjs(record?.created_at).format("DD.MM.YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Статус" span={3}>
                  {tr(`users.status.${record?.status}`)}
                </Descriptions.Item>
                <Descriptions.Item label="Имя" span={3}>
                  {record?.first_name}
                </Descriptions.Item>
                <Descriptions.Item label="Фамилия" span={3}>
                  {record?.last_name}
                </Descriptions.Item>
                <Descriptions.Item label="Телефон" span={3}>
                  {formatPhoneNumberIntl(record?.phone ?? "")}
                </Descriptions.Item>
                {record?.drive_type && (
                  <Descriptions.Item label="Тип водителя" span={3}>
                    {tr("deliveryPricing.driveType." + record?.drive_type)}
                  </Descriptions.Item>
                )}
                {record?.users_terminals && (
                  <Descriptions.Item label="Филиалы" span={3}>
                    {record?.users_terminals.map((item: any) => (
                      <Tag key={item.terminals.id}>{item.terminals.name}</Tag>
                    ))}
                  </Descriptions.Item>
                )}
                {record?.users_work_schedules && (
                  <Descriptions.Item label="График работы" span={3}>
                    {record?.users_work_schedules.map((item: any) => (
                      <Tag key={item.work_schedules.id}>
                        {item.work_schedules.name}
                      </Tag>
                    ))}
                  </Descriptions.Item>
                )}
                {record?.users_roles_usersTousers_roles_user_id && (
                  <Descriptions.Item label="Роли" span={3}>
                    {record?.users_roles_usersTousers_roles_user_id.map(
                      (item: any) => (
                        <Tag key={item.roles.id}>{item.roles.name}</Tag>
                      )
                    )}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Модель автомобиля" span={3}>
                  {record?.car_model}
                </Descriptions.Item>
                <Descriptions.Item label="Номер автомобиля" span={3}>
                  {record?.car_number}
                </Descriptions.Item>
                <Descriptions.Item label="Имя владельца карты" span={3}>
                  {record?.card_name}
                </Descriptions.Item>
                <Descriptions.Item label="Номер карты" span={3}>
                  {record?.card_number}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Максимальное количество активных заказов"
                  span={3}
                >
                  {record?.max_active_order_count}
                </Descriptions.Item>
                {record?.order_start_date && (
                  <Descriptions.Item label="Дата начала работы" span={3}>
                    {dayjs(record?.order_start_date).format("DD.MM.YYYY HH:mm")}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Документы" span={3}>
                  {record?.doc_files.map((item: any) => (
                    <Tag key={item.id}>{item.name}</Tag>
                  ))}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} md={12}>
              {record && <UserRollCallList user={record!} />}
            </Col>
          </Row>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Выплаты" key="withdraws">
          {record && <CourierWithdraws user={record} />}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Начисления" key="transactions">
          {record && (
            <CourierTransactions
              user={record}
              terminals={terminals}
              organizations={organizations}
            />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Эффективность" key="efficiency">
          {record && <CourierEffectiveness user={record} />}
        </Tabs.TabPane>
      </Tabs>
    </Show>
  );
};

export default UsersShow;
