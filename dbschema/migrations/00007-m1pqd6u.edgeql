CREATE MIGRATION m1pqd6ufehyi7gq7flumna2smdtisheodjnhwzdxayvsy727xkzucq
    ONTO m1pibf5ce4icuwjvtqat55efymcdlqhcgiollr3y66jg7va77g5shq
{
  CREATE TYPE default::Category {
      CREATE REQUIRED PROPERTY name: std::str;
  };
  ALTER TYPE default::Model {
      CREATE LINK category: default::Category;
  };
};
