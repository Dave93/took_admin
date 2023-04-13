import { Authenticated, CanParams, Refine } from "@refinedev/core";
import { notificationProvider, Layout, ErrorComponent } from "@refinedev/antd";

import "@refinedev/antd/dist/reset.css";
import "./styles/main.css";

import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { useTranslation } from "react-i18next";
import { OffLayoutArea } from "components/offLayoutArea";
import { Header, Title } from "components/layout";
import { authProvider, TOKEN_KEY } from "./authProvider";
import { Login } from "pages/login";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  split,
  HttpLink,
} from "@apollo/client";
// import dataProvider, { GraphQLClient } from "@pankod/refine-strapi-graphql";
import dataProvider from "./dataprovider";
import { client } from "graphConnect";
import {
  PermissionsList,
  PermissionsEdit,
  PermissionsCreate,
} from "pages/permissions";
import { RolesList, RolesShow } from "pages/roles";
import { RolesCreate } from "pages/roles/create";
import { RolesEdit } from "pages/roles/edit";
import {
  DeliveryPricingCreate,
  DeliveryPricingEdit,
  DeliveryPricingList,
} from "pages/delivery_pricing";
import {
  OrganizationList,
  OrganizationsCreate,
  OrganizationsEdit,
} from "pages/organization";
import {
  WorkSchedulesCreate,
  WorkSchedulesEdit,
  WorkSchedulesList,
} from "pages/work_schedules";
import { TerminalsCreate, TerminalsEdit, TerminalsList } from "pages/terminals";
import { UsersCreate, UsersEdit, UsersList } from "pages/users";
import { WorkSchedulesReport } from "pages/work_schedule_entries_report";
import { CustomersList, CustomersShow } from "pages/customers";
import {
  OrderStatusCreate,
  OrderStatusEdit,
  OrderStatusList,
} from "pages/order_status";
import { OrdersList } from "pages/orders";
import { OrdersShow } from "pages/orders/show";
import { ApiTokensCreate, ApiTokensList } from "pages/api_tokens";
import { AES, enc } from "crypto-js";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { MainPage } from "pages/main/list";
import { TerminalsCouriersListPage } from "pages/terminals_couriers/list";
import { SystemConfigsList } from "pages/system_configs/list";
import PrivacyPage from "pages/privacy";
import { useEffect, useMemo } from "react";
import { BrandsCreate, BrandsEdit, BrandsList } from "pages/brands";
import WhereCourierList from "pages/users/where_courier_list";
import OrdersGarantReport from "pages/orders/orders_garant_report";
import CourierEfficiency from "pages/users/courier_efficiency";
import queryClient from "dataprovider/reactQueryClient";
import { RollCallList } from "pages/users/roll_call_list";
import CourierBalance from "pages/users/courier_balance";
import UsersShow from "pages/users/show";
import NotificationsList from "pages/notifications/list";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import YuriyOrdersGarantReport from "pages/orders/yuriy_orders_garant_report";
import MissedOrdersList from "pages/missed_orders/list";
import {
  OrderBonusPricingCreate,
  OrderBonusPricingEdit,
  OrderBonusPricingList,
} from "pages/order_bonus_pricing";
const gqlDataProvider = dataProvider(client);

const { Link } = routerProvider;

