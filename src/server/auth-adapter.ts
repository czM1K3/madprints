import { type Adapter } from "next-auth/adapters";
import { type Client } from "edgedb";
import e from "e";

// @auth/edgedb-adapter is little bit buggy when updating session...
export const CustomAdapter = (client: Client): Adapter => {
  return {
    createUser: async ({ email, emailVerified, image, name }) => {
      const newUser = await e.insert(e.User, {
        email,
        emailVerified,
        name,
        image,
      }).run(client);
      const res = await e.select(e.User, (user) => ({
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        image: true,
        filter_single: e.op(
          user.id,
          "=",
          e.uuid(newUser.id)
        ),
      })).run(client);
      if (!res) {
        throw new Error("New user not found");
      }
      return res;
    },
    getUser: (id) => {
      return e.select(e.User, (user) => ({
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        image: true,
        filter_single: e.op(user.id, "=", e.uuid(id)),
      })).run(client);
    },
    getUserByEmail: (email) => {
      return e.select(e.User, (user) => ({
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        image: true,
        filter_single: e.op(user.email, "=", e.uuid(email)),
      })).run(client);
    },
    getUserByAccount: async ({ providerAccountId, provider }) => {
      const res = await e.select(e.Account, (account) => ({
        user: {
          id: true,
          email: true,
          emailVerified: true,
          name: true,
          image: true,
        },
        filter_single: e.op(
          e.op(account.providerAccountId, "=", providerAccountId),
          "and",
          e.op(account.provider, "=", provider)
        ),
      })).run(client);
      return res?.user ?? null;
    },
    updateUser: async ({ id, email, emailVerified, image, name }) => {
      const updatedUser = await e.update(e.User, (user) => ({
        set: {
          email,
          emailVerified,
          name,
          image,
        },
        filter_single: e.op(user.id, "=", e.uuid(id)),
      })).run(client);
      if (!updatedUser) {
        throw new Error("User not found");
      }
      const res = await e.select(e.User, (user) => ({
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        image: true,
        filter_single: e.op(
          user.id,
          "=",
          e.uuid(updatedUser.id)
        ),
      })).run(client);
      if (!res) {
        throw new Error("New user not found");
      }
      return res;
    },
    deleteUser: async (userId) => {
      await e.delete(e.User, (user) => ({
        filter: e.op(user.id, "=", e.uuid(userId)),
      })).run(client);
    },
    linkAccount: async ({
      userId,
      type,
      provider,
      providerAccountId,
      refresh_token,
      access_token,
      expires_at,
      token_type,
      scope,
      id_token,
      session_state,
    }) => {
      await e.insert(e.Account, {
        type,
        provider,
        providerAccountId,
        refresh_token,
        access_token,
        expires_at: expires_at && e.int64(expires_at),
        token_type,
        scope,
        id_token,
        session_state: session_state?.toString(),
        user: e.select(e.User, (user) => ({
          filter_single: e.op(user.id, "=", e.uuid(userId)),
        })),
      }).run(client);
    },
    unlinkAccount: async ({providerAccountId, provider}) => {
      await e.delete(e.Account, (account) => ({
        filter: e.op(
          e.op(account.providerAccountId, "=", providerAccountId),
          "and",
          e.op(account.provider, "=", provider)
        ),
      })).run(client);
    },
    createSession: async ({ expires, sessionToken, userId }) => {
      const newSession = await e.insert(e.Session, {
        expires,
        sessionToken,
        user: e.select(e.User, (user) => ({
          filter_single: e.op(user.id, "=", e.uuid(userId)),
        }))
      }).run(client);
      const res = await e.select(e.Session, (session) => ({
        expires: true,
        sessionToken: true,
        userId: true,
        filter_single: e.op(
          session.id,
          "=",
          e.uuid(newSession.id)
        ),
      })).run(client);
      if (!res) {
        throw new Error("New user not found");
      }
      return res;
    },
    getSessionAndUser: async (sessionToken) => {
      const sessionAndUser = await e.select(e.Session, (session) => ({
        userId: true,
        id: true,
        expires: true,
        sessionToken: true,
        user: {
          id: true,
          email: true,
          emailVerified: true,
          image: true,
          name: true,
        },
        filter_single: e.op(session.sessionToken, "=", sessionToken),
      })).run(client);
      if (!sessionAndUser) {
        return null;
      }
      const { user, ...session } = sessionAndUser
      if (!user || !session) {
        return null
      }
      return {
        user,
        session,
      };
    },
    updateSession: async ({ sessionToken, expires, userId }) => {
      const updatedSession = await e.update(e.Session, (session2) => ({
        set: {
          sessionToken,
          expires,
          user: userId ? e.select(e.User, (user) => ({
            filter_single: e.op(user.id, "=", e.uuid(userId)),
          })) : undefined,
        },
        filter_single: e.op(session2.sessionToken, "=", sessionToken),
      })).run(client);
      if (!updatedSession) {
        return null;
      }
      const res = await e.select(e.Session, (session1) => ({
        sessionToken: true,
        userId: true,
        expires: true,
        filter_single: e.op(
          session1.id,
          "=",
          e.uuid(updatedSession.id)
        ),
      })).run(client);
      return res;
    },
    deleteSession: async (sessionToken) => {
      await e.delete(e.Session, (session) => ({
        filter_single: e.op(session.sessionToken, "=", sessionToken),
      })).run(client);
    },
    createVerificationToken: async ({ identifier, expires, token }) => {
      const newToken = await e.insert(e.VerificationToken, {
        identifier,
        expires: e.datetime(expires),
        token,
      }).run(client);
      const res = await e.select(e.VerificationToken, (verificationToken) => ({
        identifier: true,
        expires: true,
        token: true,
        filter_single: e.op(
          verificationToken.id,
          "=",
          e.uuid(newToken.id)
        )
      })).run(client);
      return res;
    },
    useVerificationToken: async ({ identifier, token }) => {
      const res = await e.select(e.VerificationToken, (verificationToken) => ({
        id: true,
        identifier: true,
        expires: true,
        token: true,
        filter_single: e.op(
          e.op(verificationToken.token, "=", token),
          "and",
          e.op(verificationToken.identifier, "=", identifier)
        ),
      })).run(client);
      if (res) {
        await e.delete(e.VerificationToken, (verificationToken) => ({
          filter: e.op(verificationToken.id, "=", res.id),
        })).run(client);
        return {
          ...res,
          id: undefined,
        };
      }
      return null;
    },
  };
};
