import type { AuthBindings } from "@refinedev/core";
import { gql } from "graphql-request";
import { client } from "./graphConnect";
import { AES, enc } from "crypto-js";

import ms from "ms";
import { DateTime } from "luxon";

export const TOKEN_KEY = "refine-auth";

export const authProvider: AuthBindings = {
  login: async ({ phone, code, otpSecret, deviceToken }) => {
    try {
      let query = gql`
        mutation {
          verifyOtp(phone: "${phone}", otp: "${code}", verificationKey: "${otpSecret}" ${
        deviceToken ? `, deviceToken: "${deviceToken}"` : ""
      }) {
            access {
            additionalPermissions
            roles {
                name
                active
                code
            }
        }
        token {
            accessToken
            accessTokenExpires
            refreshToken
            tokenType
        }
        user {
            first_name
            id
            is_super_user
            last_name
            permissions {
                active
                slug
                id
            }
            phone
        }
          }
        }
      `;
      const data = await client.request(query);
      let expirationAddition = parseInt(
        ms(data.verifyOtp.token.accessTokenExpires)
      );
      let expiration = DateTime.local().plus({
        milliseconds: expirationAddition,
      });
      data.verifyOtp.token.expirationMillis = expiration.toMillis();
      let credentials = JSON.stringify(data.verifyOtp);
      let password = process.env.REACT_APP_CRYPTO_KEY!;
      const encrypted = AES.encrypt(credentials, password).toString();

      localStorage.setItem(TOKEN_KEY, encrypted);
      return { success: true, redirectTo: "/" };
    } catch (e: any) {
      return {
        success: false,
        error: e.response.errors.map((e: any) => e.message).join("\n"),
      };
    }
  },
  logout: async (params) => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    return { error };
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      let password = process.env.REACT_APP_CRYPTO_KEY!;
      var bytes = AES.decrypt(token, password);
      var decryptedData = JSON.parse(bytes.toString(enc.Utf8));
      if (decryptedData.token.accessTokenExpires) {
        let expiration = DateTime.fromMillis(
          decryptedData.token.expirationMillis
        );
        if (DateTime.local() > expiration) {
          try {
            let query = gql`
            mutation {
              refreshToken(
                refreshToken: "${decryptedData.token.refreshToken}"
              ) {
                accessToken
                accessTokenExpires
                refreshToken
                tokenType
              }
            }
          `;
            const data = await client.request(query);
            let expirationAddition = parseInt(
              ms(data.refreshToken.accessTokenExpires)
            );
            let expiration = DateTime.local().plus({
              milliseconds: expirationAddition,
            });
            decryptedData.token = data.refreshToken;
            decryptedData.token.expirationMillis = expiration.toMillis();
            let credentials = JSON.stringify(decryptedData);
            let password = process.env.REACT_APP_CRYPTO_KEY!;
            const encrypted = AES.encrypt(credentials, password).toString();

            localStorage.setItem(TOKEN_KEY, encrypted);
            return {
              authenticated: true,
            };
          } catch (e) {
            console.log("auth error", e);
            return {
              authenticated: false,
              error: new Error("Invalid token"),
              logout: true,
              redirectTo: "/login",
            };
          }
        }
      }
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      error: new Error("Invalid token"),
      logout: true,
      redirectTo: "/login",
    };
  },
  getPermissions: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      let password = process.env.REACT_APP_CRYPTO_KEY!;
      var bytes = AES.decrypt(token, password);
      var decryptedData = JSON.parse(bytes.toString(enc.Utf8));
      return decryptedData.access;
    }
    return null;
  },
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    let password = process.env.REACT_APP_CRYPTO_KEY!;
    var bytes = AES.decrypt(token, password);
    var decryptedData = JSON.parse(bytes.toString(enc.Utf8));
    return decryptedData;
  },
};
