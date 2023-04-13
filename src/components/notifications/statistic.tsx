import { useGetIdentity } from "@refinedev/core";
import { INotificationStatistic } from "interfaces";
import { FC, useEffect, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { Table } from "antd";

export const NotificationsStatistic: FC<{
  notifications: INotificationStatistic[];
}> = ({ notifications }) => {
  const columns = [
    {
      title: "Курьер",
      dataIndex: "user",
      key: "user",
      exportable: true,
      render: (value: any) => `${value.first_name} ${value.last_name}`,
    },
    {
      title: "Статус",
      dataIndex: "deliver_status",
      key: "deliver_status",
      exportable: true,
      render: (value: any) => {
        switch (value) {
          case "not_sent":
            return "Не отправлено";
          case "read":
            return "Прочитано";
          case "sent":
            return "Отправлено";
        }
      },
    },
  ];

  return (
    <Table
      dataSource={notifications}
      rowKey={(record) => `${record.id}_${record.user.id}`}
      bordered
      size="small"
      columns={columns}
      pagination={{
        pageSize: 200,
      }}
    />
  );
};
