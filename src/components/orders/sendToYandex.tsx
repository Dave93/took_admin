import { Button, Space } from "antd";
import React, { FC, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { useQueryClient } from "@tanstack/react-query";
import { useNotification } from "@refinedev/core";
import { IOrders } from "interfaces";
import { sleep } from "radash";

export const SendOrderToYandex = ({
  order,
  token,
}: {
  order: IOrders;
  token: string;
}) => {
  const queryClient = useQueryClient();
  const { open } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const sendToYandex = async (id: string) => {
    try {
      setIsLoading(true);
      const query = gql`
        mutation ($id: String!) {
          checkPriceOrderToYandex(id: $id)
        }
      `;
      await client.request(
        query,
        { id },
        {
          Authorization: `Bearer ${token}`,
        }
      );
    } catch (e: any) {
      setIsLoading(false);
      open!({
        type: "error",
        message: e.message,
      });
    }

    await sleep(300);
    queryClient.invalidateQueries(["default", "missed_orders", "list"]);
    await sleep(100);
    setIsLoading(false);
    queryClient.invalidateQueries(["default", "missed_orders", "list"]);
  };

  const cancelYandex = async (id: string) => {
    try {
      setIsLoading(true);
      const query = gql`
        mutation ($id: String!) {
          cancelOrderToYandex(id: $id)
        }
      `;
      await client.request(
        query,
        { id },
        {
          Authorization: `Bearer ${token}`,
        }
      );
      // setIsLoading(false);
    } catch (e: any) {
      setIsLoading(false);
      open!({
        type: "error",
        message: e.message,
      });
    }
    await sleep(1000);
    setIsLoading(false);
    queryClient.invalidateQueries(["default", "missed_orders", "list"]);
  };

  const approveYandex = async (id: string) => {
    try {
      setIsLoading(true);
      const query = gql`
        mutation ($id: String!) {
          sendOrderToYandex(id: $id)
        }
      `;
      await client.request(
        query,
        { id },
        {
          Authorization: `Bearer ${token}`,
        }
      );
    } catch (e: any) {
      setIsLoading(false);
      open!({
        type: "error",
        message: e.message,
      });
    }
    await sleep(500);
    queryClient.invalidateQueries(["default", "missed_orders", "list"]);
    await sleep(100);
    setIsLoading(false);
    queryClient.invalidateQueries(["default", "missed_orders", "list"]);
  };
  if (order.allowYandex) {
    if (order.yandex_delivery_data) {
      if (
        order.yandex_delivery_data.pricing_data &&
        (!order.yandex_delivery_data.order_data ||
          !order.yandex_delivery_data.order_data.id)
      ) {
        return (
          <>
            <div>
              Расчётная сумма доставки:{" "}
              {new Intl.NumberFormat("ru").format(
                order.yandex_delivery_data.pricing_data.price
              )}
            </div>
            <div>
              <Space>
                <Button
                  type="primary"
                  shape="round"
                  size="small"
                  danger
                  loading={isLoading}
                  onClick={() => cancelYandex(order.id)}
                >
                  Отменить отправку
                </Button>
                <Button
                  type="primary"
                  shape="round"
                  size="small"
                  loading={isLoading}
                  onClick={() => approveYandex(order.id)}
                >
                  Отправить
                </Button>
              </Space>
            </div>
          </>
        );
      } else if (
        order.yandex_delivery_data.pricing_data &&
        order.yandex_delivery_data.order_data
      ) {
        return (
          <>
            <div>
              Статус заявки: {order.yandex_delivery_data.order_data.status}
            </div>
          </>
        );
      }
    } else {
      return (
        <Button
          type="primary"
          shape="round"
          size="small"
          loading={isLoading}
          onClick={() => sendToYandex(order.id)}
        >
          Оценить доставку
        </Button>
      );
    }
  } else {
    return <div>Не доступно</div>;
  }
  return <div>Не доступно</div>;
};
