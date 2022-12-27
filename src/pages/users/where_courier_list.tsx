import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
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
                    
                }

    const query = useQuery({ queryKey: ["todos"], queryFn: getTodos });
  return <div></div>;
};

export default WhereCourierList;