const httpLink = new HttpLink({
  uri: `https://${process.env.REACT_APP_GRAPHQL_API_DOMAIN!}/graphql`,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `wss://${process.env.REACT_APP_GRAPHQL_API_DOMAIN!}/ws`,
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const gqlClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

function App() {
  const { t, i18n } = useTranslation();

  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  const resources = useMemo(() => {
    const res = [
      {
        name: "orders",
        meta: {
          label: "Заказы",
        },
        list: "/orders",
        show: "/orders/show/:id",
      },
      {
        name: "missed_orders",
        meta: {
          label: "Упущенные заказы",
        },
        list: "/missed_orders",
      },
      {
        name: "orders_garant_report",
        meta: {
          label: "Фин. Гарант",
        },
        list: "/orders_garant_report",
      },
      {
        name: "yuriy_orders_garant_report",
        meta: {
          label: "Гарант",
        },
        list: "/yuriy_orders_garant_report",
      },
      {
        name: "users",
        list: "/users",
        create: "/users/create",
        edit: "/users/edit/:id",
        show: "/users/show/:id",
        meta: {
          label: "Список пользователей",
        },
      },
      {
        name: "roll_call",
        meta: {
          label: "Перекличка",
        },
        list: "/roll_call",
      },
      {
        name: "courier_balance",
        meta: {
          label: "Кошелёк",
        },
        list: "/courier_balance",
      },
      {
        name: "courier_efficiency",
        list: "/courier_efficiency",
        meta: {
          label: "Эффективность курьера",
        },
      },
      {
        name: "order_bonus_pricing",
        meta: {
          label: "Условия бонуса за заказ",
        },
        list: "/order_bonus_pricing",
        create: "/order_bonus_pricing/create",
        edit: "/order_bonus_pricing/edit/:id",
      },
      {
        name: "notifications",
        list: "/notifications",
        meta: {
          label: "Рассылки",
        },
      },
      {
        name: "orders-group",
        list: "/orders-group",
        meta: {
          label: "Заказы",
        },
      },
      {
        name: "customers",
        meta: {
          label: "Клиенты",
          parent: "orders-group",
        },
        list: "/customers",
        show: "/customers/show/:id",
      },
      {
        name: "order_status",
        meta: {
          label: "Статусы заказов",
          parent: "orders-group",
        },
        list: "/order_status",
        create: "/order_status/create",
        edit: "/order_status/edit/:id",
      },
      {
        name: "users-group",
        meta: {
          label: "Пользователи",
        },
      },
      {
        name: "roles",
        list: "/roles",
        create: "/roles/create",
        edit: "/roles/edit/:id",
        show: "/roles/show/:id",
        meta: {
          label: "Роли",
          parent: "users-group",
        },
      },
      {
        name: "permissions",
        list: "/permissions",
        edit: "/permissions/edit/:id",
        create: "/permissions/create",
        meta: {
          label: "Разрешения",
          parent: "users-group",
        },
      },
      {
        name: "where_courier",
        list: "/where_courier",
        meta: {
          label: "Где курьер",
          parent: "users-group",
        },
      },
      {
        name: "terminals_couriers",
        list: "/terminals_couriers",
        meta: {
          label: "Курьеры по филиалам",
          parent: "users-group",
        },
      },
      {
        name: "organizations_menu",
        meta: {
          label: "Организации",
        },
      },
      {
        name: "organization",
        meta: {
          label: "Список организации",
          parent: "organizations_menu",
        },
        list: "/organizations",
        create: "/organizations/create",
        edit: "/organizations/edit/:id",
      },
      {
        name: "terminals",
        meta: {
          label: "Филиалы",
          parent: "organizations_menu",
        },
        list: "/terminals",
        create: "/terminals/create",
        edit: "/terminals/edit/:id",
      },
      {
        name: "delivery_pricing",
        meta: {
          label: "Условия доставки",
          parent: "organizations_menu",
        },
        list: "/delivery_pricing",
        create: "/delivery_pricing/create",
        edit: "/delivery_pricing/edit/:id",
      },
      {
        name: "time_management",
        meta: {
          label: "Время и отчёты",
        },
      },
      {
        name: "work_schedules",
        meta: {
          label: "Рабочие графики",
          parent: "time_management",
        },
        list: "/work_schedules",
        create: "/work_schedules/create",
        edit: "/work_schedules/edit/:id",
      },
      {
        name: "work_schedule_entries_report",
        meta: {
          label: "Отчёт по рабочим графикам",
          parent: "time_management",
        },
        list: "/work_schedule_entries_report",
      },
      {
        name: "settings",
        options: {
          label: "Настройки",
        },
      },
      {
        name: "api_tokens",
        meta: {
          label: "API Токены",
          parent: "settings",
        },
        list: "/api_tokens",
        create: "/api_tokens/create",
      },
      {
        name: "system_configs",
        meta: {
          label: "Системные настройки",
          parent: "settings",
        },
        list: "/system_configs",
      },
    ];

    if (process.env.REACT_APP_GRAPHQL_API_DOMAIN === "api.arryt.uz") {
      res.push({
        name: "brands",
        meta: {
          label: "Бренды",
          parent: "settings",
        },
        list: "/brands",
        create: "/brands/create",
        edit: "/brands/edit/:id",
      });
    }
    return res;
  }, []);

  useEffect(() => {
    if (navigator !== undefined) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "openWindow") {
          window.open(event.data.url);
        }
      });
    }

    return () => {
      if (navigator !== undefined) {
        navigator.serviceWorker.removeEventListener("message", () => {});
      }
    };
  }, []);

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ApolloProvider client={gqlClient}>
          <Refine
            notificationProvider={notificationProvider}
            options={{
              syncWithLocation: true,
              reactQuery: {
                clientConfig: queryClient,
              },
            }}
            accessControlProvider={{
              can: async ({ action, params, resource }: CanParams) => {
                if (
                  action == "list" &&
                  Object.values({ ...params }).length == 0
                ) {
                  return Promise.resolve({
                    can: true,
                  });
                }

                if (
                  params?.resource?.children &&
                  params?.resource?.children.length > 0 &&
                  !params?.resource?.parentName
                ) {
                  return Promise.resolve({
                    can: true,
                  });
                }

                if (resource === "dashboard") {
                  return Promise.resolve({
                    can: true,
                  });
                }
                const token = localStorage.getItem(TOKEN_KEY);
                if (token) {
                  let password = process.env.REACT_APP_CRYPTO_KEY!;
                  var bytes = AES.decrypt(token, password);
                  var decryptedData = JSON.parse(bytes.toString(enc.Utf8));
                  const {
                    access: { additionalPermissions },
                  } = decryptedData;
                  return Promise.resolve({
                    can: additionalPermissions.includes(
                      `${resource}.${action}`
                    ),
                    reason: additionalPermissions.includes(
                      `${resource}.${action}`
                    )
                      ? undefined
                      : "You are not allowed to do this",
                  });
                }
                return Promise.resolve({
                  can: true,
                });
              },
            }}
            routerProvider={routerProvider}
            dataProvider={gqlDataProvider}
            authProvider={authProvider}
            i18nProvider={i18nProvider}
            // syncWithLocation={true}
            resources={resources}
          >
            <RefineKbar />
            <Routes>
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route
                element={
                  <Authenticated fallback={<CatchAllNavigate to="/login" />}>
                    <Layout
                      Header={Header}
                      Title={Title}
                      OffLayoutArea={OffLayoutArea}
                    >
                      <Outlet />
                    </Layout>
                  </Authenticated>
                }
              >
                <Route index element={<MainPage />} />
                <Route path="/orders">
                  <Route index element={<OrdersList />} />
                  <Route path="show/:id" element={<OrdersShow />} />
                </Route>
                <Route path="/missed_orders">
                  <Route index element={<MissedOrdersList />} />
                </Route>
                <Route
                  path="/orders_garant_report"
                  element={<OrdersGarantReport />}
                />
                <Route
                  path="/yuriy_orders_garant_report"
                  element={<YuriyOrdersGarantReport />}
                />
                <Route path="/users">
                  <Route index element={<UsersList />} />
                  <Route path="show/:id" element={<UsersShow />} />
                  <Route path="create" element={<UsersCreate />} />
                  <Route path="edit/:id" element={<UsersEdit />} />
                </Route>
                <Route path="/roll_call">
                  <Route index element={<RollCallList />} />
                </Route>
                <Route path="/courier_balance">
                  <Route index element={<CourierBalance />} />
                </Route>
                <Route path="/courier_efficiency">
                  <Route index element={<CourierEfficiency />} />
                </Route>
                <Route path="/customers">
                  <Route index element={<CustomersList />} />
                  <Route path="show/:id" element={<CustomersShow />} />
                </Route>
                <Route path="/order_status">
                  <Route index element={<OrderStatusList />} />
                  <Route path="create" element={<OrderStatusCreate />} />
                  <Route path="edit/:id" element={<OrderStatusEdit />} />
                </Route>
                <Route path="/roles">
                  <Route index element={<RolesList />} />
                  <Route path="create" element={<RolesCreate />} />
                  <Route path="edit/:id" element={<RolesEdit />} />
                  <Route path="show/:id" element={<RolesShow />} />
                </Route>
                <Route path="/permissions">
                  <Route index element={<PermissionsList />} />
                  <Route path="create" element={<PermissionsCreate />} />
                  <Route path="edit/:id" element={<PermissionsEdit />} />
                </Route>
                <Route path="/where_courier">
                  <Route index element={<WhereCourierList />} />
                </Route>
                <Route path="/terminals_couriers">
                  <Route index element={<TerminalsCouriersListPage />} />
                </Route>
                <Route path="/organizations">
                  <Route index element={<OrganizationList />} />
                  <Route path="create" element={<OrganizationsCreate />} />
                  <Route path="edit/:id" element={<OrganizationsEdit />} />
                </Route>
                <Route path="/terminals">
                  <Route index element={<TerminalsList />} />
                  <Route path="create" element={<TerminalsCreate />} />
                  <Route path="edit/:id" element={<TerminalsEdit />} />
                </Route>
                <Route path="/delivery_pricing">
                  <Route index element={<DeliveryPricingList />} />
                  <Route path="create" element={<DeliveryPricingCreate />} />
                  <Route path="edit/:id" element={<DeliveryPricingEdit />} />
                </Route>
                <Route path="/order_bonus_pricing">
                  <Route index element={<OrderBonusPricingList />} />
                  <Route path="create" element={<OrderBonusPricingCreate />} />
                  <Route path="edit/:id" element={<OrderBonusPricingEdit />} />
                </Route>
                <Route path="/work_schedules">
                  <Route index element={<WorkSchedulesList />} />
                  <Route path="create" element={<WorkSchedulesCreate />} />
                  <Route path="edit/:id" element={<WorkSchedulesEdit />} />
                </Route>
                <Route path="/work_schedule_entries_report">
                  <Route index element={<WorkSchedulesReport />} />
                </Route>
                <Route path="/api_tokens">
                  <Route index element={<ApiTokensList />} />
                  <Route path="create" element={<ApiTokensCreate />} />
                </Route>
                <Route path="/system_configs">
                  <Route index element={<SystemConfigsList />} />
                </Route>
                <Route path="/brands">
                  <Route index element={<BrandsList />} />
                  <Route path="create" element={<BrandsCreate />} />
                  <Route path="edit/:id" element={<BrandsEdit />} />
                </Route>
                <Route path="/notifications">
                  <Route index element={<NotificationsList />} />
                  {/* <Route path="create" element={<NotificationsCreate />} />
                  <Route path="edit/:id" element={<NotificationsEdit />} /> */}
                </Route>
              </Route>
              <Route
                element={
                  <Authenticated fallback={<Outlet />}>
                    <NavigateToResource resource="dashboard" />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<Login />} />
              </Route>
              <Route
                element={
                  <Authenticated>
                    <Layout
                      Header={Header}
                      Title={Title}
                      OffLayoutArea={OffLayoutArea}
                    >
                      <Outlet />
                    </Layout>
                  </Authenticated>
                }
              >
                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>
          </Refine>
        </ApolloProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
