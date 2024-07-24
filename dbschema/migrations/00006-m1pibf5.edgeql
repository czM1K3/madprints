CREATE MIGRATION m1pibf5ce4icuwjvtqat55efymcdlqhcgiollr3y66jg7va77g5shq
    ONTO m1n52iv4jmnlr7f7xxts74oycttmh5misfajp6h655tbydyry4mjpq
{
  ALTER TYPE default::ModelIteration {
      CREATE REQUIRED LINK model: default::Model {
          ON TARGET DELETE DELETE SOURCE;
          SET REQUIRED USING (<default::Model>{});
      };
  };
  ALTER TYPE default::Model {
      ALTER LINK iterations {
          USING (.<model[IS default::ModelIteration]);
      };
      CREATE REQUIRED LINK user: default::User {
          ON TARGET DELETE DELETE SOURCE;
          SET REQUIRED USING (<default::User>{});
      };
  };
  ALTER TYPE default::ModelIterationParameters {
      CREATE REQUIRED LINK modelIteration: default::ModelIteration {
          ON TARGET DELETE DELETE SOURCE;
          SET REQUIRED USING (<default::ModelIteration>{});
      };
  };
  ALTER TYPE default::ModelIteration {
      ALTER LINK parameters {
          USING (.<modelIteration[IS default::ModelIterationParameters]);
      };
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK models := (.<user[IS default::Model]);
  };
};
