import { Refine } from "@pankod/refine-core";
import {
  notificationProvider,
  Layout,
  ErrorComponent,
} from "@pankod/refine-antd";
import "@pankod/refine-antd/dist/styles.min.css";
import routerProvider from "@pankod/refine-react-location";
import { RefineKbarProvider } from "@pankod/refine-kbar";
import { useTranslation } from "react-i18next";
import { OffLayoutArea } from "components/offLayoutArea";
import { Header } from "components/layout";
import { authProvider } from "./authProvider";
import { Login } from "pages/login";
// import dataProvider, { GraphQLClient } from "@pankod/refine-strapi-graphql";
import dataProvider, { GraphQLClient } from "./dataprovider";
import {
  PermissionsList,
  PermissionsEdit,
  PermissionsCreate,
} from "pages/permissions";
import { RolesList } from "pages/roles";
import { RolesCreate } from "pages/roles/create";
import { RolesEdit } from "pages/roles/edit";
const API_URL = process.env.REACT_APP_GRAPHQL_API_URL!;

const client = new GraphQLClient(API_URL);
const gqlDataProvider = dataProvider(client);

function App() {
  const { t, i18n } = useTranslation();

  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  return (
    <RefineKbarProvider>
      <Refine
        notificationProvider={notificationProvider}
        Layout={Layout}
        // ReadyPage={ReadyPage}
        catchAll={<ErrorComponent />}
        routerProvider={routerProvider}
        dataProvider={gqlDataProvider}
        authProvider={authProvider}
        LoginPage={Login}
        OffLayoutArea={OffLayoutArea}
        i18nProvider={i18nProvider}
        Header={Header}
        resources={[
          {
            name: "home",
          },
          {
            name: "permissions",
            list: PermissionsList,
            edit: PermissionsEdit,
            create: PermissionsCreate,
            options: {
              label: "Разрешения",
            },
          },
          {
            name: "roles",
            list: RolesList,
            create: RolesCreate,
            edit: RolesEdit,
            options: {
              label: "Роли",
            },
          },
        ]}
      />
    </RefineKbarProvider>
  );
}

export default App;
