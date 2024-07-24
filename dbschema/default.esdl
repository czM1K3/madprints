module default {
    type Model {
        required title: str;
        required description: str;
        required created_at: datetime {
            default := std::datetime_current();
            readonly := true;
        };
        multi iterations: ModelIteration;
    }

    type ModelIteration {
        required number: int32;
        required code: str;
        required created_at: datetime {
            default := std::datetime_current();
            readonly := true;
        };
        multi parameters: ModelIterationParameters;
    }

    scalar type ParameterType extending enum<Number, Boolean, String>;

    type ModelIterationParameters {
        required name: str;
        required datatype : ParameterType;
        required default_value: str;
        description: str;
    }

    # Auth.js stuff

    type User {
        property name -> str;
        required property email -> str {
            constraint exclusive;
        }
        property emailVerified -> datetime;
        property image -> str;
        multi link accounts := .<user[is Account];
        multi link sessions := .<user[is Session];
        property createdAt -> datetime {
            default := datetime_current();
        };
    }

    type Account {
       required property userId := .user.id;
       required property type -> str;
       required property provider -> str;
       required property providerAccountId -> str {
        constraint exclusive;
       };
       property refresh_token -> str;
       property access_token -> str;
       property expires_at -> int64;
       property token_type -> str;
       property scope -> str;
       property id_token -> str;
       property session_state -> str;
       required link user -> User {
            on target delete delete source;
       };
       property createdAt -> datetime {
            default := datetime_current();
        };

       constraint exclusive on ((.provider, .providerAccountId))
    }

    type Session {
        required property sessionToken -> str {
            constraint exclusive;
        }
        required property userId := .user.id;
        required property expires -> datetime;
        required link user -> User {
            on target delete delete source;
        };
        property createdAt -> datetime {
            default := datetime_current();
        };
    }

    type VerificationToken {
        required property identifier -> str;
        required property token -> str {
            constraint exclusive;
        }
        required property expires -> datetime;
        property createdAt -> datetime {
            default := datetime_current();
        };

        constraint exclusive on ((.identifier, .token))
    }
}

using future nonrecursive_access_policies;
