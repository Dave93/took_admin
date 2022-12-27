import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { client } from "graphConnect";
import { gql } from "graphql-request";
const queryClient = new QueryClient();
const WhereCourierList = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <WhereCourierListView />
    </QueryClientProvider>
  );
};

const WhereCourierListView = () => {
  const getCouriers = async () => {
    const query = gql`
      query {
        couriersLocation {
          id
          last_name
          first_name
          short_name
          phone
          is_online
          latitude
          latitude
        }
      }
    `;
    const { data } = await client.query({
      query,
      fetchPolicy: "network-only",
    });
    return data;
  };

  const query = useQuery({ queryKey: ["todos"], queryFn: getCouriers });
  return <div></div>;
};

export default WhereCourierList;
