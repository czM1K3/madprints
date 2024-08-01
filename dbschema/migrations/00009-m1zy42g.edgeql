CREATE MIGRATION m1zy42g3osrmv7ihhas4hartpgnuf6hhsptob766afqr3plwjwyweq
    ONTO m1oezxi5subvkptolhhe6r2j7p3htwnhz3jmoqqlpto5f4bzauygba
{
  ALTER TYPE default::Category {
      ALTER PROPERTY name {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
