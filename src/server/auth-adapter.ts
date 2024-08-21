import { type Adapter } from "next-auth/adapters";
import { type Client } from "edgedb";
import e from "e";

// @auth/edgedb-adapter is little bit buggy when updating session...
export const CustomAdapter = (client: Client, logging = false): Adapter => {
  return {
    createUser: async ({ email, emailVerified, image, name }) => {
      if (logging) console.log(1);
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
      if (logging) console.log(2);
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
      if (logging) console.log(3);
      return e.select(e.User, (user) => ({
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        image: true,
        filter_single: e.op(user.email, "=", e.str(email)),
      })).run(client);
    },
    getUserByAccount: async ({ providerAccountId, provider }) => {
      if (logging) console.log(4);
      const res = await e.select(e.Account, (account) => ({
        user: {
          id: true,
          email: true,
          emailVerified: true,
          name: true,
          image: true,
        },
        filter_single: e.op(
          e.op(account.providerAccountId, "=", e.str(providerAccountId)),
          "and",
          e.op(account.provider, "=", provider)
        ),
      })).run(client);
      return res?.user ?? null;
    },
    updateUser: async ({ id, email, emailVerified, image, name }) => {
      if (logging) console.log(5);
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
      if (logging) console.log(6);
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
      if (logging) console.log(7);
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
      if (logging) console.log(8);
      await e.delete(e.Account, (account) => ({
        filter: e.op(
          e.op(account.providerAccountId, "=", e.str(providerAccountId)),
          "and",
          e.op(account.provider, "=", provider)
        ),
      })).run(client);
    },
    createSession: async ({ expires, sessionToken, userId }) => {
      if (logging) console.log(9);
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
      if (logging) console.log(10);
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
      if (logging) console.log(11);
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
      if (logging) console.log(12);
      await e.delete(e.Session, (session) => ({
        filter_single: e.op(session.sessionToken, "=", sessionToken),
      })).run(client);
    },
    createVerificationToken: async ({ identifier, expires, token }) => {
      if (logging) console.log(13);
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
      if (logging) console.log(14);
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
          filter: e.op(verificationToken.id, "=", e.uuid(res.id)),
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
