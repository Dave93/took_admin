import { useGetIdentity } from "@refinedev/core";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { IOrderTransactions, IUsers } from "interfaces";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { gql } from "graphql-request";
import { client } from "graphConnect";

const { RangePicker } = DatePicker;

const CourierTransactions = ({ user }: { user: IUsers }) => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<IOrderTransactions[]>([]);
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
      getCourierWithdraws: IOrderTransactions[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });

    setData(getCourierWithdraws);
    setIsLoading(false);
  };
  return <></>;
};
export default CourierTransactions;
