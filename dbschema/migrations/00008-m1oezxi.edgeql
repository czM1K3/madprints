CREATE MIGRATION m1oezxi5subvkptolhhe6r2j7p3htwnhz3jmoqqlpto5f4bzauygba
    ONTO m1pqd6ufehyi7gq7flumna2smdtisheodjnhwzdxayvsy727xkzucq
{
  ALTER TYPE default::Category {
      CREATE MULTI LINK models := (.<category[IS default::Model]);
  };
};
