import { Button, Space } from "antd";
import React, { FC, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { useQueryClient } from "@tanstack/react-query";
import { useNotification } from "@refinedev/core";
import { IOrders } from "interfaces";

export const ResentToYandex = ({
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
          resendToYandex(id: $id)
        }
      `;
      const data = await client.request(
        query,
        { id },
        {
          Authorization: `Bearer ${token}`,
        }
      );
      setIsLoading(false);
      open!({
        type: "success",
        message: "Успешно переотправлен",
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
          Переотправить в Яндекс
        </Button>
      </Space>
    );
  } else {
    return <div>Не доступно</div>;
  }
  return <div>Не доступно</div>;
};
