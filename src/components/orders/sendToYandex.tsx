import { Button } from "antd";
import React, { FC, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { useQueryClient } from "@tanstack/react-query";
import { useNotification } from "@refinedev/core";

export const SendOrderToYandex: FC<{
  id: string;
  token: string;
}> = ({ id, token }) => {
  const queryClient = useQueryClient();
  const { open } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const sendToYandex = async (id: string) => {
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
      setIsLoading(false);
    } catch (e: any) {
      setIsLoading(false);
      open!({
        type: "error",
        message: e.message,
      });
    }
    queryClient.invalidateQueries(["default", "missed_orders", "list"]);
  };
  return (
    <Button
      type="primary"
      shape="round"
      size="small"
      loading={isLoading}
      onClick={() => sendToYandex(id)}
    >
      Отправить
    </Button>
  );
};
