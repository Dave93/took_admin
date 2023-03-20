import { Alert, Button, Col, Row, Select, Space } from "antd";
import { useCan, useGetIdentity } from "@refinedev/core";
import { client } from "graphConnect";
import { IOrders, IOrderStatus } from "interfaces";
import * as gqlb from "gql-query-builder";
import { FC, useState } from "react";
import { gql } from "graphql-request";

interface IOrdersTableActionsProps {
  selectedOrders: IOrders[] | undefined;
  onFinishAction: () => void;
}

export const OrdersTableActions: FC<IOrdersTableActionsProps> = ({
  selectedOrders,
  onFinishAction,
}) => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>({
    v3LegacyAuthProviderCompatible: true
  });
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [orderStatuses, setOrderStatuses] = useState<IOrderStatus[]>([]);
  const [chosenStatusId, setChosenStatusId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [enabledApply, setEnabledApply] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleActionChange = (value: string) => {
    setErrorMessage(null);
    changeOrdersStatus(null);
    setCurrentAction(value);
    if (value === "change_status") {
      loadOrderStatuses();
    }
  };

  const loadOrderStatuses = async () => {
    let organizations: any = {};
    selectedOrders?.forEach((order) => {
      organizations[order.orders_organization.id] =
        order.orders_organization.name;
    });
    if (Object.keys(organizations).length > 1) {
      setErrorMessage(
        "Вы не можете изменить статус заказов из разных организаций"
      );
      return;
    }
    const organizationId = Object.keys(organizations)[0];
    const query = gql`
        query {
            orderStatuses(where: {
                organization_id: {
                    equals: "${organizationId}"
                }
            }, orderBy: {
                sort: asc}) {
                id
                name
            }
        }`;
    const { orderStatuses } = await client.request<{
      orderStatuses: IOrderStatus[];
    }>(
      query,
      {},
      {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );
    setErrorMessage(null);
    setOrderStatuses(orderStatuses);
  };

  const changeOrdersStatus = async (statusId: string | null) => {
    setChosenStatusId(statusId);
    setEnabledApply(true);
  };

  const applyStatusChange = async () => {
    setErrorMessage(null);
    const { query, variables } = gqlb.mutation({
      operation: "changeMultipleOrderStatus",
      variables: {
        orderIds: {
          value: selectedOrders?.map((order) => order.id),
          type: "[String!]!",
        },
        orderStatusId: {
          value: chosenStatusId,
          type: "String!",
        },
      },
      fields: ["id"],
    });
    const response = await client.request(query, variables, {
      Authorization: `Bearer ${identity?.token.accessToken}`,
    });
    setChosenStatusId(null);
    onFinishAction();
  };

  const applyChanges = async () => {
    setLoading(true);
    if (currentAction === "change_status") {
      await applyStatusChange();
    }
    setLoading(false);
    setEnabledApply(false);
    setCurrentAction(null);
  };

  const { data: ordersChangeMultipleStatus } = useCan({
    resource: "orders",
    action: "change_multiple_status",
  });

  return (
    <div>
      <Space>
        <Select
          placeholder="Выбрать действие"
          onChange={(value: string) => handleActionChange(value)}
          disabled={selectedOrders?.length === 0}
          allowClear
        >
          <Select.Option
            value="change_status"
            disabled={ordersChangeMultipleStatus?.can === false}
          >
            Сменить статус
          </Select.Option>
        </Select>
        {currentAction === "change_status" &&
          orderStatuses.length &&
          orderStatuses.length > 0 && (
            <div>
              <Select
                placeholder="Выбрать статус"
                onChange={changeOrdersStatus}
                disabled={selectedOrders?.length === 0}
              >
                {orderStatuses.map((orderStatus) => (
                  <Select.Option value={orderStatus.id}>
                    {orderStatus.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          )}
        {errorMessage && <Alert message={errorMessage} type="error" />}
        {!errorMessage && enabledApply && (
          <Button type="primary" onClick={applyChanges} loading={loading}>
            Применить
          </Button>
        )}
      </Space>
    </div>
  );
};
