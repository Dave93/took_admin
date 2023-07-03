import { Button, Space } from "antd";
import React, { FC, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { useQueryClient } from "@tanstack/react-query";
import { useNotification } from "@refinedev/core";
import { IOrders } from "interfaces";
import { sleep } from "radash";
import { useCopyToClipboard } from "usehooks-ts";

export const TrySendMultiYandex = ({
  order,
  token,
}: {
  order: IOrders;
  token: string;
}) => {
  const queryClient = useQueryClient();
  const { open } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [value, copy] = useCopyToClipboard();
  const [resultString, setResultString] = useState("");

  const sendToYandex = async (id: string) => {
    try {
      setIsLoading(true);
      const query = gql`
        mutation ($id: String!) {
          sendOrderToRoutedYandex(id: $id)
        }
      `;
      const data = await client.request(
        query,
        { id },
        {
          Authorization: `Bearer ${token}`,
        }
      );
      console.log(data);
      setIsLoading(false);
      copy(data.sendOrderToRoutedYandex);
      setResultString(data.sendOrderToRoutedYandex);
      open!({
        type: "success",
        message: "Скопировано в буфер обмена",
      });
    } catch (e: any) {
      setIsLoading(false);
      open!({
        type: "error",
        message: e.message,
      });
    }
  };

  if (order.allowYandex) {
    return (
      <Space>
        <Button
          type="primary"
          shape="round"
          size="small"
          loading={isLoading}
          onClick={() => sendToYandex(order.id)}
        >
          Оценить мультиточку доставки
        </Button>
        {resultString ? (
          <a href={resultString} target="_blank">
            Открыть в Яндекс.Маршрутах
          </a>
        ) : null}
      </Space>
    );
  } else {
    return <div>Не доступно</div>;
  }
  return <div>Не доступно</div>;
};
